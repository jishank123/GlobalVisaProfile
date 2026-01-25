const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientAccountSchema = new mongoose.Schema({
  // Basic Information
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  
  // Authentication
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  
  // Account Status
  account_status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'active'
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  email_verification_token: {
    type: String,
    trim: true
  },
  email_verification_expires: {
    type: Date
  },
  
  // Profile Information
  profile_completion: {
    type: Number,
    min: 0,
    max: 100,
    default: 30 // Basic info filled = 30%
  },
  avatar_url: {
    type: String,
    trim: true
  },
  
  // Preferences
  communication_preferences: {
    email_notifications: {
      type: Boolean,
      default: true
    },
    sms_notifications: {
      type: Boolean,
      default: false
    },
    marketing_emails: {
      type: Boolean,
      default: true
    }
  },
  
  // Activity Tracking
  last_login: {
    type: Date,
    default: Date.now
  },
  login_count: {
    type: Number,
    default: 0
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  
  // Security
  password_reset_token: {
    type: String,
    trim: true
  },
  password_reset_expires: {
    type: Date
  },
  failed_login_attempts: {
    type: Number,
    default: 0
  },
  account_locked_until: {
    type: Date
  },
  
  // Relationships
  linked_client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  
  // Metadata
  ip_address: {
    type: String,
    trim: true
  },
  user_agent: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'direct', 'other'],
    default: 'website'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password_hash;
      delete ret.password_reset_token;
      delete ret.email_verification_token;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for account age
clientAccountSchema.virtual('account_age_days').get(function() {
  const diffTime = Math.abs(new Date() - this.registration_date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for account locked status
clientAccountSchema.virtual('is_locked').get(function() {
  return this.account_locked_until && this.account_locked_until > Date.now();
});

// Indexes for better query performance
clientAccountSchema.index({ email: 1 });
clientAccountSchema.index({ account_status: 1 });
clientAccountSchema.index({ last_login: -1 });
clientAccountSchema.index({ registration_date: -1 });
clientAccountSchema.index({ email_verification_token: 1 });
clientAccountSchema.index({ password_reset_token: 1 });

// Pre-save middleware for password hashing
clientAccountSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password_hash')) return next();
  
  // Hash password with cost of 12
  this.password_hash = await bcrypt.hash(this.password_hash, 12);
  next();
});

// Instance method to check password
clientAccountSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Instance method to create password reset token
clientAccountSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.password_reset_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.password_reset_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to update login info
clientAccountSchema.methods.updateLoginInfo = function(ipAddress, userAgent) {
  this.last_login = new Date();
  this.login_count += 1;
  this.failed_login_attempts = 0;
  this.account_locked_until = undefined;
  this.ip_address = ipAddress;
  this.user_agent = userAgent;
  return this.save();
};

// Instance method to handle failed login
clientAccountSchema.methods.handleFailedLogin = function() {
  this.failed_login_attempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failed_login_attempts >= 5) {
    this.account_locked_until = new Date(Date.now() + 30 * 60 * 1000);
  }
  
  return this.save();
};

module.exports = mongoose.model('ClientAccount', clientAccountSchema);