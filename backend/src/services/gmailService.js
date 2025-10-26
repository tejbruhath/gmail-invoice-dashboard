import { google } from 'googleapis';
import User from '../models/User.js';
import { parseEmail } from './extractionService.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const fetchInvoicesFromGmail = async (userId, daysBack = 90) => {
  try {
    // Get user with tokens
    const user = await User.findById(userId).select('+accessToken +refreshToken');
    
    if (!user || !user.refreshToken) {
      throw new Error('User tokens not found');
    }

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: user.refreshToken
    });

    // Refresh access token if needed
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // Update user tokens if refreshed
    if (credentials.access_token) {
      user.accessToken = credentials.access_token;
      user.tokenExpiry = new Date(credentials.expiry_date);
      await user.save();
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // ONLY fetch BNPL invoices from LazyPay and Simpl with date filter
    const query = `from:(lazypay OR simpl-mails.com) newer_than:${daysBack}d`;

    console.log(`🔍 Fetching LazyPay & Simpl invoices from last ${daysBack} days...`);
    
    const allInvoices = [];
    let pageToken = null;
    let totalFetched = 0;
    let pageCount = 0;

    // Fetch ALL emails within date range
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500, // Max per page
        pageToken
      });

      const messages = response.data.messages || [];
      totalFetched += messages.length;
      
      console.log(`📧 Page ${pageCount + 1}: Found ${messages.length} messages`);

      // Fetch and parse each message
      for (const message of messages) {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        // Parse email using extraction service
        const parsed = parseEmail(detail.data);
        
        // Skip if parsing returned null (repayment/dues/unknown merchant)
        if (!parsed) {
          continue;
        }
        
        console.log(`  📄 ${parsed.merchant} - ₹${parsed.amount || 'NULL'}`);
        
        // Only include if we extracted an amount
        if (parsed.amount && parsed.amount > 0) {
          // Check for duplicates (same merchant, amount, and date within 1 day)
          const isDuplicate = allInvoices.some(inv => {
            const timeDiff = Math.abs(new Date(inv.date) - new Date(parsed.date));
            const oneDayInMs = 24 * 60 * 60 * 1000;
            const sameDate = timeDiff < oneDayInMs;
            const sameAmount = Math.abs(inv.amount - parsed.amount) < 0.01;
            const sameMerchant = inv.merchant.toLowerCase() === parsed.merchant.toLowerCase();
            
            return sameMerchant && sameAmount && sameDate;
          });
          
          if (isDuplicate) {
            console.log(`  🔄 DUPLICATE: ${parsed.merchant} - ₹${parsed.amount} (already in batch)`);
            continue;
          }
          
          allInvoices.push({
            ...parsed,
            emailId: message.id,
            userId
          });
        }
      }

      // Check if there are more pages
      pageToken = response.data.nextPageToken;
      pageCount++;
      
    } while (pageToken); // Fetch ALL pages

    console.log(`✅ Extracted ${allInvoices.length} valid invoices from ${totalFetched} emails (${daysBack} days)`);
    return allInvoices;
  } catch (error) {
    console.error('Gmail fetch error:', error);
    throw error;
  }
};

// This function is no longer needed - extraction happens inline in fetchInvoicesFromGmail
