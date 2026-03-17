const Newsletter = require('../models/Newsletter');
const { validationResult } = require('express-validator');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.array()[0].msg
        }
      });
    }

    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      if (subscriber.subscribed) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_SUBSCRIBED',
            message: 'This email is already subscribed to our newsletter'
          }
        });
      } else {
        // Resubscribe if previously unsubscribed
        subscriber.subscribed = true;
        subscriber.subscription_date = new Date();
        subscriber.unsubscribe_date = null;
        subscriber.ip_address = ipAddress;
        subscriber.user_agent = userAgent;
        await subscriber.save();
      }
    } else {
      // Create new subscriber
      subscriber = new Newsletter({
        email,
        subscribed: true,
        subscription_date: new Date(),
        ip_address: ipAddress,
        user_agent: userAgent
      });
      await subscriber.save();
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        email: subscriber.email,
        subscribed: subscriber.subscribed,
        subscription_date: subscriber.subscription_date
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_SUBSCRIBED',
          message: 'This email is already subscribed to our newsletter'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SUBSCRIPTION_ERROR',
        message: 'Failed to subscribe to newsletter'
      }
    });
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Email not found in newsletter subscribers'
        }
      });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribe_date = new Date();
    await subscriber.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UNSUBSCRIBE_ERROR',
        message: 'Failed to unsubscribe from newsletter'
      }
    });
  }
};

// Get all subscribers (admin only)
exports.getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, subscribed = true } = req.query;
    const skip = (page - 1) * limit;

    const query = { subscribed: subscribed === 'true' };
    const total = await Newsletter.countDocuments(query);
    const subscribers = await Newsletter.find(query)
      .sort({ subscription_date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch subscribers'
      }
    });
  }
};

// Get subscriber count
exports.getSubscriberCount = async (req, res) => {
  try {
    const activeCount = await Newsletter.countDocuments({ subscribed: true });
    const totalCount = await Newsletter.countDocuments();

    res.json({
      success: true,
      data: {
        active: activeCount,
        total: totalCount,
        unsubscribed: totalCount - activeCount
      }
    });
  } catch (error) {
    console.error('Get subscriber count error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COUNT_ERROR',
        message: 'Failed to get subscriber count'
      }
    });
  }
};
