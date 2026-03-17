const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Ensure profile pictures directory exists
const profilePicturesDir = 'uploads/profile-pictures/';
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilePicturesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = /jpeg|jpg|png|gif|webp|avif|jfif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP, AVIF. JFIF)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Public routes - Client authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/email-login', authController.emailLogin);
router.post('/check-user', authController.checkUser);
router.post('/check-email', authController.checkEmailExists);
router.post('/setup-password', authController.setupPassword);

// Public routes - Manager authentication
router.post('/manager', authController.managerLogin);

// Public routes - Common authentication
router.post('/verify-email', authController.verifyEmailAndSetupPassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', auth(), authController.getMe);
router.post('/logout', auth(), authController.logout);
router.put('/change-password', auth(), authController.changePasswordEnhanced);
router.put('/profile', auth(), upload.single('profile_picture'), authController.updateProfile);

module.exports = router;
