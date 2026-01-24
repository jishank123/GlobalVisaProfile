const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get all payments with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { client, project, status, page = 1, limit = 50 } = req.query;
    
    // Build query
    let query = {};
    
    if (client) query.client = client;
    if (project) query.project = project;
    if (status) query.status = status;
    
    // Role-based filtering
    if (req.user.role === 'client') {
      query.client = req.user.clientProfile;
    }
    
    const payments = await Payment.find(query)
      .populate('client', 'name email')
      .populate('project', 'title')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Payment.countDocuments(query);
    
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
router.get('/:id', protect, async (req, res) => {
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
    if (req.user.role === 'client' && payment.client._id.toString() !== req.user.clientProfile.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
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
router.post('/', protect, authorize('admin', 'crm_manager'), async (req, res) => {
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
router.patch('/:id', protect, authorize('admin', 'crm_manager'), async (req, res) => {
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
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
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
router.get('/stats/summary', protect, authorize('admin', 'crm_manager'), async (req, res) => {
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
