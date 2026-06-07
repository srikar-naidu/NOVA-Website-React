import asyncHandler from '../utils/asyncHandler.js';
import * as regService from '../services/registrations.service.js';
import { uploadToCloudinary } from '../middleware/upload.middleware.js';
import crypto from 'crypto';
import { sendPaymentVerified } from '../services/email.service.js';

const generateTeamId = () => crypto.randomBytes(4).toString('hex').toUpperCase();

export const registerTeam = asyncHandler(async (req, res) => {
  const { teamName, teamLeaderEmail, teamLeaderPhone, members, transactionId } = req.body;

  let parsedMembers;
  try {
    parsedMembers = JSON.parse(members);
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid members data format' });
  }

  if (!teamName || !teamLeaderEmail || !teamLeaderPhone || !parsedMembers || parsedMembers.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const MVSREC_EMAIL_REGEX = /^2451\d{2}\d{3}\d{3}@mvsrec\.edu\.in$/;
  if (!MVSREC_EMAIL_REGEX.test(teamLeaderEmail.toLowerCase().trim())) {
    return res.status(400).json({ success: false, message: 'Please use your official MVSREC college email!' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Payment proof screenshot is required' });
  }

  // Upload to Cloudinary
  let paymentProofUrl = '';
  try {
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    paymentProofUrl = uploadResult.secure_url;
  } catch (err) {
    console.error('[REGISTER] Cloudinary upload error:', err);
  }

  const teamId = generateTeamId();
  const membersArray = parsedMembers.map(m => `${m.name} (${m.phone})`);

  try {
    await regService.createRegistration({
      teamName,
      teamId,
      leadName: parsedMembers[0]?.name || 'Leader',
      leadEmail: teamLeaderEmail,
      leadPhone: teamLeaderPhone,
      members: membersArray,
      transactionId,
      paymentProofUrl
    });

    res.json({
      success: true,
      message: 'Registration successful! Save your Team ID somewhere safe!',
      teamId: teamId
    });
  } catch (error) {
    if (error.message === 'DUPLICATE_TEAM_NAME') {
      return res.status(409).json({ success: false, field: 'teamName', message: 'Team name taken' });
    }
    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ success: false, field: 'email', message: 'Email already registered' });
    }
    if (error.message === 'DUPLICATE_PHONE') {
      return res.status(409).json({ success: false, field: 'phone', message: 'Phone already registered' });
    }
    if (error.message === 'DUPLICATE_TRANSACTION') {
      return res.status(409).json({ success: false, field: 'transactionId', message: 'Transaction ID used' });
    }
    throw error;
  }
});

export const getAllRegistrations = asyncHandler(async (req, res) => {
  const registrations = await regService.getRegistrations();
  res.json({ success: true, registrations });
});

export const verifyTeam = asyncHandler(async (req, res) => {
  const reg = await regService.verifyRegistration(req.params.id);
  if (!reg) return res.status(404).json({ success: false, message: 'Not found' });
  
  await sendPaymentVerified(reg.leadEmail, reg.teamName, reg.teamId, reg.eventId);
  res.json({ success: true, registration: reg });
});
