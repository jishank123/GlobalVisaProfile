const mongoose = require('mongoose');
const encryption = require('../middleware/encryptionMiddleware');

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
    type: mongoose.Schema.Types.Mixed, // Allow both encrypted string and number
    required: [true, 'Payment amount is required']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String, // Will be encrypted, so can't use enum validation
    default: 'pending'
  },
  paymentMethod: {
    type: String, // Will be encrypted
    default: 'credit_card'
  },
  transactionId: {
    type: String
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
    type: String, // Will be encrypted
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

// Decrypt data after finding from database
paymentSchema.post('find', function(docs) {
  console.log('🔓 Payment.post(find) hook triggered, docs count:', docs?.length);
  if (Array.isArray(docs)) {
    docs.forEach((doc, idx) => {
      if (doc) {
        console.log(`🔓 Decrypting payment ${idx + 1}, status before:`, doc.status);
        decryptPaymentFields(doc);
        console.log(`🔓 Decrypting payment ${idx + 1}, status after:`, doc.status);
      }
    });
  }
});

paymentSchema.post('findOne', function(doc) {
  if (doc) {
    decryptPaymentFields(doc);
  }
});

paymentSchema.post('findOneAndUpdate', function(doc) {
  if (doc) {
    decryptPaymentFields(doc);
  }
});

paymentSchema.post('save', function(doc) {
  if (doc) {
    decryptPaymentFields(doc);
  }
});

// Helper function to decrypt payment fields
function decryptPaymentFields(doc) {
  if (!doc) return;
  
  // Decrypt status
  if (doc.status && typeof doc.status === 'string' && doc.status.includes(':')) {
    doc.status = encryption.decrypt(doc.status);
  }
  
  // Decrypt paymentMethod
  if (doc.paymentMethod && typeof doc.paymentMethod === 'string' && doc.paymentMethod.includes(':')) {
    doc.paymentMethod = encryption.decrypt(doc.paymentMethod);
  }
  
  // Decrypt verification_status
  if (doc.verification_status && typeof doc.verification_status === 'string' && doc.verification_status.includes(':')) {
    doc.verification_status = encryption.decrypt(doc.verification_status);
  }
  
  // Decrypt amount (convert back to number)
  if (doc.amount && typeof doc.amount === 'string' && doc.amount.includes(':')) {
    const decryptedAmount = encryption.decrypt(doc.amount);
    doc.amount = typeof decryptedAmount === 'string' ? parseFloat(decryptedAmount) : decryptedAmount;
  }
  
  // Decrypt currency
  if (doc.currency && typeof doc.currency === 'string' && doc.currency.includes(':')) {
    doc.currency = encryption.decrypt(doc.currency);
  }
  
  // Decrypt service_name
  if (doc.service_name && typeof doc.service_name === 'string' && doc.service_name.includes(':')) {
    doc.service_name = encryption.decrypt(doc.service_name);
  }
  
  // Decrypt notes
  if (doc.notes && typeof doc.notes === 'string' && doc.notes.includes(':')) {
    doc.notes = encryption.decrypt(doc.notes);
  }
}

// Encrypt data before saving to database
paymentSchema.pre('save', function(next) {
  if (!this.isNew && !this.isModified()) {
    return next();
  }
  
  // Encrypt status
  if (this.status && !this.status.includes(':')) {
    this.status = encryption.encrypt(this.status);
  }
  
  // Encrypt paymentMethod
  if (this.paymentMethod && !this.paymentMethod.includes(':')) {
    this.paymentMethod = encryption.encrypt(this.paymentMethod);
  }
  
  // Encrypt verification_status
  if (this.verification_status && !this.verification_status.includes(':')) {
    this.verification_status = encryption.encrypt(this.verification_status);
  }
  
  // Encrypt amount
  if (this.amount && typeof this.amount === 'number') {
    this.amount = encryption.encrypt(this.amount.toString());
  }
  
  // Encrypt currency
  if (this.currency && !this.currency.includes(':')) {
    this.currency = encryption.encrypt(this.currency);
  }
  
  // Encrypt service_name
  if (this.service_name && !this.service_name.includes(':')) {
    this.service_name = encryption.encrypt(this.service_name);
  }
  
  // Encrypt notes
  if (this.notes && !this.notes.includes(':')) {
    this.notes = encryption.encrypt(this.notes);
  }
  
  next();
});

// Encrypt data before updating (for findOneAndUpdate, findByIdAndUpdate, etc.)
paymentSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  console.log('🔐 Payment.pre(findOneAndUpdate) hook triggered');
  console.log('🔐 Update object keys:', Object.keys(update));
  
  // List of fields that should be encrypted
  const fieldsToEncrypt = ['status', 'paymentMethod', 'verification_status', 'currency', 'service_name', 'notes'];
  
  // List of date/time fields that should NOT be encrypted
  const dateFields = ['verified_at', 'submitted_at', 'paymentDate', 'dueDate', 'createdAt', 'updatedAt'];
  
  // List of fields that should remain as plain text
  const plainTextFields = ['verified_by', 'submitted_by', 'admin_notes', 'transactionId', 'receipt_screenshot', 'receipt_path'];
  
  // Encrypt only the specific fields that need encryption
  for (const field of fieldsToEncrypt) {
    if (update[field] && typeof update[field] === 'string' && !update[field].includes(':')) {
      console.log(`🔐 Encrypting ${field}:`, update[field]);
      update[field] = encryption.encrypt(update[field]);
      console.log(`🔐 Encrypted ${field}:`, update[field]);
    }
  }
  
  // Encrypt amount if it's a number
  if (update.amount && typeof update.amount === 'number') {
    console.log('🔐 Encrypting amount:', update.amount);
    update.amount = encryption.encrypt(update.amount.toString());
  }
  
  // Log what we're NOT encrypting
  for (const key of Object.keys(update)) {
    if (!key.startsWith('$') && !fieldsToEncrypt.includes(key) && key !== 'amount') {
      console.log(`🔐 NOT encrypting ${key}:`, update[key]);
    }
  }
  
  console.log('🔐 Encryption complete, proceeding with update');
  next();
});

// Index for faster queries
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ client: 1 });
paymentSchema.index({ project: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
