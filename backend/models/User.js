const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
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
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'lead_manager', 'crm_manager', 'consultant', 'writer', 'client'],
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
  is_temp_password: {
    type: Boolean,
    default: false
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
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
  return {
    user_id: this._id,
    email: this.email,
    first_name: this.first_name,
    last_name: this.last_name,
    full_name: this.full_name,
    role: this.role,
    status: this.status,
    phone: this.phone,
    company: this.company,
    country: this.country,
    avatar: this.avatar,
    profile_picture: this.profile_picture,
    linkedin_url: this.linkedin_url,
    email_verified: this.email_verified,
    is_temp_password: this.is_temp_password,
    last_login: this.last_login,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
