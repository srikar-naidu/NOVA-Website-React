import mongoose from 'mongoose';

const teamPostSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk User ID
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String }],
  lookingFor: { type: String },
  eventId: { type: String },
  contactInfo: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('TeamPost', teamPostSchema);
