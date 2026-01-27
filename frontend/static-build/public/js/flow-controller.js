/**
 * Flow Controller - Manages user journey and smart redirects
 */

class FlowController {
    constructor() {
        this.userState = this.getUserState();
        this.init();
    }

    init() {
        this.handlePageLoad();
        this.setupFlowTracking();
    }

    /**
     * Get current user state from various sources
     */
    getUserState() {
        const isLoggedIn = ClientAuth.isLoggedIn();
        const clientData = ClientAuth.getClientData();
        
        return {
            isLoggedIn,
            clientData,
            hasVisited: localStorage.getItem('hasVisited') === 'true',
            lastAssessment: this.getLastAssessment(),
            lastAppointment: this.getLastAppointment(),
            currentPage: this.getCurrentPage(),
            sessionStart: Date.now()
        };
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    }

    getLastAssessment() {
        const assessment = localStorage.getItem('lastAssessment');
        return assessment ? JSON.parse(assessment) : null;
    }

    getLastAppointment() {
        const appointment = localStorage.getItem('lastAppointment');
        return appointment ? JSON.parse(appointment) : null;
    }

    /**
     * Handle page load logic based on user state
     */
    handlePageLoad() {
        const { currentPage, isLoggedIn } = this.userState;

        switch (currentPage) {
            case 'landing':
            case 'index-clean':
            case 'index':
                this.handleLandingPage();
                break;
                
            case 'profile-assessment':
                this.handleAssessmentPage();
                break;
                
            case 'schedule-appointment-clean':
            case 'schedule-appointment':
                this.handleAppointmentPage();
                break;
                
            case 'client-login-clean':
            case 'client-login':
                this.handleLoginPage();
                break;
                
            case 'client-signup-clean':
            case 'client-signup':
                this.handleSignupPage();
                break;
                
            case 'client-dashboard':
                this.handleDashboardPage();
                break;
                
            default:
                this.handleGenericPage();
        }
    }

    /**
     * Landing page logic
     */
    handleLandingPage() {
        const { isLoggedIn, hasVisited, lastAssessment } = this.userState;
        
        if (isLoggedIn) {
            this.showSmartBanner({
                type: 'success',
                message: 'Welcome back! Continue building your profile.',
                primaryAction: { text: 'View Dashboard', route: 'dashboard', type: 'protected' },
                secondaryAction: { text: 'Update Assessment', route: 'profileAssessment', type: 'public' }
            });
        } else if (lastAssessment) {
            const daysSinceAssessment = Math.floor((Date.now() - lastAssessment.timestamp) / (1000 * 60 * 60 * 24));
            
            if (daysSinceAssessment < 7) {
                this.showSmartBanner({
                    type: 'info',
                    message: `Your assessment score: ${lastAssessment.score}%. Ready to take the next step?`,
                    primaryAction: { text: 'Schedule Consultation', route: 'appointment', type: 'public' },
                    secondaryAction: { text: 'Retake Assessment', route: 'profileAssessment', type: 'public' }
                });
            }
        } else if (hasVisited) {
            this.showSmartBanner({
                type: 'info',
                message: 'Welcome back! Ready to assess your profile?',
                primaryAction: { text: 'Start Assessment', route: 'profileAssessment', type: 'public' },
                secondaryAction: { text: 'Schedule Consultation', route: 'appointment', type: 'public' }
            });
        }
        
        // Track landing page visit
        this.trackEvent('landing_page_visit', { isReturning: hasVisited });
    }

    /**
     * Assessment page logic
     */
    handleAssessmentPage() {
        const { isLoggedIn, lastAssessment } = this.userState;
        
        if (lastAssessment) {
            const daysSinceAssessment = Math.floor((Date.now() - lastAssessment.timestamp) / (1000 * 60 * 60 * 24));
            
            if (daysSinceAssessment < 30) {
                this.showSmartBanner({
                    type: 'warning',
                    message: `You completed an assessment ${daysSinceAssessment} days ago. Want to update it?`,
                    primaryAction: { text: 'Continue with New Assessment', action: 'dismiss' },
                    secondaryAction: { text: 'View Previous Results', action: 'showPreviousResults' }
                });
            }
        }
        
        // Setup assessment completion handler
        this.setupAssessmentCompletion();
    }

    /**
     * Appointment page logic
     */
    handleAppointmentPage() {
        const { lastAssessment } = this.userState;
        
        if (lastAssessment) {
            // Pre-fill form with assessment data
            this.prefillAppointmentForm(lastAssessment);
            
            this.showSmartBanner({
                type: 'success',
                message: `Great! Your assessment score: ${lastAssessment.score}%. Let's discuss your strategy.`,
                primaryAction: { text: 'Continue Booking', action: 'dismiss' }
            });
        }
    }

    /**
     * Login page logic
     */
    handleLoginPage() {
        const { isLoggedIn } = this.userState;
        
        if (isLoggedIn) {
            // Redirect to dashboard if already logged in
            window.appRouter.navigateTo('dashboard', 'protected');
        }
    }

    /**
     * Signup page logic
     */
    handleSignupPage() {
        const { isLoggedIn, lastAssessment } = this.userState;
        
        if (isLoggedIn) {
            // Redirect to dashboard if already logged in
            window.appRouter.navigateTo('dashboard', 'protected');
        } else if (lastAssessment) {
            this.showSmartBanner({
                type: 'info',
                message: 'Create an account to save your assessment results and track progress.',
                primaryAction: { text: 'Continue Signup', action: 'dismiss' }
            });
        }
    }

    /**
     * Dashboard page logic
     */
    handleDashboardPage() {
        const { isLoggedIn } = this.userState;
        
        if (!isLoggedIn) {
            // Redirect to login if not authenticated
            window.appRouter.navigateTo('login', 'public');
        } else {
            this.loadDashboardData();
        }
    }

    /**
     * Generic page logic
     */
    handleGenericPage() {
        // Add any common page logic here
        this.trackPageView();
    }

    /**
     * Show smart banner with contextual messaging
     */
    showSmartBanner(config) {
        const banner = document.getElementById('smart-banner') || this.createSmartBanner();
        
        const typeClasses = {
            success: 'bg-green-50 border-green-200 text-green-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            error: 'bg-red-50 border-red-200 text-red-800'
        };
        
        banner.className = `fixed top-20 left-4 right-4 z-40 p-4 rounded-lg border ${typeClasses[config.type]} shadow-lg`;
        
        banner.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="font-medium">${config.message}</p>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    ${config.primaryAction ? `
                        <button 
                            class="bg-current text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
                            onclick="flowController.handleBannerAction('${config.primaryAction.route || ''}', '${config.primaryAction.type || ''}', '${config.primaryAction.action || ''}')"
                        >
                            ${config.primaryAction.text}
                        </button>
                    ` : ''}
                    ${config.secondaryAction ? `
                        <button 
                            class="text-current px-4 py-2 rounded text-sm font-medium hover:bg-current hover:bg-opacity-10 transition-colors"
                            onclick="flowController.handleBannerAction('${config.secondaryAction.route || ''}', '${config.secondaryAction.type || ''}', '${config.secondaryAction.action || ''}')"
                        >
                            ${config.secondaryAction.text}
                        </button>
                    ` : ''}
                    <button 
                        class="text-current hover:bg-current hover:bg-opacity-10 p-1 rounded transition-colors"
                        onclick="flowController.dismissBanner()"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => this.dismissBanner(), 10000);
    }

    createSmartBanner() {
        const banner = document.createElement('div');
        banner.id = 'smart-banner';
        document.body.appendChild(banner);
        return banner;
    }

    handleBannerAction(route, type, action) {
        if (action === 'dismiss') {
            this.dismissBanner();
        } else if (action === 'showPreviousResults') {
            this.showPreviousAssessmentResults();
        } else if (route && type) {
            window.appRouter.navigateTo(route, type);
        }
    }

    dismissBanner() {
        const banner = document.getElementById('smart-banner');
        if (banner) {
            banner.remove();
        }
    }

    /**
     * Setup assessment completion handler
     */
    setupAssessmentCompletion() {
        // Listen for assessment completion event
        document.addEventListener('assessmentCompleted', (event) => {
            const assessmentData = event.detail;
            this.handleAssessmentCompletion(assessmentData);
        });
    }

    handleAssessmentCompletion(assessmentData) {
        // Save assessment data
        localStorage.setItem('lastAssessment', JSON.stringify({
            ...assessmentData,
            timestamp: Date.now()
        }));
        
        // Determine next step based on score
        const nextStep = this.getNextStepRecommendation(assessmentData.overall_score);
        
        // Show completion modal with next steps
        this.showAssessmentCompletionModal(assessmentData, nextStep);
        
        // Track completion
        this.trackEvent('assessment_completed', {
            score: assessmentData.overall_score,
            strength: assessmentData.profile_strength
        });
    }

    getNextStepRecommendation(score) {
        if (score < 40) {
            return {
                type: 'consultation',
                title: 'Schedule Expert Consultation',
                message: 'Your profile needs strategic development. Let\'s create a personalized plan.',
                primaryAction: { text: 'Schedule Consultation', route: 'appointment', type: 'public' },
                secondaryAction: { text: 'Learn About Services', route: 'services', type: 'public' }
            };
        } else if (score < 70) {
            return {
                type: 'improvement',
                title: 'Strengthen Your Profile',
                message: 'You\'re on the right track! Let\'s optimize your strongest areas.',
                primaryAction: { text: 'Get Improvement Plan', route: 'appointment', type: 'public' },
                secondaryAction: { text: 'Create Account', route: 'signup', type: 'public' }
            };
        } else {
            return {
                type: 'application',
                title: 'Ready to Apply!',
                message: 'Excellent profile! Let\'s discuss your application strategy.',
                primaryAction: { text: 'Schedule Strategy Call', route: 'appointment', type: 'public' },
                secondaryAction: { text: 'View Pricing', route: 'pricing', type: 'public' }
            };
        }
    }

    showAssessmentCompletionModal(assessmentData, nextStep) {
        // Create and show modal with results and next steps
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-8">
                    <div class="text-center mb-6">
                        <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-chart-line text-white text-3xl"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
                        <p class="text-gray-600">Here are your results and recommended next steps</p>
                    </div>
                    
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                        <div class="text-center">
                            <div class="text-4xl font-bold text-blue-600 mb-2">${assessmentData.overall_score}%</div>
                            <div class="text-lg font-semibold text-gray-900">${assessmentData.profile_strength}</div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">${nextStep.title}</h3>
                        <p class="text-gray-700 mb-4">${nextStep.message}</p>
                        
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button 
                                class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex-1"
                                onclick="flowController.handleModalAction('${nextStep.primaryAction.route}', '${nextStep.primaryAction.type}')"
                            >
                                ${nextStep.primaryAction.text}
                            </button>
                            <button 
                                class="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all flex-1"
                                onclick="flowController.handleModalAction('${nextStep.secondaryAction.route}', '${nextStep.secondaryAction.type}')"
                            >
                                ${nextStep.secondaryAction.text}
                            </button>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button 
                            class="text-gray-500 hover:text-gray-700 transition-colors"
                            onclick="flowController.closeModal()"
                        >
                            Close and continue browsing
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    handleModalAction(route, type) {
        this.closeModal();
        window.appRouter.navigateTo(route, type);
    }

    closeModal() {
        const modal = document.querySelector('.fixed.inset-0.bg-black');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Pre-fill appointment form with assessment data
     */
    prefillAppointmentForm(assessmentData) {
        setTimeout(() => {
            const nameField = document.getElementById('full-name');
            const emailField = document.getElementById('email');
            const messageField = document.getElementById('message');
            
            if (nameField && assessmentData.client_name) {
                nameField.value = assessmentData.client_name;
            }
            
            if (emailField && assessmentData.client_email) {
                emailField.value = assessmentData.client_email;
            }
            
            if (messageField) {
                messageField.value = `I recently completed a profile assessment with a score of ${assessmentData.overall_score}%. I'd like to discuss strategies to strengthen my profile for EB-1A application.`;
            }
        }, 500);
    }

    /**
     * Setup flow tracking
     */
    setupFlowTracking() {
        // Track page views
        this.trackPageView();
        
        // Track time on page
        this.startTimeTracking();
        
        // Track exit intent
        this.setupExitIntentTracking();
    }

    trackEvent(eventName, data = {}) {
        // Send to analytics
        console.log('Flow Event:', eventName, data);
        
        // Store in localStorage for debugging
        const events = JSON.parse(localStorage.getItem('flowEvents') || '[]');
        events.push({
            event: eventName,
            data,
            timestamp: Date.now(),
            page: this.userState.currentPage
        });
        localStorage.setItem('flowEvents', JSON.stringify(events.slice(-50))); // Keep last 50 events
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page: this.userState.currentPage,
            isLoggedIn: this.userState.isLoggedIn,
            hasVisited: this.userState.hasVisited
        });
    }

    startTimeTracking() {
        this.pageStartTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.pageStartTime;
            this.trackEvent('page_time', {
                page: this.userState.currentPage,
                timeSeconds: Math.round(timeOnPage / 1000)
            });
        });
    }

    setupExitIntentTracking() {
        let hasShownExitIntent = false;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !hasShownExitIntent && !this.userState.isLoggedIn) {
                hasShownExitIntent = true;
                this.showExitIntentModal();
            }
        });
    }

    showExitIntentModal() {
        this.trackEvent('exit_intent_triggered');
        
        // Show exit intent offer
        this.showSmartBanner({
            type: 'warning',
            message: 'Wait! Get your free profile assessment before you go.',
            primaryAction: { text: 'Start Assessment', route: 'profileAssessment', type: 'public' },
            secondaryAction: { text: 'No Thanks', action: 'dismiss' }
        });
    }
}

// Initialize flow controller
document.addEventListener('DOMContentLoaded', () => {
    window.flowController = new FlowController();
});