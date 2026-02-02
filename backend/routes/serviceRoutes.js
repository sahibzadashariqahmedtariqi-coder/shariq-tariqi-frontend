import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getFeaturedServices,
  bulkUpdateServices
} from '../controllers/serviceController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/featured', getFeaturedServices);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', protect, admin, createService);
router.put('/bulk', protect, admin, bulkUpdateServices);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

export default router;
