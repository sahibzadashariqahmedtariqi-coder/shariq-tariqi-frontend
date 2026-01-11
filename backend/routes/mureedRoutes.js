import express from 'express';
import {
  registerMureed,
  getMureedById,
  getAllMureeds,
  updateMureedStatus,
  deleteMureed,
  getMureedStats,
  checkContact,
} from '../controllers/mureedController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerMureed);
router.get('/card/:id', getMureedById);
router.get('/check-contact/:contact', checkContact);

// Admin routes
router.get('/', protect, admin, getAllMureeds);
router.get('/stats', protect, admin, getMureedStats);
router.put('/:id/status', protect, admin, updateMureedStatus);
router.delete('/:id', protect, admin, deleteMureed);

export default router;
