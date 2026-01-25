/**
 * Unified Dashboard Data System
 * Provides consistent data flow to all dashboard pages
 */

class DashboardDataManager {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        const token = AuthManager?.getToken() || ClientAuth?.getToken() || localStorage.getItem('token') || sessionStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * Make API request with caching
     */
    async apiRequest(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`📋 Using cached data for ${endpoint}`);
            return cached.data;
        }

        try {
            console.log(`🌐 Fetching data from ${endpoint}`);
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.getAuthHeaders(),
                ...options
            });

            const data = await response.json();
            
            if (response.ok) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
                return data;
            } else {
                console.warn(`⚠️ API request failed: ${endpoint}`, data);
                return { success: false, error: data.error || { message: 'Request failed' } };
            }
        } catch (error) {
            console.error(`❌ API request error: ${endpoint}`, error);
            return { success: false, error: { message: error.message } };
        }
    }

    /**
     * Get all profile assessments (for admin/manager dashboards)
     */
    async getAllProfileAssessments() {
        return await this.apiRequest('/profile-assessments');
    }

    /**
     * Get client-specific profile assessments (for client dashboard)
     */
    async getClientProfileAssessments() {
        return await this.apiRequest('/profile-assessments/client');
    }

    /**
     * Get contact form submissions
     */
    async getContactSubmissions() {
        return await this.apiRequest('/contact');
    }

    /**
     * Get client accounts (for admin/manager dashboards)
     */
    async getClientAccounts() {
        return await this.apiRequest('/client-accounts');
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        try {
            const [assessments, contacts, clients] = await Promise.all([
                this.getAllProfileAssessments(),
                this.getContactSubmissions(),
                this.getClientAccounts()
            ]);

            const assessmentData = assessments.success ? assessments.data.assessments || [] : [];
            const contactData = contacts.success ? contacts.data || [] : [];
            const clientData = clients.success ? clients.data || [] : [];

            return {
                totalAssessments: assessmentData.length,
                strongProfiles: assessmentData.filter(a => a.overall_score >= 70).length,
                moderateProfiles: assessmentData.filter(a => a.overall_score >= 40 && a.overall_score < 70).length,
                weakProfiles: assessmentData.filter(a => a.overall_score < 40).length,
                totalContacts: contactData.length,
                newContacts: contactData.filter(c => c.status === 'new' || !c.status).length,
                totalClients: clientData.length,
                activeClients: clientData.filter(c => c.account_status === 'active').length,
                recentAssessments: assessmentData.slice(0, 5),
                recentContacts: contactData.slice(0, 5)
            };
        } catch (error) {
            console.error('❌ Error getting dashboard stats:', error);
            return {
                totalAssessments: 0,
                strongProfiles: 0,
                moderateProfiles: 0,
                weakProfiles: 0,
                totalContacts: 0,
                newContacts: 0,
                totalClients: 0,
                activeClients: 0,
                recentAssessments: [],
                recentContacts: []
            };
        }
    }

    /**
     * Get client-specific statistics
     */
    async getClientStats() {
        try {
            const assessments = await this.getClientProfileAssessments();
            const assessmentData = assessments.success ? assessments.data || [] : [];

            return {
                totalCases: assessmentData.length,
                activeCases: assessmentData.filter(a => a.status !== 'archived').length,
                completedCases: assessmentData.filter(a => a.overall_score >= 70).length,
                averageScore: assessmentData.length > 0 
                    ? Math.round(assessmentData.reduce((sum, a) => sum + (a.overall_score || 0), 0) / assessmentData.length)
                    : 0,
                recentAssessments: assessmentData.slice(0, 3)
            };
        } catch (error) {
            console.error('❌ Error getting client stats:', error);
            return {
                totalCases: 0,
                activeCases: 0,
                completedCases: 0,
                averageScore: 0,
                recentAssessments: []
            };
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Dashboard data cache cleared');
    }

    /**
     * Refresh all data
     */
    async refreshData() {
        this.clearCache();
        console.log('🔄 Refreshing dashboard data...');
        
        // Pre-load common data
        await Promise.all([
            this.getAllProfileAssessments(),
            this.getContactSubmissions(),
            this.getDashboardStats()
        ]);
        
        console.log('✅ Dashboard data refreshed');
    }
}

/**
 * Dashboard UI Helper Functions
 */
class DashboardUI {
    /**
     * Show loading state for an element
     */
    static showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`;
        }
    }

    /**
     * Update stat card
     */
    static updateStatCard(elementId, value, animate = true) {
        const element = document.getElementById(elementId);
        if (element) {
            if (animate && !isNaN(value)) {
                this.animateNumber(element, 0, value, 1000);
            } else {
                element.textContent = value;
            }
        }
    }

    /**
     * Animate number counting
     */
    static animateNumber(element, start, end, duration) {
        const startTime = Date.now();
        const range = end - start;

        function updateNumber() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (range * progress));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        updateNumber();
    }

    /**
     * Create status badge HTML
     */
    static createStatusBadge(status) {
        const statusMap = {
            'new': 'bg-yellow-100 text-yellow-800',
            'reviewed': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-purple-100 text-purple-800',
            'converted': 'bg-green-100 text-green-800',
            'archived': 'bg-gray-100 text-gray-800'
        };
        
        const colorClass = statusMap[status?.toLowerCase()] || statusMap['new'];
        return `<span class="px-2 py-1 ${colorClass} rounded-full text-xs font-semibold">${status || 'New'}</span>`;
    }

    /**
     * Create score badge HTML
     */
    static createScoreBadge(score) {
        let colorClass = 'text-gray-600';
        if (score >= 80) colorClass = 'text-green-600';
        else if (score >= 60) colorClass = 'text-blue-600';
        else if (score >= 40) colorClass = 'text-yellow-600';
        else colorClass = 'text-red-600';
        
        return `<span class="font-bold ${colorClass}">${score}%</span>`;
    }

    /**
     * Format date
     */
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    /**
     * Format date and time
     */
    static formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    /**
     * Show notification
     */
    static showNotification(message, type = 'info', duration = 5000) {
        const notificationArea = document.getElementById('notification-area') || document.body;
        const notification = document.createElement('div');
        
        const typeClasses = {
            'success': 'bg-green-100 border-green-400 text-green-700',
            'error': 'bg-red-100 border-red-400 text-red-700',
            'warning': 'bg-yellow-100 border-yellow-400 text-yellow-700',
            'info': 'bg-blue-100 border-blue-400 text-blue-700'
        };
        
        notification.className = `fixed top-4 right-4 border-l-4 p-4 rounded-lg ${typeClasses[type]} mb-4 z-50 max-w-md shadow-lg`;
        notification.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
}

// Global instances
window.dashboardData = new DashboardDataManager();
window.DashboardUI = DashboardUI;

// Auto-refresh data every 30 seconds
setInterval(() => {
    if (window.dashboardData) {
        window.dashboardData.refreshData();
    }
}, 30000);

console.log('📊 Dashboard Data System initialized');