import express from 'express';
import { registerMember } from '../controllers/club.controller.js';
import { standardLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/clubregister', standardLimiter, registerMember);

export default router;
