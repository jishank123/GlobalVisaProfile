const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/clients
// @desc    Get all clients with filters
// @access  Private (Admin, Managers)
router.get('/', protect, authorize('admin', 'lead_manager', 'crm_manager'), async (req, res) => {
  try {
    const { search, status, country, manager, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (country) query.country = country;
    if (manager) query.assignedManager = manager;
    
    // Role-based filtering
    if (req.user.role === 'crm_manager') {
      query.assignedManager = req.user._id;
    }
    
    const clients = await Client.find(query)
      .populate('assignedManager', 'name email')
      .populate('user', 'email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Client.countDocuments(query);
    
    res.json({
      success: true,
      count: clients.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedManager', 'name email phone')
      .populate('user', 'email role lastLogin');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Check access permission
    if (req.user.role === 'client' && client.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'crm_manager' && client.assignedManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/clients
// @desc    Create new client
// @access  Private (Admin, Managers)
router.post('/', protect, authorize('admin', 'lead_manager', 'crm_manager'), async (req, res) => {
  try {
    const client = await Client.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create client',
      error: error.message
    });
  }
});

// @route   PATCH /api/clients/:id
// @desc    Update client
// @access  Private (Admin, Assigned Manager)
router.patch('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Check permission
    const isAssignedManager = client.assignedManager && client.assignedManager.toString() === req.user._id.toString();
    const isAdminOrLeadManager = ['admin', 'lead_manager'].includes(req.user.role);
    
    if (!isAssignedManager && !isAdminOrLeadManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update client
    Object.assign(client, req.body);
    await client.save();
    
    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update client',
      error: error.message
    });
  }
});

// @route   PATCH /api/clients/:id/assign
// @desc    Assign client to manager
// @access  Private (Admin, Lead Manager)
router.patch('/:id/assign', protect, authorize('admin', 'lead_manager'), async (req, res) => {
  try {
    const { managerId } = req.body;
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { assignedManager: managerId },
      { new: true }
    ).populate('assignedManager', 'name email');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Client assigned successfully',
      data: client
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to assign client',
      error: error.message
    });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/clients/stats/summary
// @desc    Get client statistics
// @access  Private (Admin, Managers)
router.get('/stats/summary', protect, authorize('admin', 'lead_manager', 'crm_manager'), async (req, res) => {
  try {
    let query = {};
    
    // Filter by assigned manager for CRM managers
    if (req.user.role === 'crm_manager') {
      query.assignedManager = req.user._id;
    }
    
    const total = await Client.countDocuments(query);
    
    const byStatus = await Client.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const byCountry = await Client.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        byStatus,
        topCountries: byCountry
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
