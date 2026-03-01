import express from 'express';
import rateLimit from 'express-rate-limit';
import { chatbotMessage, chatbotInit } from '../controllers/chatbotController.js';

const router = express.Router();

// Rate limiter for chatbot - 20 messages per minute per IP
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: 'بہت زیادہ پیغامات۔ براہ کرم ایک منٹ بعد دوبارہ کوشش کریں۔' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no auth needed)
router.get('/init', chatbotInit);
router.post('/message', chatbotLimiter, chatbotMessage);

export default router;
