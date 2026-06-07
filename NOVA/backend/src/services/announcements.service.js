import Announcement from '../models/Announcement.model.js';

export const getAnnouncements = async () => {
  return await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
};

export const addAnnouncement = async (data) => {
  const announcement = new Announcement(data);
  await announcement.save();
  return announcement;
};

export const deleteAnnouncement = async (id) => {
  const announcement = await Announcement.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!announcement) throw new Error('NOT_FOUND');
  return announcement;
};
