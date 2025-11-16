import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUserAppointments
} from '../controllers/appointmentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/my-appointments', protect, getUserAppointments);
router.post('/', createAppointment);

// Admin routes
router.get('/', protect, admin, getAllAppointments);
router.get('/:id', protect, admin, getAppointmentById);
router.put('/:id', protect, admin, updateAppointment);
router.delete('/:id', protect, admin, deleteAppointment);

export default router;
