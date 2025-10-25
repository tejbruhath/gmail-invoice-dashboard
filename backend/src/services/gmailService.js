import { google } from 'googleapis';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const fetchInvoicesFromGmail = async (userId, maxResults = 50) => {
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

    // Search for invoice-related emails
    const query = [
      'invoice OR receipt OR payment OR "order confirmation"',
      'has:attachment OR newer_than:30d'
    ].join(' ');

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    });

    const messages = response.data.messages || [];
    const emails = [];

    // Fetch each message detail
    for (const message of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = detail.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Get email body
      let body = '';
      if (detail.data.payload.body.data) {
        body = Buffer.from(detail.data.payload.body.data, 'base64').toString();
      } else if (detail.data.payload.parts) {
        const textPart = detail.data.payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      }

      // Get attachments
      const attachments = [];
      if (detail.data.payload.parts) {
        for (const part of detail.data.payload.parts) {
          if (part.filename && part.body.attachmentId) {
            const ext = part.filename.split('.').pop().toLowerCase();
            if (['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) {
              const attachment = await gmail.users.messages.attachments.get({
                userId: 'me',
                messageId: message.id,
                id: part.body.attachmentId
              });

              attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                data: attachment.data.data,
                size: attachment.data.size
              });
            }
          }
        }
      }

      emails.push({
        id: message.id,
        subject,
        from,
        date: new Date(date),
        body,
        attachments,
        hasAttachment: attachments.length > 0
      });
    }

    return emails;
  } catch (error) {
    console.error('Gmail fetch error:', error);
    throw error;
  }
};

export const processEmailForInvoice = async (email, userId) => {
  try {
    let extractedData = null;

    // If has attachments, send to extraction service
    if (email.attachments.length > 0) {
      for (const attachment of email.attachments) {
        const response = await axios.post(
          `${process.env.EXTRACTION_SERVICE_URL}/extract`,
          {
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            data: attachment.data
          }
        );

        if (response.data.success) {
          extractedData = response.data.data;
          break;
        }
      }
    }

    // Fallback to email body extraction
    if (!extractedData) {
      const response = await axios.post(
        `${process.env.EXTRACTION_SERVICE_URL}/extract-text`,
        {
          text: email.body,
          subject: email.subject
        }
      );

      if (response.data.success) {
        extractedData = response.data.data;
      }
    }

    return {
      ...extractedData,
      emailId: email.id,
      userId,
      metadata: {
        subject: email.subject,
        from: email.from,
        hasAttachment: email.hasAttachment
      }
    };
  } catch (error) {
    console.error('Process email error:', error);
    throw error;
  }
};
