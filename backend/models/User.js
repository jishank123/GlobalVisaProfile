const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [200, 'First name cannot exceed 50 characters'] // Increased to accommodate encryption
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [200, 'Last name cannot exceed 50 characters'] // Increased to accommodate encryption
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'lead_manager', 'crm_manager', 'project_manager', 'employee', 'consultant', 'writer', 'client'],
    default: 'client'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  university: {
    type: String,
    trim: true
  },
  avatar: {
    type: String // URL to avatar image
  },
  last_login: {
    type: Date
  },
  password_reset_token: String,
  password_reset_expires: Date,
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_token: String,
  email_verification_expires: Date,
  profile_picture: String,
  linkedin_url: String,
  portfolio_url: String,
  website_url: String,
  bio: {
    type: String,
    trim: true,
    maxlength: [3000, 'Bio cannot exceed 1000 characters'] // Increased to accommodate encryption
  },
  is_temp_password: {
    type: Boolean,
    default: false
  },
  terms_accepted: {
    type: Boolean,
    default: false
  },
  terms_accepted_at: {
    type: Date
  },
  deleted_at: {
    type: Date
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Create indexes explicitly (avoiding duplicate with unique: true)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Encryption/Decryption hooks
const encryption = require('../middleware/encryptionMiddleware');

// Fields to encrypt
const encryptedFields = ['first_name', 'last_name', 'email', 'phone', 'company', 'country', 'university', 'bio'];

// Pre-save hook: Encrypt fields before saving
userSchema.pre('save', async function(next) {
  try {
    // Handle password hashing first (if modified and not skipped)
    if (this.isModified('password') && this.password && !this._skipPasswordHash) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    // Skip encryption if globally disabled or explicitly skipped
    if (!global.ENCRYPTION_DISABLED && !this._skipEncryption) {
      encryptedFields.forEach(field => {
        if (this[field] !== undefined && this[field] !== null && this.isModified(field)) {
          const value = this[field];
          
          // Handle strings - only encrypt if not already encrypted
          if (typeof value === 'string' && value.length > 0 && !value.includes(':')) {
            this[field] = encryption.encrypt(value);
          }
        }
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update hooks: Encrypt fields before updating
userSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
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
  
  return doc;
};

userSchema.post('find', function(docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => decryptDocument(doc));
  }
});

userSchema.post('findOne', function(doc) {
  decryptDocument(doc);
});

userSchema.post('findOneAndUpdate', function(doc) {
  decryptDocument(doc);
});

userSchema.post('save', function(doc) {
  decryptDocument(doc);
});

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.email_verification_token = token;
  this.email_verification_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.password_reset_token = token;
  this.password_reset_expires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  return token;
};

// Generate temporary password
userSchema.methods.generateTempPassword = function() {
  const crypto = require('crypto');
  return crypto.randomBytes(8).toString('hex');
};

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT payload
userSchema.methods.toAuthJSON = function() {
  // Get decrypted version of the document
  const encryption = require('../middleware/encryptionMiddleware');
  let decryptedDoc;
  
  try {
    const plainDoc = this.toObject();
    
    // Manually decrypt fields to avoid issues with corrupted data
    const safeDecrypt = (value) => {
      if (!value || typeof value !== 'string' || !value.includes(':')) {
        return value;
      }
      
      const parts = value.split(':');
      if (parts.length === 2 && parts[0].length === 32 && parts[1].length > 0) {
        try {
          return encryption.decrypt(value);
        } catch (error) {
          console.warn(`Decryption failed for field, returning empty string`);
          return '';
        }
      }
      
      // Invalid format, return empty string
      return '';
    };
    
    decryptedDoc = {
      ...plainDoc,
      first_name: safeDecrypt(plainDoc.first_name) || plainDoc.first_name,
      last_name: safeDecrypt(plainDoc.last_name) || plainDoc.last_name,
      email: safeDecrypt(plainDoc.email) || plainDoc.email,
      phone: safeDecrypt(plainDoc.phone) || plainDoc.phone,
      company: safeDecrypt(plainDoc.company) || plainDoc.company,
      country: safeDecrypt(plainDoc.country) || plainDoc.country,
      university: safeDecrypt(plainDoc.university) || plainDoc.university,
      bio: safeDecrypt(plainDoc.bio) || plainDoc.bio
    };
  } catch (error) {
    // Fallback to plain object if decryption fails
    console.error('toAuthJSON decryption error:', error);
    decryptedDoc = this.toObject();
  }
  
  return {
    _id: this._id,
    id: this._id,
    user_id: this._id,
    email: decryptedDoc.email,
    first_name: decryptedDoc.first_name,
    last_name: decryptedDoc.last_name,
    full_name: `${decryptedDoc.first_name} ${decryptedDoc.last_name}`,
    role: decryptedDoc.role,
    status: decryptedDoc.status,
    phone: decryptedDoc.phone,
    company: decryptedDoc.company,
    country: decryptedDoc.country,
    university: decryptedDoc.university,
    avatar: decryptedDoc.avatar,
    profile_picture: decryptedDoc.profile_picture,
    linkedin_url: decryptedDoc.linkedin_url,
    portfolio_url: decryptedDoc.portfolio_url,
    website_url: decryptedDoc.website_url,
    bio: decryptedDoc.bio,
    email_verified: this.email_verified,
    is_temp_password: this.is_temp_password,
    last_login: this.last_login,
    createdAt: this.createdAt
  };
};

// Method to get decrypted user data for display
userSchema.methods.toDisplayJSON = function() {
  const encryption = require('../middleware/encryptionMiddleware');
  let decryptedDoc;
  
  try {
    const plainDoc = this.toObject();
    
    // Manually decrypt fields to avoid issues with corrupted data
    const safeDecrypt = (value) => {
      if (!value || typeof value !== 'string' || !value.includes(':')) {
        return value;
      }
      
      const parts = value.split(':');
      if (parts.length === 2 && parts[0].length === 32 && parts[1].length > 0) {
        try {
          return encryption.decrypt(value);
        } catch (error) {
          return '';
        }
      }
      
      return '';
    };
    
    decryptedDoc = {
      ...plainDoc,
      first_name: safeDecrypt(plainDoc.first_name) || plainDoc.first_name,
      last_name: safeDecrypt(plainDoc.last_name) || plainDoc.last_name,
      email: safeDecrypt(plainDoc.email) || plainDoc.email,
      phone: safeDecrypt(plainDoc.phone) || plainDoc.phone,
      company: safeDecrypt(plainDoc.company) || plainDoc.company,
      country: safeDecrypt(plainDoc.country) || plainDoc.country,
      university: safeDecrypt(plainDoc.university) || plainDoc.university,
      bio: safeDecrypt(plainDoc.bio) || plainDoc.bio
    };
  } catch (error) {
    // Fallback to plain object if decryption fails
    decryptedDoc = this.toObject();
  }
  
  return {
    _id: this._id,
    first_name: decryptedDoc.first_name,
    last_name: decryptedDoc.last_name,
    email: decryptedDoc.email,
    phone: decryptedDoc.phone,
    role: decryptedDoc.role,
    status: decryptedDoc.status,
    company: decryptedDoc.company,
    country: decryptedDoc.country,
    university: decryptedDoc.university,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);
