const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { auth } = require('../middleware/auth');
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getSubscriberCount
} = require('../controllers/newsletterController');

const router = express.Router();

// Rate limiting for public endpoints - only count duplicate attempts
const publicRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 attempts per hour (generous for new emails)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many subscription attempts. Please try again later.'
    }
  },
  skip: (req, res) => {
    // Don't skip - apply rate limit to all attempts
    return false;
  },
  keyGenerator: (req, res) => {
    // Use IP + email as key to allow different emails from same IP
    return `${req.ip}-${req.body.email || 'unknown'}`;
  }
});

// Validation for subscription
const validateSubscription = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Validation for unsubscription
const validateUnsubscription = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Public Routes

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', 
  publicRateLimit,
  validateSubscription,
  subscribe
);

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', 
  validateUnsubscription,
  unsubscribe
);

// Private Routes (Admin only)

// @route   GET /api/newsletter/subscribers
// @desc    Get all newsletter subscribers
// @access  Private (Admin)
router.get('/subscribers', 
  auth(['admin']),
  getAllSubscribers
);

// @route   GET /api/newsletter/count
// @desc    Get subscriber count statistics
// @access  Private (Admin)
router.get('/count', 
  auth(['admin']),
  getSubscriberCount
);

module.exports = router;
