import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },

  // What action was performed
  action: {
    type: String,
    required: true,
    enum: [
      // Auth actions
      'LOGIN',
      'LOGOUT',
      'LOGOUT_ALL_DEVICES',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      
      // User management
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_ROLE_CHANGE',
      
      // LMS Student actions
      'LMS_STUDENT_CREATE',
      'LMS_STUDENT_UPDATE',
      'LMS_STUDENT_DELETE',
      'LMS_STUDENT_ACCESS_TOGGLE',
      'LMS_STUDENT_PASSWORD_RESET',
      
      // Course actions
      'COURSE_CREATE',
      'COURSE_UPDATE',
      'COURSE_DELETE',
      
      // LMS actions
      'LMS_CLASS_CREATE',
      'LMS_CLASS_UPDATE',
      'LMS_CLASS_DELETE',
      'LMS_ENROLLMENT_CREATE',
      'LMS_ENROLLMENT_DELETE',
      'LMS_CERTIFICATE_ISSUE',
      'LMS_CERTIFICATE_REVOKE',
      'LMS_CERTIFICATE_RESTORE',
      'LMS_CERTIFICATE_DELETE',
      
      // Content actions
      'ARTICLE_CREATE',
      'ARTICLE_UPDATE',
      'ARTICLE_DELETE',
      'PRODUCT_CREATE',
      'PRODUCT_UPDATE',
      'PRODUCT_DELETE',
      'SERVICE_CREATE',
      'SERVICE_UPDATE',
      'SERVICE_DELETE',
      'VIDEO_CREATE',
      'VIDEO_UPDATE',
      'VIDEO_DELETE',
      
      // Settings
      'SETTINGS_UPDATE',
      'HERO_SLIDE_CREATE',
      'HERO_SLIDE_UPDATE',
      'HERO_SLIDE_DELETE',
      
      // Orders & Fees
      'ORDER_STATUS_UPDATE',
      'FEE_PAYMENT_UPDATE',
      'LMS_FEE_UPDATE',
      
      // Other
      'OTHER'
    ]
  },

  // What was affected
  targetType: {
    type: String,
    enum: ['User', 'Course', 'LMSClass', 'LMSEnrollment', 'LMSCertificate', 'Article', 'Product', 'Service', 'Video', 'Order', 'FeePayment', 'HeroSlide', 'Settings', 'Other']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  targetName: {
    type: String
  },

  // Additional details
  description: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Store any additional data like old/new values
  },

  // Request info
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for faster queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

// Static method to create audit log easily
auditLogSchema.statics.log = async function(data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('Audit log error:', error.message);
    // Don't throw - audit logging should not break the main operation
  }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
