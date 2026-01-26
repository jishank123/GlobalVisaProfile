const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serve static files from views directory (for backward compatibility)
app.use('/views', express.static(path.join(__dirname, 'views')));

// ===== MAIN ROUTES =====

// Homepage - Main entry point (MUST BE FIRST)
app.get('/', (req, res) => {
    console.log('📍 Homepage route accessed - serving index.html');
    const filePath = path.join(__dirname, 'views', 'pages', 'index.html');
    console.log('📁 File path:', filePath);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('❌ Error serving homepage:', err);
            res.status(500).send('Error loading homepage');
        } else {
            console.log('✅ Homepage served successfully');
        }
    });
});

// Root index.html redirect to main homepage
app.get('/index.html', (req, res) => {
    res.redirect('/');
});

// Explicit index route
app.get('/index', (req, res) => {
    res.redirect('/');
});

// ===== AUTHENTICATION ROUTES =====

// Single Login page for ALL users (admin, manager, client)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'login.html'));
});

// Single Signup page for CLIENT registration only
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', 'register.html'));
});

// Register page (alternative route)
app.get('/register', (req, res) => {
    res.redirect('/signup');
});

// ===== DASHBOARD ROUTES =====

// Client Profile Dashboard
app.get('/client-profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', '3-client-profile.html'));
});

// Lead Manager Dashboard
app.get('/lead-manager', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', '1-lead-manager.html'));
});

// CRM Manager Dashboard
app.get('/crm-manager', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', '4-crm-manager.html'));
});

// Admin Dashboard - Admin control panel (after admin login)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard', '2-admin-dashboard.html'));
});

// Legacy dashboard redirects
app.get('/dashboard', (req, res) => {
    res.redirect('/client-profile');
});

app.get('/client-dashboard', (req, res) => {
    res.redirect('/client-profile');
});

app.get('/admin-dashboard', (req, res) => {
    res.redirect('/admin');
});

app.get('/manager', (req, res) => {
    res.redirect('/lead-manager');
});

app.get('/crm', (req, res) => {
    res.redirect('/crm-manager');
});

// ===== SERVICE PAGES =====

// Profile Assessment - Main service
app.get('/assessment', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'profile-assessment.html'));
});

// Schedule Appointment
app.get('/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'schedule-appointment-clean.html'));
});

// ===== INFORMATION PAGES =====

// Services
app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'services-detailed.html'));
});

// EB-1A Information
app.get('/eb1a', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'eb1a-eligibility.html'));
});

// EB-2 NIW Information
app.get('/eb2-niw', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'eb2-niw.html'));
});

// O-1 Visa Information
app.get('/o1-visa', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'o1-visa.html'));
});

// Profile Building
app.get('/profile-building', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'profile-building.html'));
});

// Attorney Referrals
app.get('/attorneys', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'attorney-referrals.html'));
});

// FAQ
app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'faq.html'));
});

// Pricing
app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'pricing.html'));
});

// ===== LEGACY REDIRECTS =====

// Old client dashboard redirect
app.get('/pages/client-dashboard.html', (req, res) => {
    res.redirect('/dashboard');
});

// Old admin dashboard redirects
app.get('/pages/adminDashboard.html', (req, res) => {
    res.redirect('/admin');
});

app.get('/pages/admin-dashboard-original.html', (req, res) => {
    res.redirect('/admin');
});

// ===== DYNAMIC PAGE ROUTING =====

// Serve any HTML page from views folder (with or without .html extension)
// NOTE: This should come AFTER all specific routes to avoid conflicts
app.get('/:page', (req, res) => {
    let pageName = req.params.page;
    
    // Skip if this is the root path (should be handled by '/' route above)
    if (pageName === '' || pageName === 'index') {
        return res.redirect('/');
    }
    
    // Remove .html extension if present
    if (pageName.endsWith('.html')) {
        pageName = pageName.slice(0, -5);
    }
    
    // Check if it's a known route first
    const knownRoutes = [
        'login', 'signup', 'client-profile', 'lead-manager', 'crm-manager', 'admin',
        'dashboard', 'client-dashboard', 'admin-dashboard', 'manager', 'crm',
        'assessment', 'schedule', 'services', 'eb1a', 'eb2-niw', 'o1-visa', 'profile-building',
        'attorneys', 'faq', 'pricing'
    ];
    
    if (knownRoutes.includes(pageName)) {
        // This should have been handled by specific routes above
        return res.redirect(`/${pageName}`);
    }
    
    // Try to find the file in pages directory
    const filePath = path.join(__dirname, 'views', 'pages', `${pageName}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            // Try in auth directory
            const authPath = path.join(__dirname, 'views', 'auth', `${pageName}.html`);
            res.sendFile(authPath, (authErr) => {
                if (authErr) {
                    // Generate 404 page with available routes
                    res.status(404).send(generate404Page(pageName));
                }
            });
        }
    });
});

// ===== 404 PAGE GENERATOR =====
function generate404Page(requestedPage) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page Not Found - ImmigrationPro</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
        </head>
        <body class="bg-gray-50 font-sans">
            <div class="min-h-screen flex items-center justify-center px-4">
                <div class="max-w-2xl w-full text-center">
                    <div class="bg-white rounded-2xl shadow-xl p-8">
                        <i class="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-6"></i>
                        <h1 class="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                        <p class="text-xl text-gray-600 mb-8">The page "${requestedPage}" could not be found.</p>
                        
                        <div class="bg-blue-50 rounded-xl p-6 mb-8">
                            <h2 class="text-2xl font-bold text-gray-900 mb-4">Available Pages</h2>
                            <div class="grid md:grid-cols-2 gap-4 text-left">
                                <div>
                                    <h3 class="font-semibold text-gray-800 mb-2">Main Pages</h3>
                                    <ul class="space-y-1 text-sm">
                                        <li><a href="/" class="text-blue-600 hover:underline"><i class="fas fa-home mr-2"></i>Homepage</a></li>
                                        <li><a href="/login" class="text-blue-600 hover:underline"><i class="fas fa-sign-in-alt mr-2"></i>Login</a></li>
                                        <li><a href="/signup" class="text-blue-600 hover:underline"><i class="fas fa-user-plus mr-2"></i>Client Signup</a></li>
                                        <li><a href="/dashboard" class="text-blue-600 hover:underline"><i class="fas fa-tachometer-alt mr-2"></i>Client Dashboard</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-gray-800 mb-2">Services</h3>
                                    <ul class="space-y-1 text-sm">
                                        <li><a href="/assessment" class="text-blue-600 hover:underline"><i class="fas fa-chart-line mr-2"></i>Profile Assessment</a></li>
                                        <li><a href="/schedule" class="text-blue-600 hover:underline"><i class="fas fa-calendar mr-2"></i>Schedule Appointment</a></li>
                                        <li><a href="/eb1a" class="text-blue-600 hover:underline"><i class="fas fa-trophy mr-2"></i>EB-1A Information</a></li>
                                        <li><a href="/eb2-niw" class="text-blue-600 hover:underline"><i class="fas fa-star mr-2"></i>EB-2 NIW Information</a></li>
                                        <li><a href="/o1-visa" class="text-blue-600 hover:underline"><i class="fas fa-medal mr-2"></i>O-1 Visa Information</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-home mr-2"></i>Go to Homepage
                            </a>
                            <a href="/login" class="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                                <i class="fas fa-sign-in-alt mr-2"></i>Login Portal
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

app.listen(PORT, () => {
    console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🔗 Backend API: http://localhost:5000`);
    console.log(`🏠 Homepage: http://localhost:${PORT} (loads automatically)`);
    console.log(`📄 Other pages: /login, /signup, /assessment, /services, etc.`);
    console.log(`📂 New folder structure implemented!`);
});