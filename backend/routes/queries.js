const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const { auth } = require('../middleware/auth');

// @route   GET /api/queries
// @desc    Get queries with filters
// @access  Private (Admin, CRM Manager)
router.get('/', auth(['admin', 'crm_manager']), queryController.getQueries);

// @route   GET /api/queries/stats/summary
// @desc    Get query statistics
// @access  Private (Admin, CRM Manager)
router.get('/stats/summary', auth(['admin', 'crm_manager']), queryController.getQueryStats);

// @route   GET /api/queries/my-queries
// @desc    Get queries assigned to current CRM manager
// @access  Private (CRM Manager only)
router.get('/my-queries', auth(['crm_manager']), queryController.getMyQueries);

// @route   GET /api/queries/:id
// @desc    Get single query
// @access  Private (Admin, CRM Manager)
router.get('/:id', auth(['admin', 'crm_manager']), queryController.getQuery);

// @route   POST /api/queries
// @desc    Create new query
// @access  Private (Admin, CRM Manager, Client)
router.post('/', auth(['admin', 'crm_manager', 'client']), queryController.createQuery);

// @route   POST /api/queries/:id/respond
// @desc    Add response to query
// @access  Private (Admin, CRM Manager)
router.post('/:id/respond', auth(['admin', 'crm_manager']), queryController.respondToQuery);

// @route   PATCH /api/queries/:id/status
// @desc    Update query status
// @access  Private (Admin, CRM Manager)
router.patch('/:id/status', auth(['admin', 'crm_manager']), queryController.updateQueryStatus);

module.exports = router;