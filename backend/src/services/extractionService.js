import * as cheerio from 'cheerio';

// Brand keywords for categorization
const BRAND_KEYWORDS = {
  food: [
    'zomato', 'swiggy', 'eatsure'
  ],
  groceries: [
    'blinkit', 'zepto', 'jiomart', 'bigbasket', 'dunzo', 'instamart'
  ],
  travel: [
    'ola', 'uber', 'indigo', 'airindia', 'makemytrip', 'goibibo',
    'irctc', 'redbus', 'yatra', 'rapido', 'spicejet', 'vistara'
  ],
  shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa',
    'croma', 'reliance digital', 'tata cliq'
  ],
  entertainment: [
    'bookmyshow', 'spotify', 'netflix', 'hotstar', 'zee5', 'sonyliv',
    'voot', 'gaana', 'wynk', 'prime video', 'youtube'
  ],
  bills: [
    'amazon pay', 'phonepe', 'google pay', 'paytm', 'cred', 'electricity',
    'bsnl', 'jio', 'vi', 'airtel', 'vodafone', 'gas', 'water'
  ]
};

/**
 * Extract text from Gmail message payload
 */
export function extractTextFromEmail(payload) {
  const parts = payload.parts || [];
  let text = '';

  const extractPart = (part) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      text += Buffer.from(part.body.data, 'base64').toString('utf8');
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      const html = Buffer.from(part.body.data, 'base64').toString('utf8');
      const $ = cheerio.load(html);
      text += $.text();
    } else if (part.parts) {
      part.parts.forEach(extractPart);
    }
  };

  // Handle direct body data
  if (payload.body?.data) {
    if (payload.mimeType === 'text/plain') {
      text += Buffer.from(payload.body.data, 'base64').toString('utf8');
    } else if (payload.mimeType === 'text/html') {
      const html = Buffer.from(payload.body.data, 'base64').toString('utf8');
      const $ = cheerio.load(html);
      text += $.text();
    }
  }

  parts.forEach(extractPart);
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract amount from text
 */
export function extractAmount(text) {
  const regexList = [
    // LazyPay/Simpl specific: "₹147.00" or "₹129.0"
    /₹\s*([0-9,]+(?:\.\d{1,2})?)/,
    /Rs\.?\s*([0-9,]+(?:\.\d{1,2})?)/i,
    // Standard patterns
    /(?:Amount Paid|Total|Bill|Paid)\s*[:\-]?\s*(?:₹|Rs\.?)?\s*([0-9,]+(?:\.\d{1,2})?)/i,
    /([0-9,]+(?:\.\d{1,2})?)\s*(?:INR|₹|Rs\.?)/i,
    /(?:total|amount|paid|payment|price)[\s:]+(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.\d{1,2})?)/i
  ];

  for (const regex of regexList) {
    const match = text.match(regex);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 1000000) { // Sanity check
        return amount;
      }
    }
  }
  return null;
}

/**
 * Detect category from text
 */
export function detectCategory(text) {
  const lowerText = text.toLowerCase();
  for (const [cat, words] of Object.entries(BRAND_KEYWORDS)) {
    if (words.some(w => lowerText.includes(w))) {
      return cat;
    }
  }
  return 'other';
}

/**
 * Detect brand/merchant from text
 */
export function detectBrand(text) {
  const lowerText = text.toLowerCase();
  
  // Special handling for LazyPay/Simpl format with multi-word support
  // "LazyPay has paid Swiggy" or "₹129.0 on Swiggy charged via Simpl"
  // "LazyPay has paid Blink Commerce" or "on Zepto. charged via Simpl"
  const bnplPatterns = [
    /(?:paid|has paid)\s+([a-z\s]+?)(?:\s+on|\.|\s+private)/i,
    /on\s+([a-z\s\.]+?)\s+charged/i,
    /on\s+([a-z]+?)\./i, // "on Zepto."
    /at\s+([a-z]+)/i,
    /from\s+([a-z\s]+?)(?:\s+on|\.|\s+private)/i
  ];
  
  for (const pattern of bnplPatterns) {
    const match = text.match(pattern);
    if (match) {
      const merchantMatch = match[1].trim().toLowerCase();
      console.log(`  🔍 BNPL Pattern matched: "${merchantMatch}"`);
      
      // Check against all known merchants
      for (const [category, words] of Object.entries(BRAND_KEYWORDS)) {
        for (const word of words) {
          if (merchantMatch.includes(word) || word.includes(merchantMatch)) {
            console.log(`  ✅ Matched BNPL merchant: "${word}" in category: ${category}`);
            return word.charAt(0).toUpperCase() + word.slice(1);
          }
        }
      }
    }
  }
  
  // Merchant name variations (official names in emails)
  const merchantVariations = {
    'blink commerce': 'blinkit',
    'zepto marketplace': 'zepto',
    'jio mart': 'jiomart',
    'big basket': 'bigbasket'
  };
  
  for (const [variation, actual] of Object.entries(merchantVariations)) {
    if (lowerText.includes(variation)) {
      console.log(`  ✅ Matched merchant variation: "${variation}" → "${actual}"`);
      return actual.charAt(0).toUpperCase() + actual.slice(1);
    }
  }
  
  // Standard brand detection (search in full text)
  for (const [category, words] of Object.entries(BRAND_KEYWORDS)) {
    const found = words.find(w => lowerText.includes(w));
    if (found) {
      console.log(`  ✅ Found merchant: "${found}" in category: ${category}`);
      return found.charAt(0).toUpperCase() + found.slice(1);
    }
  }
  
  // Log what we couldn't match
  console.log(`  ⚠️  Could not detect merchant from text: "${text.substring(0, 100)}..."`);
  
  return 'Unknown Merchant';
}

/**
 * Extract date from headers or text
 */
export function extractDate(headers, text) {
  // First try from email headers
  const dateHeader = headers.find(h => h.name === 'Date');
  if (dateHeader) {
    return new Date(dateHeader.value);
  }

  // Fallback: find date in text
  const dateMatch = text.match(
    /\b(\d{1,2}[-/ ](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/ ]\d{2,4})\b/i
  );
  if (dateMatch) {
    return new Date(dateMatch[1]);
  }

  // ISO format fallback
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    return new Date(isoMatch[1]);
  }

  return new Date(); // Default to now
}

/**
 * Check if email is a valid purchase invoice
 * ONLY process emails that say "charged", "added to bill", etc. with a vendor
 */
function isValidPurchaseEmail(subject, text) {
  const combinedText = `${subject} ${text}`.toLowerCase();
  
  // Must contain action words indicating a purchase
  const purchaseIndicators = [
    'charged via',
    'added to bill',
    'added to your',
    'has paid',
    'purchase of',
    'order on',
    'on behalf',
    'payment successful on', // "Payment successful on Zepto using Simpl"
    'payment of'
  ];
  
  const hasPurchaseIndicator = purchaseIndicators.some(indicator => 
    combinedText.includes(indicator)
  );
  
  if (!hasPurchaseIndicator) {
    console.log(`  ⏭️  SKIPPED: No purchase indicator (charged/added/paid)`);
    return false;
  }
  
  return true;
}

/**
 * Check if email should be skipped (repayment or bill summary)
 */
function shouldSkipEmail(subject, text) {
  const combinedText = `${subject} ${text}`.toLowerCase();
  
  // Skip "All scheduled Pay in 3 payments complete" - you finished paying back
  if (combinedText.includes('all scheduled') && combinedText.includes('payments complete')) {
    console.log(`  ⏭️  SKIPPED: Payment schedule complete (you paid back)`);
    return true;
  }
  
  // Skip "Pay-in-3 second payment" or "Pay-in-3 first payment" - installment reminders
  if (combinedText.includes('pay-in-3') && combinedText.includes('payment of')) {
    console.log(`  ⏭️  SKIPPED: Installment payment reminder`);
    return true;
  }
  
  // Skip dues emails (but not initial invoices)
  if ((combinedText.includes('your') && combinedText.includes('dues')) ||
      combinedText.includes('lazypay dues') ||
      combinedText.includes('simpl dues')) {
    console.log(`  ⏭️  SKIPPED: Dues/bill summary email`);
    return true;
  }
  
  // Skip reminder emails
  if (combinedText.includes('reminder') && combinedText.includes('due')) {
    console.log(`  ⏭️  SKIPPED: Payment reminder`);
    return true;
  }
  
  // Skip "clear your dues"
  if (combinedText.includes('clear your dues') || combinedText.includes('outstanding amount')) {
    console.log(`  ⏭️  SKIPPED: Outstanding dues email`);
    return true;
  }
  
  // Skip promotional emails
  if (combinedText.includes('flat') && combinedText.includes('off')) {
    console.log(`  ⏭️  SKIPPED: Promotional email`);
    return true;
  }
  
  // Skip account activation
  if (combinedText.includes('account activated')) {
    console.log(`  ⏭️  SKIPPED: Account activation`);
    return true;
  }
  
  // Skip "Payment Received" (you paying back BNPL)
  if (combinedText.includes('payment received') && 
      !combinedText.includes('on ') && 
      !combinedText.includes('charged')) {
    console.log(`  ⏭️  SKIPPED: Repayment confirmation`);
    return true;
  }
  
  return false;
}

/**
 * Parse complete email message
 */
export function parseEmail(message) {
  const headers = message.payload.headers;
  const subject = headers.find(h => h.name === 'Subject')?.value || '';
  const from = headers.find(h => h.name === 'From')?.value || '';
  
  const text = extractTextFromEmail(message.payload);
  
  // Debug: Log what we're parsing
  console.log(`\n  📧 Subject: ${subject}`);
  console.log(`  👤 From: ${from}`);
  console.log(`  📝 Text preview: ${text.substring(0, 200)}...`);
  
  // Skip repayment and dues emails
  if (shouldSkipEmail(subject, text)) {
    return null;
  }
  
  // Only process valid purchase emails (charged, added to bill, etc.)
  if (!isValidPurchaseEmail(subject, text)) {
    return null;
  }
  
  // Extract amount from SUBJECT first (more accurate), then from body
  let amount = extractAmount(subject);
  if (!amount || amount <= 0) {
    amount = extractAmount(text);
  }
  
  const combinedText = `${subject} ${from} ${text}`;
  const category = detectCategory(combinedText);
  const brand = detectBrand(combinedText);
  const date = extractDate(headers, text);

  console.log(`  💰 Extracted Amount: ${amount || 'NULL'}`);
  console.log(`  🏪 Detected Merchant: ${brand}`);
  
  // Skip if no valid merchant detected (Unknown Merchant)
  if (brand === 'Unknown Merchant') {
    console.log(`  ⏭️  SKIPPED: No valid merchant detected`);
    return null;
  }

  return {
    merchant: brand,
    category,
    amount,
    currency: 'INR',
    date: date.toISOString(),
    rawText: text.substring(0, 500),
    extractionMethod: 'email_body',
    metadata: {
      subject,
      from,
      hasAttachment: !!(message.payload.parts?.some(p => p.filename))
    }
  };
}
