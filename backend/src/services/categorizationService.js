// Rule-based categorization with merchant keywords
const categoryRules = {
  food: [
    'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'kitchen',
    'doordash', 'ubereats', 'grubhub', 'postmates', 'delivery',
    'mcdonald', 'subway', 'starbucks', 'dominos', 'chipotle'
  ],
  shopping: [
    'amazon', 'ebay', 'walmart', 'target', 'costco', 'shop', 'store',
    'clothing', 'fashion', 'mall', 'retail', 'marketplace'
  ],
  bills: [
    'electric', 'utility', 'water', 'gas', 'internet', 'phone', 'mobile',
    'insurance', 'rent', 'mortgage', 'subscription', 'netflix', 'spotify',
    'hulu', 'disney', 'prime'
  ],
  entertainment: [
    'movie', 'cinema', 'theater', 'theatre', 'concert', 'ticket', 'event',
    'game', 'gaming', 'steam', 'playstation', 'xbox', 'nintendo'
  ],
  travel: [
    'airline', 'flight', 'hotel', 'airbnb', 'uber', 'lyft', 'taxi',
    'rental', 'car', 'parking', 'gas station', 'fuel', 'booking'
  ],
  healthcare: [
    'pharmacy', 'medical', 'doctor', 'hospital', 'clinic', 'health',
    'dental', 'vision', 'cvs', 'walgreens', 'prescription'
  ]
};

export const categorizeInvoice = async (merchant, text = '') => {
  const merchantLower = merchant.toLowerCase();
  const textLower = text.toLowerCase();
  const combined = `${merchantLower} ${textLower}`;

  let bestMatch = {
    category: 'other',
    confidence: 0
  };

  // Check each category
  for (const [category, keywords] of Object.entries(categoryRules)) {
    let matches = 0;
    let matchedKeywords = [];

    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        matches++;
        matchedKeywords.push(keyword);
      }
    }

    if (matches > 0) {
      const confidence = Math.min(matches / 3, 1); // Normalize confidence

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          confidence,
          matchedKeywords
        };
      }
    }
  }

  // If no good match, mark as "other" with low confidence
  if (bestMatch.confidence === 0) {
    bestMatch.confidence = 0.3;
  }

  return bestMatch;
};

export const addCategoryRule = (category, keywords) => {
  if (!categoryRules[category]) {
    categoryRules[category] = [];
  }
  categoryRules[category].push(...keywords);
};

export const getCategoryRules = () => {
  return { ...categoryRules };
};
