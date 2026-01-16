import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide course title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide course description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  image: {
    type: String,
    required: [true, 'Please provide course image']
  },
  category: {
    type: String,
    required: [true, 'Please provide course category'],
    default: 'spiritual'
  },
  duration: {
    type: String,
    required: [true, 'Please provide course duration']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'Urdu/English'
  },
  instructor: {
    type: String,
    default: 'Sahibzada Shariq Ahmed Tariqi'
  },
  price: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  syllabus: [{
    title: String,
    description: String,
    duration: String
  }],
  enrolledStudents: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  // ========== LMS INTEGRATION FIELDS ==========
  isLMSEnabled: {
    type: Boolean,
    default: false
  },
  lmsStatus: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  certificateEnabled: {
    type: Boolean,
    default: false
  },
  certificateTemplate: {
    type: String,
    default: 'default'
  },
  totalClasses: {
    type: Number,
    default: 0
  },
  // ========== END LMS FIELDS ==========
  // Indian price in INR
  priceINR: {
    type: Number,
    min: 0,
    default: null
  }
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
