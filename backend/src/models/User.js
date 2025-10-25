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
      default: ['food', 'shopping', 'bills', 'entertainment', 'travel', 'healthcare', 'other']
    }
  }
}, {
  timestamps: true
});

// Encrypt tokens before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('accessToken') && this.accessToken) {
    this.accessToken = await bcrypt.hash(this.accessToken, 10);
  }
  if (this.isModified('refreshToken') && this.refreshToken) {
    this.refreshToken = await bcrypt.hash(this.refreshToken, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
