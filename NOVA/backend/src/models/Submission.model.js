import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  teamId: { type: String, required: true },
  userId: { type: String },
  title: { type: String },
  repoUrl: { type: String }, // Used for videoPresentationUrl / projectUrl based on previous schema
  projectUrl: { type: String, required: true },
  videoPresentationUrl: { type: String, required: true },
  description: { type: String },
  eventId: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  score: { type: Number },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
