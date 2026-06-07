import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: {
    day: { type: String },
    month: { type: String }
  },
  details: {
    location: { type: String },
    time: { type: String }
  },
  registrationLink: { type: String },
  icon: { type: String, default: 'fas fa-bullhorn' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
