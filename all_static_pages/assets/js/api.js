/**
 * API Utility for Academic ERP Frontend
 * Handles all API calls, authentication, and error handling
 */

// API Base URL - change this for production
const API_BASE_URL = 'http://localhost:5000/api';

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
    window.location.href = '/all_static_pages/login.html';
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
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available
    const token = AuthManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare request config
    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle unauthorized
      if (response.status === 401) {
        AuthManager.logout();
        throw new Error('Session expired. Please login again.');
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
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
    window.location.href = '/all_static_pages/login.html';
    return false;
  }

  if (requiredRoles.length > 0 && !AuthManager.hasAnyRole(requiredRoles)) {
    alert('You do not have permission to access this page');
    window.location.href = '/all_static_pages/index.html';
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
