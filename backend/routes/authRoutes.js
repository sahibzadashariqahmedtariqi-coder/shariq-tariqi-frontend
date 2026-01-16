import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  updateUserRole,
  grantCourseAccess,
  revokeCourseAccess,
  getUserCourseAccess,
  getUserPasswordInfo,
  superAdminChangePassword
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

// Course Access Management (Admin only)
router.post('/users/:id/grant-course', protect, admin, grantCourseAccess);
router.delete('/users/:id/revoke-course/:courseId', protect, admin, revokeCourseAccess);
router.get('/users/:id/courses', protect, admin, getUserCourseAccess);

// Super Admin Only Routes - Password Management
router.get('/users/:id/password', protect, admin, getUserPasswordInfo);
router.put('/users/:id/change-password', protect, admin, superAdminChangePassword);

export default router;
