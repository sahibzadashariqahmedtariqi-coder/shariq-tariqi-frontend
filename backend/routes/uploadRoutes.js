import express from 'express';
import upload from '../middleware/upload.js';
import { uploadImage, deleteImage, uploadMureedImage } from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Upload payment proof image (Public - for product orders without login)
router.post('/payment-proof', upload.single('image'), uploadImage);

// Upload Mureed profile picture (Public - uses separate Cloudinary)
router.post('/mureed-image', upload.single('image'), uploadMureedImage);

// Upload single image (Admin only)
router.post('/image', protect, admin, upload.single('image'), uploadImage);

// Delete image from Cloudinary (Admin only)
router.delete('/image', protect, admin, deleteImage);

export default router;
