import express from 'express';
import {
  createDonation,
  uploadPaymentProof,
  getAllDonations,
  getDonationById,
  verifyDonation,
  rejectDonation,
  getDonationStats,
  deleteDonation,
} from '../controllers/donationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createDonation);
router.put('/:id/payment', uploadPaymentProof);
router.get('/:id', getDonationById);

// Admin routes
router.get('/', protect, admin, getAllDonations);
router.get('/admin/stats', protect, admin, getDonationStats);
router.put('/:id/verify', protect, admin, verifyDonation);
router.put('/:id/reject', protect, admin, rejectDonation);
router.delete('/:id', protect, admin, deleteDonation);

export default router;
