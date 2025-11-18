import express from 'express';
import { getStats, updateStats } from '../controllers/statsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get stats
router.get('/', getStats);

// Admin routes - Update stats
router.put('/', protect, admin, updateStats);

export default router;
