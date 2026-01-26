const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  // Service information for direct service purchases
  service_id: {
    type: String
  },
  service_name: {
    type: String
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
    enum: ['pending', 'completed', 'failed', 'refunded', 'pending_verification'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'stripe', 'cash', 'check', 'other'],
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
  },
  // Cash payment verification fields
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: null
  },
  receipt_screenshot: {
    type: String // filename of uploaded receipt
  },
  receipt_path: {
    type: String // full path to uploaded file
  },
  submitted_by: {
    type: String // email of client who submitted
  },
  submitted_at: {
    type: Date
  },
  verified_by: {
    type: String // email of admin/manager who verified
  },
  verified_at: {
    type: Date
  },
  admin_notes: {
    type: String // notes from admin during verification
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ client: 1, status: 1 });
paymentSchema.index({ project: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ verification_status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
