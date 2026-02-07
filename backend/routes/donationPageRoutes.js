import express from 'express';
import {
  getPublishedDonationPages,
  getAllDonationPages,
  getDonationPageBySlug,
  createDonationPage,
  updateDonationPage,
  deleteDonationPage
} from '../controllers/donationPageController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPublishedDonationPages);
router.get('/slug/:slug', getDonationPageBySlug);

// Admin routes
router.get('/admin/all', protect, admin, getAllDonationPages);
router.post('/', protect, admin, createDonationPage);
router.put('/:id', protect, admin, updateDonationPage);
router.delete('/:id', protect, admin, deleteDonationPage);

export default router;
