import mongoose from 'mongoose';

const lmsCourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  thumbnail: {
    type: String,
    default: '/images/default-course.jpg'
  },
  thumbnailPublicId: String,
  // Course type - paid or free
  courseType: {
    type: String,
    enum: ['free', 'paid'],
    default: 'paid'
  },
  price: {
    type: Number,
    default: 0
  },
  // Course category
  category: {
    type: String,
    enum: ['quran', 'hadith', 'fiqh', 'spirituality', 'arabic', 'other'],
    default: 'other'
  },
  // Course level
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Duration in hours (estimated)
  duration: {
    type: Number,
    default: 0
  },
  // Total classes count
  totalClasses: {
    type: Number,
    default: 0
  },
  // Course instructor
  instructor: {
    name: {
      type: String,
      default: 'Sahibzada Shariq Ahmed Tariqi'
    },
    bio: String,
    image: String
  },
  // Course features/highlights
  features: [{
    type: String
  }],
  // What students will learn
  learningOutcomes: [{
    type: String
  }],
  // Prerequisites
  prerequisites: [{
    type: String
  }],
  // Course status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  // Is course active
  isActive: {
    type: Boolean,
    default: true
  },
  // Enable certificate on completion
  certificateEnabled: {
    type: Boolean,
    default: true
  },
  // Certificate template
  certificateTemplate: {
    type: String,
    enum: ['default', 'premium', 'islamic'],
    default: 'islamic'
  },
  // Enrollment count
  enrollmentCount: {
    type: Number,
    default: 0
  },
  // Rating
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Start date (optional)
  startDate: Date,
  // End date (optional)
  endDate: Date
}, {
  timestamps: true
});

// Generate slug from title
lmsCourseSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for searching
lmsCourseSchema.index({ title: 'text', description: 'text' });
lmsCourseSchema.index({ status: 1, isActive: 1 });
lmsCourseSchema.index({ category: 1 });

const LMSCourse = mongoose.model('LMSCourse', lmsCourseSchema);

export default LMSCourse;
