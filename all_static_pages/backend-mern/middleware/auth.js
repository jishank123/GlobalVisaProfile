const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Not authorized to access this route'
        }
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.user_id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User no longer exists'
          }
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Your account is not active'
          }
        });
      }

      // Add user info to request
      req.user = decoded;
      req.userDoc = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: error.message
      }
    });
  }
};

// Restrict to specific roles (alias for restrictTo)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action'
        }
      });
    }
    next();
  };
};

// Authorize specific roles (same as restrictTo but different name for compatibility)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action'
        }
      });
    }
    next();
  };
};

// Optional authentication (for routes that work with or without auth)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user_id);
        
        if (user && user.status === 'active') {
          req.user = decoded;
          req.userDoc = user;
        }
      } catch (error) {
        // Invalid token, but continue anyway
        console.log('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Main auth function that combines protection and role authorization
// Usage: auth(['admin', 'manager']) or auth() for just authentication
module.exports = (roles = []) => {
  return [
    exports.protect,
    ...(roles.length > 0 ? [exports.restrictTo(...roles)] : [])
  ];
};
