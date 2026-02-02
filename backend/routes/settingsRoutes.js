import express from 'express';
import { getSettings, updateSettings, getAppointmentSettings, updateAppointmentSettings, getAboutSettings, updateAboutSettings } from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get settings
router.get('/', getSettings);

// Appointment settings routes
router.get('/appointments', getAppointmentSettings);
router.put('/appointments', protect, admin, updateAppointmentSettings);

// About page settings routes
router.get('/about', getAboutSettings);
router.put('/about', protect, admin, updateAboutSettings);

// Admin routes - Update settings
router.put('/', protect, admin, updateSettings);

export default router;
