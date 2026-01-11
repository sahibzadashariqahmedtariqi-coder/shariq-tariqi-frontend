import express from 'express';
import {
  getStudentFees,
  getAllFees,
  createFee,
  updateFee,
  deleteFee,
  generateMonthlyFees,
  getStudentFeeSummary
} from '../controllers/lmsFeeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin access
router.use(protect);
router.use(admin);

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
