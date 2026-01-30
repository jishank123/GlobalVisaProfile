const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_id: {
    type: String
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  service_name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'completed', 'cancelled', 'on_hold'],
    default: 'active'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  paid_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required']
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completion_date: {
    type: Date
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required']
  },
  description: {
    type: String,
    trim: true
  },
  created_from_lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  assignment_notes: {
    type: String,
    trim: true
  },
  assigned_to_crm_at: {
    type: Date
  },
  assigned_to_crm_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    target_date: Date,
    completion_date: Date,
    notes: String
  }],
  notes: [{
    text: {
      type: String,
      required: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  handover_history: [{
    from_crm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to_crm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['workload', 'expertise', 'availability', 'client_request', 'other'],
      default: 'workload'
    },
    notes: {
      type: String,
      required: true
    },
    handover_date: {
      type: Date,
      default: Date.now
    },
    handover_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for outstanding amount
projectSchema.virtual('outstanding_amount').get(function() {
  return this.amount - this.paid_amount;
});

// Virtual for payment percentage
projectSchema.virtual('payment_percentage').get(function() {
  return this.amount > 0 ? Math.round((this.paid_amount / this.amount) * 100) : 0;
});

// Pre-save hook to generate project ID
projectSchema.pre('save', async function(next) {
  if (!this.project_id) {
    const count = await this.constructor.countDocuments();
    this.project_id = `PRJ-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Indexes
projectSchema.index({ project_id: 1 }, { unique: true });
projectSchema.index({ client: 1 });
projectSchema.index({ assigned_to: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ due_date: 1 });

module.exports = mongoose.model('Project', projectSchema);
