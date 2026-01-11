import mongoose from 'mongoose';

const lmsProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',  // Changed from LMSCourse to Course
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSClass',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSEnrollment',
    required: true
  },
  // Progress status
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  // Watch progress (percentage)
  watchProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Last watched position (seconds)
  lastPosition: {
    type: Number,
    default: 0
  },
  // Total watch time (seconds)
  totalWatchTime: {
    type: Number,
    default: 0
  },
  // Started watching at
  startedAt: {
    type: Date,
    default: null
  },
  // Completed at
  completedAt: {
    type: Date,
    default: null
  },
  // Last accessed
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  // Notes taken by student
  studentNotes: {
    type: String,
    default: ''
  },
  // PDF downloaded
  pdfDownloaded: {
    type: Boolean,
    default: false
  },
  // Access count
  accessCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index - one progress record per user per class
lmsProgressSchema.index({ user: 1, class: 1 }, { unique: true });
lmsProgressSchema.index({ user: 1, course: 1 });
lmsProgressSchema.index({ enrollment: 1 });

// Mark as completed if watch progress >= 90%
lmsProgressSchema.methods.checkCompletion = function() {
  if (this.watchProgress >= 90 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
    return true; // Newly completed
  }
  return false;
};

const LMSProgress = mongoose.model('LMSProgress', lmsProgressSchema);

export default LMSProgress;
