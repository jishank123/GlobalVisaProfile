const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const { auth } = require('../middleware/auth');

// @route   GET /api/queries
// @desc    Get all queries with filters
// @access  Private
router.get('/', ...auth(), async (req, res) => {
  try {
    const { client, assignedTo, status, priority, category, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    
    if (client) query.client = client;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    // Role-based filtering
    if (req.user.role === 'client') {
      query.client = req.user.clientProfile;
    } else if (req.user.role === 'crm_manager') {
      query.assignedTo = req.user._id;
    }
    
    const queries = await Query.find(query)
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('responses.user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Query.countDocuments(query);
    
    res.json({
      success: true,
      count: queries.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: queries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/queries/:id
// @desc    Get single query
// @access  Private
router.get('/:id', ...auth(), async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('responses.user', 'name email role');
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check access permission
    if (req.user.role === 'client' && query.client._id.toString() !== req.user.clientProfile.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/queries
// @desc    Create new query
// @access  Private
router.post('/', ...auth(), async (req, res) => {
  try {
    // If user is client, set client field automatically
    if (req.user.role === 'client') {
      req.body.client = req.user.clientProfile;
    }
    
    const query = await Query.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Query created successfully',
      data: query
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create query',
      error: error.message
    });
  }
});

// @route   PATCH /api/queries/:id
// @desc    Update query
// @access  Private
router.patch('/:id', ...auth(), async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Check permission
    const isClient = req.user.role === 'client' && query.client.toString() === req.user.clientProfile.toString();
    const isAssigned = query.assignedTo && query.assignedTo.toString() === req.user._id.toString();
    const isAdminOrManager = ['admin', 'crm_manager'].includes(req.user.role);
    
    if (!isClient && !isAssigned && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update fields
    Object.assign(query, req.body);
    
    // Update timestamps for status changes
    if (req.body.status === 'resolved' && !query.resolvedAt) {
      query.resolvedAt = new Date();
    }
    if (req.body.status === 'closed' && !query.closedAt) {
      query.closedAt = new Date();
    }
    
    await query.save();
    
    res.json({
      success: true,
      message: 'Query updated successfully',
      data: query
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update query',
      error: error.message
    });
  }
});

// @route   POST /api/queries/:id/responses
// @desc    Add response to query
// @access  Private
router.post('/:id/responses', ...auth(), async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    // Add response
    query.responses.push({
      user: req.user._id,
      message: req.body.message,
      isInternal: req.body.isInternal || false
    });
    
    // Update status if needed
    if (query.status === 'open') {
      query.status = 'in_progress';
    }
    
    await query.save();
    
    await query.populate('responses.user', 'name email');
    
    res.json({
      success: true,
      message: 'Response added successfully',
      data: query
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
});

// @route   DELETE /api/queries/:id
// @desc    Delete query
// @access  Private (Admin only)
router.delete('/:id', ...auth(['admin']), async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Query deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/queries/stats/summary
// @desc    Get query statistics
// @access  Private (Admin, CRM Manager)
router.get('/stats/summary', ...auth(['admin', 'crm_manager']), async (req, res) => {
  try {
    const stats = await Query.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityStats = await Query.aggregate([
      {
        $match: { status: { $in: ['open', 'in_progress'] } }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byStatus: stats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
