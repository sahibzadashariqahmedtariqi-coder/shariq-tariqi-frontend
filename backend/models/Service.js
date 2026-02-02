import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Please provide service title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide service description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    default: 'heart'
  },
  image: {
    type: String
  },
  category: {
    type: String,
    enum: ['healing', 'consultation', 'therapy', 'spiritual', 'other'],
    default: 'healing'
  },
  // PKR Prices
  price: {
    type: Number,
    default: 0
  },
  videoCallPrice: {
    type: Number,
    default: 0
  },
  // INR Prices
  priceINR: {
    type: Number,
    default: 0
  },
  videoCallPriceINR: {
    type: Number,
    default: 0
  },
  priceLabel: {
    type: String,
    default: '/consultation'
  },
  duration: {
    type: String
  },
  features: [String],
  gradient: {
    type: String,
    default: 'from-primary-500 to-primary-700'
  },
  stats: {
    served: { type: String, default: '1000+' },
    rating: { type: String, default: '4.8' }
  },
  isFree: {
    type: Boolean,
    default: false
  },
  whatsappMessage: {
    type: String,
    default: ''
  },
  appointmentService: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
