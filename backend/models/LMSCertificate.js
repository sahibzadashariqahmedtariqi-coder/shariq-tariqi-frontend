import mongoose from 'mongoose';

const lmsCertificateSchema = new mongoose.Schema({
  // Unique certificate number
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
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
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LMSEnrollment',
    required: true
  },
  // Student details (snapshot at time of certificate)
  studentName: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    default: null
  },
  // Course details (snapshot)
  courseTitle: {
    type: String,
    required: true
  },
  courseCategory: {
    type: String
  },
  // Completion details
  completionDate: {
    type: Date,
    required: true
  },
  // Issue date
  issuedAt: {
    type: Date,
    default: Date.now
  },
  // Issued by
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Certificate template
  template: {
    type: String,
    enum: ['default', 'premium', 'islamic'],
    default: 'islamic'
  },
  // Certificate status
  status: {
    type: String,
    enum: ['issued', 'revoked'],
    default: 'issued'
  },
  // Revocation details
  revokedAt: {
    type: Date,
    default: null
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  revocationReason: {
    type: String,
    default: null
  },
  // Verification URL/QR code data
  verificationCode: {
    type: String,
    unique: true
  },
  // PDF URL (if generated)
  pdfUrl: {
    type: String,
    default: null
  },
  pdfPublicId: {
    type: String,
    default: null
  },
  // Additional info
  grade: {
    type: String,
    enum: ['distinction', 'merit', 'pass', 'none'],
    default: 'pass'
  },
  score: {
    type: Number,
    default: null
  },
  // Instructor signature
  instructorName: {
    type: String,
    default: 'Sahibzada Shariq Ahmed Tariqi'
  },
  instructorTitle: {
    type: String,
    default: 'Spiritual Guide & Islamic Scholar'
  }
}, {
  timestamps: true
});

// Generate certificate number and verification code before save
lmsCertificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments() + 1;
    this.certificateNumber = `CERT-SAT-${year}-${String(count).padStart(5, '0')}`;
  }
  
  if (!this.verificationCode) {
    // Generate random verification code
    this.verificationCode = `${this.certificateNumber}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
  
  next();
});

// Index
lmsCertificateSchema.index({ user: 1, course: 1 });

const LMSCertificate = mongoose.model('LMSCertificate', lmsCertificateSchema);

export default LMSCertificate;
