const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', ...auth(), authController.getMe);
router.post('/logout', ...auth(), authController.logout);
router.put('/change-password', ...auth(), authController.changePassword);

module.exports = router;
