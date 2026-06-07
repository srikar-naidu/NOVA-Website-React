import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  teamId: { type: String, required: true, unique: true },
  leadName: { type: String }, // Since the old notion schema didn't have lead name specifically, just members, we can keep it optional or parse from members
  leadEmail: { type: String, required: true },
  leadPhone: { type: String, required: true },
  members: [{ type: String }],
  eventId: { type: String },
  paymentProofUrl: { type: String },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Registration', registrationSchema);
