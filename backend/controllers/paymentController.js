const Payment = require('../models/Payment');
const Client = require('../models/Client');
const ActivityLog = require('../models/ActivityLog');

// Helper function to log activities
const logActivity = async (userId, action, resourceType, description, ipAddress, resourceId = null) => {
  try {
    if (!action || !resourceType || !description) {
      console.warn('ActivityLog: Missing required fields', { action, resourceType, description });
      return;
    }

    await ActivityLog.create({
      user: userId,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// @desc    Get payments pending verification for CRM managers
// @route   GET /api/payments/pending-verification
// @access  Private (CRM Manager, Admin)
exports.getPendingPayments = async (req, res) => {
  try {
    console.log('💳 === GET PENDING PAYMENTS REQUEST ===');
    console.log('💳 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('💳 User ID from req.user.user_id:', req.user?.user_id);
    console.log('💳 User ID from req.user._id:', req.user?._id);
    
    let query = {
      verification_status: 'pending'
    };
    
    // Filter by assigned clients for CRM managers
    if (req.user.role === 'crm_manager') {
      const crmManagerId = req.user.user_id;
      console.log('💳 Looking for clients assigned to CRM manager:', crmManagerId);
      
      const assignedClients = await Client.find({ crm_manager: crmManagerId }).select('_id name email');
      console.log('💳 Found assigned clients:', assignedClients.map(c => ({ id: c._id, name: c.name, email: c.email })));
      
      const clientIds = assignedClients.map(client => client._id);
      
      if (clientIds.length === 0) {
        console.log('💳 No clients assigned to this CRM manager');
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }
      
      query.client = { $in: clientIds };
      console.log('💳 Payment query with client filter:', query);
    }
    
    const pendingPayments = await Payment.find(query)
      .populate('client', 'name email phone')
      .populate('project', 'project_id service_name')
      .sort({ submitted_at: -1 });
    
    console.log('💳 Found pending payments:', pendingPayments.length);
    console.log('💳 Payment details:', pendingPayments.map(p => ({
      id: p._id,
      clientId: p.client?._id,
      clientName: p.client?.name,
      service: p.service_name,
      amount: p.amount,
      status: p.status,
      verification_status: p.verification_status
    })));
    
    res.json({
      success: true,
      count: pendingPayments.length,
      data: pendingPayments
    });
  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PENDING_PAYMENTS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Verify payment (CRM Manager, Admin)
// @route   PATCH /api/payments/:id/verify
// @access  Private (CRM Manager, Admin)
exports.verifyPayment = async (req, res) => {
  try {
    console.log('✅ === VERIFY PAYMENT REQUEST ===');
    console.log('✅ User:', req.user?.email, 'Role:', req.user?.role);
    console.log('✅ Request body:', req.body);
    
    const { verification_status, admin_notes } = req.body;
    
    if (!['verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid verification status. Must be "verified" or "rejected"'
        }
      });
    }
    
    const payment = await Payment.findById(req.params.id).populate('client');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found'
        }
      });
    }
    
    // Security check for CRM managers
    if (req.user.role === 'crm_manager') {
      const clientRecord = await Client.findById(payment.client._id);
      if (!clientRecord || !clientRecord.crm_manager || 
          clientRecord.crm_manager.toString() !== req.user.user_id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only verify payments for your assigned clients'
          }
        });
      }
    }
    
    // Update payment verification
    payment.verification_status = verification_status;
    payment.status = verification_status === 'verified' ? 'completed' : 'failed';
    payment.verified_by = req.user.email;
    payment.verified_at = new Date();
    
    if (admin_notes) {
      payment.admin_notes = admin_notes;
    }
    
    await payment.save();
    
    // Log activity
    await logActivity(
      req.user.user_id,
      'update',
      'Payment',
      `${verification_status === 'verified' ? 'Verified' : 'Rejected'} payment for ${payment.client.name} - ${payment.service_name}`,
      req.ip,
      payment._id
    );
    
    console.log('✅ Payment verification updated:', {
      paymentId: payment._id,
      status: verification_status,
      verifiedBy: req.user.email,
      client: payment.client.name
    });
    
    res.json({
      success: true,
      message: `Payment ${verification_status} successfully`,
      data: payment
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFY_PAYMENT_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Get payment statistics for CRM managers
// @route   GET /api/payments/stats/summary
// @access  Private (CRM Manager, Admin)
exports.getPaymentStats = async (req, res) => {
  try {
    console.log('📊 === GET PAYMENT STATS REQUEST ===');
    console.log('📊 User:', req.user?.email, 'Role:', req.user?.role);
    
    let matchQuery = {};
    
    // Filter by assigned clients for CRM managers
    if (req.user.role === 'crm_manager') {
      const assignedClients = await Client.find({ crm_manager: req.user.user_id }).select('_id');
      const clientIds = assignedClients.map(client => client._id);
      
      if (clientIds.length === 0) {
        return res.json({
          success: true,
          data: {
            byStatus: [],
            byVerificationStatus: [],
            totalAmount: 0,
            monthlyRevenue: 0
          }
        });
      }
      
      matchQuery.client = { $in: clientIds };
    }
    
    const byStatus = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const byVerificationStatus = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$verification_status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalAmount = await Payment.aggregate([
      { $match: { ...matchQuery, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          ...matchQuery,
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
        byStatus,
        byVerificationStatus,
        totalAmount: totalAmount[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PAYMENT_STATS_FAILED',
        message: error.message
      }
    });
  }
};

// @desc    Upload payment receipt/proof
// @route   POST /api/payments/:id/upload-receipt
// @access  Private (Client, Admin, CRM Manager)
exports.uploadPaymentReceipt = async (req, res) => {
  try {
    const paymentId = req.params.id;
    
    // Find the payment
    const payment = await Payment.findById(paymentId).populate('client', 'name email');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found'
        }
      });
    }
    
    // Security check - clients can only upload receipts for their own payments
    if (req.user.role === 'client') {
      // Find client record by email since there's no direct user link
      const clientRecord = await Client.findOne({ email: req.user.email });
      if (!clientRecord || payment.client._id.toString() !== clientRecord._id.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only upload receipts for your own payments'
          }
        });
      }
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'Please select a file to upload'
        }
      });
    }
    
    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Only image files (JPEG, PNG, GIF) and PDF files are allowed'
        }
      });
    }
    
    // Update payment with receipt information
    payment.receipt_screenshot = req.file.filename;
    payment.receipt_path = req.file.path;
    payment.verification_status = 'pending';
    payment.submitted_at = new Date();
    
    await payment.save();
    
    // Log activity
    await logActivity(
      req.user.user_id || req.user.id,
      'update',
      'Payment',
      `Uploaded receipt for payment ${payment._id}`,
      req.ip,
      payment._id
    );
    
    res.json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: {
        payment: payment,
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      }
    });
  } catch (error) {
    console.error('❌ Upload receipt error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_RECEIPT_FAILED',
        message: error.message
      }
    });
  }
};

module.exports = {
  getPendingPayments: exports.getPendingPayments,
  verifyPayment: exports.verifyPayment,
  getPaymentStats: exports.getPaymentStats,
  uploadPaymentReceipt: exports.uploadPaymentReceipt
};