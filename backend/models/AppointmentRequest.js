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
    enum: ['website', 'referral', 'social_media', 'direct', 'other'],
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

module.exports = mongoose.model('AppointmentRequest', appointmentRequestSchema);