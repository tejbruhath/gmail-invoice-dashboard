import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: String,
  accessToken: {
    type: String,
    select: false // Don't return by default
  },
  refreshToken: {
    type: String,
    select: false
  },
  tokenExpiry: Date,
  lastSync: Date,
  settings: {
    autoSync: {
      type: Boolean,
      default: true
    },
    syncFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'manual'],
      default: 'daily'
    },
    categories: {
      type: [String],
      default: ['food', 'groceries', 'shopping', 'bills', 'entertainment', 'travel', 'healthcare', 'other']
    }
  }
}, {
  timestamps: true
});

// NOTE: Tokens are stored in plain text for now
// In production, use proper encryption (crypto.createCipher) not hashing (bcrypt)
// Bcrypt is one-way and cannot be decrypted for use with Google API
userSchema.pre('save', async function(next) {
  // TODO: Implement proper encryption/decryption for tokens
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
