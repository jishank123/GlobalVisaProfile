const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    required: [true, 'Query subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Query description is required']
  },
  category: {
    type: String,
    enum: ['General', 'Technical', 'Billing', 'Project', 'Complaint', 'Other'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
    default: 'open'
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
querySchema.index({ client: 1, status: 1 });
querySchema.index({ assignedTo: 1, status: 1 });
querySchema.index({ createdAt: -1 });
querySchema.index({ subject: 'text', description: 'text' });

module.exports = mongoose.model('Query', querySchema);
