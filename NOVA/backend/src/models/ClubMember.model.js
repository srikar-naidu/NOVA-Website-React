import mongoose from 'mongoose';

const clubMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollno: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  year: { type: String },
  interests: [{ type: String }],
  message: { type: String },
  status: { type: String, enum: ['Pending Review', 'Approved', 'Rejected'], default: 'Pending Review' },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('ClubMember', clubMemberSchema);
