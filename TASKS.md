# Task List

## Phase 1: Core Setup ✅
- [x] Project structure
- [x] README
- [x] Backend scaffolding
- [x] Frontend scaffolding
- [x] Extraction service scaffolding

## Phase 2: Backend ✅
- [x] Express server setup
- [x] Google OAuth2 integration
- [x] MongoDB models (User, Invoice)
- [x] Redis job queue
- [x] Gmail API integration
- [x] API endpoints (auth, fetch, dashboard)
- [x] Token encryption
- [x] Error handling & logging

## Phase 3: Extraction Service ✅
- [x] FastAPI server
- [x] PDF parser (pdfplumber)
- [x] OCR integration (pytesseract)
- [x] Data normalization
- [x] Merchant name extraction
- [x] Amount/date parsing

## Phase 4: Categorization ✅
- [x] Rule-based categorization
- [x] Merchant keyword mapping
- [x] Category confidence scoring
- [ ] ML model (optional future)

## Phase 5: Frontend ✅
- [x] React + Vite setup
- [x] Tailwind + ShadCN UI
- [x] OAuth login flow
- [x] Dashboard layout
- [x] Charts (Recharts)
- [x] Invoice table with filters
- [x] Category breakdown
- [x] Settings/privacy page

## Phase 6: Integration ✅
- [x] Connect frontend to backend
- [x] Test email fetching flow (ready to test)
- [x] Test extraction pipeline (ready to test)
- [x] Error boundaries
- [x] Loading states

## Phase 7: Deployment ✅
- [x] Frontend Vercel config
- [x] Backend deployment config
- [x] Environment variables
- [x] Setup scripts
- [x] Deployment guide

## Phase 8: Testing & Polish (Ready to start)
- [ ] Set up local development environment
- [ ] Test OAuth flow end-to-end
- [ ] Test invoice extraction with real emails
- [ ] Responsive design testing
- [ ] Performance optimization
- [ ] Rate limiting
- [ ] Monitoring/logging
- [ ] User feedback mechanisms

## Next Steps
1. Run setup script: `.\setup-dev.ps1` (Windows) or `./setup-dev.sh` (Mac/Linux)
2. Configure environment variables
3. Set up Google OAuth credentials
4. Start MongoDB and Redis
5. Start all three services
6. Test the application
