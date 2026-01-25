const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const { auth, authenticateClient } = require('../middleware/auth');

// Fixed auth middleware usage

// @route   GET /api/payments
// @desc    Get all payments with filters
// @access  Private
router.get('/', authenticateClient, async (req, res) => {
  try {
    const { client, project, status, page = 1, limit = 50 } = req.query;
    
    // Build query
    let query = {};
    
    if (client) query.client = client;
    if (project) query.project = project;
    if (status) query.status = status;
    
    // For clients, only show their own payments
    // Find client record by email from the authenticated client account
    const clientRecord = await Client.findOne({ email: req.client.email });
    if (clientRecord) {
      query.client = clientRecord._id;
      console.log('🔍 Client payments query:', { clientId: clientRecord._id, email: req.client.email });
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
    
    const payments = await Payment.find(query)
      .populate('client', 'name email')
      .populate('project', 'project_id service_name')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log('🔍 Payments query executed:', query);
    console.log('💳 Payments found:', payments.length);
    
    const count = await Payment.countDocuments(query);
    console.log('💳 Total count:', count);
    
    res.json({
      success: true,
      count: payments.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', auth(['admin', 'lead_manager', 'crm_manager', 'client']), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('project', 'title status');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check access permission
    if (req.user.role === 'client') {
      // Find client record by email since there's no direct user link
      const Client = require('../models/Client');
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (!clientRecord || payment.client._id.toString() !== clientRecord._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/payments
// @desc    Create new payment
// @access  Private (Admin, CRM Manager)
router.post('/', auth(['admin', 'crm_manager']), async (req, res) => {
  try {
    // Generate transaction ID if not provided
    if (!req.body.transactionId) {
      req.body.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    const payment = await Payment.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

// @route   PATCH /api/payments/:id
// @desc    Update payment
// @access  Private (Admin, CRM Manager)
router.patch('/:id', auth(['admin', 'crm_manager']), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
});

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Private (Admin only)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payments/stats/summary
// @desc    Get payment statistics
// @access  Private (Admin, CRM Manager)
router.get('/stats/summary', auth(['admin', 'crm_manager']), async (req, res) => {
  try {
    const totalPayments = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        byStatus: totalPayments,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
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
