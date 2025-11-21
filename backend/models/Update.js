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
  category: {
    type: String,
    enum: ['event', 'announcement', 'news', 'course', 'general'],
    default: 'general'
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
