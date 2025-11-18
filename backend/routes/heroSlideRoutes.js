import express from 'express';
import {
  getHeroSlides,
  getHeroSlide,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide
} from '../controllers/heroSlideController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHeroSlides);
router.get('/:id', getHeroSlide);

// Admin routes
router.post('/', protect, admin, createHeroSlide);
router.put('/:id', protect, admin, updateHeroSlide);
router.delete('/:id', protect, admin, deleteHeroSlide);

export default router;
