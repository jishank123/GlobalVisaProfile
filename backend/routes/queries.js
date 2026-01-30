const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const { auth, authenticateClient } = require('../middleware/auth');
const Query = require('../models/Query');
const Client = require('../models/Client');

// @route   GET /api/queries
// @desc    Get queries with filters
// @access  Private (Admin, CRM Manager)
router.get('/', auth(['admin', 'crm_manager']), queryController.getQueries);

// @route   GET /api/queries/stats/summary
// @desc    Get query statistics
// @access  Private (Admin, CRM Manager)
router.get('/stats/summary', auth(['admin', 'crm_manager']), queryController.getQueryStats);

// @route   GET /api/queries/my-queries
// @desc    Get queries assigned to current CRM manager
// @access  Private (CRM Manager only)
router.get('/my-queries', auth(['crm_manager']), queryController.getMyQueries);

// @route   GET /api/queries/client/:clientId
// @desc    Get queries for a specific client (for client dashboard)
// @access  Private (Client)
router.get('/client/:clientId', authenticateClient, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    
    // Verify that the authenticated client is requesting their own queries
    const clientRecord = await Client.findOne({ email: req.client.email });
    if (!clientRecord || clientRecord._id.toString() !== clientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own queries.'
      });
    }
    
    const queries = await Query.find({ client: clientId })
      .populate('assignedTo', 'first_name last_name email')
      .populate('responses.user', 'first_name last_name email role')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: queries.length,
      data: queries
    });
  } catch (error) {
    console.error('❌ Error fetching client queries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/queries/:id
// @desc    Get single query
// @access  Private (Admin, CRM Manager)
router.get('/:id', auth(['admin', 'crm_manager']), queryController.getQuery);

// @route   POST /api/queries
// @desc    Create new query (supports both admin/manager and client creation)
// @access  Private (Admin, CRM Manager, Client)
router.post('/', (req, res, next) => {
  // Check if this is a client request by looking at the token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === 'client') {
        // Use client authentication middleware
        return authenticateClient(req, res, next);
      }
    } catch (error) {
      // If token verification fails, fall through to regular auth
    }
  }
  // Use regular auth middleware for admin/crm_manager
  return auth(['admin', 'crm_manager', 'client'])(req, res, next);
}, queryController.createQuery);

// @route   POST /api/queries/:id/respond
// @desc    Add response to query
// @access  Private (Admin, CRM Manager)
router.post('/:id/respond', auth(['admin', 'crm_manager']), queryController.respondToQuery);

// @route   PATCH /api/queries/:id/status
// @desc    Update query status
// @access  Private (Admin, CRM Manager)
router.patch('/:id/status', auth(['admin', 'crm_manager']), queryController.updateQueryStatus);

module.exports = router;