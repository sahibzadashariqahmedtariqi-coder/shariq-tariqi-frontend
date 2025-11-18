import express from 'express';
import upload from '../middleware/upload.js';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Upload single image (Admin only)
router.post('/image', protect, admin, upload.single('image'), uploadImage);

// Delete image from Cloudinary (Admin only)
router.delete('/image', protect, admin, deleteImage);

export default router;
