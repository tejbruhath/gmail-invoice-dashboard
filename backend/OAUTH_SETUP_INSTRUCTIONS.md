# 🔧 Google OAuth Setup Instructions

## ⚠️ CRITICAL: You need to add your Google OAuth credentials!

The error "Missing required parameter: client_id" means your `.env` file still has placeholder values.

## Step 1: Get Your Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click on it to view the **Client ID** and **Client Secret**

## Step 2: Update Your .env File

Open `backend/.env` and replace these lines:

```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

With your actual credentials:

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
```

## Step 3: Verify Your Google Cloud Console Settings

Make sure these are configured in Google Cloud Console:

### Authorized JavaScript origins:
- `http://localhost:3000`
- `http://localhost:5173`

### Authorized redirect URIs:
- `http://localhost:3000/auth/google/callback`

## Step 4: Restart the Backend

The backend should auto-restart with nodemon, but if not:
```bash
cd backend
npm run dev
```

## Step 5: Test the Login

1. Open http://localhost:5173
2. Click "Sign In" or "Get Started with Gmail"
3. Check the browser console for logs
4. You should be redirected to Google's OAuth consent screen

## Troubleshooting

If you see an alert saying "Google OAuth not configured", it means:
- The `.env` file still has placeholder values
- The backend couldn't read the `.env` file
- You need to add your actual Google credentials

---

**Current Status**: 
- ✅ Redirect URI is hardcoded: `http://localhost:3000/auth/google/callback`
- ✅ Frontend is calling the correct endpoint
- ❌ Google credentials need to be added to `.env`
