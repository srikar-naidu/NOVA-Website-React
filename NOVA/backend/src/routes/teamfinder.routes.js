import express from 'express';
import { getPosts, createPost, closePost, deletePost } from '../controllers/teamfinder.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/teamfinder', getPosts);
router.post('/teamfinder', authenticateUser, createPost);
router.patch('/teamfinder/:id/close', authenticateUser, closePost);
router.delete('/teamfinder/:id', authenticateUser, deletePost);

export default router;
