const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Client Authentication Middleware
 * Protects routes that require client authentication
 */
const authenticateClient = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies (multiple possible cookie names)
    else if (req.cookies) {
      token = req.cookies.client_token || req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No authentication token provided.'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user ID from token (handle both formats)
    const userId = decoded.user_id || decoded.id;

    // Find user account
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User account not found. Please login again.'
        }
      });
    }

    // Check if user is a client
    if (user.role !== 'client') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Access denied. Client role required.'
        }
      });
    }

    // Add client to request object (maintaining compatibility with existing code)
    req.client = {
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      account: user
    };

    // Also add as user for consistency
    req.user = {
      id: user._id,
      _id: user._id,
      email: user.email,
      role: user.role,
      account: user
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token.'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired. Please login again.'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication error. Please try again.'
      }
    });
  }
};

/**
 * User Authentication Middleware (for regular users, not clients)
 * Returns a function that can be called with role requirements
 */
const auth = (requiredRoles = [], options = {}) => {
  return async (req, res, next) => {
    try {
      let token;

      // Check for token in Authorization header
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      // Check for token in cookies
      else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        if (options.optional) {
          return next();
        }
        return res.status(401).json({
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Access denied. No authentication token provided.'
          }
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user account - handle both id and user_id formats
      const userId = decoded.user_id || decoded.id;
      const user = await User.findById(userId);
      
      if (!user) {
        if (options.optional) {
          return next();
        }
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found. Please login again.'
          }
        });
      }

      // Check role requirements
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        if (options.optional) {
          return next();
        }
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to access this resource.'
          }
        });
      }

      // Add user to request object
      req.user = {
        user_id: user._id,
        _id: user._id, // Some controllers might expect _id
        id: user._id,  // Some controllers might expect id
        email: user.email,
        role: user.role,
        account: user
      };

      console.log('✅ User object set in req.user:');
      console.log('✅   user_id:', req.user.user_id);
      console.log('✅   _id:', req.user._id);
      console.log('✅   id:', req.user.id);
      console.log('✅   email:', req.user.email);
      console.log('✅   role:', req.user.role);
      console.log('✅   Sample project assigned_to for comparison: "697ec40613b779c47c5cd4cd"');
      console.log('✅   Does user ID match sample project?', user._id.toString() === "697ec40613b779c47c5cd4cd");

      next();

    } catch (error) {
      if (options.optional) {
        console.log('🔐 Auth error, but optional auth - continuing:', error.message);
        return next();
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication token.'
          }
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired. Please login again.'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication error. Please try again.'
        }
      });
    }
  };
};

/**
 * Optional Authentication Middleware
 * Adds client info to request if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies) {
      token = req.cookies.client_token || req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.user_id || decoded.id;
      const user = await User.findById(userId);
      
      if (user && user.role === 'client') {
        req.client = {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          account: user
        };
        
        req.user = {
          id: user._id,
          _id: user._id,
          email: user.email,
          role: user.role,
          account: user
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't return errors, just continue without client info
    next();
  }
};

module.exports = {
  authenticateClient,
  auth, // This is the function that returns middleware
  optionalAuth
};