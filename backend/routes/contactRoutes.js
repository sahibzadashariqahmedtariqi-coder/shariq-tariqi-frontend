import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContactStatus,
  deleteContact,
  replyContact
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createContact);

// Admin routes
router.get('/', protect, admin, getAllContacts);
router.get('/:id', protect, admin, getContactById);
router.put('/:id/status', protect, admin, updateContactStatus);
router.put('/:id/reply', protect, admin, replyContact);
router.delete('/:id', protect, admin, deleteContact);

export default router;
