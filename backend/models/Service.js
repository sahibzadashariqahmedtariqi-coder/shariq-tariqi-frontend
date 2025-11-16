import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
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
    default: 'Heart'
  },
  image: {
    type: String
  },
  category: {
    type: String,
    enum: ['healing', 'consultation', 'therapy', 'spiritual', 'other'],
    default: 'healing'
  },
  price: {
    type: Number,
    default: 0
  },
  duration: {
    type: String
  },
  features: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;
