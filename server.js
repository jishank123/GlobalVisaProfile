const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/all_static_pages', express.static(path.join(__dirname, 'all_static_pages')));

// ===== MAIN ROUTES =====

// Homepage - Main entry point
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Root index.html redirect to pages/index.html
app.get('/index.html', (req, res) => {
    res.redirect('/pages/index.html');
});

// ===== AUTHENTICATION ROUTES =====

// Client Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'client-login-clean.html'));
});

// Client Signup
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'client-signup-clean.html'));
});

// ===== DASHBOARD ROUTES =====

// Client Dashboard - Main client portal
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'all_static_pages', 'backend-mern', '3-client-profile.html'));
});

// Client Dashboard - Alternative routes
app.get('/client-dashboard', (req, res) => {
    res.redirect('/dashboard');
});

// Admin Dashboard - Admin control panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'all_static_pages', '2-admin-dashboard.html'));
});

// Admin Dashboard - Alternative routes
app.get('/admin-dashboard', (req, res) => {
    res.redirect('/admin');
});

// ===== SERVICE PAGES =====

// Profile Assessment - Main service
app.get('/assessment', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'profile-assessment.html'));
});

// Schedule Appointment
app.get('/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'schedule-appointment-clean.html'));
});

// ===== INFORMATION PAGES =====

// Services
app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'services-detailed.html'));
});

// EB-1A Information
app.get('/eb1a', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'eb1a-eligibility.html'));
});

// EB-2 NIW Information
app.get('/eb2-niw', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'eb2-niw.html'));
});

// Profile Building
app.get('/profile-building', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'profile-building.html'));
});

// Attorney Referrals
app.get('/attorneys', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'attorney-referrals.html'));
});

// FAQ
app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'faq.html'));
});

// Pricing
app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'pricing.html'));
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

// Serve any HTML page from pages folder (with or without .html extension)
app.get('/:page', (req, res) => {
    let pageName = req.params.page;
    
    // Remove .html extension if present
    if (pageName.endsWith('.html')) {
        pageName = pageName.slice(0, -5);
    }
    
    // Check if it's a known route first
    const knownRoutes = [
        'login', 'signup', 'dashboard', 'client-dashboard', 'admin', 'admin-dashboard',
        'assessment', 'schedule', 'services', 'eb1a', 'eb2-niw', 'profile-building',
        'attorneys', 'faq', 'pricing'
    ];
    
    if (knownRoutes.includes(pageName)) {
        // This should have been handled by specific routes above
        return res.redirect(`/${pageName}`);
    }
    
    const filePath = path.join(__dirname, 'pages', `${pageName}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            // Try without -clean suffix for backward compatibility
            const fallbackPath = path.join(__dirname, 'pages', `${pageName.replace('-clean', '')}.html`);
            res.sendFile(fallbackPath, (fallbackErr) => {
                if (fallbackErr) {
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
                                        <li><a href="/login" class="text-blue-600 hover:underline"><i class="fas fa-sign-in-alt mr-2"></i>Client Login</a></li>
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
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-home mr-2"></i>Go to Homepage
                            </a>
                            <a href="/login" class="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                                <i class="fas fa-sign-in-alt mr-2"></i>Client Portal
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
    console.log(`📄 Pages available at: http://localhost:${PORT}/[page-name]`);
});