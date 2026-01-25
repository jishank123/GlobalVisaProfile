const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leadRoutes = require('./routes/leads');
// const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/projects');
const paymentRoutes = require('./routes/payments');
// const queryRoutes = require('./routes/queries');
const serviceRoutes = require('./routes/services');
// const documentRoutes = require('./routes/documents');
// const analyticsRoutes = require('./routes/analytics');

// Import new form routes
const profileAssessmentRoutes = require('./routes/profileAssessments');
const appointmentRoutes = require('./routes/appointments');
const contactRoutes = require('./routes/contact');
const clientAccountRoutes = require('./routes/clientAccounts');
const debugRoutes = require('./routes/debug');
const dashboardRoutes = require('./routes/dashboard');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
console.log('🔌 Attempting to connect to MongoDB...');
console.log('🔌 MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/academic_erp');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🏠 Host: ${mongoose.connection.host}`);
  console.log(`🔌 Port: ${mongoose.connection.port}`);
  console.log(`📊 Ready State: ${mongoose.connection.readyState}`); // 1 = connected
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.error('❌ Full error:', err);
  process.exit(1);
});

// API Routes
console.log('🛣️ Setting up API routes...');
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/leads', leadRoutes); 
// app.use('/api/clients', clientRoutes); 
app.use('/api/projects', projectRoutes); 
app.use('/api/payments', paymentRoutes); 
// app.use('/api/queries', queryRoutes); 
app.use('/api/services', (req, res, next) => {
  console.log(`🛣️ Services route hit: ${req.method} ${req.path}`);
  next();
}, serviceRoutes); 
// app.use('/api/documents', documentRoutes); 
// app.use('/api/analytics', analyticsRoutes); 
 
// New form API routes
app.use('/api/profile-assessments', (req, res, next) => {
  console.log(`🛣️ Profile assessments route hit: ${req.method} ${req.path}`);
  next();
}, profileAssessmentRoutes);
app.use('/api/appointments', (req, res, next) => {
  console.log(`🛣️ Appointments route hit: ${req.method} ${req.path}`);
  next();
}, appointmentRoutes);
app.use('/api/contact', (req, res, next) => {
  console.log(`🛣️ Contact form route hit: ${req.method} ${req.path}`);
  next();
}, contactRoutes);
app.use('/api/client-accounts', (req, res, next) => {
  console.log(`🛣️ Client accounts route hit: ${req.method} ${req.path}`);
  next();
}, clientAccountRoutes);

// Dashboard routes
app.use('/api/dashboard', (req, res, next) => {
  console.log(`🛣️ Dashboard route hit: ${req.method} ${req.path}`);
  next();
}, dashboardRoutes);

// Debug routes (remove in production)
app.use('/api/debug', debugRoutes);

console.log('✅ All API routes configured');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Academic ERP API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Academic ERP API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      leads: '/api/leads',
      clients: '/api/clients',
      projects: '/api/projects',
      payments: '/api/payments',
      queries: '/api/queries',
      services: '/api/services',
      documents: '/api/documents',
      analytics: '/api/analytics',
      // New form endpoints
      profileAssessments: '/api/profile-assessments',
      appointments: '/api/appointments',
      contact: '/api/contact',
      clientAccounts: '/api/client-accounts'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `${field} already exists`
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired'
      }
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
