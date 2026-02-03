import AuditLog from '../models/AuditLog.js';
import asyncHandler from 'express-async-handler';

// @desc    Get audit logs (Admin only)
// @route   GET /api/audit-logs
// @access  Private/Admin
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    action, 
    userId, 
    targetType, 
    startDate, 
    endDate,
    search 
  } = req.query;

  const query = {};

  // Filter by action
  if (action) {
    query.action = action;
  }

  // Filter by user
  if (userId) {
    query.user = userId;
  }

  // Filter by target type
  if (targetType) {
    query.targetType = targetType;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Search in description, userName, userEmail, targetName
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { userName: { $regex: search, $options: 'i' } },
      { userEmail: { $regex: search, $options: 'i' } },
      { targetName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email'),
    AuditLog.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get audit log stats (Admin only)
// @route   GET /api/audit-logs/stats
// @access  Private/Admin
export const getAuditLogStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalLogs,
    todayLogs,
    loginAttempts,
    actionsByType
  ] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ createdAt: { $gte: today } }),
    AuditLog.countDocuments({ action: 'LOGIN', createdAt: { $gte: today } }),
    AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalLogs,
      todayLogs,
      todayLoginAttempts: loginAttempts,
      topActions: actionsByType
    }
  });
});

// @desc    Get recent activity for a user
// @route   GET /api/audit-logs/user/:userId
// @access  Private/Admin
export const getUserAuditLogs = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 20 } = req.query;

  const logs = await AuditLog.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: logs
  });
});

// Helper function to create audit log (exported for use in other controllers)
export const createAuditLog = async (req, action, data = {}) => {
  try {
    await AuditLog.log({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      action,
      targetType: data.targetType,
      targetId: data.targetId,
      targetName: data.targetName,
      description: data.description,
      metadata: data.metadata,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
  }
};

export default { getAuditLogs, getAuditLogStats, getUserAuditLogs, createAuditLog };
