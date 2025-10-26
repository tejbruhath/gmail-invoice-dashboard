# Gmail Invoice Dashboard

AI-powered invoice tracking system that scrapes Gmail for invoices and provides spending analytics.

## Features
- 🔐 Secure Gmail OAuth2 login
- 📧 Automatic invoice/receipt extraction
- 📄 PDF & image parsing (OCR)
- 🏷️ Smart expense categorization
- 📊 Interactive dashboard with charts
- 🔒 Privacy-focused (minimal scopes, data deletion)

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + ShadCN UI
- **Backend**: Node.js + Express + MongoDB + Redis
- **Extraction Service**: Python FastAPI + pdfplumber + pytesseract
- **Deployment**: Vercel (frontend) + Cloud (backend)

## Project Structure
```
├── backend/          # Node.js Express API
├── frontend/         # React dashboard UI
├── extraction/       # Python extraction service
└── shared/           # Shared types/utilities
```

## Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- Redis
- Google Cloud OAuth2 credentials

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your credentials to .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Extraction Service
```bash
cd extraction
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

## Environment Variables

### Backend (.env)
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
MONGODB_URI=
REDIS_URL=
JWT_SECRET=
EXTRACTION_SERVICE_URL=http://localhost:8000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## API Endpoints
- `GET /auth/google` - Initiate OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /api/fetch-invoices` - Trigger invoice fetch
- `GET /api/dashboard-summary` - Dashboard data
- `GET /api/categories` - Category breakdown
- `DELETE /api/user/data` - Delete user data

## Privacy & Security
- Only reads emails (gmail.readonly scope)
- Encrypted token storage
- User-controlled data deletion
- Clear consent flows

## License
MIT
# gmail-invoice-dashboard
