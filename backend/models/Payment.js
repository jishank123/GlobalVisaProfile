const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'stripe', 'other'],
    default: 'credit_card'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  notes: {
    type: String
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ client: 1, status: 1 });
paymentSchema.index({ project: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
