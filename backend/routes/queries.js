const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const queryController = require('../controllers/queryController');
const { auth, authenticateClient } = require('../middleware/auth');
const Query = require('../models/Query');
const Client = require('../models/Client');

// Configure multer for query attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/query-attachments/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'query-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept documents and images
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, PNG, and GIF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

// @route   GET /api/queries
// @desc    Get queries with filters (supports client access)
// @access  Private (Admin, CRM Manager, Client)
router.get('/', (req, res, next) => {
  // Check if this is a client request by looking at the token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === 'client') {
        // Use client authentication middleware
        return authenticateClient(req, res, async (err) => {
          if (err) return next(err);
          
          try {
            // Find client record and get their queries
            const clientRecord = await Client.findOne({ email: req.client.email });
            if (!clientRecord) {
              return res.status(404).json({
                success: false,
                message: 'Client record not found'
              });
            }
            
            const queries = await Query.find({ client: clientRecord._id })
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
      }
    } catch (error) {
      // If token verification fails, fall through to regular auth
    }
  }
  // Use regular auth middleware for admin/crm_manager
  return auth(['admin', 'crm_manager'])(req, res, next);
}, queryController.getQueries);

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
// @desc    Get single query (supports client access)
// @access  Private (Admin, CRM Manager, Client)
router.get('/:id', (req, res, next) => {
  // Check if this is a client request by looking at the token
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === 'client') {
        // Use client authentication middleware
        return authenticateClient(req, res, async (err) => {
          if (err) return next(err);
          
          try {
            const query = await Query.findById(req.params.id)
              .populate('client', 'name email university phone')
              .populate('assignedTo', 'first_name last_name email')
              .populate('replies.sender', 'first_name last_name email role name');
            
            if (!query) {
              return res.status(404).json({
                success: false,
                message: 'Query not found'
              });
            }
            
            // Verify that the client owns this query
            const clientRecord = await Client.findOne({ email: req.client.email });
            if (!clientRecord || query.client._id.toString() !== clientRecord._id.toString()) {
              return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own queries.'
              });
            }
            
            res.json({
              success: true,
              data: query
            });
          } catch (error) {
            console.error('❌ Error fetching query:', error);
            res.status(500).json({
              success: false,
              message: 'Server error',
              error: error.message
            });
          }
        });
      }
    } catch (error) {
      // If token verification fails, fall through to regular auth
    }
  }
  // Use regular auth middleware for admin/crm_manager
  return auth(['admin', 'crm_manager'])(req, res, next);
}, queryController.getQuery);

// @route   POST /api/queries
// @desc    Create new query (supports both admin/manager and client creation)
// @access  Private (Admin, CRM Manager, Client)
router.post('/', upload.array('attachments', 5), (req, res, next) => {
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

// @route   POST /api/queries/:id/reply
// @desc    Add reply to query (for clients)
// @access  Private (Client)
router.post('/:id/reply', authenticateClient, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }
    
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Verify that the client owns this query
    const clientRecord = await Client.findOne({ email: req.client.email });
    if (!clientRecord || query.client.toString() !== clientRecord._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only reply to your own queries.'
      });
    }
    
    // Add reply
    query.replies.push({
      sender: clientRecord._id,
      sender_type: 'Client',
      message,
      created_at: new Date()
    });
    
    // Update status if it was resolved
    if (query.status === 'resolved') {
      query.status = 'in_progress';
    }
    
    await query.save();
    
    // Populate the updated query
    await query.populate('assignedTo', 'first_name last_name email');
    await query.populate('replies.sender', 'name email');
    
    console.log('💬 Client reply added to query:', {
      queryId: query._id,
      clientEmail: req.client.email,
      message: message.substring(0, 50) + '...'
    });
    
    res.json({
      success: true,
      message: 'Reply added successfully',
      data: query
    });
  } catch (error) {
    console.error('❌ Error adding client reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
});

// @route   POST /api/queries/:id/respond
// @desc    Add response to query
// @access  Private (Admin, CRM Manager)
router.post('/:id/respond', auth(['admin', 'crm_manager']), queryController.respondToQuery);

// @route   PATCH /api/queries/:id/status
// @desc    Update query status
// @access  Private (Admin, CRM Manager)
router.patch('/:id/status', auth(['admin', 'crm_manager']), queryController.updateQueryStatus);

module.exports = router;