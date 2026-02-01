const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks for current CRM manager's projects
// @access  Private (CRM Manager only)
router.get('/my-tasks', auth(['crm_manager']), taskController.getMyTasks);

// @route   GET /api/tasks
// @desc    Get all tasks with filters
// @access  Private (Admin, Lead Manager, CRM Manager)
router.get('/', auth(['admin', 'lead_manager', 'crm_manager']), taskController.getTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private (Admin, Lead Manager, CRM Manager)
router.get('/:id', auth(['admin', 'lead_manager', 'crm_manager']), taskController.getTask);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (CRM Manager, Admin)
router.post('/', auth(['crm_manager', 'admin']), taskController.createTask);

// @route   PATCH /api/tasks/:id
// @desc    Update task
// @access  Private (CRM Manager, Admin)
router.patch('/:id', auth(['crm_manager', 'admin']), taskController.updateTask);

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status
// @access  Private (CRM Manager, Admin)
router.patch('/:id/status', auth(['crm_manager', 'admin']), taskController.updateTaskStatus);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin only)
router.delete('/:id', auth(['admin']), taskController.deleteTask);

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private (Admin, Lead Manager, CRM Manager)
router.get('/stats', auth(['admin', 'lead_manager', 'crm_manager']), taskController.getTaskStats);

module.exports = router;