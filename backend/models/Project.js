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
    required: false // Allow unassigned projects (e.g., client purchases without CRM manager)
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  // Project Manager assignment fields
  project_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pm_assignment_notes: {
    type: String,
    trim: true
  },
  assigned_to_pm_at: {
    type: Date
  },
  assigned_to_pm_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Payment-related fields for service purchases
  payment_method: {
    type: String,
    enum: ['card', 'bank_transfer', 'upi', 'paypal', 'cash'],
    default: 'card'
  },
  payment_receipt: {
    type: String, // filename of uploaded receipt
    default: null
  },
  purchase_date: {
    type: Date,
    default: null
  },
  // Payment verification fields
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  admin_notes: {
    type: String,
    trim: true
  },
  verified_at: {
    type: Date
  },
  verified_by: {
    type: String // admin email or name
  },
  budget: {
    type: Number,
    default: 0,
    min: 0
  },
  estimated_duration: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    target_date: Date,
    start_date: Date,
    completion_date: Date,
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    files: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
      uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploaded_at: {
        type: Date,
        default: Date.now
      },
      description: String
    }],
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
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
  final_files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    },
    approval_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approved_at: {
      type: Date
    },
    rejection_reason: {
      type: String,
      trim: true
    }
  }],
  task_files: [{
    filename: {
      type: String,
      required: true
    },
    originalname: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploaded_by_role: {
      type: String,
      enum: ['crm_manager', 'project_manager', 'admin'],
      required: true
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true
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
  // Ensure amount and paid_amount are numbers (decrypt if needed)
  const amount = typeof this.amount === 'number' ? this.amount : parseFloat(this.amount) || 0;
  const paidAmount = typeof this.paid_amount === 'number' ? this.paid_amount : parseFloat(this.paid_amount) || 0;
  return amount - paidAmount;
});

// Virtual for payment percentage
projectSchema.virtual('payment_percentage').get(function() {
  // Ensure amount and paid_amount are numbers (decrypt if needed)
  const amount = typeof this.amount === 'number' ? this.amount : parseFloat(this.amount) || 0;
  const paidAmount = typeof this.paid_amount === 'number' ? this.paid_amount : parseFloat(this.paid_amount) || 0;
  return amount > 0 ? Math.round((paidAmount / amount) * 100) : 0;
});

// Pre-save hook to generate project ID
projectSchema.pre('save', async function(next) {
  if (!this.project_id) {
    const count = await this.constructor.countDocuments();
    this.project_id = `PRJ-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Encryption/Decryption hooks
const encryption = require('../middleware/encryptionMiddleware');

// Fields to encrypt
const encryptedFields = [
  'status', 
  'service_name', 
  'description', 
  'assignment_notes', 
  'admin_notes',
  'amount',           // Financial data - sensitive
  'paid_amount',      // Financial data - sensitive
  'budget'            // Financial data - sensitive
];

// Pre-save hook: Encrypt fields before saving
projectSchema.pre('save', function(next) {
  try {
    encryptedFields.forEach(field => {
      if (this[field] !== undefined && this[field] !== null && this.isModified(field)) {
        const value = this[field];
        
        // Handle numbers
        if (typeof value === 'number') {
          // Convert to string and encrypt
          this[field] = encryption.encrypt(value.toString());
        }
        // Handle strings - only encrypt if not already encrypted
        else if (typeof value === 'string' && !value.includes(':')) {
          this[field] = encryption.encrypt(value);
        }
      }
    });
    next();
  } catch (error) {
    next(error);
  }
});

// Post-find hooks: Decrypt fields after fetching
const decryptDocument = function(doc) {
  if (!doc) return doc;
  
  encryptedFields.forEach(field => {
    if (doc[field] && typeof doc[field] === 'string' && doc[field].includes(':')) {
      try {
        // Check if it's a valid encrypted format (iv:encryptedData)
        const parts = doc[field].split(':');
        if (parts.length === 2 && parts[0].length === 32 && parts[1].length > 0) {
          const decrypted = encryption.decrypt(doc[field]);
          
          // Convert back to number if it's a numeric field
          if (['amount', 'paid_amount', 'budget'].includes(field)) {
            const asNumber = parseFloat(decrypted);
            doc[field] = !isNaN(asNumber) && isFinite(asNumber) ? asNumber : decrypted;
          } else {
            doc[field] = decrypted;
          }
        }
      } catch (error) {
        // Skip decryption if it fails (field might not be encrypted)
        console.error(`Failed to decrypt ${field}:`, error.message);
      }
    }
  });
  
  return doc;
};

projectSchema.post('find', function(docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => decryptDocument(doc));
  }
});

projectSchema.post('findOne', function(doc) {
  decryptDocument(doc);
});

projectSchema.post('findOneAndUpdate', function(doc) {
  decryptDocument(doc);
});

projectSchema.post('save', function(doc) {
  decryptDocument(doc);
});

// Indexes
projectSchema.index({ project_id: 1 }, { unique: true });
projectSchema.index({ client: 1 });
projectSchema.index({ assigned_to: 1 });
projectSchema.index({ created_by: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ due_date: 1 });

module.exports = mongoose.model('Project', projectSchema);
