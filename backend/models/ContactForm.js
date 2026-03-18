const mongoose = require('mongoose');

const contactFormSchema = new mongoose.Schema({
  // Contact Information
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  
  // Inquiry Details
  visa_type: {
    type: String,
    required: [true, 'Visa category is required'],
    enum: ['eb1a-eligibility', 'profile-building', 'eb2-niw', 'o1-visa', 'career-coaching', 'other'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Classification and Priority
  inquiry_type: {
    type: String,
    enum: ['consultation', 'information', 'support', 'complaint', 'other'],
    default: 'consultation'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status and Management
  status: {
    type: String,
    enum: ['new', 'reviewed', 'responded', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Lead Conversion
  converted_to_lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  converted_at: {
    type: Date
  },
  converted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Linked User and Client
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  
  // Response and Follow-up
  response_required: {
    type: Boolean,
    default: true
  },
  response_deadline: {
    type: Date,
    default: function() {
      // Default response deadline: 24 hours for high priority, 48 hours for others
      const hours = this.priority === 'high' || this.priority === 'urgent' ? 24 : 48;
      return new Date(Date.now() + hours * 60 * 60 * 1000);
    }
  },
  responded_at: {
    type: Date
  },
  response_message: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'sms', 'meeting', 'note'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      default: 'outbound'
    }
  }],
  
  // Lead Conversion
  converted_to_lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  converted_to_client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  conversion_date: {
    type: Date
  },
  
  // Source and Tracking
  source: {
    type: String,
    enum: ['website_contact', 'landing_page', 'referral', 'social_media', 'direct', 'other'],
    default: 'website_contact'
  },
  utm_source: {
    type: String,
    trim: true
  },
  utm_medium: {
    type: String,
    trim: true
  },
  utm_campaign: {
    type: String,
    trim: true
  },
  referrer_url: {
    type: String,
    trim: true
  },
  
  // Security and Metadata
  ip_address: {
    type: String,
    trim: true
  },
  user_agent: {
    type: String,
    trim: true
  },
  
  // Internal Notes
  internal_notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for visa type display name
contactFormSchema.virtual('visa_type_display').get(function() {
  const types = {
    'eb1a-eligibility': 'EB-1A Eligibility',
    'profile-building': 'Profile Building',
    'eb2-niw': 'EB-2 NIW',
    'o1-visa': 'O-1 Visa',
    'career-coaching': 'Career Coaching',
    'other': 'Other'
  };
  return types[this.visa_type] || this.visa_type;
});

// Virtual for response status
contactFormSchema.virtual('response_status').get(function() {
  if (this.responded_at) {
    return 'Responded';
  } else if (this.response_deadline && new Date() > this.response_deadline) {
    return 'Overdue';
  } else {
    return 'Pending';
  }
});

// Virtual for days since submission
contactFormSchema.virtual('days_since_submission').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
contactFormSchema.index({ email: 1 });
contactFormSchema.index({ status: 1 });
contactFormSchema.index({ assigned_to: 1, status: 1 });
contactFormSchema.index({ visa_type: 1 });
contactFormSchema.index({ priority: 1, status: 1 });
contactFormSchema.index({ response_deadline: 1 });
contactFormSchema.index({ createdAt: -1 });
contactFormSchema.index({ source: 1 });

// Text index for search functionality
contactFormSchema.index({ 
  name: 'text', 
  email: 'text', 
  message: 'text',
  internal_notes: 'text'
});

// Pre-save middleware for automatic categorization
contactFormSchema.pre('save', function(next) {
  if (this.isNew) {
    // Auto-assign priority based on visa type and message content
    const urgentKeywords = ['urgent', 'asap', 'deadline', 'emergency'];
    const messageText = this.message.toLowerCase();
    
    if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
      this.priority = 'urgent';
    } else if (this.visa_type === 'eb1a-eligibility') {
      this.priority = 'high';
    }
    
    // Auto-categorize inquiry type
    if (messageText.includes('consultation') || messageText.includes('schedule') || messageText.includes('appointment')) {
      this.inquiry_type = 'consultation';
    } else if (messageText.includes('question') || messageText.includes('information') || messageText.includes('how')) {
      this.inquiry_type = 'information';
    } else if (messageText.includes('problem') || messageText.includes('issue') || messageText.includes('help')) {
      this.inquiry_type = 'support';
    }
    
    // Auto-tag based on content
    const tags = [];
    if (messageText.includes('profile building')) tags.push('profile-building');
    if (messageText.includes('documentation')) tags.push('documentation');
    if (messageText.includes('timeline')) tags.push('timeline');
    if (messageText.includes('cost') || messageText.includes('price') || messageText.includes('fee')) tags.push('pricing');
    
    this.tags = tags;
  }
  
  next();
});

// Method to add communication
contactFormSchema.methods.addCommunication = function(type, message, user, direction = 'outbound') {
  this.communications.push({
    type,
    message,
    user,
    direction,
    date: new Date()
  });
  return this.save();
};

// Method to respond to inquiry
contactFormSchema.methods.respond = function(responseMessage, user) {
  this.response_message = responseMessage;
  this.responded_at = new Date();
  this.status = 'responded';
  
  // Add to communications
  this.communications.push({
    type: 'email',
    message: responseMessage,
    user: user,
    direction: 'outbound',
    date: new Date()
  });
  
  return this.save();
};

// Method to convert to lead
contactFormSchema.methods.convertToLead = function(leadData) {
  this.converted_to_lead = leadData._id;
  this.conversion_date = new Date();
  this.status = 'resolved';
  return this.save();
};

// Method to get decrypted contact data for display
contactFormSchema.methods.toDisplayJSON = function() {
  // Get decrypted version of the document
  const decryptedDoc = this.toObject();
  
  return {
    _id: this._id,
    name: decryptedDoc.name,
    email: decryptedDoc.email,
    phone: decryptedDoc.phone,
    visa_type: this.visa_type,
    message: decryptedDoc.message,
    inquiry_type: this.inquiry_type,
    priority: this.priority,
    status: this.status,
    source: this.source,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('ContactForm', contactFormSchema);