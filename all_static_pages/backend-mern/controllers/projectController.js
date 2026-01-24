const Project = require('../models/Project');
const Client = require('../models/Client');
const Service = require('../models/Service');
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

// @desc    Get all projects with role-based filtering
// @route   GET /api/projects
// @access  Private (Admin, Managers, Clients)
exports.getProjects = async (req, res) => {
  try {
    const { search, status, service, client, page = 1, limit = 20 } = req.query;
    
    // Build query with security filters
    let query = {};
    
    // Role-based access control
    if (req.user.role === 'crm_manager') {
      // CRM managers can only see projects for their assigned clients
      const assignedClients = await Client.find({ assignedManager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
    } else if (req.user.role === 'client') {
      // Clients can only see their own projects
      const clientRecord = await Client.findOne({ user: req.user.user_id });
      if (clientRecord) {
        query.client = clientRecord._id;
      } else {
        // No client record found, return empty result
        return res.json({
          success: true,
          count: 0,
          total: 0,
          page: parseInt(page),
          totalPages: 0,
          data: []
        });
      }
    }
    
    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (service) query.service = service;
    if (client && req.user.role !== 'client') query.client = client;
    
    const projects = await Project.find(query)
      .populate('client', 'name email company')
      .populate('service', 'name category price')
      .populate('assignedTo', 'first_name last_name email')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Project.countDocuments(query);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_PROJECTS',
      `Viewed projects list. Role: ${req.user.role}, Filters: ${JSON.stringify(req.query)}`,
      req.ip
    );
    
    res.json({
      success: true,
      count: projects.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECTS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email company phone')
      .populate('service', 'name category price duration')
      .populate('assignedTo', 'first_name last_name email phone')
      .populate('created_by', 'first_name last_name email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'client') {
      const clientRecord = await Client.findOne({ user: req.user.user_id });
      if (!clientRecord || project.client._id.toString() !== clientRecord._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view your own projects'
          }
        });
      }
    } else if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      if (!clientRecord || !clientRecord.assignedManager || 
          clientRecord.assignedManager.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view projects for your assigned clients'
          }
        });
      }
    }
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_PROJECT',
      `Viewed project: ${project.title} (ID: ${project._id})`,
      req.ip
    );
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin, Lead Manager, CRM Manager)
exports.createProject = async (req, res) => {
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
    
    const { client, service, title, description, priority, deadline } = req.body;
    
    // Verify client exists
    const clientRecord = await Client.findById(client);
    if (!clientRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      });
    }
    
    // Verify service exists
    const serviceRecord = await Service.findById(service);
    if (!serviceRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found'
        }
      });
    }
    
    // Security check for CRM managers
    if (req.user.role === 'crm_manager') {
      if (!clientRecord.assignedManager || 
          clientRecord.assignedManager.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only create projects for your assigned clients'
          }
        });
      }
    }
    
    const projectData = {
      client,
      service,
      title,
      description,
      priority: priority || 'medium',
      deadline,
      assignedTo: clientRecord.assignedManager || req.user.user_id,
      created_by: req.user.user_id,
      status: 'planning'
    };
    
    const project = await Project.create(projectData);
    
    // Populate the created project
    await project.populate([
      { path: 'client', select: 'name email company' },
      { path: 'service', select: 'name category price' },
      { path: 'assignedTo', select: 'first_name last_name email' }
    ]);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'CREATE_PROJECT',
      `Created new project: ${project.title} for client: ${clientRecord.name}`,
      req.ip
    );
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Update project
// @route   PATCH /api/projects/:id
// @access  Private (Admin, Lead Manager, Assigned Manager)
exports.updateProject = async (req, res) => {
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
    
    const project = await Project.findById(req.params.id).populate('client');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Security check - role-based access control
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      if (!clientRecord || !clientRecord.assignedManager || 
          clientRecord.assignedManager.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update projects for your assigned clients'
          }
        });
      }
    }
    
    // Define allowed fields based on role
    let allowedFields = ['title', 'description', 'status', 'progress', 'priority', 'deadline', 'notes'];
    
    if (req.user.role === 'crm_manager') {
      // CRM managers can update progress and status but not reassign
      allowedFields = ['status', 'progress', 'notes'];
    }
    
    // Update only allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Validate progress percentage
    if (updateData.progress !== undefined) {
      if (updateData.progress < 0 || updateData.progress > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PROGRESS',
            message: 'Progress must be between 0 and 100'
          }
        });
      }
    }
    
    // Auto-update status based on progress
    if (updateData.progress !== undefined) {
      if (updateData.progress === 0) {
        updateData.status = 'planning';
      } else if (updateData.progress === 100) {
        updateData.status = 'completed';
        updateData.completed_at = new Date();
      } else {
        updateData.status = 'in_progress';
      }
    }
    
    Object.assign(project, updateData);
    project.updated_at = new Date();
    await project.save();
    
    // Populate updated project
    await project.populate([
      { path: 'client', select: 'name email company' },
      { path: 'service', select: 'name category price' },
      { path: 'assignedTo', select: 'first_name last_name email' }
    ]);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'UPDATE_PROJECT',
      `Updated project: ${project.title}. Fields: ${Object.keys(updateData).join(', ')}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Delete project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Lead Manager)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }
    
    // Soft delete - change status instead of actual deletion
    project.status = 'cancelled';
    project.cancelled_at = new Date();
    project.cancelled_by = req.user.user_id;
    await project.save();
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'DELETE_PROJECT',
      `Cancelled project: ${project.title}`,
      req.ip
    );
    
    res.json({
      success: true,
      message: 'Project cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/summary
// @access  Private (Admin, Managers)
exports.getProjectStats = async (req, res) => {
  try {
    let query = { status: { $ne: 'cancelled' } };
    
    // Filter by assigned clients for CRM managers
    if (req.user.role === 'crm_manager') {
      const assignedClients = await Client.find({ assignedManager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
    }
    
    const total = await Project.countDocuments(query);
    
    const byStatus = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const byPriority = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const avgProgress = await Project.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);
    
    const recentProjects = await Project.find(query)
      .populate('client', 'name email')
      .populate('service', 'name category')
      .sort({ created_at: -1 })
      .limit(5);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_PROJECT_STATS',
      `Viewed project statistics. Role: ${req.user.role}`,
      req.ip
    );
    
    res.json({
      success: true,
      data: {
        total,
        byStatus,
        byPriority,
        averageProgress: avgProgress[0]?.averageProgress || 0,
        recentProjects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROJECT_STATS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get projects assigned to current manager
// @route   GET /api/projects/my-projects
// @access  Private (CRM Manager only)
exports.getMyProjects = async (req, res) => {
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
    
    // Get assigned clients first
    const assignedClients = await Client.find({ assignedManager: req.user.user_id }).select('_id');
    const clientIds = assignedClients.map(client => client._id);
    
    const projects = await Project.find({ 
      client: { $in: clientIds },
      status: { $ne: 'cancelled' }
    })
      .populate('client', 'name email company')
      .populate('service', 'name category price')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Project.countDocuments({ 
      client: { $in: clientIds },
      status: { $ne: 'cancelled' }
    });
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'VIEW_MY_PROJECTS',
      `Viewed assigned projects list`,
      req.ip
    );
    
    res.json({
      success: true,
      count: projects.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_MY_PROJECTS_FAILED',
        message: error.message
      }
    });
  }
};