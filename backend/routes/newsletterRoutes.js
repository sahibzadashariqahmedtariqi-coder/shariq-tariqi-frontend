import express from 'express';
import {
  getAllSubscribers,
  subscribe,
  unsubscribe,
  deleteSubscriber
} from '../controllers/newsletterController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/', protect, admin, getAllSubscribers);
router.delete('/:id', protect, admin, deleteSubscriber);

export default router;
