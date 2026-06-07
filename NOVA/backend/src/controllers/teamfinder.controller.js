import * as teamFinderService from '../services/teamFinder.service.js';

export const getPosts = async (req, res) => {
  try {
    const filters = {
      skills: req.query.skills,
      year: req.query.year,
      branch: req.query.branch
    };
    const posts = await teamFinderService.getPosts(filters);
    res.json({ success: true, posts });
  } catch (error) {
    console.error('[TeamFinder] GET posts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
};

export const createPost = async (req, res) => {
  try {
    // With Clerk Auth middleware, req.auth should be populated
    const userId = req.auth?.userId || req.body.userId; // fallback
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: missing userId' });
    }

    const data = { ...req.body, userId };
    await teamFinderService.createPost(data);
    
    res.json({ success: true, message: 'Post created successfully' });
  } catch (error) {
    console.error('[TeamFinder] POST create error:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
};

export const closePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const post = await teamFinderService.getPostById(postId);
    if (!post || post.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this post' });
    }

    await teamFinderService.closePost(postId);
    res.json({ success: true, message: 'Post closed' });
  } catch (error) {
    console.error('[TeamFinder] PATCH close error:', error);
    res.status(500).json({ success: false, error: 'Failed to close post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const post = await teamFinderService.getPostById(postId);
    if (!post || post.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this post' });
    }

    await teamFinderService.deletePost(postId);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('[TeamFinder] DELETE error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
};
