import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    // Donation Details
    donationNumber: {
      type: String,
      unique: true,
    },
    
    // Donor Information
    donorName: {
      type: String,
      required: true,
    },
    donorEmail: {
      type: String,
      required: true,
    },
    donorPhone: {
      type: String,
      required: true,
    },
    donorCountry: {
      type: String,
      default: 'Pakistan',
    },
    
    // Donation Amount
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['PKR', 'INR', 'USD'],
      default: 'PKR',
    },
    
    // Donation Purpose
    purpose: {
      type: String,
      enum: ['general', 'madrasa', 'orphans', 'poor', 'mosque', 'education', 'other'],
      default: 'general',
    },
    customPurpose: {
      type: String,
    },
    donorMessage: {
      type: String,
    },
    
    // Payment Details
    paymentStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    paymentProof: {
      type: String, // Cloudinary URL
    },
    transactionId: {
      type: String,
    },
    senderAccountNumber: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
    
    // Admin Actions
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    
    // Thank You Message Sent
    thankYouSent: {
      type: Boolean,
      default: false,
    },
    
    // Anonymous Donation
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    
    // Recurring Donation
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
    },
  },
  {
    timestamps: true,
  }
);

// Generate donation number before saving
donationSchema.pre('save', async function (next) {
  if (!this.donationNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.donationNumber = `DON-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
