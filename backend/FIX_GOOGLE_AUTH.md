# Google OAuth Redirect URI Fix

## Problem
Error 400: redirect_uri_mismatch - The redirect URI in the request doesn't match the one configured in Google Cloud Console.

## Solution

### Step 1: Update Your .env.local File
Open `nextjs-invoice-dashboard/.env.local` and change:

**FROM:**
```
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

**TO:**
```
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### Step 2: Update Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID (the one with ID: 985398731191-l6dc71a43g2j9tqukqo6qnk3risbs0tu)
4. Under **Authorized redirect URIs**, add or update to:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Click **SAVE**

### Step 3: Restart Your Development Server
After making both changes:
1. Stop your Next.js server (Ctrl+C)
2. Start it again: `npm run dev` or `yarn dev`

### Why This Happened
Your Next.js API routes are under `/api/` directory, so the callback route is at `/api/auth/google/callback`, not `/auth/google/callback`.

## Quick Test
After fixing, try signing in with Google again. The error should be resolved.
