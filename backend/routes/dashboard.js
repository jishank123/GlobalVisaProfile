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

// @route   GET /api/dashboard/crm-stats
// @desc    Get CRM manager dashboard statistics
// @access  Private (CRM Manager only)
router.get('/crm-stats', auth(['crm_manager']), dashboardController.getCrmStats);

// @route   GET /api/dashboard/crm-activity
// @desc    Get CRM manager recent activity
// @access  Private (CRM Manager only)
router.get('/crm-activity', auth(['crm_manager']), dashboardController.getCrmActivity);

// @route   GET /api/dashboard/crm-test
// @desc    Test CRM manager authentication and ID matching
// @access  Private (CRM Manager only)
router.get('/crm-test', auth(['crm_manager']), async (req, res) => {
  try {
    console.log('🧪 === CRM TEST ENDPOINT ===');
    console.log('🧪 User ID:', req.user.user_id || req.user._id || req.user.id);
    console.log('🧪 User email:', req.user.email);
    console.log('🧪 User role:', req.user.role);
    console.log('🧪 Sample project assigned_to: "697ec40613b779c47c5cd4cd"');
    
    const crmManagerId = req.user.user_id || req.user._id || req.user.id;
    const sampleAssignedTo = "697ec40613b779c47c5cd4cd";
    
    console.log('🧪 ID Comparison:');
    console.log('🧪   CRM ID:', crmManagerId);
    console.log('🧪   CRM ID type:', typeof crmManagerId);
    console.log('🧪   CRM ID toString():', crmManagerId.toString());
    console.log('🧪   Sample assigned_to:', sampleAssignedTo);
    console.log('🧪   Direct match:', crmManagerId.toString() === sampleAssignedTo);
    
    // Check if sample project exists
    const Project = require('../models/Project');
    const sampleProject = await Project.findOne({ project_id: "PRJ-0003" }).lean();
    
    res.json({
      success: true,
      data: {
        user_id: crmManagerId,
        user_email: req.user.email,
        user_role: req.user.role,
        sample_assigned_to: sampleAssignedTo,
        id_match: crmManagerId.toString() === sampleAssignedTo,
        sample_project_exists: !!sampleProject,
        sample_project_assigned_to: sampleProject?.assigned_to?.toString()
      }
    });
  } catch (error) {
    console.error('🧪 CRM test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/dashboard/health
// @desc    Simple health check endpoint (no auth required)
// @access  Public
router.get('/health', (req, res) => {
  console.log('🏥 Health check endpoint called');
  res.json({ 
    success: true, 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    api_base: req.protocol + '://' + req.get('host') + '/api'
  });
});

module.exports = router;