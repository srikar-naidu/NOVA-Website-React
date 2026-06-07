import express from 'express';
import { getAnnouncements, addAnnouncement, deleteAnnouncement } from '../controllers/announcements.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/announcements', getAnnouncements);
router.post('/announcements', authenticateAdmin, addAnnouncement);
router.delete('/announcements/:id', authenticateAdmin, deleteAnnouncement);

export default router;
