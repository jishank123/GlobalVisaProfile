const Client = require('../models/Client');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

// Helper function to log activities
const logActivity = async (userId, action, details, ipAddress) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ipAddress,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// @desc    Get all clients with role-based filtering
// @route   GET /api/clients
// @access  Private (Admin, Managers)
exports.getClients = async (req, res) => {
  try {
    const { search, status, country, manager, page = 1, limit = 20 } = req.query;
    
    // Build query with security filters
    let query = {};
    
    // Role-based access control
    if (req.user.role === 'crm_manager') {
      // CRM managers can only see their assigned clients
      query.crm_manager = req.user.user_id;
    }
    
    // Apply filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (country) query.country = country;
    if (manager && req.user.role !== 'crm_manager') {
      query.crm_manager = manager;
    }
    
    const clients = await Client.find(query)
      .populate('assignedManager', 'first_name last_name email phone')
      .populate('user', 'email role last_login status')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Client.countDocuments(query);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_CLIENTS',
      `Viewed clients list. Role: ${req.user.role}, Filters: ${JSON.stringify(req.query)}`,
      req.ip
    );
    
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
      error: {
        code: 'FETCH_CLIENTS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedManager', 'first_name last_name email phone')
      .populate('user', 'email role last_login status');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'client' && client.user.toString() !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own profile'
        }
      });
    }
    
    if (req.user.role === 'crm_manager' && 
        (!client.crm_manager || client.crm_manager._id.toString() !== req.user.user_id)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your assigned clients'
        }
      });
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_CLIENT',
      `Viewed client profile: ${client.email}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CLIENT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private (Admin, Lead Manager)
exports.createClient = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    
    const clientData = {
      ...req.body,
      created_by: req.user.user_id
    };
    
    const client = await Client.create(clientData);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'CREATE_CLIENT',
      `Created new client: ${client.email}`,
      req.ip
    );
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CLIENT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Update client
// @route   PATCH /api/clients/:id
// @access  Private (Admin, Assigned Manager, Own Profile)
exports.updateClient = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Security check - role-based access control
    const isOwnProfile = client.user && client.user.toString() === req.user.user_id;
    const isAssignedManager = client.assignedManager && client.assignedManager.toString() === req.user.user_id;
    const isAdminOrLeadManager = ['admin', 'lead_manager'].includes(req.user.role);
    
    if (!isOwnProfile && !isAssignedManager && !isAdminOrLeadManager) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this client'
        }
      });
    }
    
    // Define allowed fields based on role
    let allowedFields = ['phone', 'company', 'country', 'notes'];
    
    if (req.user.role === 'admin' || req.user.role === 'lead_manager') {
      allowedFields.push('status', 'assignedManager', 'priority');
    }
    
    if (isOwnProfile) {
      allowedFields = ['phone', 'company', 'country']; // Clients can only update limited fields
    }
    
    // Update only allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    Object.assign(client, updateData);
    client.updated_at = new Date();
    await client.save();
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'UPDATE_CLIENT',
      `Updated client: ${client.email}. Fields: ${Object.keys(updateData).join(', ')}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_CLIENT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Assign client to manager
// @route   PATCH /api/clients/:id/assign
// @access  Private (Admin, Lead Manager)
exports.assignClient = async (req, res) => {
  try {
    const { managerId } = req.body;
    
    if (!managerId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MANAGER_ID',
          message: 'Manager ID is required'
        }
      });
    }
    
    // Verify manager exists and has correct role
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'crm_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MANAGER',
          message: 'Invalid manager ID or user is not a CRM manager'
        }
      });
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { 
        assignedManager: managerId,
        updated_at: new Date()
      },
      { new: true }
    ).populate('assignedManager', 'first_name last_name email');
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'ASSIGN_CLIENT',
      `Assigned client ${client.email} to manager ${manager.email}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Client assigned successfully',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ASSIGN_CLIENT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Delete client (soft delete)
// @route   DELETE /api/clients/:id
// @access  Private (Admin only)
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Soft delete - change status instead of actual deletion
    client.status = 'deleted';
    client.deleted_at = new Date();
    client.deleted_by = req.user.user_id;
    await client.save();
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'DELETE_CLIENT',
      `Deleted client: ${client.email}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_CLIENT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get client statistics
// @route   GET /api/clients/stats/summary
// @access  Private (Admin, Managers)
exports.getClientStats = async (req, res) => {
  try {
    let query = { status: { $ne: 'deleted' } };
    
    // Filter by assigned manager for CRM managers
    if (req.user.role === 'crm_manager') {
      query.crm_manager = req.user.user_id;
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
    
    const recentClients = await Client.find(query)
      .populate('assignedManager', 'first_name last_name')
      .sort({ created_at: -1 })
      .limit(5);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_CLIENT_STATS',
      `Viewed client statistics. Role: ${req.user.role}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: {
        total,
        byStatus,
        topCountries: byCountry,
        recentClients
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CLIENT_STATS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get clients assigned to current manager
// @route   GET /api/clients/my-clients
// @access  Private (CRM Manager only)
exports.getMyClients = async (req, res) => {
  try {
    if (req.user.role !== 'crm_manager') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only CRM managers can access this endpoint'
        }
      });
    }
    
    const { page = 1, limit = 20 } = req.query;
    
    const clients = await Client.find({ 
      assignedManager: req.user.user_id,
      status: { $ne: 'deleted' }
    })
      .populate('user', 'email last_login status')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Client.countDocuments({ 
      assignedManager: req.user.user_id,
      status: { $ne: 'deleted' }
    });
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_MY_CLIENTS',
      `Viewed assigned clients list`,
      req.ip
    );
    
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
      error: {
        code: 'FETCH_MY_CLIENTS_FAILED',
        message: error.message
      }
    });
  }
};