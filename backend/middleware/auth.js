import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (include activeSessionToken for LMS students)
      req.user = await User.findById(decoded.id).select('-password +activeSessionToken');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // For LMS students, verify single device login
      if (req.user.isLMSStudent && decoded.sessionToken) {
        // Check if session token matches the active one in database
        if (req.user.activeSessionToken !== decoded.sessionToken) {
          return res.status(401).json({
            success: false,
            message: 'Session expired. You have been logged in from another device. Please login again.',
            code: 'SESSION_REPLACED'
          });
        }
      }

      // Remove activeSessionToken from req.user before proceeding
      req.user.activeSessionToken = undefined;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};
