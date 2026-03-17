const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');
const Client = require('../models/Client');
const { auth, authenticateClient } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

// Configure multer for payment receipt uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payment-receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for final files uploads
const finalFilesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/final-files/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'final-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed!'), false);
  }
};

const finalFilesFilter = (req, file, cb) => {
  // Accept various file types for final deliverables
  const allowedTypes = [
    'image/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain'
  ];
  
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type) || file.mimetype === type);
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadFinalFiles = multer({ 
  storage: finalFilesStorage,
  fileFilter: finalFilesFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for final files
  }
});

// Configure multer for task files uploads
const taskFilesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/task-files/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadTaskFiles = multer({ 
  storage: taskFilesStorage,
  fileFilter: finalFilesFilter, // Use same filter as final files
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for task files
  }
});

// @route   POST /api/projects/purchase
// @desc    Purchase services (for clients)
// @access  Private (Client)
router.post('/purchase', authenticateClient, upload.single('paymentReceipt'), projectController.purchaseServices);

// Fixed auth middleware usage - all instances

// @route   POST /api/projects/bulk/assign-to-crm
// @desc    Bulk assign projects to CRM manager (Lead Manager and Admin)
// @access  Private (Lead Manager and Admin)
router.post('/bulk/assign-to-crm', auth(['lead_manager', 'admin']), projectController.bulkAssignProjectsToCrm);

// @route   GET /api/projects/my-projects
// @desc    Get projects assigned to current CRM manager
// @access  Private (CRM Manager only)
router.get('/my-projects', auth(['crm_manager']), projectController.getMyProjects);

// @route   POST /api/projects/:id/assign-pm
// @desc    Assign project to project manager with optional task files
// @access  Private (CRM Manager, Admin)
router.post('/:id/assign-pm', auth(['crm_manager', 'admin']), uploadTaskFiles.array('task_files', 10), projectController.assignProjectToProjectManager);

// @route   GET /api/projects/my-created-projects
// @desc    Get projects created by current lead manager
// @access  Private (Lead Manager only)
router.get('/my-created-projects', auth(['lead_manager']), projectController.getMyCreatedProjects);

// @route   GET /api/projects/my-pm-projects
// @desc    Get projects assigned to current project manager
// @access  Private (Project Manager only)
router.get('/my-pm-projects', auth(['project_manager']), projectController.getMyPMProjects);

// @route   POST /api/projects/:id/milestones
// @desc    Add milestone/task to project
// @access  Private (CRM Manager, Admin)
router.post('/:id/milestones', auth(['crm_manager', 'admin']), projectController.addProjectMilestone);

// @route   POST /api/projects/:id/notes
// @desc    Add note to project
// @access  Private (CRM Manager, Admin)
router.post('/:id/notes', auth(['crm_manager', 'admin']), projectController.addProjectNote);

// @route   POST /api/projects/:id/final-files
// @desc    Upload final files to project (Project Manager only)
// @access  Private (Project Manager)
router.post('/:id/final-files', auth(['project_manager']), uploadFinalFiles.single('file'), projectController.uploadFinalFile);

// @route   DELETE /api/projects/:id/final-files/:fileId
// @desc    Delete final file from project
// @access  Private (Project Manager, Admin)
router.delete('/:id/final-files/:fileId', auth(['project_manager', 'admin']), projectController.deleteFinalFile);

// @route   PATCH /api/projects/:id/final-files/:fileId/approve
// @desc    Approve final file (CRM Manager only)
// @access  Private (CRM Manager, Admin)
router.patch('/:id/final-files/:fileId/approve', auth(['crm_manager', 'admin']), projectController.approveFinalFile);

// @route   PATCH /api/projects/:id/final-files/:fileId/reject
// @desc    Reject final file (CRM Manager only)
// @access  Private (CRM Manager, Admin)
router.patch('/:id/final-files/:fileId/reject', auth(['crm_manager', 'admin']), projectController.rejectFinalFile);

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
// @access  Private (Admin, Lead Manager, CRM Manager, Project Manager)
router.patch('/:id', auth(['admin', 'lead_manager', 'crm_manager', 'project_manager']), projectController.updateProject);

// @route   PATCH /api/projects/:id/handover
// @desc    Handover project to another CRM manager
// @access  Private (CRM Manager, Admin)
router.patch('/:id/handover', auth(['crm_manager', 'admin']), projectController.handoverProject);

// @route   PATCH /api/projects/:id/progress
// @desc    Update project progress
// @access  Private (Team Members)
router.patch('/:id/progress', auth(['admin', 'lead_manager', 'crm_manager', 'project_manager']), async (req, res) => {
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
    const isAssignedCRM = project.assigned_to && project.assigned_to.toString() === req.user._id.toString();
    const isAssignedPM = project.project_manager && project.project_manager.toString() === req.user._id.toString();
    const isAdminOrManager = ['admin', 'lead_manager', 'crm_manager'].includes(req.user.role);
    
    if (!isAssignedCRM && !isAssignedPM && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    project.progress = progress;
    
    // Auto-update status based on progress
    if (progress === 0) {
      project.status = 'pending';
    } else if (progress > 0 && progress < 100) {
      project.status = 'active';
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
router.post('/:id/milestones', auth(['admin', 'lead_manager', 'crm_manager']), projectController.addProjectMilestone);

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

// @route   POST /api/projects/:id/invoice
// @desc    Generate invoice for project
// @access  Private (Admin, Lead Manager, CRM Manager)
router.post('/:id/invoice', auth(['admin', 'lead_manager', 'crm_manager']), projectController.generateProjectInvoice);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', auth(['admin']), projectController.deleteProject);

// @route   GET /api/projects/stats/summary
// @desc    Get project statistics
// @access  Private (Admin, Lead Manager, CRM Manager)
router.get('/stats/summary', auth(['admin', 'lead_manager', 'crm_manager']), projectController.getProjectStats);

module.exports = router;
