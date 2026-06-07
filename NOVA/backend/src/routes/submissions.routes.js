import express from 'express';
import { submitProject, getAllSubmissions } from '../controllers/submissions.controller.js';
import { standardLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/submit', standardLimiter, submitProject);
router.get('/submissions', authenticateAdmin, getAllSubmissions);

export default router;
