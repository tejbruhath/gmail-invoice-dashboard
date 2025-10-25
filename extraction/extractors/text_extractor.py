import re
from .pdf_extractor import extract_invoice_data

def extract_from_text(text, subject=""):
    """Extract invoice data from plain email text"""
    try:
        combined_text = f"{subject}\n{text}"
        
        # Extract invoice information
        result = extract_invoice_data(combined_text)
        result['extractionMethod'] = 'email_body'
        result['rawText'] = combined_text[:1000]
        
        # If no merchant found, try to extract from email subject or sender
        if not result['merchant']:
            merchant = extract_merchant_from_subject(subject)
            if merchant:
                result['merchant'] = merchant
        
        return result
        
    except Exception as e:
        print(f"Text extraction error: {e}")
        return None

def extract_merchant_from_subject(subject):
    """Try to extract merchant name from email subject"""
    # Common patterns
    patterns = [
        r'receipt from (.+?)(?:\s|$)',
        r'invoice from (.+?)(?:\s|$)',
        r'order confirmation - (.+?)(?:\s|$)',
        r'payment to (.+?)(?:\s|$)',
        r'^(.+?)\s+(?:receipt|invoice|order)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, subject.lower())
        if match:
            merchant = match.group(1).strip()
            if len(merchant) > 2:
                return merchant.title()
    
    return None
