import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { 
  getMySessions, 
  logoutSession, 
  logoutAllSessions,
  getAllSessions,
  forceLogoutUser
} from '../controllers/sessionController.js';

const router = express.Router();

// User routes (require authentication)
router.get('/my', protect, getMySessions);
router.delete('/:sessionId', protect, logoutSession);
router.post('/logout-all', protect, logoutAllSessions);

// Admin routes
router.get('/all', protect, admin, getAllSessions);
router.post('/force-logout/:userId', protect, admin, forceLogoutUser);

export default router;
