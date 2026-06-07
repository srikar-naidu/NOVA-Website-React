import TeamPost from '../models/TeamPost.model.js';

export const getOpenPosts = async (query = {}) => {
  const filter = { isOpen: true };
  
  if (query.skills) {
    const skillsArray = query.skills.split(',').map(s => new RegExp(s.trim(), 'i'));
    filter.skills = { $in: skillsArray };
  }
  
  if (query.eventId) {
    filter.eventId = query.eventId;
  }
  
  return await TeamPost.find(filter).sort({ createdAt: -1 });
};

export const createPost = async (data) => {
  const post = new TeamPost(data);
  await post.save();
  return post;
};

export const closePost = async (id, userId) => {
  const post = await TeamPost.findById(id);
  if (!post) throw new Error('NOT_FOUND');
  
  // Verify ownership
  if (post.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }
  
  post.isOpen = false;
  await post.save();
  return post;
};

export const deletePost = async (id, userId) => {
  const post = await TeamPost.findById(id);
  if (!post) throw new Error('NOT_FOUND');
  
  // Verify ownership
  if (post.userId !== userId) {
    throw new Error('UNAUTHORIZED');
  }
  
  await TeamPost.findByIdAndDelete(id);
  return true;
};
