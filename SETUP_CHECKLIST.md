# Setup Checklist

## ✅ What You Have
- [x] MongoDB Atlas connection string
- [x] Redis password/key
- [ ] ❌ Google OAuth credentials (you have Gemini API, need OAuth instead)

## 🔑 API Keys Needed

### 1. Google OAuth2 Credentials ⚠️ REQUIRED
**What you provided**: Gemini API key (wrong service)  
**What you need**: OAuth Client ID + Client Secret

**Follow**: `GOOGLE_OAUTH_SETUP.md` for detailed steps

**Quick version**:
1. Go to https://console.cloud.google.com/
2. Create project
3. Enable **Gmail API** (NOT Gemini)
4. Create **OAuth 2.0 Client ID** (NOT API key)
5. Get Client ID and Client Secret

---

### 2. MongoDB Atlas ✅ COMPLETE
```
mongodb+srv://tejb78300_db_user:IUkJAUQ3qT9pUihs@invoice-dashboard.8hprckv.mongodb.net/gmail-invoice-dashboard?retryWrites=true&w=majority&appName=invoice-dashboard
```

---

### 3. Redis Cloud ⚠️ NEED FULL URL
You provided the password: `A2ufv0lymjrm45gunti1qeayoswci2tyv6hn5gwz719mtm7gpzu`

**You need the full connection string from Redis Cloud**:
1. Login to your Redis Cloud dashboard
2. Go to your database
3. Look for "Public endpoint" or "Connection string"
4. Format: `redis://default:PASSWORD@host:port`

Example:
```
redis://default:A2ufv0lymjrm45gunti1qeayoswci2tyv6hn5gwz719mtm7gpzu@redis-12345.c1.us-east-1-2.ec2.redns.redis-cloud.com:12345
```

⚠️ **Find your Redis host and port** from Redis Cloud dashboard

---

### 4. JWT Secret ✅ EASY
Just create a random string. Examples:
```
my-super-secret-jwt-key-2024-invoice-dashboard-xyz123
```

Or generate one:
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## 📝 Next Steps

### Step 1: Get Google OAuth Credentials
Follow `GOOGLE_OAUTH_SETUP.md` - this is the most important step!

### Step 2: Get Full Redis URL
Check your Redis Cloud dashboard for the complete connection string.

### Step 3: Create .env files

**Backend** (`backend/.env`):
```bash
# Copy the template
cp backend/.env.configured backend/.env

# Edit backend/.env and add:
# - Your Google Client ID (from Step 1)
# - Your Google Client Secret (from Step 1)
# - Your full Redis URL (from Step 2)
# - A random JWT secret
```

**Frontend** (`frontend/.env`):
```bash
cp frontend/.env.example frontend/.env
# Default values are fine for local development
```

**Extraction** (`extraction/.env`):
```bash
cp extraction/.env.example extraction/.env
# Default values are fine
```

### Step 4: Install Dependencies
```powershell
# Run the setup script
.\setup-dev.ps1
```

### Step 5: Start Services
Open 3 terminals:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

**Terminal 3 - Extraction**:
```bash
cd extraction
python main.py
```

### Step 6: Test
Visit: http://localhost:5173

---

## ❓ FAQ

### Q: Can I use my Gemini API key?
**A**: No. Gemini is for AI features. Gmail access requires OAuth2 credentials (different system).

### Q: Where do I get the Google credentials?
**A**: Follow `GOOGLE_OAUTH_SETUP.md` - you need to create an OAuth client in Google Cloud Console.

### Q: Do I need a credit card for Google Cloud?
**A**: No! OAuth credentials are free. You only need billing for paid APIs (which we don't use).

### Q: What scopes does the app need?
**A**: `email`, `profile`, `gmail.readonly` (read-only, very safe)

### Q: Will this work with any Gmail account?
**A**: Yes, but you need to add yourself as a "test user" in OAuth consent screen during development.

---

## 🔍 Summary of What You Need to Do

1. ✅ MongoDB - Already configured
2. ⚠️ Redis - Get full URL from Redis Cloud dashboard
3. ❌ Google OAuth - **MUST CREATE** (follow GOOGLE_OAUTH_SETUP.md)
4. ✅ JWT Secret - Just make a random string

**The only blocker is Google OAuth credentials** - the Gemini key won't work for Gmail access.
