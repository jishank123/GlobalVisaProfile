const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  description: {
    type: String
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'image', 'other'],
    default: 'other'
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  category: {
    type: String,
    enum: ['Contract', 'Proposal', 'Report', 'Invoice', 'Research', 'Submission', 'Other'],
    default: 'Other'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessPermissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    canView: {
      type: Boolean,
      default: true
    },
    canDownload: {
      type: Boolean,
      default: true
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ client: 1, project: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Document', documentSchema);
