import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // JWT token ID (jti claim) - unique identifier for the token
  tokenId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Device/browser info
  deviceInfo: {
    type: String,
    default: 'Unknown Device'
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  
  // IP Address
  ipAddress: {
    type: String
  },
  
  // Location (optional - can be derived from IP)
  location: {
    type: String
  },
  
  // Session status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Logout info
  loggedOutAt: {
    type: Date
  },
  logoutReason: {
    type: String,
    enum: ['manual', 'expired', 'logout_all', 'admin_action', 'password_change']
  }
});

// Index for cleanup of expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to invalidate all sessions for a user
sessionSchema.statics.invalidateAllUserSessions = async function(userId, reason = 'logout_all') {
  return await this.updateMany(
    { user: userId, isActive: true },
    { 
      isActive: false, 
      loggedOutAt: new Date(),
      logoutReason: reason
    }
  );
};

// Static method to invalidate a specific session
sessionSchema.statics.invalidateSession = async function(tokenId, reason = 'manual') {
  return await this.findOneAndUpdate(
    { tokenId },
    { 
      isActive: false, 
      loggedOutAt: new Date(),
      logoutReason: reason
    }
  );
};

// Static method to check if a session is valid
sessionSchema.statics.isSessionValid = async function(tokenId) {
  const session = await this.findOne({ tokenId, isActive: true });
  if (!session) return false;
  if (session.expiresAt < new Date()) {
    await this.invalidateSession(tokenId, 'expired');
    return false;
  }
  // Update last active time
  session.lastActiveAt = new Date();
  await session.save();
  return true;
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
