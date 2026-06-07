import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Client } from '@notionhq/client';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import AnnouncementService from './AnnouncementService.js';
import teamFinderRoutes from './src/routes/teamFinder.routes.js';
import projectRoutes from './src/routes/project.routes.js';

// Load environment variablesco
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'novathon-payments',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};



// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// ============================================
// NOTION CACHE
// ============================================

const notionCache = {
  registrationDataSourceId: null,
  membersDataSourceId: null
};

/**
 * Get cached registration database data source ID
 * Saves 1-2 seconds per submission!
 */
async function getRegistrationDataSourceId() {
  if (notionCache.registrationDataSourceId) {
    console.log('[CACHE] Using cached registration dataSourceId');
    return notionCache.registrationDataSourceId;
  }

  try {
    console.log('[CACHE] Fetching registration dataSourceId...');
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    });

    notionCache.registrationDataSourceId = database.data_sources[0].id;
    console.log('[CACHE] Cached registration dataSourceId:', notionCache.registrationDataSourceId);

    return notionCache.registrationDataSourceId;
  } catch (error) {
    console.error('[CACHE] Error fetching dataSourceId:', error);
    throw error;
  }
}
async function getMembersDataSourceId() {
  if (notionCache.membersDataSourceId) {
    console.log('[CACHE] Using cached registration dataSourceId');
    return notionCache.membersDataSourceId;
  }

  try {
    console.log('[CACHE] Fetching registration dataSourceId...');
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_MEMBERS_DATABASE_ID
    });

    notionCache.membersDataSourceId = database.data_sources[0].id;
    console.log('[CACHE] Cached registration dataSourceId:', notionCache.membersDataSourceId);

    return notionCache.membersDataSourceId;
  } catch (error) {
    console.error('[CACHE] Error fetching dataSourceId:', error);
    throw error;
  }
}
/**
 * Clear cache (useful for debugging or if database structure changes)
 */
function clearNotionCache() {
  notionCache.registrationDataSourceId = null;
  notionCache.membersDataSourceId = null;
  console.log('[CACHE] Cache cleared');
}

//validate email 
function isValidMVSRECEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const MVSREC_EMAIL_REGEX = /^2451\d{2}\d{3}\d{3}@mvsrec\.edu\.in$/;

  return MVSREC_EMAIL_REGEX.test(email.toLowerCase().trim());
}

/**
 * Check for duplicate registrations in Notion
 */
async function checkDuplicateRegistration(email, phone, transactionId) {
  try {
    const dataSourceId = await getRegistrationDataSourceId();

    const response = await notion.request({
      path: `data_sources/${dataSourceId}/query`,
      method: 'POST',
      body: {
        filter: {
          or: [
            { property: 'Team Leader Email', email: { equals: email } },
            { property: 'Team Leader Phone', phone_number: { equals: phone } },
            { property: 'Transaction ID', rich_text: { contains: transactionId } }
          ]
        }
      }
    });

    if (response.results.length > 0) {
      const duplicate = response.results[0];
      const properties = duplicate.properties;

      // Identify which field is duplicate
      if (properties['Team Leader Email']?.email === email) {
        return { isDuplicate: true, field: 'email', message: 'This email is already registered' };
      }
      if (properties['Team Leader Phone']?.phone_number === phone) {
        return { isDuplicate: true, field: 'phone', message: 'This phone number is already registered' };
      }
      if (properties['Transaction ID']?.rich_text?.[0]?.text?.content === transactionId) {
        return { isDuplicate: true, field: 'transactionId', message: 'This transaction ID has already been used' };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('[DUPLICATE CHECK] Error:', error);
    // On error, allow registration but log
    return { isDuplicate: false, error: true };
  }
}

/**
 * Check for duplicate club member registrations
 */
async function checkDuplicateClubMember(email, rollno, phone) {
  try {

    const dataSourceId = await getMembersDataSourceId();

    const response = await notion.request({
      path: `data_sources/${dataSourceId}/query`,
      method: 'POST',
      body: {
        filter: {
          or: [
            { property: 'Email', email: { equals: email } },
            { property: 'Roll Number', phone_number: { equals: rollno } },
            { property: 'Phone', rich_text: { contains: phone } }
          ]
        }
      }
    });

    if (response.results.length > 0) {
      const duplicate = response.results[0];
      const properties = duplicate.properties;

      if (properties['Email']?.email === email) {
        return { isDuplicate: true, field: 'email', message: 'This email is already registered' };
      }
      if (properties['Roll Number']?.rich_text?.[0]?.text?.content === rollno) {
        return { isDuplicate: true, field: 'rollno', message: 'This roll number is already registered' };
      }
      if (properties['Phone']?.phone_number === phone) {
        return { isDuplicate: true, field: 'phone', message: 'This phone number is already registered' };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('[DUPLICATE CHECK CLUB] Error:', error);
    return { isDuplicate: false, error: true };
  }
}

/**
 * Check for duplicate team names
 */
async function checkDuplicateTeamName(teamName) {
  try {
    const dataSourceId = await getRegistrationDataSourceId();

    const response = await notion.request({
      path: `data_sources/${dataSourceId}/query`,
      method: 'POST',
      body: {
        filter: {
          property: 'Team Name',
          title: { equals: teamName }
        }
      }
    });

    if (response.results.length > 0) {
      return {
        isDuplicate: true,
        message: 'This team name is already taken. Please choose another name.'
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('[DUPLICATE TEAM NAME] Error:', error);
    return { isDuplicate: false, error: true };
  }
}

// ============================================
// JWT AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Middleware to verify JWT token for admin routes
 */
const authenticateAdmin = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please login again.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.admin = decoded;
    console.log('[AUTH] Admin authenticated:', decoded.username);
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


const app = express();

// Determine environment
//const isDevelopment = process.env.NODE_ENV !== 'production';

// Configure CORS
app.use(cors({
  origin: [
    // Production domains
    'https://thenova.club',
    'https://www.thenova.club',
    'https://nova-website-react-1.vercel.app',
    'https://nova-website-react-1-*.vercel.app',
    // Development - for testing
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Set timeout for all requests to 30 seconds
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate limiting middleware for registration and submission
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to specific routes
app.use('/api/register', limiter);
app.use('/api/submit', limiter);

// Mount new feature routes
app.use('/api/teamfinder', teamFinderRoutes);
app.use('/api/projects', projectRoutes);

// Strict rate limiting for login endpoint (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful logins too
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.'
  }
});


//=============================================
// AUTHENTICATION ENDPOINT
//=============================================
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Check if admin credentials are configured
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
      console.error('[AUTH] Admin credentials not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Verify username
    if (username !== process.env.ADMIN_USERNAME) {
      console.log('[AUTH] Invalid username attempt:', username);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    if (!isValidPassword) {
      console.log('[AUTH] Invalid password attempt for user:', username);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        role: 'admin',
        username: username,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    console.log('[AUTH] Login successful for user:', username);

    res.json({
      success: true,
      token: token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed. Please try again.'
    });
  }
});

// ============================================
// ANNOUNCEMENTS ENDPOINTS
// ============================================
// Get announcements (PUBLIC - no auth needed)
app.get('/api/announcements', async (req, res) => {
  try {
    const data = await AnnouncementService.getAnnouncements();
    res.json(data);
  } catch (error) {
    console.error('[API] GET announcements error:', error);

    // Return empty announcements on error to prevent frontend breaking
    res.status(200).json({ announcements: [] });
  }
});

// Add announcement (ADMIN ONLY - requires JWT)
app.post('/api/announcements', authenticateAdmin, async (req, res) => {
  try {
    console.log('[API] Adding announcement by admin:', req.admin.username);

    const newAnnouncement = await AnnouncementService.addAnnouncement(req.body);

    // Return all announcements after adding
    const data = await AnnouncementService.getAnnouncements();

    res.json({
      success: true,
      announcement: newAnnouncement,
      announcements: data.announcements
    });

  } catch (error) {
    console.error('[API] POST announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add announcement',
      message: error.message
    });
  }
});

// Delete announcement (ADMIN ONLY - requires JWT)
app.delete('/api/announcements/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('[API] Deleting announcement by admin:', req.admin.username);

    await AnnouncementService.deleteAnnouncement(req.params.id);

    // Return updated list
    const data = await AnnouncementService.getAnnouncements();

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
      announcements: data.announcements
    });

  } catch (error) {
    console.error('[API] DELETE announcement error:', error);

    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete announcement',
        message: error.message
      });
    }
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate a unique team ID
function generateTeamId() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// ============================================
// REGISTRATION ENDPOINT WITH FILE UPLOAD
// ============================================

app.post('/api/register', upload.single('paymentProof'), async (req, res) => {
  const startTime = Date.now();
  console.log('[REGISTER] Request received at:', new Date().toISOString());
  console.log('[REGISTER] Request body:', req.body);
  console.log('[REGISTER] File received:', req.file ? 'Yes' : 'No');

  const {
    teamName,
    teamLeaderEmail,
    teamLeaderPhone,
    members, // This will be a JSON string
    transactionId
  } = req.body;

  // Parse members JSON
  let parsedMembers;
  try {
    parsedMembers = JSON.parse(members);
  } catch (error) {
    console.log('[REGISTER] Failed to parse members');
    return res.status(400).json({
      success: false,
      message: 'Invalid members data format'
    });
  }

  // Basic validation
  if (!teamName || !teamLeaderEmail || !teamLeaderPhone || !parsedMembers || parsedMembers.length === 0) {
    console.log('[REGISTER] Validation failed - missing required fields');
    return res.status(400).json({
      success: false,
      message: 'Team name, leader email, leader phone, and at least one member are required'
    });
  }

  if (!isValidMVSRECEmail(teamLeaderEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please use your official MVSREC college email!'
    });
  }

  // Validate transaction ID
  if (!transactionId || transactionId.trim().length < 5) {
    console.log('[REGISTER] Validation failed - invalid transaction ID');
    return res.status(400).json({
      success: false,
      message: 'Valid transaction ID is required'
    });
  }

  // Validate payment proof file
  if (!req.file) {
    console.log('[REGISTER] Validation failed - no payment proof uploaded');
    return res.status(400).json({
      success: false,
      message: 'Payment proof screenshot is required'
    });
  }

  // ✅ NEW: Check for duplicate team name
  const teamNameCheck = await checkDuplicateTeamName(teamName);
  if (teamNameCheck.isDuplicate) {
    return res.status(409).json({
      success: false,
      field: 'teamName',
      message: teamNameCheck.message
    });
  }

  // ✅ NEW: Check for duplicate registration
  const duplicateCheck = await checkDuplicateRegistration(
    teamLeaderEmail,
    teamLeaderPhone,
    transactionId
  );

  if (duplicateCheck.isDuplicate) {
    return res.status(409).json({
      success: false,
      field: duplicateCheck.field,
      message: duplicateCheck.message
    });
  }

  // Check if Notion is configured
  if (!process.env.NOTION_API_KEY) {
    console.error('[REGISTER] NOTION_API_KEY missing');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Notion API key missing'
    });
  }

  if (!process.env.NOTION_DATABASE_ID) {
    console.error('[REGISTER] NOTION_DATABASE_ID missing');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Notion database ID missing'
    });
  }

  // Generate team ID
  const teamId = generateTeamId();
  console.log('[REGISTER] Generated team ID:', teamId, '- Time elapsed:', Date.now() - startTime, 'ms');

  // IMMEDIATELY send response to frontend
  console.log('[REGISTER] Sending response NOW - Time elapsed:', Date.now() - startTime, 'ms');

  const responseData = {
    success: true,
    message: 'Registration successful! Save your Team ID somewhere safe!',
    teamId: teamId
  };

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(responseData))
  });
  res.write(JSON.stringify(responseData));
  res.end();

  console.log('[REGISTER] Response sent! Now processing in background...');

  // Process registration in background (upload image + Notion + email)
  (async () => {
    try {
      console.log('[REGISTER-BG] Starting background processing for team:', teamId);

      // Upload payment proof to Cloudinary
      let paymentProofUrl = '';
      try {
        console.log('[REGISTER-BG] Uploading payment proof to Cloudinary...');
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        paymentProofUrl = uploadResult.secure_url;
        console.log('[REGISTER-BG] Payment proof uploaded:', paymentProofUrl);
      } catch (uploadError) {
        console.error('[REGISTER-BG] Error uploading to Cloudinary:', uploadError);
        // Continue with registration even if upload fails
      }

      // Create members array for Notion (with phone numbers)
      const memberDetails = parsedMembers.map(member =>
        `${member.name} (${member.phone})`
      ).join(', ');

      // Create a new record in Notion database
      const createNotionPage = notion.pages.create({
        parent: {
          database_id: process.env.NOTION_DATABASE_ID,
        },
        properties: {
          'Team Name': {
            title: [
              {
                text: {
                  content: teamName
                }
              }
            ]
          },
          'Team Leader Email': {
            email: teamLeaderEmail
          },
          'Team Leader Phone': {
            phone_number: teamLeaderPhone
          },
          'Members': {
            rich_text: [
              {
                text: {
                  content: memberDetails
                }
              }
            ]
          },
          'Team ID': {
            rich_text: [
              {
                text: {
                  content: teamId
                }
              }
            ]
          },
          'Transaction ID': {
            rich_text: [
              {
                text: {
                  content: transactionId
                }
              }
            ]
          },
          'Payment Proof URL': {
            url: paymentProofUrl || null
          },
          'Registration Date': {
            date: {
              start: new Date().toISOString(),
            },
          },
          'Status': {
            select: {
              name: 'Pending Verification'
            }
          }
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Notion API request timed out after 60 seconds')), 60000);
      });

      const notionResponse = await Promise.race([createNotionPage, timeoutPromise]);
      console.log('[REGISTER-BG] Notion record created:', notionResponse.id);
      console.log('[REGISTER-BG] Background processing completed for team:', teamId);

    } catch (error) {
      console.error('[REGISTER-BG] Error in background processing:', error);

      if (error.code === 'validation_error') {
        console.error('[REGISTER-BG] Notion validation error for team:', teamId, error.message);
      } else if (error.status === 404) {
        console.error('[REGISTER-BG] Notion database not found for team:', teamId);
      } else if (error.status === 401) {
        console.error('[REGISTER-BG] Notion authentication failed for team:', teamId);
      }
    }
  })();
});


// ============================================
// SUBMISSION ENDPOINT (OPTIMIZED FOR PEAK TRAFFIC)
// ============================================

app.post('/api/submit', async (req, res) => {
  const startTime = Date.now();
  console.log('[SUBMIT] Request received at:', new Date().toISOString());

  try {
    const { submissionTeamId, projectUrl, videoPresentationUrl } = req.body;

    // Validation
    if (!submissionTeamId || !projectUrl) {
      return res.status(400).json({
        success: false,
        message: 'Team ID and Project URL are required'
      });
    }

    // Validate video presentation URL
    if (!videoPresentationUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video Presentation URL is required'
      });
    }

    // Validate it's a Google Drive link
    if (!videoPresentationUrl.includes('drive.google.com')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Google Drive link for the video presentation'
      });
    }

    // USE CACHED DATA SOURCE ID
    const dataSourceId = await getRegistrationDataSourceId();

    // Create a timeout promise (25 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 25000)
    );

    // Create the submission promise
    const submissionPromise = (async () => {
      // Query for the team
      const response = await notion.request({
        path: `data_sources/${dataSourceId}/query`,
        method: 'POST',
        body: {
          filter: {
            and: [
              { property: 'Team ID', rich_text: { equals: submissionTeamId } },
              {
                or: [
                  { property: 'Status', select: { equals: 'Active' } },
                  { property: 'Status', select: { equals: 'Pending Verification' } }
                ]
              }
            ]
          }
        }
      });

      if (response.results.length === 0) {
        throw new Error('TEAM_NOT_FOUND');
      }

      // Update the Notion page
      const submissionDate = new Date().toISOString();
      await notion.pages.update({
        page_id: response.results[0].id,
        properties: {
          'Project URL': { url: projectUrl },
          'Video Presentation URL': { url: videoPresentationUrl },
          'Submission Date': { date: { start: submissionDate } }
        }
      });

      return { success: true, pageId: response.results[0].id };
    })();

    // Race between submission and timeout
    const result = await Promise.race([submissionPromise, timeoutPromise]);

    const elapsed = Date.now() - startTime;
    console.log(`[SUBMIT] ✅ Success for team ${submissionTeamId} in ${elapsed}ms`);

    res.json({
      success: true,
      message: 'Project submitted successfully!',
      teamId: submissionTeamId
    });

  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`[SUBMIT] ❌ Error after ${elapsed}ms:`, error.message);

    // Handle timeout errors
    if (error.message === 'REQUEST_TIMEOUT') {
      console.log('[SUBMIT] Request timed out for team:', req.body.submissionTeamId);
      return res.status(504).json({
        success: false,
        message: 'Submission is taking longer than expected. Please wait 1 minute and try submitting again. If you see your project in the submissions list, it was successful.',
        timeout: true
      });
    }

    // Handle team not found
    if (error.message === 'TEAM_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Team not found or not active. Please check your Team ID and ensure your registration was approved.'
      });
    }

    // Clear cache on object not found errors
    if (error.code === 'object_not_found' || error.status === 404) {
      console.log('[SUBMIT] Clearing cache due to object not found error');
      clearNotionCache();
    }

    // Handle Notion API errors
    if (error.code === 'validation_error') {
      console.error('[SUBMIT] Notion validation error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Invalid submission data. Please check your URLs and try again.'
      });
    }

    if (error.status === 401) {
      console.error('[SUBMIT] Notion authentication failed');
      return res.status(500).json({
        success: false,
        message: 'Server authentication error. Please contact support.'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Submission failed. Please try again in a few moments.'
    });
  }
});
// ============================================
// CLUB MEMBERSHIP REGISTRATION ENDPOINT
// ============================================

app.post('/api/clubregister', async (req, res) => {
  console.log('[CLUB REGISTER] New registration request received');
  const startTime = Date.now();

  const {
    name,
    rollno,
    email,
    phone,
    year,
    interests,
    message
  } = req.body;

  // Basic validation
  if (!name || !rollno || !email || !phone || !year) {
    console.log('[CLUB REGISTER] Validation failed - missing required fields');
    return res.status(400).json({
      success: false,
      message: 'Name, Roll Number, Email, Phone, and Year are required'
    });
  }

  // Email validation
  if (!isValidMVSRECEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please use your official MVSREC college email!'
    });
  }

  // Phone validation
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+91/, '');
  if (!phoneRegex.test(cleanPhone)) {
    console.log('[CLUB REGISTER] Validation failed - invalid phone');
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid 10-digit phone number'
    });
  }

  // ✅ NEW: Check for duplicate member
  const duplicateCheck = await checkDuplicateClubMember(email, rollno, cleanPhone);

  if (duplicateCheck.isDuplicate) {
    return res.status(409).json({
      success: false,
      field: duplicateCheck.field,
      message: duplicateCheck.message
    });
  }

  // Check if Notion is configured
  if (!process.env.NOTION_API_KEY) {
    console.error('[CLUB REGISTER] NOTION_API_KEY missing');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Notion API key missing'
    });
  }

  if (!process.env.NOTION_MEMBERS_DATABASE_ID) {
    console.error('[CLUB REGISTER] NOTION_MEMBERS_DATABASE_ID missing');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Members database not configured'
    });
  }

  try {
    console.log('[CLUB REGISTER] Creating Notion page...');

    // Determine year suffix (1st, 2nd, 3rd, 4th)
    const yearSuffix = year == 1 ? 'st' : year == 2 ? 'nd' : year == 3 ? 'rd' : 'th';
    const yearLabel = `${year}${yearSuffix} Year`;

    // Format phone number with +91
    const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone}`;

    // Create interests array for multi-select
    const interestsArray = Array.isArray(interests) ? interests : [];

    // Create a new page in Notion database
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_MEMBERS_DATABASE_ID,
      },
      properties: {
        'Name': {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        'Roll Number': {
          rich_text: [
            {
              text: {
                content: rollno,
              },
            },
          ],
        },
        'Email': {
          email: email,
        },
        'Phone': {
          phone_number: formattedPhone,
        },
        'Year': {
          select: {
            name: yearLabel,
          },
        },
        'Interests': {
          multi_select: interestsArray.map(interest => ({ name: interest })),
        },
        'Message': {
          rich_text: [
            {
              text: {
                content: message || 'No message provided',
              },
            },
          ],
        },
        'Registration Date': {
          date: {
            start: new Date().toISOString(),
          },
        },
        'Status': {
          select: {
            name: 'Pending Review',
          },
        },
      },
    });

    console.log('[CLUB REGISTER] Notion page created:', response.id);
    console.log('[CLUB REGISTER] Time elapsed:', Date.now() - startTime, 'ms');

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Registration successful! We will contact you soon.',
    });



  } catch (error) {
    console.error('[CLUB REGISTER] Error:', error);

    // Handle specific Notion errors
    if (error.code === 'validation_error') {
      console.error('[CLUB REGISTER] Notion validation error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Database validation error. Please contact support.',
      });
    }

    if (error.status === 404) {
      console.error('[CLUB REGISTER] Database not found');
      return res.status(500).json({
        success: false,
        message: 'Database not found. Please contact support.',
      });
    }

    if (error.status === 401) {
      console.error('[CLUB REGISTER] Authentication failed');
      return res.status(500).json({
        success: false,
        message: 'Authentication error. Please contact support.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit registration. Please try again later.',
    });
  }
});
// ============================================
// HEALTH CHECK & TEST ENDPOINTS
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    config: {
      notion: !!process.env.NOTION_DATABASE_ID,
      jwt: !!process.env.JWT_SECRET,
      admin: !!process.env.ADMIN_USERNAME && !!process.env.ADMIN_PASSWORD_HASH
    }
  });
});

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Legacy health check (keeping for compatibility)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// SERVER STARTUP
// ============================================

// Use PORT from environment or default to 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📝 Notion database: ${process.env.NOTION_DATABASE_ID ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`🔑 Notion API key: ${process.env.NOTION_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`👤 Admin username: ${process.env.ADMIN_USERNAME ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`🔒 Admin password hash: ${process.env.ADMIN_PASSWORD_HASH ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log('='.repeat(50));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

export default app;