const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    subscribed: {
      type: Boolean,
      default: true
    },
    subscription_date: {
      type: Date,
      default: Date.now
    },
    unsubscribe_date: {
      type: Date,
      default: null
    },
    ip_address: {
      type: String,
      default: null
    },
    user_agent: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for finding active subscribers
newsletterSchema.index({ subscribed: 1, email: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);
