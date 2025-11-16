import express from 'express';
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getFeaturedArticles,
  addComment,
  approveComment
} from '../controllers/articleController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllArticles);
router.get('/featured', getFeaturedArticles);
router.get('/:id', getArticleById);
router.post('/:id/comment', addComment);

// Admin routes
router.post('/', protect, admin, createArticle);
router.put('/:id', protect, admin, updateArticle);
router.delete('/:id', protect, admin, deleteArticle);
router.put('/:id/comment/:commentId/approve', protect, admin, approveComment);

export default router;
