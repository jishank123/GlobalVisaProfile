const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  service_name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  tax_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  issue_date: {
    type: Date,
    default: Date.now
  },
  due_date: {
    type: Date,
    required: true
  },
  payment_terms: {
    type: String,
    default: 'Net 30'
  },
  description: {
    type: String
  },
  line_items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  notes: {
    type: String
  },
  payment_instructions: {
    type: String
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sent_at: {
    type: Date
  },
  paid_at: {
    type: Date
  },
  payment_reference: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days overdue
invoiceSchema.virtual('days_overdue').get(function() {
  if (this.status === 'overdue' && this.due_date) {
    const today = new Date();
    const diffTime = today - this.due_date;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Pre-save hook to generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (!this.invoice_number) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.invoice_number = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Calculate total amount
  if (this.line_items && this.line_items.length > 0) {
    this.amount = this.line_items.reduce((sum, item) => sum + item.total, 0);
    this.total_amount = this.amount + (this.tax_amount || 0);
  }
  
  next();
});

// Indexes
invoiceSchema.index({ client: 1 });
invoiceSchema.index({ project: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ due_date: 1 });
invoiceSchema.index({ created_by: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);