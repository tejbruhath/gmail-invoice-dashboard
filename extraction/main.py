from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import base64
import io
import os
from dotenv import load_dotenv

from extractors.pdf_extractor import extract_from_pdf
from extractors.image_extractor import extract_from_image
from extractors.text_extractor import extract_from_text

load_dotenv()

app = FastAPI(title="Invoice Extraction Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractionRequest(BaseModel):
    filename: str
    mimeType: str
    data: str  # base64 encoded

class TextExtractionRequest(BaseModel):
    text: str
    subject: Optional[str] = ""

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/extract")
async def extract_invoice(request: ExtractionRequest):
    try:
        # Decode base64 data
        file_data = base64.b64decode(request.data)
        file_obj = io.BytesIO(file_data)
        
        result = None
        
        # Route to appropriate extractor
        if request.mimeType == "application/pdf":
            result = extract_from_pdf(file_obj)
        elif request.mimeType.startswith("image/"):
            result = extract_from_image(file_obj)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        if not result:
            return {"success": False, "error": "Failed to extract data"}
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        print(f"Extraction error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/extract-text")
async def extract_from_email_text(request: TextExtractionRequest):
    try:
        result = extract_from_text(request.text, request.subject)
        
        if not result:
            return {"success": False, "error": "Failed to extract data"}
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        print(f"Text extraction error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
