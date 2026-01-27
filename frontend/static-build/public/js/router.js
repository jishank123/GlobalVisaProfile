/**
 * Application Router with Basename Support - Like React Router
 * Automatically adds /CRM prefix to all routes
 */

class AppRouter {
    constructor() {
        this.basename = '/CRM'; // Basename like React Router
        this.routes = this.defineRoutes();
        this.currentUser = null;
        this.init();
    }

    defineRoutes() {
        return {
            // Public Routes (No Authentication Required)
            public: {
                // Landing & Information Pages
                home: { path: '', title: 'Home - ImmigrationPro' }, // Empty path for base route
                services: { path: 'services', title: 'Services - ImmigrationPro' },
                eb1a: { path: 'eb1a', title: 'EB-1A Eligibility - ImmigrationPro' },
                eb2niw: { path: 'eb2-niw', title: 'EB-2 NIW - ImmigrationPro' },
                o1visa: { path: 'o1-visa', title: 'O-1 Visa - ImmigrationPro' },
                pricing: { path: 'pricing', title: 'Pricing - ImmigrationPro' },
                faq: { path: 'faq', title: 'FAQ - ImmigrationPro' },
                attorneys: { path: 'attorneys', title: 'Attorney Referrals - ImmigrationPro' },
                profileBuilding: { path: 'profile-building', title: 'Profile Building - ImmigrationPro' },
                
                // Demo & Assessment (No Auth Required)
                profileAssessment: { path: 'assessment', title: 'Free Profile Assessment - ImmigrationPro' },
                
                // Contact & Booking
                contact: { path: '#contact', title: 'Contact Us - ImmigrationPro' },
                appointment: { path: 'schedule', title: 'Schedule Consultation - ImmigrationPro' },
                
                // Authentication Pages
                login: { path: 'login', title: 'Client Login - ImmigrationPro' },
                signup: { path: 'signup', title: 'Create Account - ImmigrationPro' }
            },

            // Protected Routes (Authentication Required)
            protected: {
                // Client Dashboard & Profile
                dashboard: { path: 'client-profile', title: 'Dashboard - ImmigrationPro' },
                profile: { path: 'client-profile', title: 'My Profile - ImmigrationPro' },
                
                // Assessment & Progress
                myAssessment: { path: 'assessment', title: 'My Assessment - ImmigrationPro' },
                progress: { path: 'client-profile', title: 'My Progress - ImmigrationPro' },
                
                // Documents & Files
                documents: { path: 'client-profile', title: 'My Documents - ImmigrationPro' },
                
                // Appointments & Communication
                appointments: { path: 'client-profile', title: 'My Appointments - ImmigrationPro' },
                messages: { path: 'client-profile', title: 'Messages - ImmigrationPro' }
            },

            // Admin Routes (Admin Authentication Required)
            admin: {
                dashboard: { path: 'admin', title: 'Admin Dashboard - ImmigrationPro' },
                clients: { path: 'admin', title: 'Manage Clients - ImmigrationPro' },
                appointments: { path: 'admin', title: 'Manage Appointments - ImmigrationPro' },
                assessments: { path: 'admin', title: 'Manage Assessments - ImmigrationPro' }
            },

            // Manager Routes (Manager Authentication Required)
            manager: {
                dashboard: { path: 'lead-manager', title: 'Manager Dashboard - ImmigrationPro' },
                leads: { path: 'lead-manager', title: 'Manage Leads - ImmigrationPro' },
                clients: { path: 'crm-manager', title: 'Manage Clients - ImmigrationPro' }
            }
        };
    }

    init() {
        this.checkAuthStatus();
        this.setupNavigationHandlers();
        
        // Wait for DOM to be ready before intercepting links
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.interceptAllLinks();
                this.watchForNewLinks();
                this.handleInitialRoute();
            });
        } else {
            this.interceptAllLinks();
            this.watchForNewLinks();
            this.handleInitialRoute();
        }
    }

    checkAuthStatus() {
        // Check if ClientAuth exists, if not create a mock
        if (typeof ClientAuth === 'undefined') {
            window.ClientAuth = {
                isLoggedIn: () => false,
                getClientData: () => null
            };
        }
        this.currentUser = ClientAuth.getClientData();
    }

    /**
     * Create full URL with basename (like React Router)
     */
    createUrl(path) {
        // Remove leading slash if present
        const cleanPath = path.replace(/^\//, '');
        
        // If path is empty, return just basename
        if (!cleanPath) {
            return this.basename + '/';
        }
        
        // Return basename + path
        return `${this.basename}/${cleanPath}`;
    }

    /**
     * Navigate to a specific route with automatic basename
     */
    navigateTo(routeKey, routeType = 'public') {
        const route = this.routes[routeType][routeKey];
        if (!route) {
            console.error(`Route not found: ${routeType}.${routeKey}`);
            return;
        }

        // Check authentication for protected routes
        if (routeType === 'protected' && !ClientAuth.isLoggedIn()) {
            this.navigateTo('login', 'public');
            return;
        }

        // Create full URL with basename
        const fullUrl = this.createUrl(route.path);
        
        console.log(`🔗 Navigating to: ${fullUrl}`);
        window.location.href = fullUrl;
    }

    /**
     * Navigate by path (like React Router's navigate)
     */
    navigate(path) {
        const fullUrl = this.createUrl(path);
        console.log(`🔗 Navigating to path: ${fullUrl}`);
        window.location.href = fullUrl;
    }

    /**
     * Intercept all links and add basename automatically
     */
    interceptAllLinks() {
        // First, update all existing links on the page
        this.updateExistingLinks();
        
        // Use event delegation on document body for better performance
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            
            console.log('🔗 Link clicked:', href);
            
            // Skip external links, anchors, and already processed links
            if (href.startsWith('http') || 
                href.startsWith('https') ||
                href.startsWith('#') || 
                href.startsWith(this.basename) ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                link.hasAttribute('target') ||
                link.hasAttribute('download')) {
                console.log('⏭️ Skipping link:', href);
                return;
            }

            // Skip if it's a data-route link (handled separately)
            if (link.hasAttribute('data-route')) {
                console.log('📊 Data-route link, skipping interception');
                return;
            }

            // Intercept and add basename for relative links
            if (href.startsWith('/')) {
                e.preventDefault();
                const path = href.substring(1); // Remove leading slash
                console.log('🎯 Intercepted link, navigating to:', path);
                this.navigate(path);
            }
        }, true); // Use capture phase for better interception
    }

    /**
     * Update existing links on the page to include basename
     */
    updateExistingLinks() {
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip if already has basename or is external/special link
            if (href.startsWith(this.basename) || 
                href.startsWith('http') ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                link.hasAttribute('data-route')) {
                return;
            }
            
            // Update href to include basename
            const newHref = this.createUrl(href.substring(1));
            link.setAttribute('href', newHref);
            console.log('🔄 Updated link:', href, '→', newHref);
        });
    }

    /**
     * Watch for dynamically added links and update them
     */
    watchForNewLinks() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a link
                        if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('/')) {
                            this.updateSingleLink(node);
                        }
                        
                        // Check for links within the added node
                        const links = node.querySelectorAll?.('a[href^="/"]');
                        links?.forEach(link => this.updateSingleLink(link));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Update a single link element
     */
    updateSingleLink(link) {
        const href = link.getAttribute('href');
        
        // Skip if already processed or special link
        if (!href || 
            href.startsWith(this.basename) || 
            href.startsWith('http') ||
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            link.hasAttribute('data-route')) {
            return;
        }
        
        // Update href to include basename
        const newHref = this.createUrl(href.substring(1));
        link.setAttribute('href', newHref);
        console.log('🆕 Updated new link:', href, '→', newHref);
    }

    /**
     * Get current route without basename
     */
    getCurrentRoute() {
        const currentPath = window.location.pathname;
        return currentPath.replace(this.basename, '').replace(/^\//, '') || '';
    }

    /**
     * Handle page-specific logic
     */
    handleInitialRoute() {
        const currentRoute = this.getCurrentRoute();
        
        // Redirect logic based on current page
        switch (currentRoute) {
            case 'login':
                if (ClientAuth.isLoggedIn()) {
                    this.navigateTo('dashboard', 'protected');
                }
                break;
                
            case 'signup':
                if (ClientAuth.isLoggedIn()) {
                    this.navigateTo('dashboard', 'protected');
                }
                break;
                
            case 'client-profile':
            case 'admin':
            case 'lead-manager':
            case 'crm-manager':
                if (!ClientAuth.isLoggedIn()) {
                    this.navigateTo('login', 'public');
                }
                break;
        }
    }

    /**
     * Setup navigation event handlers
     */
    setupNavigationHandlers() {
        // Handle navigation clicks with data-route
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const routeKey = link.getAttribute('data-route');
                const routeType = link.getAttribute('data-route-type') || 'public';
                this.navigateTo(routeKey, routeType);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleInitialRoute();
        });
    }

    /**
     * Helper method to create navigation links with basename
     */
    createLink(path, text, className = '') {
        const fullUrl = this.createUrl(path);
        return `<a href="${fullUrl}" class="${className}">${text}</a>`;
    }

    /**
     * Get user flow recommendations based on current state
     */
    getUserFlowRecommendations() {
        const isLoggedIn = ClientAuth.isLoggedIn();
        
        // Mock user state - in real app, this would come from API
        const userState = {
            isLoggedIn,
            hasCompletedAssessment: false, // Would check from database
            hasScheduledAppointment: false, // Would check from database
            profileStrength: 0 // Would get from last assessment
        };

        return this.getRecommendedFlow(userState);
    }

    /**
     * Get the recommended next step for user
     */
    getRecommendedFlow(userState = {}) {
        const { isLoggedIn, hasCompletedAssessment, hasScheduledAppointment, profileStrength } = userState;

        if (!isLoggedIn) {
            return {
                step: 'authentication',
                title: 'Get Started',
                description: 'Create your account to track your progress',
                primaryAction: { text: 'Sign Up', route: 'signup', type: 'public' },
                secondaryAction: { text: 'Take Free Assessment', route: 'profileAssessment', type: 'public' }
            };
        }

        if (!hasCompletedAssessment) {
            return {
                step: 'assessment',
                title: 'Complete Your Profile Assessment',
                description: 'Understand your current profile strength',
                primaryAction: { text: 'Start Assessment', route: 'profileAssessment', type: 'public' },
                secondaryAction: { text: 'View Dashboard', route: 'dashboard', type: 'protected' }
            };
        }

        if (profileStrength < 60 && !hasScheduledAppointment) {
            return {
                step: 'consultation',
                title: 'Schedule Expert Consultation',
                description: 'Get personalized guidance to strengthen your profile',
                primaryAction: { text: 'Schedule Consultation', route: 'appointment', type: 'public' },
                secondaryAction: { text: 'View Recommendations', route: 'dashboard', type: 'protected' }
            };
        }

        return {
            step: 'progress',
            title: 'Continue Building Your Profile',
            description: 'Follow your personalized action plan',
            primaryAction: { text: 'View Dashboard', route: 'dashboard', type: 'protected' },
            secondaryAction: { text: 'Update Assessment', route: 'profileAssessment', type: 'public' }
        };
    }
}

/**
 * Page Flow Manager - Handles specific page flows
 */
class PageFlowManager {
    constructor(router) {
        this.router = router;
    }

    /**
     * Handle landing page flow
     */
    handleLandingFlow() {
        const recommendations = this.router.getUserFlowRecommendations();
        this.displayFlowRecommendations(recommendations);
    }

    /**
     * Handle assessment completion flow
     */
    handleAssessmentCompletion(assessmentData) {
        const { overall_score } = assessmentData;
        
        if (overall_score < 40) {
            return {
                nextStep: 'consultation',
                message: 'Your profile needs significant development. Let\'s schedule a consultation to create a personalized strategy.',
                primaryAction: { text: 'Schedule Consultation', route: 'appointment', type: 'public' },
                secondaryAction: { text: 'View Detailed Results', route: 'dashboard', type: 'protected' }
            };
        } else if (overall_score < 70) {
            return {
                nextStep: 'improvement',
                message: 'Your profile shows promise! Let\'s work together to strengthen key areas.',
                primaryAction: { text: 'Get Improvement Plan', route: 'appointment', type: 'public' },
                secondaryAction: { text: 'Create Account', route: 'signup', type: 'public' }
            };
        } else {
            return {
                nextStep: 'application',
                message: 'Excellent! Your profile is strong. Let\'s discuss application strategy.',
                primaryAction: { text: 'Schedule Strategy Call', route: 'appointment', type: 'public' },
                secondaryAction: { text: 'View Services', route: 'services', type: 'public' }
            };
        }
    }

    /**
     * Display flow recommendations on page
     */
    displayFlowRecommendations(recommendations) {
        const container = document.getElementById('flow-recommendations');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <h3 class="text-xl font-bold mb-2">${recommendations.title}</h3>
                <p class="text-blue-100 mb-4">${recommendations.description}</p>
                <div class="flex flex-col sm:flex-row gap-3">
                    <button 
                        data-route="${recommendations.primaryAction.route}" 
                        data-route-type="${recommendations.primaryAction.type}"
                        class="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                    >
                        ${recommendations.primaryAction.text}
                    </button>
                    <button 
                        data-route="${recommendations.secondaryAction.route}" 
                        data-route-type="${recommendations.secondaryAction.type}"
                        class="bg-transparent border border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
                    >
                        ${recommendations.secondaryAction.text}
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new AppRouter();
    window.pageFlowManager = new PageFlowManager(window.appRouter);
    
    // Global navigation helpers (like React Router)
    window.navigate = (path) => {
        window.appRouter.navigate(path);
    };
    
    window.navigateTo = (routeKey, routeType = 'public') => {
        window.appRouter.navigateTo(routeKey, routeType);
    };
    
    window.createUrl = (path) => {
        return window.appRouter.createUrl(path);
    };
    
    console.log('✅ Router initialized with basename:', window.appRouter.basename);
    console.log('📍 Current route:', window.appRouter.getCurrentRoute());
    
    // Handle landing page flow if on homepage
    const currentRoute = window.appRouter.getCurrentRoute();
    if (!currentRoute || currentRoute === 'index') {
        window.pageFlowManager.handleLandingFlow();
    }
});