import mongoose from 'mongoose';

const lmsClassSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',  // Changed from LMSCourse to Course
    required: true
  },
  // Class/Lesson title
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Section/Module this class belongs to
  section: {
    type: String,
    default: 'Main Content'
  },
  // Order within section
  order: {
    type: Number,
    default: 0
  },
  // YouTube video URL (unlisted)
  videoUrl: {
    type: String,
    required: [true, 'YouTube video URL is required']
  },
  // Extracted YouTube video ID
  videoId: {
    type: String
  },
  // Video duration in minutes
  duration: {
    type: Number,
    default: 0
  },
  // PDF attachment
  pdfAttachment: {
    url: String,
    publicId: String,
    filename: String,
    size: Number
  },
  // Additional resources/links
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'link', 'download'],
      default: 'link'
    }
  }],
  // Class is locked globally (admin controls this)
  isLocked: {
    type: Boolean,
    default: true // Locked by default, admin unlocks
  },
  // Is class published
  isPublished: {
    type: Boolean,
    default: false
  },
  // Preview class (available without enrollment)
  isPreview: {
    type: Boolean,
    default: false
  },
  // Class notes/content
  notes: {
    type: String,
    default: ''
  },
  // Unlock date (optional - auto unlock on this date)
  unlockDate: {
    type: Date,
    default: null
  },
  // Created/updated by
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

// Extract YouTube video ID from URL
lmsClassSchema.pre('save', function(next) {
  if (this.isModified('videoUrl') && this.videoUrl) {
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = this.videoUrl.match(pattern);
      if (match) {
        this.videoId = match[1];
        break;
      }
    }
  }
  next();
});

// Index
lmsClassSchema.index({ course: 1, order: 1 });
lmsClassSchema.index({ course: 1, section: 1, order: 1 });
lmsClassSchema.index({ isLocked: 1, isPublished: 1 });

const LMSClass = mongoose.model('LMSClass', lmsClassSchema);

export default LMSClass;
