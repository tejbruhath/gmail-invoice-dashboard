# Quick Start Guide

## 1. Prerequisites

Install these on your system:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.9+** - [Download](https://www.python.org/)
- **MongoDB** - [Install](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Redis** - [Install](https://redis.io/download) or use [Redis Labs](https://redis.com/)
- **Tesseract OCR** - [Install](https://github.com/tesseract-ocr/tesseract)

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Gmail API**
4. Go to "OAuth consent screen":
   - Choose "External"
   - Add scopes: `email`, `profile`, `gmail.readonly`
5. Go to "Credentials" → Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Save your **Client ID** and **Client Secret**

## 3. Project Setup

### Option A: Automated Setup (Recommended)

**Windows:**
```powershell
.\setup-dev.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

### Option B: Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
```

**Extraction Service:**
```bash
cd extraction
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
```

## 4. Configure Environment Variables

### backend/.env
```env
PORT=3000
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
MONGODB_URI=mongodb://localhost:27017/gmail-invoice-dashboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_random_secret_key_here
EXTRACTION_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### frontend/.env
```env
VITE_API_URL=http://localhost:3000
```

### extraction/.env
```env
PORT=8000
TESSERACT_CMD=tesseract
```

## 5. Start Services

Open **3 separate terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Extraction Service:**
```bash
cd extraction
python main.py
```

## 6. Access the App

Open your browser and go to: **http://localhost:5173**

## 7. Usage Flow

1. Click **"Sign In"** or **"Get Started with Gmail"**
2. Authorize with your Google account
3. You'll be redirected to the **Dashboard**
4. Click **"Sync"** to fetch invoices from Gmail
5. View your expenses, charts, and invoice table
6. Use filters to organize invoices by category or date

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas cloud URL

### Redis Connection Error
- Make sure Redis is running: `redis-server`
- Or use Redis Labs cloud URL

### OAuth Error
- Check redirect URI matches exactly
- Verify Client ID/Secret are correct
- Make sure Gmail API is enabled

### Tesseract Not Found
- Windows: Add Tesseract to PATH or set `TESSERACT_CMD` in extraction/.env
- Mac: `brew install tesseract`
- Linux: `sudo apt-get install tesseract-ocr`

## Features Overview

- **🔐 Secure Login**: OAuth2 with Gmail
- **📧 Auto Sync**: Fetches invoices from your email
- **🏷️ Smart Categories**: AI-based expense categorization
- **📊 Visual Dashboard**: Charts and spending insights
- **🔍 Filters**: Search by category, date range
- **⚙️ Settings**: Privacy controls and data management
- **🗑️ Data Control**: Revoke access or delete all data

## Need Help?

- Check `README.md` for detailed documentation
- See `DEPLOYMENT.md` for production setup
- Review `TASKS.md` for project roadmap
