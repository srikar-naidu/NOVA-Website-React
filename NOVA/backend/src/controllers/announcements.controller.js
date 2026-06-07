import asyncHandler from '../utils/asyncHandler.js';
import * as annService from '../services/announcements.service.js';

export const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await annService.getAnnouncements();
  res.json({ announcements });
});

export const addAnnouncement = asyncHandler(async (req, res) => {
  const newAnn = await annService.addAnnouncement(req.body);
  const announcements = await annService.getAnnouncements();
  res.json({ success: true, announcement: newAnn, announcements });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await annService.deleteAnnouncement(req.params.id);
  const announcements = await annService.getAnnouncements();
  res.json({ success: true, message: 'Deleted', announcements });
});
