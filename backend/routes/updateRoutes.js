import express from 'express';
import {
  getAllUpdates,
  getUpdateById,
  createUpdate,
  updateUpdate,
  deleteUpdate,
  getPinnedUpdates
} from '../controllers/updateController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllUpdates);
router.get('/pinned', getPinnedUpdates);
router.get('/:id', getUpdateById);

// Admin routes
router.post('/', protect, admin, createUpdate);
router.put('/:id', protect, admin, updateUpdate);
router.delete('/:id', protect, admin, deleteUpdate);

export default router;
