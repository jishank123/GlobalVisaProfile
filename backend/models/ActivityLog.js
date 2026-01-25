const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for anonymous submissions
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'login', 'logout', 'register',
      'create', 'update', 'delete', 'view',
      'upload', 'download', 'share',
      'status_change', 'payment', 'query',
      'other'
    ]
  },
  resourceType: {
    type: String,
    enum: ['User', 'Lead', 'Client', 'Project', 'Payment', 'Query', 'Document', 'Service', 'System', 'ProfileAssessment', 'AppointmentRequest', 'ContactForm'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for activity logs
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index to automatically delete old logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
