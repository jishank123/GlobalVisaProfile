const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  university: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'vip'],
    default: 'active'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  crm_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional for client self-registration
  },
  satisfaction_rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  lead_source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total projects
clientSchema.virtual('total_projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client',
  count: true
});

// Virtual for total spent
clientSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'client'
});

// Indexes
clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ crm_manager: 1 });
clientSchema.index({ status: 1 });

module.exports = mongoose.model('Client', clientSchema);
