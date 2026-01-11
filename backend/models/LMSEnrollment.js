import mongoose from 'mongoose';

const lmsEnrollmentSchema = new mongoose.Schema({
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
  // Enrollment status
  status: {
    type: String,
    enum: ['active', 'completed', 'suspended', 'expired'],
    default: 'active'
  },
  // How did user enroll
  enrollmentType: {
    type: String,
    enum: ['paid', 'free', 'granted'], // granted = admin gave access
    default: 'granted'
  },
  // Enrolled by admin
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Enrollment date
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  // Expiry date (for time-limited access)
  expiresAt: {
    type: Date,
    default: null
  },
  // Access blocked due to fee default
  accessBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: {
    type: String,
    default: null
  },
  blockedAt: {
    type: Date,
    default: null
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Progress tracking
  progress: {
    completedClasses: {
      type: Number,
      default: 0
    },
    totalClasses: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    lastAccessedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LMSClass',
      default: null
    },
    lastAccessedAt: {
      type: Date,
      default: null
    }
  },
  // Completion details
  completedAt: {
    type: Date,
    default: null
  },
  // Certificate issued
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSCertificate',
    default: null
  },
  // Admin notes
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to ensure one enrollment per user per course
lmsEnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
lmsEnrollmentSchema.index({ user: 1, status: 1 });
lmsEnrollmentSchema.index({ course: 1, status: 1 });

// Method to check if enrollment is valid for access
lmsEnrollmentSchema.methods.canAccess = function() {
  if (this.status !== 'active') return false;
  if (this.accessBlocked) return false;
  if (this.expiresAt && new Date(this.expiresAt) < new Date()) return false;
  return true;
};

// Update progress percentage
lmsEnrollmentSchema.methods.updateProgress = function(completedClasses, totalClasses) {
  this.progress.completedClasses = completedClasses;
  this.progress.totalClasses = totalClasses;
  this.progress.percentage = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;
  
  if (this.progress.percentage >= 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
};

const LMSEnrollment = mongoose.model('LMSEnrollment', lmsEnrollmentSchema);

export default LMSEnrollment;
