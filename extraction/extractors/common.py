import re
from dateutil import parser

def normalize_amount(amount_str):
    """Convert amount string to float"""
    try:
        # Remove currency symbols and commas
        cleaned = re.sub(r'[$,€£¥]', '', amount_str)
        return float(cleaned)
    except Exception:
        return None

def normalize_date(date_str):
    """Convert date string to datetime object"""
    try:
        # Try parsing with dateutil parser (handles many formats)
        date = parser.parse(date_str, fuzzy=True)
        return date
    except Exception:
        return None

def extract_merchant_name(text):
    """Extract merchant name from invoice text"""
    # Get first few lines
    lines = text.split('\n')[:5]
    
    for line in lines:
        line = line.strip()
        if len(line) > 3 and len(line) < 100:
            # Skip common headers
            if any(skip in line.lower() for skip in ['invoice', 'receipt', 'bill', 'statement', 'order', 'payment']):
                continue
            
            # Clean up the line
            cleaned = re.sub(r'[^a-zA-Z0-9\s&\-\.]', '', line)
            if len(cleaned) > 2:
                return cleaned.strip()
    
    return "Unknown Merchant"
