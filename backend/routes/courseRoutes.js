import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getFeaturedCourses,
  enrollInCourse,
  addCourseReview
} from '../controllers/courseController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/:id/enroll', protect, enrollInCourse);
router.post('/:id/review', protect, addCourseReview);

// Admin routes
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

export default router;
