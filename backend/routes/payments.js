const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const { auth, authenticateClient } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const encryption = require('../middleware/encryptionMiddleware');

// Helper function to get all possible encrypted values for a status
function getEncryptedStatusValues(status) {
  // Since encryption uses random IV, we can't pre-encrypt
  // Instead, we'll fetch all and filter in memory
  return status;
}

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
    
    // Build query (without status filter since it's encrypted)
    let query = {};
    
    if (client) query.client = client;
    if (project) query.project = project;
    // Don't filter by status in query - we'll filter after decryption
    
    // For clients, only show their own payments
    // Use user_id instead of email since emails are encrypted in Client model
    const clientRecord = await Client.findOne({ user_id: req.client.id });
    if (clientRecord) {
      query.client = clientRecord._id;
      console.log('🔍 Client payments query:', { clientId: clientRecord._id, userId: req.client.id, email: req.client.email });
    } else {
      console.log('❌ No client record found for user_id:', req.client.id, 'email:', req.client.email);
      return res.json({
        success: true,
        count: 0,
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        data: []
      });
    }
    
    // Fetch all payments (decryption happens in post hooks)
    let payments = await Payment.find(query)
      .populate('client', 'name email')
      .populate('project', 'project_id service_name')
      .sort({ paymentDate: -1 });
    
    // Manually decrypt fields to ensure they're decrypted (fallback if hooks don't work)
    payments = payments.map(payment => {
      const paymentObj = payment.toObject ? payment.toObject() : payment;
      
      // Decrypt status if still encrypted
      if (paymentObj.status && typeof paymentObj.status === 'string' && paymentObj.status.includes(':')) {
        paymentObj.status = encryption.decrypt(paymentObj.status);
      }
      
      // Decrypt amount if still encrypted
      if (paymentObj.amount && typeof paymentObj.amount === 'string' && paymentObj.amount.includes(':')) {
        const decrypted = encryption.decrypt(paymentObj.amount);
        paymentObj.amount = parseFloat(decrypted);
      }
      
      // Decrypt paymentMethod if still encrypted
      if (paymentObj.paymentMethod && typeof paymentObj.paymentMethod === 'string' && paymentObj.paymentMethod.includes(':')) {
        paymentObj.paymentMethod = encryption.decrypt(paymentObj.paymentMethod);
      }
      
      // Decrypt service_name if still encrypted
      if (paymentObj.service_name && typeof paymentObj.service_name === 'string' && paymentObj.service_name.includes(':')) {
        paymentObj.service_name = encryption.decrypt(paymentObj.service_name);
      }
      
      // Decrypt currency if still encrypted
      if (paymentObj.currency && typeof paymentObj.currency === 'string' && paymentObj.currency.includes(':')) {
        paymentObj.currency = encryption.decrypt(paymentObj.currency);
      }
      
      // Decrypt verification_status if still encrypted
      if (paymentObj.verification_status && typeof paymentObj.verification_status === 'string' && paymentObj.verification_status.includes(':')) {
        paymentObj.verification_status = encryption.decrypt(paymentObj.verification_status);
      }
      
      return paymentObj;
    });
    
    // Log payment statuses for debugging
    console.log('💳 Payment statuses after decryption:');
    payments.forEach((p, i) => {
      console.log(`  ${i + 1}. ID: ${p._id}, Status: "${p.status}", Amount: ${p.amount}`);
    });
    
    // Filter by status AFTER decryption (in memory)
    if (status) {
      payments = payments.filter(p => p.status === status);
    }
    
    // Apply pagination after filtering
    const total = payments.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = payments.slice(startIndex, endIndex);
    
    console.log('🔍 Payments query executed:', query);
    console.log('💳 Payments found:', paginatedPayments.length, 'Total:', total);
    
    res.json({
      success: true,
      count: paginatedPayments.length,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: paginatedPayments
    });
  } catch (error) {
    console.error('❌ Get payments error:', error);
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
    console.log('💳 === UPDATE PAYMENT REQUEST ===');
    console.log('💳 Payment ID:', req.params.id);
    console.log('💳 Update data:', req.body);
    
    // If verification_status is being set to 'verified', add verified_at timestamp
    if (req.body.verification_status === 'verified' && !req.body.verified_at) {
      req.body.verified_at = new Date();
    }
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!payment) {
      console.log('❌ Payment not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    console.log('✅ Payment updated successfully:', payment._id);
    
    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('❌ Update payment error:', error);
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

    // Find client record using user_id instead of email (emails are encrypted)
    const clientRecord = await Client.findOne({ user_id: req.client.id });
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

    // Find client record using user_id instead of email (emails are encrypted)
    const clientRecord = await Client.findOne({ user_id: req.client.id });
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

// @route   PATCH /api/payments/:id/submit-payment
// @desc    Submit payment for a due payment or resubmit for rejected payment (update with payment method and receipt)
// @access  Private (Client)
router.patch('/:id/submit-payment', authenticateClient, upload.single('payment_screenshot'), async (req, res) => {
  try {
    console.log('💳 === SUBMIT DUE PAYMENT REQUEST ===');
    console.log('💳 Payment ID:', req.params.id);
    console.log('💳 Client:', req.client.email);
    console.log('💳 Body:', req.body);
    console.log('💳 File:', req.file ? req.file.filename : 'No file');

    const { payment_method, payment_date, notes } = req.body;

    // Validate required fields
    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment receipt screenshot is required'
      });
    }

    // Find the payment
    const payment = await Payment.findById(req.params.id).populate('client');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify this payment belongs to the client using user_id (emails are encrypted)
    const clientRecord = await Client.findOne({ user_id: req.client.id });
    if (!clientRecord || payment.client._id.toString() !== clientRecord._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This payment does not belong to you.'
      });
    }

    // Check if payment status is 'due' or 'rejected/failed/cancelled' (for resubmission)
    const allowedStatuses = ['due', 'rejected', 'failed', 'cancelled'];
    if (!allowedStatuses.includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit payment. Current status is '${payment.status}'. Only 'due' or 'rejected' payments can be submitted.`
      });
    }

    // Check if this is a resubmission (rejected payment)
    const isResubmission = ['rejected', 'failed', 'cancelled'].includes(payment.status);
    
    // If resubmission, clear previous admin notes
    if (isResubmission) {
      payment.admin_notes = undefined;
      payment.verified_by = undefined;
      payment.verified_at = undefined;
    }

    // Generate transaction ID if not exists
    if (!payment.transactionId) {
      payment.transactionId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Update payment with submission details
    payment.paymentMethod = payment_method;
    payment.paymentDate = payment_date ? new Date(payment_date) : new Date();
    payment.status = 'pending_verification';
    payment.verification_status = 'pending';
    payment.receipt_screenshot = req.file.filename;
    payment.receipt_path = req.file.path;
    payment.submitted_by = req.client.email;
    payment.submitted_at = new Date();
    if (notes) payment.notes = notes;

    await payment.save();

    // Populate for response
    await payment.populate('project', 'project_id service_name');

    console.log('✅ Payment submitted successfully:', {
      paymentId: payment._id,
      client: req.client.email,
      service: payment.service_name,
      amount: payment.amount,
      method: payment_method,
      status: payment.status,
      isResubmission: isResubmission
    });

    res.json({
      success: true,
      message: isResubmission 
        ? 'Payment resubmitted successfully! Your payment is now pending verification by our team.'
        : 'Payment submitted successfully! Your payment is now pending verification by our team.',
      data: payment
    });

  } catch (error) {
    console.error('❌ Submit due payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit payment',
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

// @route   GET /api/payments/admin/all
// @desc    Get all payments for admin/CRM managers
// @access  Private (Admin, CRM Manager, Lead Manager)
router.get('/admin/all', auth(['admin', 'crm_manager', 'lead_manager']), paymentController.getAllPaymentsForAdmin);

// @route   GET /api/payments/by-project/:projectId
// @desc    Get payment by project ID (for managers and clients)
// @access  Private (Admin, CRM Manager, Lead Manager, Client)
router.get('/by-project/:projectId', auth(['admin', 'crm_manager', 'lead_manager', 'client']), async (req, res) => {
  try {
    console.log('💳 === GET PAYMENT BY PROJECT REQUEST ===');
    console.log('💳 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('💳 Project ID:', req.params.projectId);
    
    // If client, verify they own this project
    if (req.user.role === 'client') {
      const project = await require('../models/Project').findById(req.params.projectId).populate('client');
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      
      // Check if the project belongs to this client
      if (project.client.email !== req.user.email) {
        console.log('❌ Client does not own this project');
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      console.log('✅ Client owns this project, proceeding');
    }
    
    const payments = await Payment.find({ project: req.params.projectId })
      .populate('client', 'name email phone')
      .populate('project', 'project_id service_name')
      .sort({ paymentDate: -1 });
    
    console.log('💳 Found payments for project:', payments.length);
    console.log('💳 RAW payment objects from DB:');
    payments.forEach((p, idx) => {
      console.log(`  Payment ${idx + 1}:`, {
        _id: p._id,
        status: p.status,
        status_type: typeof p.status,
        status_includes_colon: p.status?.includes(':'),
        status_raw: JSON.stringify(p.status),
        verification_status: p.verification_status
      });
    });
    
    if (payments.length > 0) {
      console.log('💳 Payment details:', payments.map(p => ({
        id: p._id,
        status: p.status,
        statusType: typeof p.status,
        receipt_screenshot: p.receipt_screenshot,
        receipt_path: p.receipt_path,
        verification_status: p.verification_status
      })));
    }
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('❌ Error fetching payment by project:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PAYMENT_BY_PROJECT_FAILED',
        message: error.message
      }
    });
  }
});

// @route   GET /api/payments/stats/summary
// @desc    Get payment statistics
// @access  Private (Admin, CRM Manager)
router.get('/stats/summary', auth(['admin', 'crm_manager']), paymentController.getPaymentStats);

// @route   POST /api/payments/:id/upload-receipt
// @desc    Upload payment receipt/proof
// @access  Private (Client, Admin, CRM Manager)
router.post('/:id/upload-receipt', auth(['admin', 'crm_manager', 'client']), upload.single('receipt'), paymentController.uploadPaymentReceipt);

module.exports = router;
// @route   GET /api/payments/my-payments
// @desc    Get payments for projects assigned to current CRM manager
// @access  Private (CRM Manager only)
router.get('/my-payments', auth(['crm_manager']), paymentController.getMyPayments);