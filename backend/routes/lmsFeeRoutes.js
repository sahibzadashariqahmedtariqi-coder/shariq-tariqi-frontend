import express from 'express';
import {
  getStudentFees,
  getAllFees,
  createFee,
  updateFee,
  deleteFee,
  generateMonthlyFees,
  getStudentFeeSummary,
  getMyFees,
  submitPaymentRequest,
  getMyPaymentRequests,
  getAllPaymentRequests,
  reviewPaymentRequest,
  deletePaymentRequest
} from '../controllers/lmsFeeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Student routes (must be before admin middleware)
router.get('/my', protect, getMyFees);
router.post('/pay', protect, submitPaymentRequest);
router.get('/my-payments', protect, getMyPaymentRequests);

// All routes below require authentication and admin access
router.use(protect);
router.use(admin);

// Admin: Payment requests management
router.get('/payment-requests', getAllPaymentRequests);
router.put('/payment-requests/:requestId', reviewPaymentRequest);
router.delete('/payment-requests/:requestId', deletePaymentRequest);

// Fee routes
router.route('/')
  .get(getAllFees)
  .post(createFee);

router.post('/generate', generateMonthlyFees);

router.route('/:feeId')
  .put(updateFee)
  .delete(deleteFee);

router.get('/student/:studentId', getStudentFees);
router.get('/summary/:studentId', getStudentFeeSummary);

export default router;
