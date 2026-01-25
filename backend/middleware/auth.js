const jwt = require('jsonwebtoken');
const ClientAccount = require('../models/ClientAccount');
const User = require('../models/User');

/**
 * Client Authentication Middleware
 * Protects routes that require client authentication
 */
const authenticateClient = async (req, res, next) => {
  console.log('\n🔐 === CLIENT AUTHENTICATION MIDDLEWARE ===');
  console.log('🔐 Request URL:', req.originalUrl);
  console.log('🔐 Request method:', req.method);
  console.log('🔐 Middleware called: authenticateClient');
  
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Token found in Authorization header');
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🔐 Token found in cookies');
    }

    console.log('🔐 Token present:', token ? 'YES' : 'NO');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No authentication token provided.'
        }
      });
    }

    // Verify token
    console.log('🔐 Verifying JWT token...');
    console.log('🔐 JWT_SECRET available:', process.env.JWT_SECRET ? 'YES' : 'NO');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Token decoded successfully');
    console.log('🔐 Client ID from token:', decoded.id);

    // Find client account
    console.log('🔍 Looking up client account...');
    const clientAccount = await ClientAccount.findById(decoded.id);
    
    if (!clientAccount) {
      console.log('❌ Client account not found');
      return res.status(401).json({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client account not found. Please login again.'
        }
      });
    }

    console.log('✅ Client authenticated:', clientAccount.email);
    console.log('✅ Client ID:', clientAccount._id);

    // Add client to request object
    req.client = {
      id: clientAccount._id,
      email: clientAccount.email,
      full_name: clientAccount.full_name,
      phone: clientAccount.phone,
      account: clientAccount
    };

    console.log('🔐 === AUTHENTICATION SUCCESSFUL ===\n');
    next();

  } catch (error) {
    console.error('🔐 Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid token');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token.'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      console.log('❌ Token expired');
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Authentication token has expired. Please login again.'
        }
      });
    }

    console.log('❌ Authentication middleware error');
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
const auth = (requiredRoles = []) => {
  return async (req, res, next) => {
    console.log('\n🔐 === USER AUTHENTICATION MIDDLEWARE ===');
    console.log('🔐 Request URL:', req.originalUrl);
    console.log('🔐 Request method:', req.method);
    console.log('🔐 Middleware called: auth (for users, not clients)');
    console.log('🔐 Required roles:', requiredRoles);
    
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
      console.log('🔐 Token decoded:', decoded);

      // Find user account - handle both id and user_id formats
      const userId = decoded.user_id || decoded.id;
      const user = await User.findById(userId);
      
      if (!user) {
        console.log('❌ User not found with ID:', userId);
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found. Please login again.'
          }
        });
      }

      console.log('✅ User authenticated:', user.email, 'Role:', user.role);

      // Check role requirements
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
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
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const clientAccount = await ClientAccount.findById(decoded.id);
      
      if (clientAccount) {
        req.client = {
          id: clientAccount._id,
          email: clientAccount.email,
          full_name: clientAccount.full_name,
          phone: clientAccount.phone,
          account: clientAccount
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