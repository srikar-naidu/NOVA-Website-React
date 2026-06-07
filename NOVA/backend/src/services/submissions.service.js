import Submission from '../models/Submission.model.js';
import Registration from '../models/Registration.model.js';

export const createSubmission = async (data) => {
  const team = await Registration.findOne({ teamId: data.teamId, status: { $in: ['verified', 'pending'] } });
  
  if (!team) {
    throw new Error('TEAM_NOT_FOUND');
  }

  const submission = new Submission(data);
  await submission.save();

  return submission;
};

export const getSubmissions = async () => {
  return await Submission.find().sort({ submittedAt: -1 });
};
