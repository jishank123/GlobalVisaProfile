const mongoose = require('mongoose');

const appointmentRequestSchema = new mongoose.Schema({
  // Client Information
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
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  
  // Appointment Details
  visa_category: {
    type: String,
    required: [true, 'Visa category is required'],
    enum: ['eb1a', 'eb2-niw', 'o1', 'multiple', 'other'],
    trim: true
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    enum: ['EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'IST', 'CST-China', 'JST', 'AEST', 'other'],
    trim: true
  },
  preferred_date: {
    type: String,
    trim: true,
    maxlength: [20, 'Date cannot exceed 20 characters']
  },
  preferred_time: {
    type: String,
    trim: true,
    maxlength: [20, 'Time cannot exceed 20 characters']
  },
  consultation_type: {
    type: String,
    enum: ['video', 'phone', 'in-person'],
    default: 'video'
  },
  
  // Additional Information
  details: {
    type: String,
    trim: true,
    maxlength: [2000, 'Details cannot exceed 2000 characters']
  },
  
  // Status and Management
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Created by (Lead Manager who created this appointment)
  created_by: {
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
  
  // Appointment Scheduling
  scheduled_date: {
    type: Date
  },
  scheduled_time: {
    type: String,
    trim: true
  },
  duration_minutes: {
    type: Number,
    default: 30,
    min: [15, 'Minimum duration is 15 minutes'],
    max: [180, 'Maximum duration is 180 minutes']
  },
  meeting_link: {
    type: String,
    trim: true
  },
  meeting_id: {
    type: String,
    trim: true
  },
  
  // Follow-up and Notes
  consultation_notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  follow_up_required: {
    type: Boolean,
    default: false
  },
  follow_up_date: {
    type: Date
  },
  converted_to_client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
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
  
  // Security and Tracking
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
    enum: ['website', 'referral', 'social_media', 'direct', 'staff', 'other'],
    default: 'website'
  },
  
  // Submission metadata
  submission_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for visa category display name
appointmentRequestSchema.virtual('visa_category_display').get(function() {
  const categories = {
    'eb1a': 'EB-1A (Extraordinary Ability)',
    'eb2-niw': 'EB-2 NIW (National Interest Waiver)',
    'o1': 'O-1 Visa',
    'multiple': 'Multiple Categories',
    'other': 'Other / Not Sure'
  };
  return categories[this.visa_category] || this.visa_category;
});

// Virtual for status display
appointmentRequestSchema.virtual('status_display').get(function() {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1);
});

// Indexes for better query performance
appointmentRequestSchema.index({ email: 1 });
appointmentRequestSchema.index({ status: 1 });
appointmentRequestSchema.index({ assigned_to: 1, status: 1 });
appointmentRequestSchema.index({ scheduled_date: 1 });
appointmentRequestSchema.index({ createdAt: -1 });
appointmentRequestSchema.index({ visa_category: 1 });
appointmentRequestSchema.index({ priority: 1, status: 1 });

// Fields to encrypt
const encryptedFields = [
  'name', 'email', 'phone', 'preferred_date', 'preferred_time',
  'details', 'scheduled_time', 'meeting_link', 'meeting_id',
  'consultation_notes', 'ip_address', 'user_agent'
];

// Pre-save hook: Encrypt fields before saving
appointmentRequestSchema.pre('save', function(next) {
  try {
    // Skip if encryption is globally disabled
    if (global.ENCRYPTION_DISABLED || this._skipEncryption) {
      return next();
    }
    
    const encryption = require('../middleware/encryptionMiddleware');
    
    encryptedFields.forEach(field => {
      if (this[field] !== undefined && this[field] !== null && this.isModified(field)) {
        const value = this[field];
        
        // Handle strings - only encrypt if not already encrypted
        if (typeof value === 'string' && !value.includes(':')) {
          this[field] = encryption.encrypt(value);
        }
      }
    });
    
    // Encrypt communications array
    if (this.communications && Array.isArray(this.communications) && this.isModified('communications')) {
      this.communications.forEach(comm => {
        if (comm.message && typeof comm.message === 'string' && !comm.message.includes(':')) {
          comm.message = encryption.encrypt(comm.message);
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Appointment encryption error:', error);
    next(error);
  }
});

// Pre-save middleware for automatic priority assignment
appointmentRequestSchema.pre('save', function(next) {
  // Set priority based on visa category
  if (this.isNew) {
    if (this.visa_category === 'eb1a') {
      this.priority = 'high';
    } else if (this.visa_category === 'multiple') {
      this.priority = 'medium';
    }
  }
  
  next();
});

// Method to add communication
appointmentRequestSchema.methods.addCommunication = function(type, message, user, direction = 'outbound') {
  this.communications.push({
    type,
    message,
    user,
    direction,
    date: new Date()
  });
  return this.save();
};

// Method to schedule appointment
appointmentRequestSchema.methods.scheduleAppointment = function(date, time, meetingLink, assignedTo) {
  this.scheduled_date = date;
  this.scheduled_time = time;
  this.meeting_link = meetingLink;
  this.assigned_to = assignedTo;
  this.status = 'confirmed';
  return this.save();
};

// Method to get decrypted appointment data for display
appointmentRequestSchema.methods.toDisplayJSON = function() {
  // Get decrypted version of the document
  const decryptedDoc = this.toObject();
  
  return {
    _id: this._id,
    name: decryptedDoc.name,
    email: decryptedDoc.email,
    phone: decryptedDoc.phone,
    visa_category: this.visa_category,
    timezone: this.timezone,
    preferred_date: decryptedDoc.preferred_date,
    preferred_time: decryptedDoc.preferred_time,
    consultation_type: this.consultation_type,
    details: decryptedDoc.details,
    status: this.status,
    priority: this.priority,
    scheduled_date: this.scheduled_date,
    scheduled_time: decryptedDoc.scheduled_time,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Helper function to decrypt appointment fields
const decryptAppointmentFields = (doc) => {
  if (!doc) return;
  
  const encryptionMiddleware = require('../middleware/encryptionMiddleware');
  
  // Decrypt string fields
  const fieldsToDecrypt = [
    'name', 'email', 'phone', 'preferred_date', 'preferred_time',
    'details', 'scheduled_time', 'meeting_link', 'meeting_id',
    'consultation_notes', 'ip_address', 'user_agent'
  ];
  
  fieldsToDecrypt.forEach(field => {
    if (doc[field] && typeof doc[field] === 'string') {
      doc[field] = encryptionMiddleware.decrypt(doc[field]);
    }
  });
  
  // Decrypt communications array
  if (doc.communications && Array.isArray(doc.communications)) {
    doc.communications.forEach(comm => {
      if (comm.message && typeof comm.message === 'string') {
        comm.message = encryptionMiddleware.decrypt(comm.message);
      }
    });
  }
};

// Decrypt data after finding from database
appointmentRequestSchema.post('find', function(docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => decryptAppointmentFields(doc));
  }
});

appointmentRequestSchema.post('findOne', function(doc) {
  decryptAppointmentFields(doc);
});

appointmentRequestSchema.post('findOneAndUpdate', function(doc) {
  decryptAppointmentFields(doc);
});

module.exports = mongoose.model('AppointmentRequest', appointmentRequestSchema);