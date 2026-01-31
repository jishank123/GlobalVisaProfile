const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', auth(['admin']), dashboardController.getDashboardStats);

// @route   GET /api/dashboard/financial
// @desc    Get financial overview data
// @access  Private (Admin only)
router.get('/financial', auth(['admin']), dashboardController.getFinancialOverview);

// @route   GET /api/dashboard/activity
// @desc    Get recent activity
// @access  Private (Admin only)
router.get('/activity', auth(['admin']), dashboardController.getRecentActivity);

// @route   GET /api/dashboard/client
// @desc    Get client dashboard data
// @access  Private (Client only)
router.get('/client', auth(['client']), dashboardController.getClientDashboard);

module.exports = router;