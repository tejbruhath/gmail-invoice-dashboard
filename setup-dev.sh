#!/bin/bash

echo "🚀 Setting up Gmail Invoice Dashboard..."

# Backend setup
echo "\n📦 Setting up Backend..."
cd backend
cp .env.example .env
npm install
cd ..

# Frontend setup
echo "\n📦 Setting up Frontend..."
cd frontend
cp .env.example .env
npm install
cd ..

# Extraction service setup
echo "\n📦 Setting up Extraction Service..."
cd extraction
cp .env.example .env
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo "\n✅ Setup complete!"
echo "\n📝 Next steps:"
echo "1. Update .env files with your credentials:"
echo "   - backend/.env: Google OAuth credentials, MongoDB URI, Redis URL"
echo "   - frontend/.env: API URL (usually default is fine for dev)"
echo "   - extraction/.env: Tesseract path (if not in PATH)"
echo ""
echo "2. Start MongoDB and Redis locally"
echo ""
echo "3. Run the services:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - Extraction: cd extraction && python main.py"
echo ""
echo "4. Visit http://localhost:5173 to see the app!"
