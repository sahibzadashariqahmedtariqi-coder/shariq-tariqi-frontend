import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get settings
router.get('/', getSettings);

// Admin routes - Update settings
router.put('/', protect, admin, updateSettings);

export default router;
