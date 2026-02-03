import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    // Check if requesting user is super admin
    const isSuperAdmin = req.user && req.user.isSuperAdmin;
    
    let users;
    if (isSuperAdmin) {
      // Super admin can see admin-set passwords
      users = await User.find().select('-password +adminSetPassword');
    } else {
      users = await User.find().select('-password -adminSetPassword');
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
      isSuperAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Protect super admin from deletion
    if (user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Super Admin cannot be deleted'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Protect super admin from role changes
    if (user.isSuperAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can modify Super Admin account'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grant course access to user
// @route   POST /api/auth/users/:id/grant-course
// @access  Private/Admin
export const grantCourseAccess = async (req, res, next) => {
  try {
    const { courseId, expiresAt, notes } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if course access already granted
    const existingGrant = user.grantedCourses?.find(
      grant => grant.courseId.toString() === courseId
    );

    if (existingGrant) {
      // Update existing grant
      existingGrant.expiresAt = expiresAt;
      existingGrant.notes = notes;
      existingGrant.grantedAt = new Date();
      existingGrant.grantedBy = req.user._id;
    } else {
      // Add new grant
      user.grantedCourses.push({
        courseId,
        grantedBy: req.user._id,
        grantedAt: new Date(),
        expiresAt,
        notes
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Course access granted successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke course access from user
// @route   DELETE /api/auth/users/:id/revoke-course/:courseId
// @access  Private/Admin
export const revokeCourseAccess = async (req, res, next) => {
  try {
    const { id, courseId } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove course from grantedCourses
    user.grantedCourses = user.grantedCourses.filter(
      grant => grant.courseId.toString() !== courseId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Course access revoked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user with course access details
// @route   GET /api/auth/users/:id/courses
// @access  Private/Admin
export const getUserCourseAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('grantedCourses.courseId', 'title image isPaid price')
      .populate('grantedCourses.grantedBy', 'name email')
      .populate('enrolledCourses', 'title image isPaid price');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        grantedCourses: user.grantedCourses,
        enrolledCourses: user.enrolledCourses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Super Admin: Get user password (decrypted view not possible, but can reset)
// @route   GET /api/auth/users/:id/password
// @access  Private/Super Admin Only
export const getUserPasswordInfo = async (req, res, next) => {
  try {
    // Only super admin can access this
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can access password information'
      });
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // We cannot decrypt bcrypt passwords, but we can confirm it exists
    res.status(200).json({
      success: true,
      message: 'Password is encrypted and cannot be revealed. Use change password to set a new one.',
      data: {
        userId: user._id,
        userName: user.name,
        email: user.email,
        hasPassword: !!user.password,
        isSuperAdmin: user.isSuperAdmin
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Super Admin: Change any user's password
// @route   PUT /api/auth/users/:id/change-password
// @access  Private/Super Admin Only
export const superAdminChangePassword = async (req, res, next) => {
  try {
    // Only super admin can change other users' passwords
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can change user passwords'
      });
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Save plain password for super admin to view
    user.adminSetPassword = newPassword;
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password changed successfully for ${user.name}`
    });
  } catch (error) {
    next(error);
  }
};
