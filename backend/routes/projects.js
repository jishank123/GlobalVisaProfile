const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Client = require('../models/Client');
const { auth, authenticateClient } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

// Fixed auth middleware usage - all instances

// @route   POST /api/projects/bulk/assign-to-crm
// @desc    Bulk assign projects to CRM manager (Lead Manager and Admin)
// @access  Private (Lead Manager and Admin)
router.post('/bulk/assign-to-crm', auth(['lead_manager', 'admin']), projectController.bulkAssignProjectsToCrm);

// @route   GET /api/projects/my-projects
// @desc    Get projects assigned to current CRM manager
// @access  Private (CRM Manager only)
router.get('/my-projects', auth(['crm_manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Get assigned clients
    const assignedClients = await Client.find({ crm_manager: req.user._id }).select('_id');
    const clientIds = assignedClients.map(client => client._id);
    
    const projects = await Project.find({ 
      client: { $in: clientIds },
      status: { $ne: 'cancelled' }
    })
      .populate('client', 'name email phone university')
      .populate('service', 'name category')
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Project.countDocuments({ 
      client: { $in: clientIds },
      status: { $ne: 'cancelled' }
    });
    
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
});

// @route   GET /api/projects
// @desc    Get all projects with filters
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
router.get('/', auth(['admin', 'lead_manager', 'crm_manager', 'client']), projectController.getProjects);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private (Admin, Lead Manager, CRM Manager, Client)
router.get('/:id', auth(['admin', 'lead_manager', 'crm_manager', 'client']), projectController.getProject);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin, Lead Manager, CRM Manager)
router.post('/', auth(['admin', 'lead_manager', 'crm_manager']), projectController.createProject);

// @route   PATCH /api/projects/:id
// @desc    Update project
// @access  Private (Admin, Lead Manager, CRM Manager)
router.patch('/:id', auth(['admin', 'lead_manager', 'crm_manager']), projectController.updateProject);

// @route   PATCH /api/projects/:id/handover
// @desc    Handover project to another CRM manager
// @access  Private (CRM Manager, Admin)
router.patch('/:id/handover', auth(['crm_manager', 'admin']), projectController.handoverProject);

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
router.delete('/:id', auth(['admin']), projectController.deleteProject);

// @route   GET /api/projects/stats/summary
// @desc    Get project statistics
// @access  Private (Admin, Lead Manager, CRM Manager)
router.get('/stats/summary', auth(['admin', 'lead_manager', 'crm_manager']), projectController.getProjectStats);

module.exports = router;
