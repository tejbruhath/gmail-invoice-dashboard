import pdfplumber
import re
from .common import normalize_amount, normalize_date, extract_merchant_name

def extract_from_pdf(file_obj):
    """Extract invoice data from PDF file"""
    try:
        with pdfplumber.open(file_obj) as pdf:
            full_text = ""
            
            # Extract text from all pages
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
            
            if not full_text.strip():
                return None
            
            # Extract invoice information
            result = extract_invoice_data(full_text)
            result['extractionMethod'] = 'pdf'
            result['rawText'] = full_text[:1000]  # Limit raw text size
            
            return result
            
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return None

def extract_invoice_data(text):
    """Extract structured data from invoice text"""
    data = {
        "merchant": None,
        "amount": None,
        "currency": "USD",
        "date": None
    }
    
    # Extract merchant name (usually at top)
    merchant = extract_merchant_name(text)
    if merchant:
        data['merchant'] = merchant
    
    # Extract amount
    amount = extract_amount(text)
    if amount:
        data['amount'] = amount['value']
        data['currency'] = amount['currency']
    
    # Extract date
    date = extract_date(text)
    if date:
        data['date'] = date.isoformat()
    
    return data

def extract_amount(text):
    """Extract monetary amount from text"""
    # Patterns for amounts
    patterns = [
        r'total[:\s]+\$?([0-9,]+\.?\d{0,2})',
        r'amount[:\s]+\$?([0-9,]+\.?\d{0,2})',
        r'grand total[:\s]+\$?([0-9,]+\.?\d{0,2})',
        r'balance[:\s]+\$?([0-9,]+\.?\d{0,2})',
        r'\$([0-9,]+\.?\d{2})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            amount_str = match.group(1)
            amount = normalize_amount(amount_str)
            if amount and amount > 0:
                return {
                    'value': amount,
                    'currency': 'USD'
                }
    
    return None

def extract_date(text):
    """Extract date from text"""
    # Common date patterns
    patterns = [
        r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
        r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            date = normalize_date(date_str)
            if date:
                return date
    
    return None
