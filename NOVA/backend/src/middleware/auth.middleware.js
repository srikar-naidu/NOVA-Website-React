import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token for admin routes
 */
export const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please login again.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('[AUTH] Authentication error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please login again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Please login again.'
    });
  }
};

/**
 * Clerk Authentication Middleware for regular users
 */
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

export const authenticateUser = ClerkExpressRequireAuth({
  // Optionally customize the error response
  onError: (err, req, res) => {
    return res.status(401).json({ success: false, error: 'Unauthorized: Please log in.' });
  }
});
