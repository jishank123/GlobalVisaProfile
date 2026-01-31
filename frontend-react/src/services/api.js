import axios from 'axios';

// API Base URL - configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;
const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging in development
    if (DEBUG_MODE) {
        console.log('🌐 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            headers: config.headers,
            data: config.data
        });
    }

    return config;
}, (error) => {
    if (DEBUG_MODE) {
        console.error('🌐 API Request Error:', error);
    }
    return Promise.reject(error);
});

// Response interceptor to handle errors
apiClient.interceptors.response.use((response) => { // Debug logging in development
    if (DEBUG_MODE) {
        console.log('🌐 API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
    }

    return response.data;
}, (error) => { // Debug logging in development
    if (DEBUG_MODE) {
        console.error('🌐 API Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data
        });
    }

    if (error.response?.status === 401) { // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const basePath = process.env.REACT_APP_BASE_PATH || '/CRM';
        window.location.href = `${basePath}/login`;
    }

    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An error occurred';

    return Promise.reject(new Error(errorMessage));
});

// Authentication API
export const authAPI = {
    login: (email, password, isPasswordSetup = false) => apiClient.post('/auth/login', {email, password, isPasswordSetup}),
    emailLogin: (email, formData, source) => apiClient.post('/auth/email-login', {email, formData, source}),
    managerLogin: (email, password) => apiClient.post('/auth/manager', {email, password}),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getCurrentUser: () => apiClient.get('/auth/me'),
    verifyEmail: (data) => apiClient.post('/auth/verify-email', data),
    forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
    resetPassword: (data) => apiClient.post('/auth/reset-password', data),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    changePassword: (data) => apiClient.put('/auth/change-password', data),
    checkUser: (email) => apiClient.post('/auth/check-user', {email}),
    setupPassword: (email, password, isNewUser) => apiClient.post('/auth/setup-password', {email, password, isNewUser})
};

// Users API
export const usersAPI = {
    getAll: (params) => apiClient.get('/users', {params}),
    getById: (id) => apiClient.get(`/users/${id}`),
    create: (data) => apiClient.post('/users', data),
    update: (id, data) => apiClient.patch(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
    getStats: () => apiClient.get('/users/stats')
};

// Dashboard API
export const dashboardAPI = {
    getData: () => apiClient.get('/dashboard/stats'),
    getFinancialOverview: () => apiClient.get('/dashboard/financial'),
    getActivity: () => apiClient.get('/dashboard/activity')
};

// Services API
export const servicesAPI = {
    getAll: (params) => apiClient.get('/services', {params}),
    getById: (id) => apiClient.get(`/services/${id}`),
    create: (data) => apiClient.post('/services', data),
    update: (id, data) => apiClient.patch(`/services/${id}`, data),
    delete: (id) => apiClient.delete(`/services/${id}`),
    getStats: () => apiClient.get('/services/stats')
};

// Leads API
export const leadsAPI = {
    getAll: (params) => apiClient.get('/leads', {params}),
    getById: (id) => apiClient.get(`/leads/${id}`),
    create: (data) => apiClient.post('/leads', data),
    update: (id, data) => apiClient.patch(`/leads/${id}`, data),
    delete: (id) => apiClient.delete(`/leads/${id}`),
    convertToClient: (id) => apiClient.post(`/leads/${id}/convert`),
    bulkAssign: (data) => apiClient.post('/leads/bulk/assign', data),
    bulkAssignToCRM: (data) => apiClient.post('/leads/bulk/assign-to-crm', data),
    bulkConvertToProject: (data) => apiClient.post('/leads/bulk/convert-to-project', data),
    getStats: () => apiClient.get('/leads/stats/summary')
};

// Projects API
export const projectsAPI = {
    getAll: (params) => apiClient.get('/projects', {params}),
    getById: (id) => apiClient.get(`/projects/${id}`),
    create: (data) => apiClient.post('/projects', data),
    update: (id, data) => apiClient.patch(`/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/projects/${id}`),
    updateProgress: (id, progress) => apiClient.patch(`/projects/${id}`, {progress}),
    handover: (id, data) => apiClient.patch(`/projects/${id}/handover`, data),
    addMilestone: (id, milestoneData) => apiClient.post(`/projects/${id}/milestones`, milestoneData),
    updateMilestone: (id, milestoneId, data) => apiClient.patch(`/projects/${id}/milestones/${milestoneId}`, data),
    getStats: () => apiClient.get('/projects/stats/summary')
};

// Payments API
export const paymentsAPI = {
    getAll: (params) => apiClient.get('/payments', {params}),
    getById: (id) => apiClient.get(`/payments/${id}`),
    create: (data) => apiClient.post('/payments', data),
    update: (id, data) => apiClient.patch(`/payments/${id}`, data),
    delete: (id) => apiClient.delete(`/payments/${id}`),
    verify: (id, data) => apiClient.patch(`/payments/${id}/verify`, data),
    getStats: () => apiClient.get('/payments/stats/summary')
};

// Clients API
export const clientsAPI = {
    getAll: (params) => apiClient.get('/clients', {params}),
    getById: (id) => apiClient.get(`/clients/${id}`),
    create: (data) => apiClient.post('/clients', data),
    update: (id, data) => apiClient.patch(`/clients/${id}`, data),
    delete: (id) => apiClient.delete(`/clients/${id}`),
    assign: (id, managerId) => apiClient.patch(`/clients/${id}/assign`, {managerId}),
    getStats: () => apiClient.get('/clients/stats/summary')
};

// Queries API
export const queriesAPI = {
    getAll: (params) => apiClient.get('/queries', {params}),
    getById: (id) => apiClient.get(`/queries/${id}`),
    create: (data) => apiClient.post('/queries', data),
    update: (id, data) => apiClient.patch(`/queries/${id}`, data),
    delete: (id) => apiClient.delete(`/queries/${id}`),
    addResponse: (id, message, isInternal = false) => apiClient.post(`/queries/${id}/responses`, {message, isInternal})
};

// Profile Assessments API
export const profileAssessmentsAPI = {
    submit: (data) => apiClient.post('/profile-assessments', data),
    getAll: (params) => apiClient.get('/profile-assessments', {params}),
    getById: (id) => apiClient.get(`/profile-assessments/${id}`),
    updateStatus: (id, data) => apiClient.patch(`/profile-assessments/${id}/status`, data),
    addNotes: (id, notes) => apiClient.patch(`/profile-assessments/${id}/notes`, {notes})
};

// Appointments API
export const appointmentsAPI = {
    submit: (data) => apiClient.post('/appointments', data),
    getAll: (params) => apiClient.get('/appointments', {params}),
    getById: (id) => apiClient.get(`/appointments/${id}`),
    updateStatus: (id, data) => apiClient.put(`/appointments/${id}/status`, data),
    schedule: (id, scheduleData) => apiClient.put(`/appointments/${id}/schedule`, scheduleData),
    addCommunication: (id, communicationData) => apiClient.post(`/appointments/${id}/communications`, communicationData)
};

// Contact API
export const contactAPI = {
    submit: (data) => apiClient.post('/contact', data),
    getAll: (params) => apiClient.get('/contact', {params}),
    getById: (id) => apiClient.get(`/contact/${id}`),
    updateStatus: (id, data) => apiClient.patch(`/contact/${id}/status`, data),
    respond: (id, responseData) => apiClient.post(`/contact/${id}/respond`, responseData),
    convertToLead: (id, data) => apiClient.post(`/contact/${id}/convert-to-lead`, data),
    convertToLeads: (data) => apiClient.post('/contact/convert-to-leads', data)
};

// Client Accounts API
export const clientAccountsAPI = {
    checkUserExists: (email) => apiClient.post('/client-accounts/check-user', {email}),
    register: (data) => apiClient.post('/client-accounts/register', data),
    login: (email, password) => apiClient.post('/client-accounts/login', {email, password}),
    getProfile: () => apiClient.get('/client-accounts/profile'),
    updateProfile: (data) => apiClient.put('/client-accounts/profile', data),
    changePassword: (data) => apiClient.put('/client-accounts/change-password', data),
    forgotPassword: (email) => apiClient.post('/client-accounts/forgot-password', {email}),
    resetPassword: (token, password) => apiClient.post('/client-accounts/reset-password', {token, password}),
    verifyEmail: (token) => apiClient.get(`/client-accounts/verify-email/${token}`),
    resendVerification: (email) => apiClient.post('/client-accounts/resend-verification', {email})
};

// Tasks API
export const tasksAPI = {
  getAll: (params) => apiClient.get('/tasks', {params}),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  create: (data) => apiClient.post('/tasks', data),
  update: (id, data) => apiClient.patch(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/tasks/${id}/status`, {status}),
  assign: (id, assignedTo) => apiClient.patch(`/tasks/${id}/assign`, {assignedTo}),
  getStats: () => apiClient.get('/tasks/stats')
};

// Analytics API
export const analyticsAPI = {
    getDashboard: () => apiClient.get('/analytics/dashboard'),
    getRevenue: (params) => apiClient.get('/analytics/revenue', {params}),
    getPerformance: () => apiClient.get('/analytics/performance'),
    getTrends: (params) => apiClient.get('/analytics/trends', {params})
};

// Activity API
export const activityAPI = {
    getAll: (params) => apiClient.get('/activity', {params}),
    getUserActivities: (userId) => apiClient.get(`/activity/user/${userId}`)
};

// Utility functions
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getStatusBadgeClass = (status) => {
    const statusClasses = {
        // Lead statuses
        'new': 'badge-new',
        'contacted': 'badge-contacted',
        'qualified': 'badge-qualified',
        'negotiation': 'badge-negotiation',
        'converted': 'badge-converted',
        'assigned': 'badge-assigned',
        'assigned_to_crm': 'badge-assigned',
        'converted_to_project': 'badge-converted_to_project',
        'lost': 'badge-lost',

        // Project statuses
        'planning': 'badge-new',
        'in_progress': 'badge-contacted',
        'review': 'badge-qualified',
        'project_completed': 'badge-converted',
        'on_hold': 'badge-qualified',

        // Payment statuses
        'pending': 'badge-qualified',
        'failed': 'badge-lost',
        'payment_completed': 'badge-converted',

        // Query statuses
        'open': 'badge-new',
        'waiting': 'badge-qualified',
        'resolved': 'badge-converted',
        'closed': 'badge-assigned',

        // Client statuses
        'active': 'badge-converted',
        'inactive': 'badge-lost'
    };

    return statusClasses[status] || 'badge-assigned';
};

export const getPriorityClass = (priority) => {
    const priorityClasses = {
        'low': 'priority-low',
        'medium': 'priority-medium',
        'high': 'priority-high',
        'urgent': 'priority-high'
    };

    return priorityClasses[priority] || 'priority-medium';
};
