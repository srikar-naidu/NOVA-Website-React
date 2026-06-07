import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';

export const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
    console.error('[AUTH] Admin credentials not configured');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

  if (!isValidPassword) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { role: 'admin', username: username, timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ success: true, token: token, message: 'Login successful' });
});
