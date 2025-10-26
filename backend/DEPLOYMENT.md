# Deployment Guide

## Prerequisites
- Google Cloud Project with OAuth2 credentials
- MongoDB database (MongoDB Atlas recommended)
- Redis instance (Redis Labs or similar)
- Vercel account (frontend)
- Railway/Render/Heroku account (backend + extraction)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Configure OAuth consent screen
   - User Type: External
   - Scopes: email, profile, gmail.readonly
5. Create OAuth 2.0 credentials
   - Application type: Web application
   - Authorized redirect URIs: `https://your-backend-domain.com/auth/google/callback`
6. Save Client ID and Client Secret

## Frontend Deployment (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

Environment variables in Vercel:
- `VITE_API_URL`: Your backend URL

## Backend Deployment (Railway/Render)

```bash
cd backend
# Push to Railway or connect GitHub repo
```

Environment variables:
- `PORT`: 3000
- `NODE_ENV`: production
- `GOOGLE_CLIENT_ID`: From Google Cloud
- `GOOGLE_CLIENT_SECRET`: From Google Cloud
- `GOOGLE_REDIRECT_URI`: https://your-backend-domain.com/auth/google/callback
- `MONGODB_URI`: Your MongoDB connection string
- `REDIS_URL`: Your Redis connection string
- `JWT_SECRET`: Random secure string
- `EXTRACTION_SERVICE_URL`: Your extraction service URL
- `FRONTEND_URL`: Your Vercel frontend URL

## Extraction Service Deployment (Railway/Render)

```bash
cd extraction
# Push to Railway or connect GitHub repo
```

Environment variables:
- `PORT`: 8000
- `TESSERACT_CMD`: tesseract (or path if custom)

**Note**: Make sure to install system dependencies:
- Tesseract OCR
- Poppler (for PDF processing)

For Railway:
```toml
# Add to nixpacks.toml
[phases.setup]
aptPkgs = ["tesseract-ocr", "poppler-utils"]
```

## Database Setup

### MongoDB Atlas
1. Create cluster
2. Add database user
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string

### Redis Labs
1. Create database
2. Get connection string
3. Enable TLS if required

## Post-Deployment

1. Test OAuth flow
2. Verify Gmail API access
3. Test invoice extraction
4. Monitor logs for errors
5. Set up error tracking (Sentry recommended)

## Security Checklist

- [ ] HTTPS enabled on all services
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] JWT secret is strong
- [ ] MongoDB/Redis authentication enabled
- [ ] OAuth redirect URIs whitelisted
- [ ] Minimal Gmail API scopes used
