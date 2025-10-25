# Google OAuth2 Setup Guide for Gmail Access

## ⚠️ IMPORTANT: You need OAuth credentials, NOT Gemini API key!

The Gemini API key is for Google's AI service. For Gmail access, you need OAuth2 credentials.

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click the project dropdown at the top
- Click "New Project"
- Name: "Invoice Dashboard" (or any name)
- Click "Create"

### 3. Enable Gmail API
1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on it and press **"Enable"**

### 4. Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type → Click **"Create"**
3. Fill in the form:
   - **App name**: Invoice Dashboard
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. On the **Scopes** page, click **"Add or Remove Scopes"**
   - Search and add: `email`, `profile`, `gmail.readonly`
   - Click **"Update"** → **"Save and Continue"**
6. On **Test users** page:
   - Click **"Add Users"**
   - Add your Gmail address (the one you'll use to login)
   - Click **"Save and Continue"**
7. Click **"Back to Dashboard"**

### 5. Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** at the top
3. Select **"OAuth 2.0 Client ID"**
4. If prompted to configure consent screen, you've already done it
5. Application type: **"Web application"**
6. Name: **"Invoice Dashboard Client"**
7. Under **"Authorized redirect URIs"**:
   - Click **"+ Add URI"**
   - Enter: `http://localhost:3000/auth/google/callback`
8. Click **"Create"**

### 6. Copy Your Credentials
A popup will show your credentials:
- **Client ID**: Looks like `123456789-abcdefgh.apps.googleusercontent.com`
- **Client Secret**: Looks like `GOCSPX-abcd1234efgh5678`

**SAVE THESE!** You'll need them for the .env file.

### 7. Update Your .env File
Copy `backend/.env.configured` to `backend/.env` and update:
```env
GOOGLE_CLIENT_ID=<paste your Client ID here>
GOOGLE_CLIENT_SECRET=<paste your Client Secret here>
```

## What Each Credential Does

| Credential | Purpose | Where to Get |
|------------|---------|--------------|
| **Google Client ID** | Identifies your app to Google | Google Cloud Console → OAuth 2.0 Client |
| **Google Client Secret** | Secret key for OAuth flow | Same as above |
| **MongoDB URI** | ✅ You already have this | MongoDB Atlas |
| **Redis URL** | ✅ You already have this | Redis Cloud |
| **JWT Secret** | Signs session tokens | Generate random string |

## Testing

After setup:
1. Start your backend: `cd backend && npm run dev`
2. Visit: `http://localhost:3000/auth/google`
3. You should see Google's OAuth consent screen
4. Authorize the app
5. Should redirect back to your app

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- The redirect URI in Google Console must EXACTLY match
- Make sure it's: `http://localhost:3000/auth/google/callback`
- No trailing slash, correct port

### "Access blocked: This app's request is invalid"
- Make sure Gmail API is enabled
- Check OAuth consent screen is configured
- Add yourself as a test user

### "The OAuth client was not found"
- Client ID or Secret is wrong
- Copy them again from Google Console

## Production Setup

When deploying to production:
1. Add production redirect URI: `https://your-domain.com/auth/google/callback`
2. Update `GOOGLE_REDIRECT_URI` in production .env
3. Consider publishing OAuth consent screen (if public app)
