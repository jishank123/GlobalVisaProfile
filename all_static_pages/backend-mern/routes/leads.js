const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const Lead = require('../models/Lead');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Lead Manager, CRM Manager, Admin)
router.get('/', protect, restrictTo('admin', 'lead_manager', 'crm_manager'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, source, assigned_to, search } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (assigned_to) query.assigned_to = assigned_to;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const leads = await Lead.find(query)
      .populate('assigned_to', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message
      }
    });
  }
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assigned_to', 'first_name last_name email')
      .populate('converted_to_client');

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: error.message
      }
    });
  }
});

// @desc    Create new lead
// @route   POST /api/leads
// @access  Public or Private
router.post('/', async (req, res) => {
  try {
    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: error.message
      }
    });
  }
});

// @desc    Update lead
// @route   PATCH /api/leads/:id
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: error.message
      }
    });
  }
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin, Lead Manager)
router.delete('/:id', protect, restrictTo('admin', 'lead_manager'), async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error.message
      }
    });
  }
});

// @desc    Add interaction to lead
// @route   POST /api/leads/:id/interactions
// @access  Private
router.post('/:id/interactions', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found'
        }
      });
    }

    lead.interactions.push({
      ...req.body,
      user: req.user.user_id,
      date: new Date()
    });

    lead.last_contact = new Date();
    await lead.save();

    res.json({
      success: true,
      message: 'Interaction added successfully',
      data: lead
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'ADD_INTERACTION_FAILED',
        message: error.message
      }
    });
  }
});

module.exports = router;
