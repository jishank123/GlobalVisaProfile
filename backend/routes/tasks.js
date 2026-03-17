const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// Configure multer for task file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/task-files/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, and Office documents
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Office documents are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// @route   POST /api/tasks/:id/upload
// @desc    Upload files to task
// @access  Private (Employee, Project Manager, CRM Manager, Admin)
router.post('/:id/upload', auth(['employee', 'project_manager', 'crm_manager', 'admin']), upload.array('files', 10), taskController.uploadTaskFiles);

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks for current CRM manager's or Project manager's projects
// @access  Private (CRM Manager, Project Manager)
router.get('/my-tasks', auth(['crm_manager', 'project_manager', 'employee']), taskController.getMyTasks);

// @route   GET /api/tasks
// @desc    Get all tasks with filters
// @access  Private (Admin, Lead Manager, CRM Manager, Project Manager, Client)
router.get('/', auth(['admin', 'lead_manager', 'crm_manager', 'project_manager', 'client']), taskController.getTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private (Admin, Lead Manager, CRM Manager, Project Manager)
router.get('/:id', auth(['admin', 'lead_manager', 'crm_manager', 'project_manager']), taskController.getTask);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (CRM Manager, Project Manager, Admin)
router.post('/', auth(['crm_manager', 'project_manager', 'admin']), taskController.createTask);

// @route   PATCH /api/tasks/:id
// @desc    Update task
// @access  Private (Employee, CRM Manager, Project Manager, Admin)
router.patch('/:id', auth(['employee', 'crm_manager', 'project_manager', 'admin']), taskController.updateTask);

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status
// @access  Private (Employee, CRM Manager, Project Manager, Admin)
router.patch('/:id/status', auth(['employee', 'crm_manager', 'project_manager', 'admin']), taskController.updateTaskStatus);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin only)
router.delete('/:id', auth(['admin']), taskController.deleteTask);

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private (Admin, Lead Manager, CRM Manager, Project Manager)
router.get('/stats', auth(['admin', 'lead_manager', 'crm_manager', 'project_manager']), taskController.getTaskStats);

module.exports = router;

module.exports = router;