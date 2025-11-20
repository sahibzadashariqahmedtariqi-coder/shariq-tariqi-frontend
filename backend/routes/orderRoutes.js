import express from 'express';
import {
  createOrder,
  uploadPaymentProof,
  getMyOrders,
  getAllOrders,
  verifyPayment,
  rejectPayment,
  getOrder,
  trackOrder,
  deleteOrder,
  restoreOrder,
  permanentDeleteOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.put('/:id/payment', uploadPaymentProof);
router.get('/track/:orderNumber', trackOrder);

// User routes
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrder);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/verify', protect, admin, verifyPayment);
router.put('/:id/reject', protect, admin, rejectPayment);
router.delete('/:id', protect, admin, deleteOrder);
router.put('/:id/restore', protect, admin, restoreOrder);
router.delete('/:id/permanent', protect, admin, permanentDeleteOrder);

export default router;
