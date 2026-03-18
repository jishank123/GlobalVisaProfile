const mongoose = require('mongoose');

const profileAssessmentSchema = new mongoose.Schema({
  // Client Information
  client_name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  client_email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  client_phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  service_interest: {
    type: String,
    enum: ['eb1a-eligibility', 'profile-building', 'eb2-niw', 'o1-visa', 'career-coaching', 'other'],
    required: [true, 'Service interest is required'],
    trim: true
  },
  field_of_expertise: {
    type: String,
    required: [true, 'Field of expertise is required'],
    trim: true,
    maxlength: [200, 'Field cannot exceed 200 characters']
  },
  years_of_experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [100, 'Experience cannot exceed 100 years']
  },
  current_location: {
    type: String,
    required: [true, 'Current location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },

  // EB-1A Criteria Scores (0-3 scale: None, Weak, Moderate, Strong)
  criterion_1_awards: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_2_memberships: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_3_media: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_4_judging: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_5_contributions: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_6_publications: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_7_exhibitions: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_8_leadership: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_9_salary: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },
  criterion_10_commercial: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
    default: 0
  },

  // Assessment Results
  overall_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  profile_strength: {
    type: String,
    required: true,
    enum: ['Needs Development', 'Moderate Profile Strength', 'Good Profile Strength', 'Excellent Profile Strength']
  },
  strong_criteria_count: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  moderate_criteria_count: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  weak_criteria_count: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  criteria_met: {
    type: Number,
    required: true,
    min: 0,
    max: 10
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

  // Status and Follow-up
  status: {
    type: String,
    enum: ['New', 'Reviewed', 'Contacted', 'Converted', 'Archived'],
    default: 'New'
  },
  follow_up_status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Completed', 'Not Required'],
    default: 'Pending'
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Lead Conversion
  converted_to_lead_id: {
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
  
  // IP and User Agent for security
  ip_address: {
    type: String,
    trim: true
  },
  user_agent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for eligibility recommendation
profileAssessmentSchema.virtual('eligibility_recommendation').get(function() {
  if (this.criteria_met >= 3 && this.overall_score >= 60) {
    return 'Ready to Apply';
  } else if (this.criteria_met >= 2) {
    return 'Close - Needs Strengthening';
  } else {
    return 'Significant Development Needed';
  }
});

// Indexes for better query performance
profileAssessmentSchema.index({ client_email: 1 });
profileAssessmentSchema.index({ user_id: 1 });
profileAssessmentSchema.index({ status: 1 });
profileAssessmentSchema.index({ createdAt: -1 });
profileAssessmentSchema.index({ overall_score: -1 });
profileAssessmentSchema.index({ assigned_to: 1, status: 1 });

// Pre-save middleware for data validation
profileAssessmentSchema.pre('save', function(next) {
  // Validate criteria scores sum
  const criteriaScores = [
    this.criterion_1_awards, this.criterion_2_memberships, this.criterion_3_media,
    this.criterion_4_judging, this.criterion_5_contributions, this.criterion_6_publications,
    this.criterion_7_exhibitions, this.criterion_8_leadership, this.criterion_9_salary,
    this.criterion_10_commercial
  ];
  
  // Count criteria by strength
  const strong = criteriaScores.filter(score => score === 3).length;
  const moderate = criteriaScores.filter(score => score === 2).length;
  const weak = criteriaScores.filter(score => score === 1).length;
  const none = criteriaScores.filter(score => score === 0).length;
  
  // Update counts
  this.strong_criteria_count = strong;
  this.moderate_criteria_count = moderate;
  this.weak_criteria_count = weak + none;
  this.criteria_met = strong + moderate;
  
  next();
});

// Method to get decrypted assessment data for display
profileAssessmentSchema.methods.toDisplayJSON = function() {
  // Get decrypted version of the document
  const decryptedDoc = this.toObject();
  
  return {
    _id: this._id,
    client_name: decryptedDoc.client_name,
    client_email: decryptedDoc.client_email,
    client_phone: decryptedDoc.client_phone,
    service_interest: decryptedDoc.service_interest,
    field_of_expertise: decryptedDoc.field_of_expertise,
    years_of_experience: this.years_of_experience,
    current_location: decryptedDoc.current_location,
    overall_score: this.overall_score,
    profile_strength: this.profile_strength,
    criteria_met: this.criteria_met,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('ProfileAssessment', profileAssessmentSchema);