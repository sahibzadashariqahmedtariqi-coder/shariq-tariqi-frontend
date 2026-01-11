import mongoose from 'mongoose';

const lmsFeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true // Format: "January 2026"
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 5000
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partial'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paidDate: {
    type: Date
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'online', 'other'],
  },
  transactionId: {
    type: String
  },
  remarks: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure one fee record per student per month
lmsFeeSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

const LMSFee = mongoose.model('LMSFee', lmsFeeSchema);

export default LMSFee;
