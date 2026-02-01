const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  category: {
    type: String,
    enum: ['Research', 'Writing', 'Editing', 'Consulting', 'Other'],
    default: 'Other'
  },
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'range'],
      default: 'range'
    },
    minPrice: {
      type: Number,
      required: true
    },
    maxPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  duration: {
    type: String,
    default: '2-4 weeks'
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for searching services
serviceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
