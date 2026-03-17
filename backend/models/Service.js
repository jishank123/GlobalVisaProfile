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

// Encryption/Decryption hooks
const encryption = require('../middleware/encryptionMiddleware');

// Fields to encrypt
const encryptedFields = ['name', 'description', 'category', 'duration'];

// Pre-save hook: Encrypt fields before saving
serviceSchema.pre('save', function(next) {
  try {
    // Skip if encryption is globally disabled
    if (global.ENCRYPTION_DISABLED || this._skipEncryption) {
      return next();
    }
    
    encryptedFields.forEach(field => {
      if (this[field] !== undefined && this[field] !== null && this.isModified(field)) {
        const value = this[field];
        
        // Handle strings - only encrypt if not already encrypted
        if (typeof value === 'string' && !value.includes(':')) {
          this[field] = encryption.encrypt(value);
        }
      }
    });
    
    // Encrypt features array
    if (this.features && Array.isArray(this.features) && this.isModified('features')) {
      this.features = this.features.map(feature => {
        if (typeof feature === 'string' && !feature.includes(':')) {
          return encryption.encrypt(feature);
        }
        return feature;
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update hooks: Encrypt fields before updating
serviceSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
  try {
    // Skip if encryption is globally disabled
    if (global.ENCRYPTION_DISABLED) {
      return next();
    }
    
    const update = this.getUpdate();
    if (update && typeof update === 'object') {
      // Handle $set operator
      if (update.$set) {
        encryptedFields.forEach(field => {
          if (update.$set[field] && typeof update.$set[field] === 'string' && !update.$set[field].includes(':')) {
            update.$set[field] = encryption.encrypt(update.$set[field]);
          }
        });
        
        // Encrypt features array in $set
        if (update.$set.features && Array.isArray(update.$set.features)) {
          update.$set.features = update.$set.features.map(feature => {
            if (typeof feature === 'string' && !feature.includes(':')) {
              return encryption.encrypt(feature);
            }
            return feature;
          });
        }
      }
      
      // Handle direct field updates
      encryptedFields.forEach(field => {
        if (update[field] && typeof update[field] === 'string' && !update[field].includes(':')) {
          update[field] = encryption.encrypt(update[field]);
        }
      });
    }
    
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
          doc[field] = encryption.decrypt(doc[field]);
        }
      } catch (error) {
        // Skip decryption if it fails
        console.error(`Failed to decrypt ${field}:`, error.message);
      }
    }
  });
  
  // Decrypt features array
  if (doc.features && Array.isArray(doc.features)) {
    doc.features = doc.features.map(feature => {
      if (typeof feature === 'string' && feature.includes(':')) {
        try {
          const parts = feature.split(':');
          if (parts.length === 2 && parts[0].length === 32 && parts[1].length > 0) {
            return encryption.decrypt(feature);
          }
        } catch (error) {
          // Skip decryption if it fails
        }
      }
      return feature;
    });
  }
  
  return doc;
};

serviceSchema.post('find', function(docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => decryptDocument(doc));
  }
});

serviceSchema.post('findOne', function(doc) {
  decryptDocument(doc);
});

serviceSchema.post('findOneAndUpdate', function(doc) {
  decryptDocument(doc);
});

serviceSchema.post('save', function(doc) {
  decryptDocument(doc);
});

module.exports = mongoose.model('Service', serviceSchema);
