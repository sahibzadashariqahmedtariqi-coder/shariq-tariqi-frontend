import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide update title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide update description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  fullContent: {
    type: String,
    maxlength: [10000, 'Full content cannot exceed 10000 characters']
  },
  detailImage1: {
    type: String
  },
  detailImage2: {
    type: String
  },
  category: {
    type: String,
    enum: ['event', 'announcement', 'news', 'course', 'general'],
    default: 'general'
  },
  // NEW: Update Type for special buttons
  updateType: {
    type: String,
    enum: ['announcement', 'product', 'course', 'rohani_tour', 'donate'],
    default: 'announcement'
  },
  // Reference to Product ID (if updateType is 'product')
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // Reference to Course ID (if updateType is 'course')
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String
  },
  promoImage: {
    type: String
  },
  link: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Update = mongoose.model('Update', updateSchema);
export default Update;
