import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lms_student'],
    default: 'user'
  },
  // ========== LMS STUDENT SPECIFIC FIELDS ==========
  isLMSStudent: {
    type: Boolean,
    default: false
  },
  lmsStudentId: {
    type: String,
    unique: true,
    sparse: true // Unique LMS ID like SAT-STU-0001
  },
  lmsAccessEnabled: {
    type: Boolean,
    default: true // Admin can disable LMS access
  },
  lmsCreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin who created this student account
  },
  // ========== END LMS STUDENT FIELDS ==========
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // ========== PAID STUDENT FIELDS ==========
  isPaidStudent: {
    type: Boolean,
    default: false
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness
  },
  monthlyFee: {
    type: Number,
    default: 0
  },
  feeStatus: {
    type: String,
    enum: ['active', 'defaulter', 'suspended'],
    default: 'active'
  },
  courseAccessBlocked: {
    type: Boolean,
    default: false
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
  blockReason: {
    type: String,
    default: null
  },
  enrollmentDate: {
    type: Date,
    default: null
  },
  // ========== END PAID STUDENT FIELDS ==========
  // Course Access Management - Admin can grant access to paid courses
  grantedCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date // Optional expiry date for course access
    },
    notes: String // Admin notes for why access was granted
  }],
  // Enrolled courses (paid by user)
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user has access to a course (either paid or granted by admin)
userSchema.methods.hasCourseAccess = function(courseId) {
  const courseIdStr = courseId.toString();
  
  // Check enrolled courses (paid)
  const isEnrolled = this.enrolledCourses?.some(id => id.toString() === courseIdStr);
  
  // Check granted courses (by admin)
  const isGranted = this.grantedCourses?.some(grant => {
    if (grant.courseId.toString() !== courseIdStr) return false;
    // Check if access has expired
    if (grant.expiresAt && new Date(grant.expiresAt) < new Date()) return false;
    return true;
  });
  
  return isEnrolled || isGranted;
};

const User = mongoose.model('User', userSchema);
export default User;
