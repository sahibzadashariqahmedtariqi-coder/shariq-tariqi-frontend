import mongoose from 'mongoose';

const lmsPaymentRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSFee',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'easypaisa', 'jazzcash', 'other'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  accountTitle: {
    type: String
  },
  accountNumber: {
    type: String
  },
  paymentProof: {
    type: String // Cloudinary URL for screenshot
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminRemarks: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const LMSPaymentRequest = mongoose.model('LMSPaymentRequest', lmsPaymentRequestSchema);

export default LMSPaymentRequest;
