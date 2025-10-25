import pytesseract
from PIL import Image
import os
from .pdf_extractor import extract_invoice_data

# Set tesseract command path (customize based on installation)
tesseract_cmd = os.getenv('TESSERACT_CMD', 'tesseract')
if tesseract_cmd != 'tesseract':
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

def extract_from_image(file_obj):
    """Extract invoice data from image using OCR"""
    try:
        # Open image
        image = Image.open(file_obj)
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        if not text.strip():
            return None
        
        # Extract invoice information from OCR text
        result = extract_invoice_data(text)
        result['extractionMethod'] = 'image_ocr'
        result['rawText'] = text[:1000]
        
        return result
        
    except Exception as e:
        print(f"Image OCR error: {e}")
        return None
