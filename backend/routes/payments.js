const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const { auth, authenticateClient } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payment-receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed!'), false);
    }
  }
});

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

// @route   POST /api/payments/service-request
// @desc    Submit service request with payment (for clients)
// @access  Private (Client)
router.post('/service-request', authenticateClient, async (req, res) => {
  try {
    const {
      service_id,
      service_name,
      amount,
      payment_method,
      notes
    } = req.body;

    // Validate required fields
    if (!service_id || !service_name || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: service_id, service_name, amount, payment_method'
      });
    }

    // Find client record
    const clientRecord = await Client.findOne({ email: req.client.email });
    if (!clientRecord) {
      return res.status(404).json({
        success: false,
        message: 'Client record not found'
      });
    }

    // Generate transaction ID
    const transactionId = `SRV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const paymentData = {
      client: clientRecord._id,
      service_id,
      service_name,
      amount: parseFloat(amount),
      paymentMethod: payment_method,
      paymentDate: new Date(),
      transactionId,
      status: payment_method === 'online' ? 'completed' : 'pending_verification',
      verification_status: payment_method === 'online' ? 'verified' : 'pending',
      notes: notes || '',
      submitted_by: req.client.email,
      submitted_at: new Date()
    };

    const payment = await Payment.create(paymentData);

    // Populate client data for response
    await payment.populate('client', 'name email phone');

    console.log('💰 Service request payment created:', {
      client: req.client.email,
      service: service_name,
      amount: amount,
      method: payment_method,
      transactionId
    });

    res.status(201).json({
      success: true,
      message: payment_method === 'online' 
        ? 'Service request submitted successfully! Payment processed.' 
        : 'Service request submitted successfully! Our team will verify your payment and contact you soon.',
      data: payment
    });

  } catch (error) {
    console.error('❌ Service request payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit service request',
      error: error.message
    });
  }
});

// @route   POST /api/payments/cash-payment
// @desc    Submit cash payment with receipt screenshot
// @access  Private (Client)
router.post('/cash-payment', authenticateClient, upload.single('payment_screenshot'), async (req, res) => {
  try {
    const {
      service_id,
      service_name,
      amount,
      payment_date,
      payment_method,
      notes
    } = req.body;

    // Validate required fields
    if (!service_id || !service_name || !amount || !payment_date || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment receipt screenshot is required'
      });
    }

    // Find client record
    const clientRecord = await Client.findOne({ email: req.client.email });
    if (!clientRecord) {
      return res.status(404).json({
        success: false,
        message: 'Client record not found'
      });
    }

    // Generate transaction ID
    const transactionId = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record with pending verification status
    const paymentData = {
      client: clientRecord._id,
      service_id,
      service_name,
      amount: parseFloat(amount),
      paymentMethod: payment_method,
      paymentDate: new Date(payment_date),
      transactionId,
      status: 'pending_verification',
      verification_status: 'pending',
      receipt_screenshot: req.file.filename,
      receipt_path: req.file.path,
      notes: notes || '',
      submitted_by: req.client.email,
      submitted_at: new Date()
    };

    const payment = await Payment.create(paymentData);

    // Populate client data for response
    await payment.populate('client', 'name email phone');

    console.log('💵 Cash payment submitted:', {
      client: req.client.email,
      service: service_name,
      amount: amount,
      transactionId
    });

    res.status(201).json({
      success: true,
      message: 'Cash payment proof submitted successfully. Your payment is now pending verification.',
      data: payment
    });

  } catch (error) {
    console.error('❌ Cash payment submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit cash payment proof',
      error: error.message
    });
  }
});

// @route   PATCH /api/payments/:id/verify
// @desc    Verify cash payment (Admin/Manager only)
// @access  Private (Admin, CRM Manager, Lead Manager)
router.patch('/:id/verify', auth(['admin', 'crm_manager', 'lead_manager']), paymentController.verifyPayment);

// @route   GET /api/payments/pending-verification
// @desc    Get all payments pending verification (Admin/Manager only)
// @access  Private (Admin, CRM Manager, Lead Manager)
router.get('/pending-verification', auth(['admin', 'crm_manager', 'lead_manager']), paymentController.getPendingPayments);

// @route   GET /api/payments/stats/summary
// @desc    Get payment statistics
// @access  Private (Admin, CRM Manager)
router.get('/stats/summary', auth(['admin', 'crm_manager']), paymentController.getPaymentStats);

module.exports = router;
