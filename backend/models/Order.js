import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Order Details
    orderType: {
      type: String,
      enum: ['course', 'product', 'appointment'],
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    
    // Item Reference
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Not required for appointments
      refPath: 'orderType',
    },
    itemTitle: {
      type: String,
      required: true,
    },
    
    // Payment Details
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    paymentProof: {
      type: String, // Cloudinary URL of payment screenshot
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
    
    // Customer Message (for appointments/special requests)
    customerMessage: {
      type: String,
    },
    
    // Additional Info for different order types
    appointmentDate: {
      type: Date,
    },
    appointmentTime: {
      type: String,
    },
    shippingAddress: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    
    // Soft Delete (Trash)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order number
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const prefix = this.orderType.charAt(0).toUpperCase();
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `${prefix}${timestamp}${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
