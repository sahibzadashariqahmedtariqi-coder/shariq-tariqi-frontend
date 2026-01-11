import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createPaidStudent,
  getAllPaidStudents,
  getFeeHistory,
  submitFeePayment,
  approveFeePayment,
  rejectFeePayment,
  blockStudentAccess,
  unblockStudentAccess,
  getPendingFees,
  getAllFees,
  generateMonthlyFees,
  getMyFees
} from '../controllers/feeController.js';

const router = express.Router();

// Student routes (must be authenticated)
router.get('/my-fees', protect, getMyFees);
router.post('/submit', protect, submitFeePayment);

// Admin routes
router.post('/create-student', protect, admin, createPaidStudent);
router.get('/students', protect, admin, getAllPaidStudents);
router.get('/pending', protect, admin, getPendingFees);
router.get('/all', protect, admin, getAllFees);
router.get('/history/:studentId', protect, getFeeHistory);
router.put('/approve/:feeId', protect, admin, approveFeePayment);
router.put('/reject/:feeId', protect, admin, rejectFeePayment);
router.put('/block/:studentId', protect, admin, blockStudentAccess);
router.put('/unblock/:studentId', protect, admin, unblockStudentAccess);
router.post('/generate-monthly', protect, admin, generateMonthlyFees);

export default router;
