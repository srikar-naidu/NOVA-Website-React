import asyncHandler from '../utils/asyncHandler.js';
import * as clubService from '../services/club.service.js';

export const registerMember = asyncHandler(async (req, res) => {
  const { name, rollno, email, phone, year, interests, message } = req.body;

  if (!name || !rollno || !email || !phone || !year) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
  if (!phoneRegex.test(cleanPhone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone' });
  }

  try {
    await clubService.createClubMember({
      name, rollno, email, phone: cleanPhone, year, interests, message
    });
    res.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    if (error.message.includes('DUPLICATE')) {
      return res.status(409).json({ success: false, message: 'You are already registered' });
    }
    throw error;
  }
});
