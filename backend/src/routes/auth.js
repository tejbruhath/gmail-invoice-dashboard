import express from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Ensure dotenv is loaded
dotenv.config();

const router = express.Router();

// Hardcoded redirect URI for local development
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

// Debug log
console.log('🔐 Auth Route - Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// Generate auth URL
router.get('/google', (req, res) => {
  // Validate credentials
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    return res.status(500).json({ 
      error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env file' 
    });
  }

  const scopes = [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    redirect_uri: REDIRECT_URI
  });

  console.log('Generated auth URL:', authUrl);
  res.json({ authUrl });
});

// OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Find or create user
    let user = await User.findOne({ googleId: userInfo.id });

    if (!user) {
      user = new User({
        email: userInfo.email,
        googleId: userInfo.id,
        name: userInfo.name,
        picture: userInfo.picture
      });
    }

    // Update tokens
    user.accessToken = tokens.access_token;
    user.refreshToken = tokens.refresh_token;
    user.tokenExpiry = new Date(tokens.expiry_date);
    await user.save();

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie and redirect
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-accessToken -refreshToken');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
