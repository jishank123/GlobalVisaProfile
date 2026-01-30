const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public routes - Client authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/email-login', authController.emailLogin);
router.post('/check-user', authController.checkUser);

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
router.put('/profile', auth(), authController.updateProfile);

module.exports = router;
