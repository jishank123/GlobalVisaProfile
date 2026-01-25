const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Client = require('../models/Client');
const { auth, authenticateClient } = require('../middleware/auth');

// Fixed auth middleware usage - all instances

// @route   GET /api/projects
// @desc    Get all projects with filters
// @access  Private
router.get('/', authenticateClient, async (req, res) => {
  try {
    const { client, service, status, priority, manager, page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = {};
    
    if (client) query.client = client;
    if (service) query.service = service;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (manager) query.assignedTeam = manager;
    
    // For clients, only show their own projects
    // Find client record by email from the authenticated client account
    const clientRecord = await Client.findOne({ email: req.client.email });
    if (clientRecord) {
      query.client = clientRecord._id;
      console.log('🔍 Client projects query:', { clientId: clientRecord._id, email: req.client.email });
    } else {
      console.log('❌ No client record found for email:', req.client.email);
      return res.json({
        success: true,
        count: 0,
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        data: []
      });
    }
    
    const projects = await Project.find(query)
      .populate('client', 'name email phone')
      .populate('service', 'name category')
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log('🔍 Query executed:', query);
    console.log('📊 Projects found:', projects.length);
    
    const count = await Project.countDocuments(query);
    console.log('📊 Total count:', count);
    
    res.json({
      success: true,
      count: projects.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: projects
    });
  } catch (error) {
    console.error('❌ Projects API error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', auth(['admin', 'lead_manager', 'crm_manager', 'client']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email phone country')
      .populate('service', 'name description pricing')
      .populate('assignedTeam', 'name email role')
      .populate('createdBy', 'name email')
      .populate('milestones.completedBy', 'name');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check access permission
    if (req.user.role === 'client' && project.client._id.toString() !== req.user.clientProfile.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (req.user.role === 'crm_manager') {
      const isAssigned = project.assignedTeam.some(member => member._id.toString() === req.user._id.toString());
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin, Managers)
router.post('/', auth(['admin', 'lead_manager', 'crm_manager']), async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    
    const project = await Project.create(req.body);
    
    await project.populate('client service assignedTeam createdBy');
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// @route   PATCH /api/projects/:id
// @desc    Update project
// @access  Private
router.patch('/:id', auth(['admin', 'lead_manager', 'crm_manager']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check permission
    const isAssigned = project.assignedTeam.some(member => member.toString() === req.user._id.toString());
    const isAdminOrManager = ['admin', 'lead_manager', 'crm_manager'].includes(req.user.role);
    
    if (!isAssigned && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update fields
    Object.assign(project, req.body);
    
    // Update completion date if status changed to completed
    if (req.body.status === 'completed' && !project.actualEndDate) {
      project.actualEndDate = new Date();
    }
    
    await project.save();
    await project.populate('client service assignedTeam createdBy');
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
});

// @route   PATCH /api/projects/:id/progress
// @desc    Update project progress
// @access  Private (Team Members)
router.patch('/:id/progress', auth(['admin', 'lead_manager', 'crm_manager']), async (req, res) => {
  try {
    const { progress } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check permission
    const isAssigned = project.assignedTeam.some(member => member.toString() === req.user._id.toString());
    const isAdminOrManager = ['admin', 'lead_manager', 'crm_manager'].includes(req.user.role);
    
    if (!isAssigned && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    project.progress = progress;
    
    // Auto-update status based on progress
    if (progress === 0) {
      project.status = 'planning';
    } else if (progress > 0 && progress < 100) {
      project.status = 'in_progress';
    } else if (progress === 100) {
      project.status = 'completed';
      project.actualEndDate = new Date();
    }
    
    await project.save();
    
    res.json({
      success: true,
      message: 'Project progress updated',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
});

// @route   POST /api/projects/:id/milestones
// @desc    Add milestone to project
// @access  Private (Team Members)
router.post('/:id/milestones', auth(['admin', 'lead_manager', 'crm_manager']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    project.milestones.push(req.body);
    await project.save();
    
    res.json({
      success: true,
      message: 'Milestone added successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add milestone',
      error: error.message
    });
  }
});

// @route   PATCH /api/projects/:id/milestones/:milestoneId
// @desc    Update milestone
// @access  Private (Team Members)
router.patch('/:id/milestones/:milestoneId', auth(['admin', 'lead_manager', 'crm_manager']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const milestone = project.milestones.id(req.params.milestoneId);
    
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }
    
    Object.assign(milestone, req.body);
    
    if (req.body.status === 'completed' && !milestone.completedAt) {
      milestone.completedAt = new Date();
      milestone.completedBy = req.user._id;
    }
    
    await project.save();
    
    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update milestone',
      error: error.message
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/projects/stats/summary
// @desc    Get project statistics
// @access  Private (Admin, Managers)
router.get('/stats/summary', auth(['admin', 'lead_manager', 'crm_manager']), async (req, res) => {
  try {
    let query = {};
    
    // Filter by assigned team for CRM managers
    if (req.user.role === 'crm_manager') {
      query.assignedTeam = req.user._id;
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
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        byStatus,
        byPriority,
        averageProgress: avgProgress[0]?.avgProgress || 0
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
