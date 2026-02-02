const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const { authenticateClient } = require('../middleware/auth');
const {
  registerClient,
  loginClient,
  getClientProfile,
  updateClientProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  checkUserExists,
  getAllClientAccounts
} = require('../controllers/clientAccountController');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept all image types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit (very generous)
  }
});

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // 10 in production, 50 in development
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Validation middleware for registration
const validateRegistration = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-\.\']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, dots, and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Validation middleware for login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation middleware for profile update
const validateProfileUpdate = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s\-\.\']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, dots, and apostrophes'),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s\-\.\']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, dots, and apostrophes'),
  
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name cannot exceed 100 characters'),
  
  body('university')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('University name cannot exceed 100 characters'),
  
  body('linkedin_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  
  body('portfolio_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Portfolio URL must be a valid URL'),
  
  body('website_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Website URL must be a valid URL'),
  
  body('university')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('University name cannot exceed 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  
  body('communication_preferences.email_notifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be a boolean'),
  
  body('communication_preferences.sms_notifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications preference must be a boolean'),
  
  body('communication_preferences.marketing_emails')
    .optional()
    .isBoolean()
    .withMessage('Marketing emails preference must be a boolean')
];

// Validation middleware for password change
const validatePasswordChange = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('new_password')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Validation middleware for forgot password
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Validation middleware for reset password
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Public Routes

// @route   POST /api/client-accounts/check-user
// @desc    Check if user exists by email
// @access  Public
router.post('/check-user', 
  (req, res, next) => {
    console.log('\n🛣️ === ROUTE: POST /api/client-accounts/check-user ===');
    console.log('🛣️ Request received at:', new Date().toISOString());
    next();
  },
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  checkUserExists
);

// @route   POST /api/client-accounts/register
// @desc    Register new client account
// @access  Public
router.post('/register', 
  (req, res, next) => {
    console.log('\n🛣️ === ROUTE: POST /api/client-accounts/register ===');
    console.log('🛣️ Request received at:', new Date().toISOString());
    console.log('🛣️ Request method:', req.method);
    console.log('🛣️ Request URL:', req.originalUrl);
    console.log('🛣️ Request headers:', {
      'content-type': req.get('content-type'),
      'user-agent': req.get('user-agent'),
      'origin': req.get('origin'),
      'referer': req.get('referer')
    });
    console.log('🛣️ Request body keys:', Object.keys(req.body));
    next();
  },
  authRateLimit,
  validateRegistration,
  registerClient
);

// @route   POST /api/client-accounts/login
// @desc    Login client
// @access  Public
router.post('/login', 
  (req, res, next) => {
    console.log('\n🛣️ === ROUTE: POST /api/client-accounts/login ===');
    console.log('🛣️ Request received at:', new Date().toISOString());
    console.log('🛣️ Request method:', req.method);
    console.log('🛣️ Request URL:', req.originalUrl);
    console.log('🛣️ Request headers:', {
      'content-type': req.get('content-type'),
      'user-agent': req.get('user-agent'),
      'origin': req.get('origin'),
      'referer': req.get('referer')
    });
    console.log('🛣️ Request body keys:', Object.keys(req.body));
    next();
  },
  authRateLimit,
  validateLogin,
  loginClient
);

// @route   POST /api/client-accounts/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', 
  authRateLimit,
  validateForgotPassword,
  forgotPassword
);

// @route   POST /api/client-accounts/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', 
  authRateLimit,
  validateResetPassword,
  resetPassword
);

// @route   GET /api/client-accounts/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', verifyEmail);

// @route   POST /api/client-accounts/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification', 
  authRateLimit,
  body('email').isEmail().normalizeEmail(),
  resendVerification
);

// Protected Routes (require client authentication)

// @route   GET /api/client-accounts/all
// @desc    Get all client accounts (for admin/manager dashboards)
// @access  Public (for now - should be admin only in production)
router.get('/all', getAllClientAccounts);

// @route   GET /api/client-accounts/profile
// @desc    Get client profile
// @access  Private (Client)
router.get('/profile', authenticateClient, getClientProfile);

// @route   PUT /api/client-accounts/profile
// @desc    Update client profile
// @access  Private (Client)
router.put('/profile', 
  authenticateClient,
  upload.single('profile_picture'),
  validateProfileUpdate,
  updateClientProfile
);

// @route   PUT /api/client-accounts/change-password
// @desc    Change client password
// @access  Private (Client)
router.put('/change-password', 
  authenticateClient,
  validatePasswordChange,
  changePassword
);

module.exports = router;