import axios from 'axios';

// API Base URL - configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL;
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;
const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

// Validate that API_BASE_URL is set
if (!API_BASE_URL) {
    console.error('❌ REACT_APP_API_URL is not set in environment variables!');
    throw new Error('API_BASE_URL is required. Please set REACT_APP_API_URL in your .env file.');
}

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

    return config;
}, (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
});

// Response interceptor to handle errors
apiClient.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    // Only redirect on 401 if it's NOT a login attempt
    if (error.response?.status === 401) {
        const isLoginAttempt = error.config?.url?.includes('/auth/login') || 
                              error.config?.url?.includes('/auth/manager') ||
                              error.config?.url?.includes('/auth/email-login');
        
        if (!isLoginAttempt) {
            // Token expired or invalid for authenticated requests
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const basePath = process.env.REACT_APP_BASE_PATH || '/CRM';
            window.location.href = `${basePath}/login`;
        }
    }

    const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An error occurred';
    const errorCode = error.response?.data?.error?.code || null;
    
    // Create error object with both message and code, and preserve full response
    const errorObj = new Error(errorMessage);
    errorObj.code = errorCode;
    errorObj.response = error.response; // Preserve full response for detailed error handling

    return Promise.reject(errorObj);
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
    checkEmail: (email) => apiClient.post('/auth/check-email', {email}),
    setupPassword: (email, password, isNewUser) => apiClient.post('/auth/setup-password', {email, password, isNewUser})
};

// Users API
export const usersAPI = {
    getAll: (params) => apiClient.get('/users', {params}),
    getById: (id) => apiClient.get(`/users/${id}`),
    create: (data) => apiClient.post('/users', data),
    update: (id, data) => apiClient.patch(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
    permanentDelete: (id) => apiClient.delete(`/users/${id}/permanent`),
    getDeleted: () => apiClient.get('/users/deleted'),
    restore: (id) => apiClient.patch(`/users/${id}/restore`),
    getStats: () => apiClient.get('/users/stats')
};

// Dashboard API
export const dashboardAPI = {
    getData: () => apiClient.get('/dashboard/stats'),
    getFinancialOverview: () => apiClient.get('/dashboard/financial'),
    getActivity: () => apiClient.get('/dashboard/activity'),
    getRecentActivity: () => apiClient.get('/dashboard/activity'),
    getCrmStats: () => apiClient.get('/dashboard/crm-stats'),
    getCrmActivity: () => apiClient.get('/dashboard/crm-activity')
};

// Services API
export const servicesAPI = {
    getAll: (params) => apiClient.get('/services', {params}),
    getById: (id) => apiClient.get(`/services/${id}`),
    create: (data) => apiClient.post('/services', data),
    update: (id, data) => apiClient.patch(`/services/${id}`, data),
    toggleStatus: (id) => apiClient.patch(`/services/${id}/toggle-status`),
    delete: (id) => apiClient.delete(`/services/${id}`),
    permanentDelete: (id) => apiClient.delete(`/services/${id}/permanent`),
    getDeleted: () => apiClient.get('/services/deleted'),
    restore: (id) => apiClient.patch(`/services/${id}/restore`),
    getStats: () => apiClient.get('/services/stats')
};

// Leads API
export const leadsAPI = {
    getAll: (params) => apiClient.get('/leads', {params}),
    getById: (id) => apiClient.get(`/leads/${id}`),
    create: (data) => apiClient.post('/leads', data),
    update: (id, data) => apiClient.patch(`/leads/${id}`, data),
    patch: (endpoint, data) => apiClient.patch(`/leads/${endpoint}`, data),
    delete: (id) => apiClient.delete(`/leads/${id}`),
    permanentDelete: (id) => apiClient.delete(`/leads/${id}/permanent`),
    getDeleted: () => apiClient.get('/leads/deleted'),
    restore: (id) => apiClient.patch(`/leads/${id}/restore`),
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
    purchase: (formData) => { // Handle FormData for file uploads
        return apiClient.post('/projects/purchase', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    update: (id, data) => apiClient.patch(`/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/projects/${id}`),
    permanentDelete: (id) => apiClient.delete(`/projects/${id}/permanent`),
    getDeleted: () => apiClient.get('/projects/deleted'),
    restore: (id) => apiClient.patch(`/projects/${id}/restore`),
    updateProgress: (id, progress) => apiClient.patch(`/projects/${id}`, {progress}),
    handover: (id, data) => apiClient.patch(`/projects/${id}/handover`, data),
    addMilestone: (id, milestoneData) => apiClient.post(`/projects/${id}/milestones`, milestoneData),
    updateMilestone: (id, milestoneId, data) => apiClient.patch(`/projects/${id}/milestones/${milestoneId}`, data),
    getStats: () => apiClient.get('/projects/stats/summary'),
    getMyCreatedProjects: (params) => apiClient.get('/projects/my-created-projects', {params}),
    getMyProjects: (params) => apiClient.get('/projects/my-projects', {params})
};

// Payments API
export const paymentsAPI = {
    getAll: (params) => apiClient.get('/payments', {params}),
    getAllForAdmin: (params) => apiClient.get('/payments/admin/all', {params}),
    getPendingVerification: (params) => apiClient.get('/payments/pending-verification', {params}),
    getById: (id) => apiClient.get(`/payments/${id}`),
    create: (data) => apiClient.post('/payments', data),
    update: (id, data) => apiClient.patch(`/payments/${id}`, data),
    delete: (id) => apiClient.delete(`/payments/${id}`),
    permanentDelete: (id) => apiClient.delete(`/payments/${id}/permanent`),
    getDeleted: () => apiClient.get('/payments/deleted'),
    restore: (id) => apiClient.patch(`/payments/${id}/restore`),
    verify: (id, data) => apiClient.patch(`/payments/${id}/verify`, data),
    generateInvoice: (id) => apiClient.post(`/payments/${id}/invoice`),
    getStats: () => apiClient.get('/payments/stats/summary')
};

// Clients API
export const clientsAPI = {
    getAll: (params) => apiClient.get('/clients', {params}),
    getById: (id) => apiClient.get(`/clients/${id}`),
    create: (data) => apiClient.post('/clients', data),
    update: (id, data) => apiClient.patch(`/clients/${id}`, data),
    delete: (id) => apiClient.delete(`/clients/${id}`),
    permanentDelete: (id) => apiClient.delete(`/clients/${id}/permanent`),
    getDeleted: () => apiClient.get('/clients/deleted'),
    restore: (id) => apiClient.patch(`/clients/${id}/restore`),
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
    permanentDelete: (id) => apiClient.delete(`/queries/${id}/permanent`),
    getDeleted: () => apiClient.get('/queries/deleted'),
    restore: (id) => apiClient.patch(`/queries/${id}/restore`),
    addResponse: (id, message, isInternal = false) => apiClient.post(`/queries/${id}/responses`, {message, isInternal})
};

// Profile Assessments API
export const profileAssessmentsAPI = {
    submit: (data) => apiClient.post('/profile-assessments', data),
    getAll: (params) => apiClient.get('/profile-assessments', {params}),
    getById: (id) => apiClient.get(`/profile-assessments/${id}`),
    getByEmail: (email, assessmentId) => apiClient.post('/profile-assessments/by-email', {email, assessmentId}),
    getClientAssessments: () => apiClient.get('/profile-assessments/client'),
    updateStatus: (id, data) => apiClient.patch(`/profile-assessments/${id}/status`, data),
    addNotes: (id, notes) => apiClient.patch(`/profile-assessments/${id}/notes`, {notes}),
    convertToLead: (id, data) => apiClient.post(`/profile-assessments/${id}/convert-to-lead`, data)
};

// Appointments API
export const appointmentsAPI = {
    submit: (data) => apiClient.post('/appointments', data),
    getAll: (params) => apiClient.get('/appointments', {params}),
    getById: (id) => apiClient.get(`/appointments/${id}`),
    updateStatus: (id, data) => apiClient.put(`/appointments/${id}/status`, data),
    schedule: (id, scheduleData) => apiClient.put(`/appointments/${id}/schedule`, scheduleData),
    addCommunication: (id, communicationData) => apiClient.post(`/appointments/${id}/communications`, communicationData),
    getMyCreatedAppointments: (params) => apiClient.get('/appointments/my-created-appointments', {params})
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

// Newsletter API
export const newsletterAPI = {
    subscribe: (email) => apiClient.post('/newsletter/subscribe', {email}),
    unsubscribe: (email) => apiClient.post('/newsletter/unsubscribe', {email}),
    getSubscribers: (params) => apiClient.get('/newsletter/subscribers', {params}),
    getCount: () => apiClient.get('/newsletter/count')
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
    getStats: () => apiClient.get('/tasks/stats'),
    uploadFiles: (taskId, formData) => apiClient.post(`/tasks/${taskId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
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
    getUserActivities: (userId) => apiClient.get(`/activity/user/${userId}`),
    getRecent: (limit = 10) => apiClient.get('/activity/recent', { params: { limit } })
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

// CRM Manager specific API endpoints
export const crmAPI = {
    // Dashboard stats for CRM managers
    getStats: () => apiClient.get('/dashboard/crm-stats'),
    getActivity: () => apiClient.get('/dashboard/crm-activity'),

    // Projects assigned to CRM manager
    getMyProjects: (params) => apiClient.get('/projects/my-projects', {params}),
    updateProjectStatus: (id, status) => apiClient.patch(`/projects/${id}`, {status}), // Fixed: use general update endpoint
    updateProjectProgress: (id, progress) => apiClient.patch(`/projects/${id}/progress`, {progress}),

    // Tasks for CRM manager
    getMyTasks: (params) => apiClient.get('/tasks/my-tasks', {params}),
    createTask: (data) => apiClient.post('/tasks', data),
    updateTask: (id, data) => apiClient.patch(`/tasks/${id}`, data),
    updateTaskStatus: (id, status) => apiClient.patch(`/tasks/${id}/status`, {status}),

    // Queries assigned to CRM manager
    getMyQueries: (params) => apiClient.get('/queries/my-queries', {params}),
    respondToQuery: (id, responseData) => apiClient.post(`/queries/${id}/respond`, responseData),
    updateQueryStatus: (id, status) => apiClient.patch(`/queries/${id}/status`, {status}),

    // Appointments for CRM manager
    getMyAppointments: (params) => apiClient.get('/appointments/my-appointments', {params}),
    createAppointment: (data) => apiClient.post('/appointments', data),
    scheduleAppointment: (id, scheduleData) => apiClient.patch(`/appointments/${id}/schedule`, scheduleData),
    updateAppointmentStatus: (id, status) => apiClient.patch(`/appointments/${id}/status`, {status}),

    // Payments for CRM manager's projects
    getMyPayments: (params) => apiClient.get('/payments/my-payments', {params}),
    createPayment: (data) => apiClient.post('/payments', data),
    uploadReceipt: (id, receiptData) => apiClient.post(`/payments/${id}/receipt`, receiptData)
};

// Update existing API objects to include CRM-specific methods
projectsAPI.getMyProjects = crmAPI.getMyProjects;
projectsAPI.updateStatus = crmAPI.updateProjectStatus;
projectsAPI.updateProgress = crmAPI.updateProjectProgress;

// Add PM-specific methods
projectsAPI.getMyPMProjects = (params) => apiClient.get('/projects/my-pm-projects', {params});

// Add task-related methods to projectsAPI
projectsAPI.getMyTasks = crmAPI.getMyTasks;
projectsAPI.createTask = crmAPI.createTask;
projectsAPI.updateTask = crmAPI.updateTask;
projectsAPI.updateTaskStatus = crmAPI.updateTaskStatus;
projectsAPI.uploadTaskFiles = tasksAPI.uploadFiles;

queriesAPI.getMyQueries = crmAPI.getMyQueries;
queriesAPI.addResponse = crmAPI.respondToQuery;
queriesAPI.updateStatus = crmAPI.updateQueryStatus;

appointmentsAPI.getMyAppointments = crmAPI.getMyAppointments;
appointmentsAPI.create = crmAPI.createAppointment;
appointmentsAPI.schedule = crmAPI.scheduleAppointment;
appointmentsAPI.updateStatus = crmAPI.updateAppointmentStatus;

paymentsAPI.getMyPayments = crmAPI.getMyPayments;
paymentsAPI.create = crmAPI.createPayment;

tasksAPI.getMyTasks = crmAPI.getMyTasks;
tasksAPI.create = crmAPI.createTask;
tasksAPI.update = crmAPI.updateTask;
tasksAPI.updateStatus = crmAPI.updateTaskStatus;

dashboardAPI.getCrmStats = crmAPI.getStats;
dashboardAPI.getCrmActivity = crmAPI.getActivity;
