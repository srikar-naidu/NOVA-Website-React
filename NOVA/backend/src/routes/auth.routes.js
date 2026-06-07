import express from 'express';
import { adminLogin } from '../controllers/auth.controller.js';
import { loginLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/admin/login', loginLimiter, adminLogin);

export default router;
