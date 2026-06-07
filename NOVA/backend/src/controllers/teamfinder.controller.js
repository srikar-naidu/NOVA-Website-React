import asyncHandler from '../utils/asyncHandler.js';
import * as teamService from '../services/teamfinder.service.js';

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await teamService.getOpenPosts(req.query);
  res.json({ success: true, posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const userId = req.auth.userId; // Provided by ClerkExpressRequireAuth
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const postData = { ...req.body, userId };
  const newPost = await teamService.createPost(postData);
  
  res.json({ success: true, post: newPost });
});

export const closePost = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const post = await teamService.closePost(req.params.id, userId);
  res.json({ success: true, post });
});

export const deletePost = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  await teamService.deletePost(req.params.id, userId);
  res.json({ success: true, message: 'Deleted' });
});
