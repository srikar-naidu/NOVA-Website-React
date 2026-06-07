import express from 'express';
import { requireAuth } from '@clerk/express';
import * as teamFinderController from '../controllers/teamFinder.controller.js';

const router = express.Router();

// Public route to get open posts
router.get('/', teamFinderController.getPosts);

// Protected routes using Clerk Auth middleware
router.post('/', requireAuth(), teamFinderController.createPost);
router.patch('/:id/close', requireAuth(), teamFinderController.closePost);
router.delete('/:id', requireAuth(), teamFinderController.deletePost);

export default router;
