import express from 'express';
import { registerTeam, getAllRegistrations, verifyTeam } from '../controllers/registrations.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { standardLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', standardLimiter, upload.single('paymentProof'), registerTeam);
router.get('/registrations', authenticateAdmin, getAllRegistrations);
router.patch('/registrations/:id/verify', authenticateAdmin, verifyTeam);

export default router;
