const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mime = require('mime-types');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import and apply DEFERRED global encryption plugin
const mongooseEncryptionPlugin = require('./middleware/mongooseEncryptionDeferred');
console.log('🔐 Applying DEFERRED global document encryption...');
mongoose.plugin(mongooseEncryptionPlugin);
console.log('✅ Deferred encryption plugin applied successfully');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leadRoutes = require('./routes/leads');
const clientRoutes = require('./routes/clients');
const projectRoutes = require('./routes/projects');
const paymentRoutes = require('./routes/payments');
const queryRoutes = require('./routes/queries');
const serviceRoutes = require('./routes/services');
const invoiceRoutes = require('./routes/invoices');
const tasksRoutes = require('./routes/tasks');
// const documentRoutes = require('./routes/documents');
const analyticsRoutes = require('./routes/analytics');
const activityRoutes = require('./routes/activity');

// Import new form routes
const profileAssessmentRoutes = require('./routes/profileAssessments');
const appointmentRoutes = require('./routes/appointments');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');
const debugRoutes = require('./routes/debug');
const dashboardRoutes = require('./routes/dashboard');

// Initialize Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Manual CORS middleware - handles preflight and actual requests FIRST
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://immigrationprofile.com',
  'http://immigrationprofile.com'
].filter(Boolean);

  console.log('🌐 Request:', req.method, req.path, 'Origin:', origin);

  // Check if origin is allowed
  if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('localhost') && (process.env.NODE_ENV === 'development' || process.env.ALLOW_LOCALHOST === 'true'))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Max-Age', '3600');
    console.log('✅ CORS headers set');
  }

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight');
    return res.status(204).end();
  }

  next();
});

// CORS configuration - using environment variables
app.use(cors({
  origin: true,        // allow same-origin via proxy
  credentials: true
}));


// Rate limiting with proper proxy configuration
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later.'
        }
    },
    trustProxy: true, // Trust the proxy
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Static files for uploads with proper headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    // Set proper content type for images with specific MIME types
    if (path.match(/\.(jpg|jpeg)$/i)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', 'inline');
    } else if (path.match(/\.jfif$/i)) {
      res.setHeader('Content-Type', 'image/jpeg'); // JFIF is a JPEG format
      res.setHeader('Content-Disposition', 'inline');
    } else if (path.match(/\.png$/i)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline');
    } else if (path.match(/\.gif$/i)) {
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Content-Disposition', 'inline');
    } else if (path.match(/\.webp$/i)) {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Content-Disposition', 'inline');
    } else if (path.match(/\.avif$/i)) {
      res.setHeader('Content-Type', 'image/avif');
      res.setHeader('Content-Disposition', 'inline');
    } else if (path.match(/\.(jpg|jpeg|png|gif|webp|avif|jfif)$/i)) {
      res.setHeader('Content-Type', 'image/*');
      res.setHeader('Content-Disposition', 'inline');
    }
    // Add CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Add cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
}));

// Debug endpoint to check if file exists
app.get('/api/debug/file-exists/:type/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', type, filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    res.json({
      success: true,
      exists: !err,
      path: filePath,
      filename: filename,
      type: type,
      error: err ? err.message : null,
      staticUrl: `${req.protocol}://${req.get('host')}/uploads/${type}/${filename}`
    });
  });
});

// Test endpoint to serve image directly with proper headers
app.get('/api/debug/serve-image/:type/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const mime = require('mime-types');
  
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', type, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found',
      path: filePath
    });
  }
  
  // Get file stats
  const stats = fs.statSync(filePath);
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  
  // Set proper headers for inline viewing
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.setHeader('Content-Disposition', 'inline'); // Force inline viewing instead of download
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Endpoint to force download of image
app.get('/api/debug/download-image/:type/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const mime = require('mime-types');
  
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', type, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found',
      path: filePath
    });
  }
  
  // Get file stats
  const stats = fs.statSync(filePath);
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  
  // Set proper headers for download
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); // Force download
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

// Endpoint to clean up missing file references
app.post('/api/admin/cleanup-missing-files', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const Project = require('./models/Project');
    const Payment = require('./models/Payment');
    
    const uploadsDir = path.join(__dirname, 'uploads', 'payment-receipts');
    let cleaned = 0;
    
    // Check projects
    const projects = await Project.find({ payment_receipt: { $ne: null, $ne: '' } });
    for (const project of projects) {
      if (!project.payment_receipt) continue; // Skip null/empty values
      
      const filePath = path.join(uploadsDir, project.payment_receipt);
      if (!fs.existsSync(filePath)) {
        await Project.findByIdAndUpdate(project._id, { 
          $unset: { payment_receipt: 1 } 
        });
        cleaned++;
      }
    }
    
    // Check payments
    const payments = await Payment.find({ receipt_screenshot: { $ne: null, $ne: '' } });
    for (const payment of payments) {
      if (!payment.receipt_screenshot) continue; // Skip null/empty values
      
      const filePath = path.join(uploadsDir, payment.receipt_screenshot);
      if (!fs.existsSync(filePath)) {
        await Payment.findByIdAndUpdate(payment._id, { 
          $unset: { receipt_screenshot: 1, receipt_path: 1 } 
        });
        cleaned++;
      }
    }
    
    res.json({
      success: true,
      message: `Cleaned up ${cleaned} missing file references`,
      cleaned: cleaned
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// MongoDB Connection
console.log('📌 Attempting to connect to MongoDB...');
const mongoUri = process.env.MONGODB_URI;
console.log('📌 MongoDB URI:', mongoUri);

mongoose.connect(mongoUri).then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`📌 Port: ${mongoose.connection.port}`);
    console.log(`📊 Ready State: ${mongoose.connection.readyState}`); // 1 = connected
}).catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('❌ Full error:', err);
    process.exit(1);
});

// API Routes
console.log('🛣️ Setting up API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/tasks', (req, res, next) => {
    console.log(`🛣️ Tasks route hit: ${req.method} ${req.path}`);
    next();
}, tasksRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/services', (req, res, next) => {
    console.log(`🛣️ Services route hit: ${req.method} ${req.path}`);
    next();
}, serviceRoutes);
app.use('/api/invoices', (req, res, next) => {
    console.log(`🛣️ Invoices route hit: ${req.method} ${req.path}`);
    next();
}, invoiceRoutes);
// app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

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

// Newsletter routes
app.use('/api/newsletter', (req, res, next) => {
    console.log(`🛣️ Newsletter route hit: ${req.method} ${req.path}`);
    next();
}, newsletterRoutes);

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
            invoices: '/api/invoices',
            documents: '/api/documents',
            analytics: '/api/analytics',
            // New form endpoints
            profileAssessments: '/api/profile-assessments',
            appointments: '/api/appointments',
            contact: '/api/contact',
            newsletter: '/api/newsletter'
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
        const errors = Object.values(err.errors).map(e => ({field: e.path, message: e.message}));
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
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack
            })
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('💥 UNHANDLED PROMISE REJECTION! Shutting down...');
    console.error('💥 Error:', err.name, err.message);
    console.error('💥 Stack:', err.stack);
    
    // Close server & exit process
    process.exit(1);
});

module.exports = app;