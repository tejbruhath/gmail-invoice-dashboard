import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  merchant: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['food', 'shopping', 'bills', 'entertainment', 'travel', 'healthcare', 'other']
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  rawText: String,
  attachmentUrl: String,
  extractionMethod: {
    type: String,
    enum: ['email_body', 'pdf', 'image_ocr'],
    default: 'email_body'
  },
  metadata: {
    subject: String,
    from: String,
    hasAttachment: Boolean
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
invoiceSchema.index({ userId: 1, date: -1 });
invoiceSchema.index({ userId: 1, category: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
