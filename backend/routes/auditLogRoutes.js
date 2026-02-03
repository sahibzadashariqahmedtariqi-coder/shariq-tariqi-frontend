import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { 
  getAuditLogs, 
  getAuditLogStats, 
  getUserAuditLogs 
} from '../controllers/auditLogController.js';

const router = express.Router();

// All routes require admin access
router.use(protect, admin);

// Get audit logs with filtering and pagination
router.get('/', getAuditLogs);

// Get audit log statistics
router.get('/stats', getAuditLogStats);

// Get audit logs for a specific user
router.get('/user/:userId', getUserAuditLogs);

export default router;
