/**
 * Shared Utilities for Form Handling and API Integration
 */

class FormHandler {
    constructor() {
        this.loadingStates = new Map();
    }

    /**
     * Show loading state for a form
     */
    showLoading(formId, messageElementId, message = 'Processing...') {
        const messageElement = document.getElementById(messageElementId);
        const form = document.getElementById(formId);
        
        if (messageElement) {
            messageElement.className = 'mt-4 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200';
            messageElement.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`;
            messageElement.classList.remove('hidden');
        }
        
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                this.loadingStates.set(formId, submitButton.innerHTML);
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
            }
        }
    }

    /**
     * Show success message
     */
    showSuccess(messageElementId, message, autoHide = false) {
        const messageElement = document.getElementById(messageElementId);
        if (messageElement) {
            messageElement.className = 'mt-4 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200';
            messageElement.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
            messageElement.classList.remove('hidden');
            
            if (autoHide) {
                setTimeout(() => {
                    messageElement.classList.add('hidden');
                }, 5000);
            }
        }
    }

    /**
     * Show error message
     */
    showError(messageElementId, message, autoHide = false) {
        const messageElement = document.getElementById(messageElementId);
        if (messageElement) {
            messageElement.className = 'mt-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200';
            messageElement.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
            messageElement.classList.remove('hidden');
            
            if (autoHide) {
                setTimeout(() => {
                    messageElement.classList.add('hidden');
                }, 8000);
            }
        }
    }

    /**
     * Reset form loading state
     */
    resetLoading(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton && this.loadingStates.has(formId)) {
                submitButton.disabled = false;
                submitButton.innerHTML = this.loadingStates.get(formId);
                this.loadingStates.delete(formId);
            }
        }
    }

    /**
     * Validate form data
     */
    validateForm(formData, rules) {
        const errors = [];
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors.push(`${rule.label || field} is required`);
                continue;
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.label || field} must be at least ${rule.minLength} characters`);
            }
            
            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.label || field} cannot exceed ${rule.maxLength} characters`);
            }
            
            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors.push(rule.patternMessage || `${rule.label || field} format is invalid`);
            }
            
            if (value && rule.min && parseFloat(value) < rule.min) {
                errors.push(`${rule.label || field} must be at least ${rule.min}`);
            }
            
            if (value && rule.max && parseFloat(value) > rule.max) {
                errors.push(`${rule.label || field} cannot exceed ${rule.max}`);
            }
        }
        
        return errors;
    }

    /**
     * Extract form data
     */
    extractFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Handle checkboxes and radio buttons
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });
        
        return data;
    }

    /**
     * Handle API response
     */
    async handleApiResponse(apiCall, formId, messageElementId, successMessage, successCallback = null) {
        try {
            const result = await apiCall();
            
            if (result.success) {
                this.showSuccess(messageElementId, successMessage);
                this.resetLoading(formId);
                
                if (successCallback) {
                    setTimeout(successCallback, 1500);
                }
                
                return result;
            } else {
                throw new Error(result.error?.message || 'Operation failed');
            }
        } catch (error) {
            console.error('API Error:', error);
            this.showError(messageElementId, error.message || 'An error occurred. Please try again.');
            this.resetLoading(formId);
            throw error;
        }
    }
}

/**
 * Client Authentication Helper
 */
class ClientAuth {
    static getToken() {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    static isLoggedIn() {
        // Check for both token and clientId to ensure proper authentication
        const hasToken = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
        const hasClientId = !!(localStorage.getItem('clientId') || sessionStorage.getItem('clientId'));
        
        console.log('🔍 ClientAuth.isLoggedIn() check:');
        console.log('🔍 - Has token:', hasToken);
        console.log('🔍 - Has clientId:', hasClientId);
        console.log('🔍 - Result:', hasToken && hasClientId);
        
        return hasToken && hasClientId;
    }

    static getClientData() {
        return {
            id: localStorage.getItem('clientId') || sessionStorage.getItem('clientId'),
            email: localStorage.getItem('clientEmail') || sessionStorage.getItem('clientEmail'),
            name: localStorage.getItem('clientName') || sessionStorage.getItem('clientName'),
            phone: localStorage.getItem('clientPhone') || sessionStorage.getItem('clientPhone')
        };
    }

    static logout() {
        console.log('🚪 ClientAuth.logout() called');
        
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('client_token');
        localStorage.removeItem('clientId');
        localStorage.removeItem('clientEmail');
        localStorage.removeItem('clientName');
        localStorage.removeItem('clientPhone');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('client_token');
        sessionStorage.removeItem('clientId');
        sessionStorage.removeItem('clientEmail');
        sessionStorage.removeItem('clientName');
        sessionStorage.removeItem('clientPhone');
        
        console.log('🧹 All authentication data cleared');
        console.log('🔄 Redirecting to login page...');
        window.location.href = '/login';
    }

    static redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            window.location.href = 'client-dashboard.html';
        }
    }

    static requireAuth() {
        console.log('🔒 ClientAuth.requireAuth() called');
        const isLoggedIn = this.isLoggedIn();
        console.log('🔒 Authentication check result:', isLoggedIn);
        
        if (!isLoggedIn) {
            console.log('❌ User not authenticated, redirecting to login...');
            window.location.href = 'client-login-clean.html';
        } else {
            console.log('✅ User authenticated, allowing access');
        }
    }

    static updateNavigation() {
        const clientPortalLink = document.querySelector('a[href="client-login-clean.html"]');
        if (clientPortalLink && this.isLoggedIn()) {
            const clientData = this.getClientData();
            clientPortalLink.innerHTML = `<i class="fas fa-user mr-1"></i>${clientData.name || 'Dashboard'}`;
            clientPortalLink.href = 'client-dashboard.html';
        }
    }
}

/**
 * Page Utilities
 */
class PageUtils {
    /**
     * Add smooth scrolling to anchor links
     */
    static initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Initialize tooltips
     */
    static initTooltips() {
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'absolute bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg z-50';
                tooltip.textContent = this.getAttribute('data-tooltip');
                tooltip.style.top = this.offsetTop - 30 + 'px';
                tooltip.style.left = this.offsetLeft + 'px';
                document.body.appendChild(tooltip);
                this._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', function() {
                if (this._tooltip) {
                    document.body.removeChild(this._tooltip);
                    this._tooltip = null;
                }
            });
        });
    }

    /**
     * Initialize page animations
     */
    static initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Initialize common page features
     */
    static init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initSmoothScrolling();
            this.initTooltips();
            this.initAnimations();
            ClientAuth.updateNavigation();
        });
    }
}

// Global instances
window.formHandler = new FormHandler();
window.ClientAuth = ClientAuth;
window.AuthManager = ClientAuth; // Alias for compatibility
window.PageUtils = PageUtils;

// Initialize page utilities
PageUtils.init();