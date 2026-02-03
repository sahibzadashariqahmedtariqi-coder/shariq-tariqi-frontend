import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getAllCoursesAdmin,
  getPublishedCourses,
  getCourseDetails,
  getCourseForStudent,
  updateCourse,
  enableLMS,
  addClass,
  getCourseClasses,
  updateClass,
  deleteClass,
  toggleClassLock,
  toggleClassPublish,
  unlockAllClasses,
  lockAllClasses,
  toggleCoursePublish
} from '../controllers/lmsCourseController.js';
import {
  enrollStudent,
  getCourseEnrollments,
  getMyEnrolledCourses,
  toggleEnrollmentAccess,
  removeEnrollment,
  blockFeeDefaulters,
  watchClass,
  updateProgress,
  getMyCourseProgress,
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
  getCertificateDetails,
  getAllCertificates,
  revokeCertificate,
  toggleStudentClassLock,
  getEnrollmentClasses,
  bulkUpdateStudentClassAccess,
  issueCertificateManually,
  restoreCertificate,
  deleteCertificate
} from '../controllers/lmsEnrollmentController.js';
import {
  createLMSStudent,
  getAllLMSStudents,
  getLMSStudent,
  updateLMSStudent,
  deleteLMSStudent,
  toggleLMSAccess,
  resetStudentPassword,
  lmsStudentLogin,
  getMyEnrolledCoursesLMS,
  getLMSDetailedStats
} from '../controllers/lmsStudentController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get published courses (for marketing/course listing)
router.get('/courses/published', getPublishedCourses);

// Verify certificate (public)
router.get('/certificates/verify/:code', verifyCertificate);

// LMS Student Login (public)
router.post('/student-login', lmsStudentLogin);

// ==================== PROTECTED ROUTES (Students) ====================

// Get my enrolled courses
router.get('/my-courses', protect, getMyEnrolledCourses);

// Get course details for enrolled student
router.get('/courses/:courseId/learn', protect, getCourseForStudent);

// Watch a class
router.get('/watch/:classId', protect, watchClass);

// Update watch progress
router.put('/progress/:classId', protect, updateProgress);

// Get my progress in a course
router.get('/courses/:courseId/my-progress', protect, getMyCourseProgress);

// Generate certificate
router.post('/certificates/generate', protect, generateCertificate);

// Get my certificates
router.get('/certificates/my', protect, getMyCertificates);

// Get certificate details
router.get('/certificates/:id', protect, getCertificateDetails);

// ==================== ADMIN ROUTES ====================

// Course Management (uses existing courses from /admin/courses)
router.get('/courses', protect, admin, getAllCoursesAdmin);
router.get('/courses/:courseId', protect, admin, getCourseDetails);
router.put('/courses/:courseId', protect, admin, updateCourse);
router.put('/courses/:courseId/enable-lms', protect, admin, enableLMS);
router.put('/courses/:courseId/toggle-publish', protect, admin, toggleCoursePublish);

// Class Management
router.post('/courses/:courseId/classes', protect, admin, upload.single('pdfAttachment'), addClass);
router.get('/courses/:courseId/classes', protect, admin, getCourseClasses);
router.put('/classes/:classId', protect, admin, upload.single('pdfAttachment'), updateClass);
router.delete('/classes/:classId', protect, admin, deleteClass);

// Class Lock/Unlock
router.put('/classes/:classId/toggle-lock', protect, admin, toggleClassLock);
router.put('/classes/:classId/toggle-publish', protect, admin, toggleClassPublish);
router.put('/courses/:courseId/unlock-all', protect, admin, unlockAllClasses);
router.put('/courses/:courseId/lock-all', protect, admin, lockAllClasses);

// Enrollment Management
router.post('/enroll', protect, admin, enrollStudent);
router.get('/courses/:courseId/enrollments', protect, admin, getCourseEnrollments);
router.put('/enrollments/:enrollmentId/block', protect, admin, toggleEnrollmentAccess);
router.delete('/enrollments/:enrollmentId', protect, admin, removeEnrollment);
router.put('/courses/:courseId/block-defaulters', protect, admin, blockFeeDefaulters);

// Per-Student Class Access Control
router.get('/enrollments/:enrollmentId/classes', protect, admin, getEnrollmentClasses);
router.put('/enrollments/:enrollmentId/class/:classId/toggle-lock', protect, admin, toggleStudentClassLock);
router.put('/enrollments/:enrollmentId/bulk-class-access', protect, admin, bulkUpdateStudentClassAccess);

// Certificate Management (Admin)
router.get('/certificates', protect, admin, getAllCertificates);
router.post('/certificates/issue', protect, admin, issueCertificateManually);
router.put('/certificates/:id/revoke', protect, admin, revokeCertificate);
router.put('/certificates/:id/restore', protect, admin, restoreCertificate);
router.delete('/certificates/:id', protect, admin, deleteCertificate);

// ==================== LMS STUDENT MANAGEMENT (Admin) ====================
router.get('/students/stats/detailed', protect, admin, getLMSDetailedStats);
router.post('/students', protect, admin, createLMSStudent);
router.get('/students', protect, admin, getAllLMSStudents);
router.get('/students/:id', protect, admin, getLMSStudent);
router.put('/students/:id', protect, admin, updateLMSStudent);
router.delete('/students/:id', protect, admin, deleteLMSStudent);
router.put('/students/:id/toggle-access', protect, admin, toggleLMSAccess);
router.put('/students/:id/reset-password', protect, admin, resetStudentPassword);

// ==================== LMS STUDENT ROUTES ====================
router.get('/my-enrolled-courses', protect, getMyEnrolledCoursesLMS);

export default router;
