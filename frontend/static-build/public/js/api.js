/**
 * API Utility for Academic ERP Frontend
 * Handles all API calls, authentication, and error handling
 */

// API Base URL - change this for production
const API_BASE_URL = 'https://backend.immigrationprofile.com/api';

// ============================================
// Authentication Management
// ============================================

const AuthManager = {
  /**
   * Get JWT token from localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Set JWT token in localStorage
   */
  setToken(token) {
    localStorage.setItem('token', token);
  },

  /**
   * Remove JWT token from localStorage
   */
  removeToken() {
    localStorage.removeItem('token');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Set current user in localStorage
   */
  setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  /**
   * Remove current user from localStorage
   */
  removeCurrentUser() {
    localStorage.removeItem('currentUser');
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  },

  /**
   * Logout user
   */
  logout() {
    this.removeToken();
    this.removeCurrentUser();
    window.location.href = '/login';
  }
};

// ============================================
// API Request Handler
// ============================================

const API = {
  /**
   * Make an API request
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('\n🌐 === API REQUEST ===');
    console.log('🌐 URL:', url);
    console.log('🌐 Method:', options.method || 'GET');
    console.log('🌐 Endpoint:', endpoint);
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available
    const token = AuthManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🌐 Auth token added to headers');
    } else {
      console.log('🌐 No auth token available');
    }
    
    console.log('🌐 Headers:', headers);

    // Prepare request config
    const config = {
      ...options,
      headers
    };
    
    if (options.body) {
      console.log('🌐 Request body:', options.body);
    }

    try {
      console.log('🌐 Sending fetch request...');
      const response = await fetch(url, config);
      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🌐 Response data:', data);

      // Handle unauthorized
      if (response.status === 401) {
        console.log('🌐 Unauthorized - logging out user');
        AuthManager.logout();
        throw new Error('Session expired. Please login again.');
      }

      // Handle other errors
      if (!response.ok) {
        console.log('🌐 Request failed with status:', response.status);
        const errorMessage = data.message || data.error?.message || 'Request failed';
        console.log('🌐 Error message:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('🌐 Request successful');
      console.log('🌐 === API REQUEST COMPLETED ===\n');
      return data;
    } catch (error) {
      console.error('🌐 === API REQUEST ERROR ===');
      console.error('🌐 Error:', error);
      console.error('🌐 Error message:', error.message);
      console.log('🌐 === API REQUEST ERROR END ===\n');
      throw error;
    }
  },

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    // Convert params to query string
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  },

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
};

// ============================================
// Authentication API
// ============================================

const AuthAPI = {
  /**
   * Login user
   */
  async login(email, password) {
    const response = await API.post('/auth/login', { email, password });
    
    if (response.success && response.token) {
      AuthManager.setToken(response.token);
      AuthManager.setCurrentUser(response.data.user);
    }
    
    return response;
  },

  /**
   * Register user
   */
  async register(userData) {
    const response = await API.post('/auth/register', userData);
    
    if (response.success && response.token) {
      AuthManager.setToken(response.token);
      AuthManager.setCurrentUser(response.data.user);
    }
    
    return response;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthManager.logout();
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return await API.get('/auth/me');
  }
};

// ============================================
// Users API
// ============================================

const UsersAPI = {
  getAll(params) {
    return API.get('/users', params);
  },

  getById(id) {
    return API.get(`/users/${id}`);
  },

  create(data) {
    return API.post('/users', data);
  },

  update(id, data) {
    return API.patch(`/users/${id}`, data);
  },

  delete(id) {
    return API.delete(`/users/${id}`);
  }
};

// ============================================
// Leads API
// ============================================

const LeadsAPI = {
  getAll(params) {
    return API.get('/leads', params);
  },

  getById(id) {
    return API.get(`/leads/${id}`);
  },

  create(data) {
    return API.post('/leads', data);
  },

  update(id, data) {
    return API.patch(`/leads/${id}`, data);
  },

  delete(id) {
    return API.delete(`/leads/${id}`);
  },

  convertToClient(id) {
    return API.post(`/leads/${id}/convert`);
  }
};

// ============================================
// Clients API
// ============================================

const ClientsAPI = {
  getAll(params) {
    return API.get('/clients', params);
  },

  getById(id) {
    return API.get(`/clients/${id}`);
  },

  create(data) {
    return API.post('/clients', data);
  },

  update(id, data) {
    return API.patch(`/clients/${id}`, data);
  },

  delete(id) {
    return API.delete(`/clients/${id}`);
  },

  assign(id, managerId) {
    return API.patch(`/clients/${id}/assign`, { managerId });
  },

  getStats() {
    return API.get('/clients/stats/summary');
  }
};

// ============================================
// Projects API
// ============================================

const ProjectsAPI = {
  getAll(params) {
    return API.get('/projects', params);
  },

  getById(id) {
    return API.get(`/projects/${id}`);
  },

  create(data) {
    return API.post('/projects', data);
  },

  update(id, data) {
    return API.patch(`/projects/${id}`, data);
  },

  delete(id) {
    return API.delete(`/projects/${id}`);
  },

  updateProgress(id, progress) {
    return API.patch(`/projects/${id}/progress`, { progress });
  },

  addMilestone(id, milestone) {
    return API.post(`/projects/${id}/milestones`, milestone);
  },

  updateMilestone(id, milestoneId, data) {
    return API.patch(`/projects/${id}/milestones/${milestoneId}`, data);
  },

  getStats() {
    return API.get('/projects/stats/summary');
  }
};

// ============================================
// Payments API
// ============================================

const PaymentsAPI = {
  getAll(params) {
    return API.get('/payments', params);
  },

  getById(id) {
    return API.get(`/payments/${id}`);
  },

  create(data) {
    return API.post('/payments', data);
  },

  update(id, data) {
    return API.patch(`/payments/${id}`, data);
  },

  delete(id) {
    return API.delete(`/payments/${id}`);
  },

  getStats() {
    return API.get('/payments/stats/summary');
  }
};

// ============================================
// Queries API
// ============================================

const QueriesAPI = {
  getAll(params) {
    return API.get('/queries', params);
  },

  getById(id) {
    return API.get(`/queries/${id}`);
  },

  create(data) {
    return API.post('/queries', data);
  },

  update(id, data) {
    return API.patch(`/queries/${id}`, data);
  },

  delete(id) {
    return API.delete(`/queries/${id}`);
  },

  addResponse(id, message, isInternal = false) {
    return API.post(`/queries/${id}/responses`, { message, isInternal });
  },

  getStats() {
    return API.get('/queries/stats/summary');
  }
};

// ============================================
// Services API
// ============================================

const ServicesAPI = {
  getAll(params) {
    return API.get('/services', params);
  },

  getById(id) {
    return API.get(`/services/${id}`);
  },

  create(data) {
    return API.post('/services', data);
  },

  update(id, data) {
    return API.patch(`/services/${id}`, data);
  },

  delete(id) {
    return API.delete(`/services/${id}`);
  }
};

// ============================================
// Documents API
// ============================================

const DocumentsAPI = {
  getAll(params) {
    return API.get('/documents', params);
  },

  getById(id) {
    return API.get(`/documents/${id}`);
  },

  create(data) {
    return API.post('/documents', data);
  },

  update(id, data) {
    return API.patch(`/documents/${id}`, data);
  },

  delete(id) {
    return API.delete(`/documents/${id}`);
  },

  trackDownload(id) {
    return API.post(`/documents/${id}/download`);
  },

  getStats() {
    return API.get('/documents/stats/summary');
  }
};

// ============================================
// Analytics API
// ============================================

const AnalyticsAPI = {
  getDashboard() {
    return API.get('/analytics/dashboard');
  },

  getRevenue(params) {
    return API.get('/analytics/revenue', params);
  },

  getPerformance() {
    return API.get('/analytics/performance');
  },

  getTrends(params) {
    return API.get('/analytics/trends', params);
  }
};

// ============================================
// Profile Assessments API
// ============================================

const ProfileAssessmentsAPI = {
  /**
   * Submit profile assessment
   */
  async submit(assessmentData) {
    return await API.post('/profile-assessments', assessmentData);
  },

  /**
   * Get all profile assessments (admin)
   */
  getAll(params) {
    return API.get('/profile-assessments', params);
  },

  /**
   * Get profile assessment by ID
   */
  getById(id) {
    return API.get(`/profile-assessments/${id}`);
  },

  /**
   * Update assessment status
   */
  updateStatus(id, data) {
    return API.patch(`/profile-assessments/${id}/status`, data);
  },

  /**
   * Add notes to assessment
   */
  addNotes(id, notes) {
    return API.patch(`/profile-assessments/${id}/notes`, { notes });
  }
};

// ============================================
// Appointments API
// ============================================

const AppointmentsAPI = {
  /**
   * Submit appointment request
   */
  async submit(appointmentData) {
    console.log('\n🌐 === API CALL: AppointmentsAPI.submit ===');
    console.log('🌐 Appointment data:', appointmentData);
    
    try {
      const response = await API.post('/appointments', appointmentData);
      console.log('🌐 Appointment response:', response);
      return response;
    } catch (error) {
      console.error('🌐 Appointment submission error:', error);
      throw error;
    }
  },

  /**
   * Get all appointment requests (admin)
   */
  getAll(params) {
    return API.get('/appointments', params);
  },

  /**
   * Get appointment by ID
   */
  getById(id) {
    return API.get(`/appointments/${id}`);
  },

  /**
   * Update appointment status
   */
  updateStatus(id, data) {
    return API.put(`/appointments/${id}/status`, data);
  },

  /**
   * Schedule appointment
   */
  schedule(id, scheduleData) {
    return API.put(`/appointments/${id}/schedule`, scheduleData);
  },

  /**
   * Add communication
   */
  addCommunication(id, communicationData) {
    return API.post(`/appointments/${id}/communications`, communicationData);
  }
};

// ============================================
// Contact Forms API
// ============================================

const ContactAPI = {
  /**
   * Submit contact form
   */
  async submit(contactData) {
    return await API.post('/contact', contactData);
  },

  /**
   * Get all contact forms (admin)
   */
  getAll(params) {
    return API.get('/contact', params);
  },

  /**
   * Get contact form by ID
   */
  getById(id) {
    return API.get(`/contact/${id}`);
  },

  /**
   * Update contact form status
   */
  updateStatus(id, data) {
    return API.patch(`/contact/${id}/status`, data);
  },

  /**
   * Respond to contact form
   */
  respond(id, responseData) {
    return API.post(`/contact/${id}/respond`, responseData);
  }
};

// ============================================
// Client Accounts API
// ============================================

const ClientAccountsAPI = {
  /**
   * Check if user exists by email
   */
  async checkUserExists(email) {
    console.log('\n🌐 === API CALL: ClientAccountsAPI.checkUserExists ===');
    console.log('🌐 Email:', email);
    
    try {
      const response = await API.post('/client-accounts/check-user', { email });
      console.log('🌐 Check user response:', response);
      return response;
    } catch (error) {
      console.error('🌐 Check user error:', error);
      throw error;
    }
  },

  /**
   * Register new client account
   */
  async register(registrationData) {
    const response = await API.post('/client-accounts/register', registrationData);
    
    if (response.success && response.data.token) {
      AuthManager.setToken(response.data.token);
      // Store client-specific data
      const client = response.data.client;
      localStorage.setItem('clientId', client._id);
      localStorage.setItem('clientEmail', client.email);
      localStorage.setItem('clientName', client.full_name);
      if (client.phone) localStorage.setItem('clientPhone', client.phone);
    }
    
    return response;
  },

  /**
   * Login client
   */
  async login(email, password) {
    console.log('\n🌐 === API CALL: ClientAccountsAPI.login ===');
    console.log('🌐 Email:', email);
    console.log('🌐 Password provided:', password ? 'YES' : 'NO');
    console.log('🌐 API endpoint:', `${API_BASE_URL}/client-accounts/login`);
    
    try {
      const startTime = Date.now();
      console.log('🌐 Making POST request...');
      
      const response = await API.post('/client-accounts/login', { email, password });
      
      const endTime = Date.now();
      console.log(`🌐 Request completed in ${endTime - startTime}ms`);
      console.log('🌐 Response received:', {
        success: response.success,
        hasToken: response.data?.token ? 'YES' : 'NO',
        hasClient: response.data?.client ? 'YES' : 'NO',
        clientId: response.data?.client?._id,
        clientEmail: response.data?.client?.email
      });
      
      if (response.success && response.data.token) {
        console.log('🌐 Storing authentication data...');
        AuthManager.setToken(response.data.token);
        // Store client-specific data
        const client = response.data.client;
        localStorage.setItem('clientId', client._id);
        localStorage.setItem('clientEmail', client.email);
        localStorage.setItem('clientName', client.full_name);
        if (client.phone) localStorage.setItem('clientPhone', client.phone);
        console.log('🌐 Authentication data stored successfully');
      }
      
      console.log('🌐 === API CALL COMPLETED ===\n');
      return response;
      
    } catch (error) {
      console.error('🌐 === API CALL ERROR ===');
      console.error('🌐 Error message:', error.message);
      console.error('🌐 Error stack:', error.stack);
      console.error('🌐 Full error:', error);
      console.log('🌐 === API CALL ERROR END ===\n');
      throw error;
    }
  },

  /**
   * Get client profile
   */
  getProfile() {
    return API.get('/client-accounts/profile');
  },

  /**
   * Update client profile
   */
  updateProfile(profileData) {
    return API.put('/client-accounts/profile', profileData);
  },

  /**
   * Change password
   */
  changePassword(passwordData) {
    return API.put('/client-accounts/change-password', passwordData);
  },

  /**
   * Forgot password
   */
  forgotPassword(email) {
    return API.post('/client-accounts/forgot-password', { email });
  },

  /**
   * Reset password
   */
  resetPassword(token, password) {
    return API.post('/client-accounts/reset-password', { token, password });
  },

  /**
   * Verify email
   */
  verifyEmail(token) {
    return API.get(`/client-accounts/verify-email/${token}`);
  },

  /**
   * Resend verification email
   */
  resendVerification(email) {
    return API.post('/client-accounts/resend-verification', { email });
  },

  /**
   * Logout client
   */
  logout() {
    AuthManager.removeToken();
    localStorage.removeItem('client_token');
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('clientName');
    localStorage.removeItem('clientPhone');
    sessionStorage.removeItem('client_token');
    sessionStorage.removeItem('clientId');
    sessionStorage.removeItem('clientEmail');
    sessionStorage.removeItem('clientName');
    sessionStorage.removeItem('clientPhone');
    window.location.href = '/login';
  }
};

// ============================================
// UI Helper Functions
// ============================================

const UIHelpers = {
  /**
   * Show loading spinner
   */
  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading...</p>
        </div>
      `;
    }
  },

  /**
   * Show error message
   */
  showError(message, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle"></i>
          ${message}
        </div>
      `;
    } else {
      alert(message);
    }
  },

  /**
   * Show success toast
   */
  showSuccess(message) {
    // If Bootstrap toast is available
    const toastContainer = document.getElementById('toastContainer');
    if (toastContainer) {
      const toastHtml = `
        <div class="toast align-items-center text-white bg-success border-0" role="alert">
          <div class="d-flex">
            <div class="toast-body">
              <i class="fas fa-check-circle"></i> ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      `;
      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      const toastElement = toastContainer.lastElementChild;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    } else {
      alert(message);
    }
  },

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * Format date
   */
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format date and time
   */
  formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Get status badge HTML
   */
  getStatusBadge(status) {
    const statusColors = {
      // Lead statuses
      'new': 'primary',
      'contacted': 'info',
      'qualified': 'warning',
      'negotiation': 'secondary',
      'converted': 'success',
      'lost': 'danger',
      
      // Project statuses
      'planning': 'secondary',
      'in_progress': 'info',
      'review': 'warning',
      'completed': 'success',
      'on_hold': 'warning',
      
      // Payment statuses
      'pending': 'warning',
      'failed': 'danger',
      
      // Query statuses
      'open': 'primary',
      'waiting': 'warning',
      'resolved': 'success',
      'closed': 'secondary',
      
      // Client statuses
      'active': 'success',
      'inactive': 'danger'
    };

    const color = statusColors[status] || 'secondary';
    const label = status.replace(/_/g, ' ').toUpperCase();
    
    return `<span class="badge bg-${color}">${label}</span>`;
  },

  /**
   * Get priority badge HTML
   */
  getPriorityBadge(priority) {
    const colors = {
      'low': 'secondary',
      'medium': 'info',
      'high': 'warning',
      'urgent': 'danger'
    };

    const color = colors[priority] || 'secondary';
    const label = priority.toUpperCase();
    
    return `<span class="badge bg-${color}">${label}</span>`;
  }
};

// ============================================
// Page Protection
// ============================================

/**
 * Protect a page - redirect to login if not authenticated
 */
function protectPage(requiredRoles = []) {
  if (!AuthManager.isLoggedIn()) {
    window.location.href = 'client-login-clean.html';
    return false;
  }

  if (requiredRoles.length > 0 && !AuthManager.hasAnyRole(requiredRoles)) {
    alert('You do not have permission to access this page');
    window.location.href = 'index.html';
    return false;
  }

  return true;
}

/**
 * Update user profile display in navbar
 */
function updateUserProfile() {
  const user = AuthManager.getCurrentUser();
  if (user) {
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userRoleElement = document.getElementById('userRole');

    if (userNameElement) userNameElement.textContent = user.name;
    if (userEmailElement) userEmailElement.textContent = user.email;
    if (userRoleElement) userRoleElement.textContent = user.role.replace(/_/g, ' ').toUpperCase();
  }
}

// Initialize user profile on page load
document.addEventListener('DOMContentLoaded', () => {
  if (AuthManager.isLoggedIn()) {
    updateUserProfile();
  }
});
