import Session from '../models/Session.js';
import asyncHandler from 'express-async-handler';
import { createAuditLog } from './auditLogController.js';

// @desc    Get my active sessions
// @route   GET /api/sessions/my
// @access  Private
export const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ 
    user: req.user._id,
    isActive: true 
  }).sort({ lastActiveAt: -1 });

  // Mark the current session
  const currentTokenId = req.tokenId; // Will be set in auth middleware

  const sessionsWithCurrent = sessions.map(session => ({
    ...session.toObject(),
    isCurrent: session.tokenId === currentTokenId
  }));

  res.json({
    success: true,
    data: sessionsWithCurrent
  });
});

// @desc    Logout from a specific session
// @route   DELETE /api/sessions/:sessionId
// @access  Private
export const logoutSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findOne({ 
    _id: sessionId, 
    user: req.user._id,
    isActive: true 
  });

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  await Session.invalidateSession(session.tokenId, 'manual');

  res.json({
    success: true,
    message: 'Session logged out successfully'
  });
});

// @desc    Logout from all devices except current
// @route   POST /api/sessions/logout-all
// @access  Private
export const logoutAllSessions = asyncHandler(async (req, res) => {
  const currentTokenId = req.tokenId;

  // Invalidate all sessions except current
  await Session.updateMany(
    { 
      user: req.user._id, 
      isActive: true,
      tokenId: { $ne: currentTokenId }
    },
    { 
      isActive: false, 
      loggedOutAt: new Date(),
      logoutReason: 'logout_all'
    }
  );

  // Create audit log
  await createAuditLog(req, 'LOGOUT_ALL_DEVICES', {
    description: 'User logged out from all other devices'
  });

  res.json({
    success: true,
    message: 'Logged out from all other devices'
  });
});

// @desc    Get all sessions (Admin only - for monitoring)
// @route   GET /api/sessions/all
// @access  Private/Admin
export const getAllSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, userId, isActive } = req.query;

  const query = {};
  
  if (userId) {
    query.user = userId;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [sessions, total] = await Promise.all([
    Session.find(query)
      .populate('user', 'name email role')
      .sort({ lastActiveAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Session.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: sessions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Force logout a user (Admin only)
// @route   POST /api/sessions/force-logout/:userId
// @access  Private/Admin
export const forceLogoutUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await Session.invalidateAllUserSessions(userId, 'admin_action');

  // Create audit log
  await createAuditLog(req, 'LOGOUT_ALL_DEVICES', {
    targetType: 'User',
    targetId: userId,
    description: `Admin force logged out user from ${result.modifiedCount} devices`
  });

  res.json({
    success: true,
    message: `User logged out from ${result.modifiedCount} devices`
  });
});

export default { getMySessions, logoutSession, logoutAllSessions, getAllSessions, forceLogoutUser };
