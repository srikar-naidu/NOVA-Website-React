import asyncHandler from '../utils/asyncHandler.js';
import * as subService from '../services/submissions.service.js';

export const submitProject = asyncHandler(async (req, res) => {
  const { submissionTeamId, projectUrl, videoPresentationUrl } = req.body;

  if (!submissionTeamId || !projectUrl || !videoPresentationUrl) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (!videoPresentationUrl.includes('drive.google.com')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid Google Drive link' });
  }

  try {
    await subService.createSubmission({
      teamId: submissionTeamId,
      projectUrl,
      videoPresentationUrl
    });

    res.json({
      success: true,
      message: 'Project submitted successfully!',
      teamId: submissionTeamId
    });
  } catch (error) {
    if (error.message === 'TEAM_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Team not found or not verified.'
      });
    }
    throw error;
  }
});

export const getAllSubmissions = asyncHandler(async (req, res) => {
  const submissions = await subService.getSubmissions();
  res.json({ success: true, submissions });
});
