const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics for current user
// @access  Private (All authenticated users)
router.get('/dashboard', ...auth(), analyticsController.getDashboardAnalytics);

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private (Admin, CRM Manager)
router.get('/revenue', ...auth(['admin', 'crm_manager']), analyticsController.getRevenueAnalytics);

// @route   GET /api/analytics/performance
// @desc    Get performance analytics
// @access  Private (Admin, Managers)
router.get('/performance', ...auth(['admin', 'lead_manager', 'crm_manager']), analyticsController.getPerformanceAnalytics);

module.exports = router;
