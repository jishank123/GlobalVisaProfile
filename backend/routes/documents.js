const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

// @route   GET /api/documents
// @desc    Get all documents with filters
// @access  Private
router.get('/', ...auth(), async (req, res) => {
  try {
    const { client, project, category, status, page = 1, limit = 50 } = req.query;
    
    // Build query
    let query = {};
    
    if (client) query.client = client;
    if (project) query.project = project;
    if (category) query.category = category;
    if (status) query.status = status;
    
    // Role-based filtering
    if (req.user.role === 'client') {
      query.client = req.user.clientProfile;
    }
    
    const documents = await Document.find(query)
      .populate('client', 'name email')
      .populate('project', 'title')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Document.countDocuments(query);
    
    res.json({
      success: true,
      count: documents.length,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document
// @access  Private
router.get('/:id', ...auth(), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('project', 'title status')
      .populate('uploadedBy', 'name email');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check access permission
    if (req.user.role === 'client' && document.client._id.toString() !== req.user.clientProfile.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update last accessed time
    document.lastAccessedAt = new Date();
    await document.save();
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/documents
// @desc    Upload new document
// @access  Private
router.post('/', ...auth(), async (req, res) => {
  try {
    // Set uploadedBy to current user
    req.body.uploadedBy = req.user._id;
    
    // If user is client, set client field automatically
    if (req.user.role === 'client') {
      req.body.client = req.user.clientProfile;
    }
    
    const document = await Document.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

// @route   PATCH /api/documents/:id
// @desc    Update document metadata
// @access  Private
router.patch('/:id', ...auth(), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check permission
    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isAdminOrManager = ['admin', 'crm_manager', 'lead_manager'].includes(req.user.role);
    
    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update fields (excluding sensitive fields)
    const allowedUpdates = ['name', 'description', 'category', 'status', 'isConfidential', 'accessPermissions'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        document[field] = req.body[field];
      }
    });
    
    await document.save();
    
    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
});

// @route   POST /api/documents/:id/download
// @desc    Track document download
// @access  Private
router.post('/:id/download', ...auth(), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check access permission
    if (req.user.role === 'client' && document.client.toString() !== req.user.clientProfile.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Increment download count
    document.downloadCount += 1;
    document.lastAccessedAt = new Date();
    await document.save();
    
    res.json({
      success: true,
      message: 'Download tracked',
      data: {
        fileUrl: document.fileUrl,
        downloadCount: document.downloadCount
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

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private (Admin or Owner)
router.delete('/:id', ...auth(), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check permission
    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await document.deleteOne();
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/documents/stats/summary
// @desc    Get document statistics
// @access  Private (Admin, Managers)
router.get('/stats/summary', ...auth(['admin', 'lead_manager', 'crm_manager']), async (req, res) => {
  try {
    const totalDocs = await Document.countDocuments();
    
    const byCategory = await Document.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const byStatus = await Document.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalSize = await Document.aggregate([
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalDocs,
        byCategory,
        byStatus,
        totalSize: totalSize[0]?.totalSize || 0
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
