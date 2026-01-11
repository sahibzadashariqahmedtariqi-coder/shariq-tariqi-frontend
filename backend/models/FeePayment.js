import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  month: {
    type: Number, // 1-12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  },
  // Payment proof screenshot
  paymentScreenshot: {
    type: String,
    default: null
  },
  paymentScreenshotPublicId: {
    type: String,
    default: null
  },
  // Payment details
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'jazzcash', 'easypaisa', 'other'],
    default: 'bank_transfer'
  },
  transactionId: {
    type: String,
    default: null
  },
  // Admin actions
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  // Notes
  studentNotes: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    default: null
  },
  // Due date for this month's fee
  dueDate: {
    type: Date,
    required: true
  },
  // Submission date
  submittedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure one fee record per student per month/year
feePaymentSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });
feePaymentSchema.index({ studentId: 1, month: 1, year: 1 });
feePaymentSchema.index({ status: 1 });

// Get month name
feePaymentSchema.virtual('monthName').get(function() {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[this.month - 1];
});

// Check if fee is overdue
feePaymentSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && new Date() > this.dueDate;
});

feePaymentSchema.set('toJSON', { virtuals: true });
feePaymentSchema.set('toObject', { virtuals: true });

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

export default FeePayment;
