const Project = require('../models/Project');
const Client = require('../models/Client');
const Service = require('../models/Service');
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
      const assignedClients = await Client.find({ crm_manager: req.user._id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      query.client = { $in: clientIds };
    } else if (req.user.role === 'lead_manager') {
      // Lead managers can see projects they created or are assigned to
      query.assigned_to = req.user._id;
    } else if (req.user.role === 'client') {
      // Clients can only see their own projects
      // Find client record by email since there's no direct user link
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (clientRecord) {
        query.client = clientRecord._id;
        console.log('🔍 Client query:', { clientId: clientRecord._id, email: req.user.email });
      } else {
        console.log('❌ No client record found for email:', req.user.email);
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
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log('🔍 Query executed:', query);
    console.log('📊 Projects found:', projects.length);
    
    const count = await Project.countDocuments(query);
    console.log('📊 Total count:', count);
    
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
      // Find client record by email since there's no direct user link
      const clientRecord = await Client.findOne({ email: req.user.email });
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
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user.user_id) {
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
      if (!clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user.user_id) {
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
      assignedTo: clientRecord.crm_manager || req.user.user_id,
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
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user.user_id) {
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
      const assignedClients = await Client.find({ crm_manager: req.user.user_id }).select('_id');
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

// @desc    Bulk assign projects to CRM manager (Lead Manager only)
// @route   POST /api/projects/bulk/assign-to-crm
// @access  Private (Lead Manager, Admin)
exports.bulkAssignProjectsToCrm = async (req, res) => {
  try {
    console.log('🎯 === BULK ASSIGN PROJECTS TO CRM REQUEST ===');
    console.log('🎯 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('🎯 Request body:', req.body);
    
    const { project_ids, crm_manager_id, notes } = req.body;
    
    // Validation
    if (!project_ids || !Array.isArray(project_ids) || project_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PROJECT_IDS',
          message: 'Project IDs array is required and cannot be empty'
        }
      });
    }
    
    if (!crm_manager_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_MANAGER_ID',
          message: 'CRM Manager ID is required'
        }
      });
    }
    
    // Verify manager exists and has correct role
    const manager = await User.findById(crm_manager_id);
    if (!manager || manager.role !== 'crm_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MANAGER',
          message: 'Invalid manager ID or user is not a CRM manager'
        }
      });
    }
    
    console.log('🎯 CRM Manager found:', manager.email, 'Role:', manager.role);
    
    // Process each project assignment
    const results = [];
    const errors = [];
    
    for (const projectId of project_ids) {
      try {
        // First check if project exists
        const existingProject = await Project.findById(projectId).populate('client');
        if (!existingProject) {
          errors.push({
            projectId: projectId,
            error: 'Project not found'
          });
          continue;
        }
        
        // Check if project is created from lead and in planning/pending status
        if (!['planning', 'pending'].includes(existingProject.status)) {
          errors.push({
            projectId: projectId,
            error: 'Only projects in planning or pending status can be assigned to CRM managers'
          });
          continue;
        }
        
        // Update project with CRM manager assignment
        const project = await Project.findByIdAndUpdate(
          projectId,
          { 
            assigned_to: crm_manager_id,
            status: 'active', // Change status to active when assigned to CRM
            updated_at: new Date(),
            assignment_notes: notes || '',
            assigned_to_crm_at: new Date(),
            assigned_to_crm_by: req.user.user_id
          },
          { new: true }
        ).populate('client', 'name email')
        .populate('service', 'name category')
        .populate('assigned_to', 'first_name last_name email');
        
        // Also update the client to be assigned to this CRM manager
        if (existingProject.client) {
          await Client.findByIdAndUpdate(
            existingProject.client._id,
            { 
              crm_manager: crm_manager_id,
              updated_at: new Date()
            }
          );
        }
        
        if (project) {
          results.push({
            projectId: projectId,
            success: true,
            project: project
          });
          
          // Log activity
          await logActivity(
            req.user.user_id,
            'ASSIGN_PROJECT_TO_CRM',
            `Assigned project ${project.project_id} to CRM manager ${manager.email}`,
            req.ip
          );
        } else {
          errors.push({
            projectId: projectId,
            error: 'Failed to update project'
          });
        }
      } catch (error) {
        console.error('🎯 Error assigning project:', projectId, error);
        errors.push({
          projectId: projectId,
          error: error.message
        });
      }
    }
    
    console.log('🎯 Assignment results:', {
      successful: results.length,
      failed: errors.length,
      total: project_ids.length
    });
    
    // Return results
    const response = {
      success: true,
      message: `Successfully assigned ${results.length} of ${project_ids.length} projects to CRM manager`,
      data: {
        successful: results,
        failed: errors,
        manager: {
          id: manager._id,
          name: `${manager.first_name} ${manager.last_name}`,
          email: manager.email
        },
        notes: notes || ''
      }
    };
    
    // If some assignments failed, include warning
    if (errors.length > 0) {
      response.warning = `${errors.length} project(s) could not be assigned`;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('🎯 Bulk project assignment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BULK_PROJECT_ASSIGN_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Handover project to another CRM manager
// @route   PATCH /api/projects/:id/handover
// @access  Private (CRM Manager, Admin)
exports.handoverProject = async (req, res) => {
  try {
    console.log('🔄 === PROJECT HANDOVER REQUEST ===');
    console.log('🔄 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('🔄 Request body:', req.body);
    
    const { new_crm_manager, handover_reason, handover_notes } = req.body;
    
    // Validation
    if (!new_crm_manager) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CRM_MANAGER',
          message: 'New CRM manager ID is required'
        }
      });
    }
    
    if (!handover_notes || handover_notes.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_HANDOVER_NOTES',
          message: 'Handover notes are required'
        }
      });
    }
    
    // Verify new CRM manager exists and has correct role
    const newCrmManager = await User.findById(new_crm_manager);
    if (!newCrmManager || newCrmManager.role !== 'crm_manager') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CRM_MANAGER',
          message: 'Invalid CRM manager ID or user is not a CRM manager'
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
    
    // Security check - only current assigned CRM or admin can handover
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(project.client._id);
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only handover projects assigned to you'
          }
        });
      }
    }
    
    const oldCrmManager = project.assigned_to;
    
    // Update project assignment
    project.assigned_to = new_crm_manager;
    project.handover_history = project.handover_history || [];
    project.handover_history.push({
      from_crm: oldCrmManager,
      to_crm: new_crm_manager,
      reason: handover_reason || 'Not specified',
      notes: handover_notes,
      handover_date: new Date(),
      handover_by: req.user.user_id
    });
    project.updated_at = new Date();
    
    await project.save();
    
    // Also update client assignment
    await Client.findByIdAndUpdate(
      project.client._id,
      { 
        crm_manager: new_crm_manager,
        updated_at: new Date()
      }
    );
    
    // Populate the updated project
    await project.populate([
      { path: 'client', select: 'name email company' },
      { path: 'service', select: 'name category price' },
      { path: 'assigned_to', select: 'first_name last_name email' }
    ]);
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'HANDOVER_PROJECT',
      `Handed over project ${project.project_id} from ${req.user.email} to ${newCrmManager.email}. Reason: ${handover_reason}`,
      req.ip
    );
    
    console.log('🔄 Project handover successful:', {
      projectId: project.project_id,
      from: req.user.email,
      to: newCrmManager.email,
      reason: handover_reason
    });
    
    res.json({
      success: true,
      message: 'Project handed over successfully',
      data: {
        project: project,
        handover_details: {
          from_crm: req.user.email,
          to_crm: newCrmManager.email,
          reason: handover_reason,
          notes: handover_notes,
          handover_date: new Date()
        }
      }
    });
  } catch (error) {
    console.error('🔄 Project handover error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HANDOVER_PROJECT_FAILED',
        message: error.message
      }
    });
  }
};