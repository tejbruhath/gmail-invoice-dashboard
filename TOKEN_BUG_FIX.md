# 🐛 Critical Bug Found & Fixed: Token Storage Issue

## The Problem

The User model was using **bcrypt to hash OAuth tokens** before saving them to the database. 

### Why this is wrong:
- **Bcrypt is a one-way hash** - you cannot decrypt it back to the original value
- **OAuth tokens need to be used** with Google's API to refresh access
- When the app tried to use the hashed token, Google rejected it with a 400 error

### The error you saw:
```
status: 400 from 'https://oauth2.googleapis.com/token'
```

This happened because the app was sending a bcrypt hash to Google instead of the actual refresh token.

## The Fix

✅ **Removed bcrypt hashing** from the User model
✅ Tokens are now stored in plain text (for development)
✅ Added TODO note for proper encryption in production

## What You Need to Do

Since your existing user has **hashed tokens** in the database, you need to:

### Option 1: Clear Database & Re-authenticate (Recommended)
```bash
cd backend
node clear-user.js
```
Then go to http://localhost:5173 and sign in again with Google.

### Option 2: Manual Database Clear
1. Open MongoDB Compass or your MongoDB client
2. Delete all documents from the `users` collection
3. Delete all documents from the `invoices` collection
4. Go to http://localhost:5173 and sign in again

## After Re-authentication

Once you sign in again:
1. Fresh, **unhashed tokens** will be saved
2. Click "Sync" button
3. The backend will successfully use the refresh token with Google
4. Emails will be fetched and processed
5. Dashboard will show your invoice data!

## Security Note

For production, we should implement proper **encryption** (not hashing):
- Use `crypto.createCipheriv()` to encrypt tokens
- Use `crypto.createDecipheriv()` to decrypt when needed
- Store encryption key in environment variable
- This allows reversible encryption while keeping tokens secure

---

**TL;DR**: The tokens were being hashed (one-way) instead of encrypted (reversible), so Google couldn't validate them. Clear the database and re-authenticate to get fresh tokens.
