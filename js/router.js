/**
 * Application Router - Manages user flow and page navigation
 */

class AppRouter {
    constructor() {
        this.routes = this.defineRoutes();
        this.currentUser = null;
        this.init();
    }

    defineRoutes() {
        return {
            // Public Routes (No Authentication Required)
            public: {
                // Landing & Information Pages
                home: { path: 'index-clean.html', title: 'Home - ImmigrationPro' },
                services: { path: 'services-detailed.html', title: 'Services - ImmigrationPro' },
                eb1a: { path: 'eb1a-eligibility.html', title: 'EB-1A Eligibility - ImmigrationPro' },
                eb2niw: { path: 'eb2-niw.html', title: 'EB-2 NIW - ImmigrationPro' },
                o1visa: { path: 'o1-visa.html', title: 'O-1 Visa - ImmigrationPro' },
                pricing: { path: 'pricing.html', title: 'Pricing - ImmigrationPro' },
                faq: { path: 'faq.html', title: 'FAQ - ImmigrationPro' },
                attorneys: { path: 'attorney-referrals.html', title: 'Attorney Referrals - ImmigrationPro' },
                
                // Demo & Assessment (No Auth Required)
                profileAssessment: { path: 'profile-assessment.html', title: 'Free Profile Assessment - ImmigrationPro' },
                
                // Contact & Booking
                contact: { path: 'index-clean.html#contact', title: 'Contact Us - ImmigrationPro' },
                appointment: { path: 'schedule-appointment-clean.html', title: 'Schedule Consultation - ImmigrationPro' },
                
                // Authentication Pages
                login: { path: 'client-login-clean.html', title: 'Client Login - ImmigrationPro' },
                signup: { path: 'client-signup-clean.html', title: 'Create Account - ImmigrationPro' },
                
                // Demo & Testing
                demo: { path: 'demo-prototype-static.html', title: 'Demo - ImmigrationPro' },
                apiTest: { path: 'test-api.html', title: 'API Test - ImmigrationPro' }
            },

            // Protected Routes (Authentication Required)
            protected: {
                // Client Dashboard & Profile
                dashboard: { path: 'client-dashboard.html', title: 'Dashboard - ImmigrationPro' },
                profile: { path: 'client-profile.html', title: 'My Profile - ImmigrationPro' },
                
                // Assessment & Progress
                myAssessment: { path: 'client-assessment.html', title: 'My Assessment - ImmigrationPro' },
                progress: { path: 'client-progress.html', title: 'My Progress - ImmigrationPro' },
                
                // Documents & Files
                documents: { path: 'client-documents.html', title: 'My Documents - ImmigrationPro' },
                
                // Appointments & Communication
                appointments: { path: 'client-appointments.html', title: 'My Appointments - ImmigrationPro' },
                messages: { path: 'client-messages.html', title: 'Messages - ImmigrationPro' }
            },

            // Admin Routes (Admin Authentication Required)
            admin: {
                dashboard: { path: 'admin-dashboard.html', title: 'Admin Dashboard - ImmigrationPro' },
                clients: { path: 'admin-clients.html', title: 'Manage Clients - ImmigrationPro' },
                appointments: { path: 'admin-appointments.html', title: 'Manage Appointments - ImmigrationPro' },
                assessments: { path: 'admin-assessments.html', title: 'Manage Assessments - ImmigrationPro' }
            },

            // Manager Routes (Manager Authentication Required)
            manager: {
                dashboard: { path: 'manager-dashboard.html', title: 'Manager Dashboard - ImmigrationPro' },
                leads: { path: 'manager-leads.html', title: 'Manage Leads - ImmigrationPro' },
                clients: { path: 'manager-clients.html', title: 'Manage Clients - ImmigrationPro' }
            }
        };
    }

    init() {
        this.checkAuthStatus();
        this.setupNavigationHandlers();
        this.handleInitialRoute();
    }

    checkAuthStatus() {
        this.currentUser = ClientAuth.getClientData();
    }

    /**
     * Navigate to a specific route
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

        // Navigate to the route
        window.location.href = route.path;
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

    /**
     * Handle page-specific logic
     */
    handleInitialRoute() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Redirect logic based on current page
        switch (currentPage) {
            case 'client-login.html':
            case 'client-login-clean.html':
                if (ClientAuth.isLoggedIn()) {
                    this.navigateTo('dashboard', 'protected');
                }
                break;
                
            case 'client-signup.html':
            case 'client-signup-clean.html':
                if (ClientAuth.isLoggedIn()) {
                    this.navigateTo('dashboard', 'protected');
                }
                break;
                
            case 'client-dashboard.html':
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
        // Handle navigation clicks
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
        const { overall_score, profile_strength } = assessmentData;
        
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
    
    // Handle landing page flow if on homepage
    if (window.location.pathname.includes('index') || window.location.pathname === '/') {
        window.pageFlowManager.handleLandingFlow();
    }
});