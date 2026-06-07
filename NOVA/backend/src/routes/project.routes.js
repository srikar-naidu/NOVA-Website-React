import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import * as projectController from '../controllers/project.controller.js';

const router = express.Router();

// Setup Multer for up to 5 images
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Admin auth middleware wrapper
const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Authentication failed.' });
  }
};

// Public routes
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

// Admin only routes
router.post('/', authenticateAdmin, upload.array('screenshots', 5), projectController.createProject);
router.patch('/:id', authenticateAdmin, projectController.updateProject);
router.delete('/:id', authenticateAdmin, projectController.deleteProject);

export default router;
