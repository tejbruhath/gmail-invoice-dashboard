# PowerShell setup script for Windows

Write-Host "🚀 Setting up Gmail Invoice Dashboard..." -ForegroundColor Green

# Backend setup
Write-Host "`n📦 Setting up Backend..." -ForegroundColor Cyan
Set-Location backend
Copy-Item .env.example .env
npm install
Set-Location ..

# Frontend setup
Write-Host "`n📦 Setting up Frontend..." -ForegroundColor Cyan
Set-Location frontend
Copy-Item .env.example .env
npm install
Set-Location ..

# Extraction service setup
Write-Host "`n📦 Setting up Extraction Service..." -ForegroundColor Cyan
Set-Location extraction
Copy-Item .env.example .env
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Set-Location ..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env files with your credentials:"
Write-Host "   - backend/.env: Google OAuth credentials, MongoDB URI, Redis URL"
Write-Host "   - frontend/.env: API URL (usually default is fine for dev)"
Write-Host "   - extraction/.env: Tesseract path (if not in PATH)"
Write-Host ""
Write-Host "2. Start MongoDB and Redis locally"
Write-Host ""
Write-Host "3. Run the services in separate terminals:"
Write-Host "   - Backend: cd backend; npm run dev"
Write-Host "   - Frontend: cd frontend; npm run dev"
Write-Host "   - Extraction: cd extraction; python main.py"
Write-Host ""
Write-Host "4. Visit http://localhost:5173 to see the app!"
