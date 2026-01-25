const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  university: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  degree: {
    type: String,
    enum: ['Bachelors', 'Masters', 'PhD'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    trim: true
  },
  interestedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'event', 'cold_call', 'email_campaign', 'other'],
    default: 'website'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  estimatedValue: {
    type: Number,
    min: 0
  },
  nextFollowUp: {
    type: Date
  },
  lastContact: {
    type: Date
  },
  convertedToClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  convertedAt: {
    type: Date
  },
  convertedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  interactions: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'note']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for better query performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ nextFollowUp: 1 });

module.exports = mongoose.model('Lead', leadSchema);
