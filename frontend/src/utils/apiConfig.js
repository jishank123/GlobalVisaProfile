/**
 * API Configuration Utility
 * Centralized API URL management to avoid hardcoded URLs throughout the application
 */

// Get API base URL from environment variable
export const getApiBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  
  if (!apiUrl) {
    console.error('❌ REACT_APP_API_URL is not set in environment variables!');
    throw new Error('API_BASE_URL is required. Please set REACT_APP_API_URL in your .env file.');
  }
  
  return apiUrl;
};

// Get backend base URL (without /api suffix)
export const getBackendBaseUrl = () => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('/api', '');
};

// Get frontend URL from environment variable
export const getFrontendUrl = () => {
  return process.env.REACT_APP_FRONTEND_URL || window.location.origin;
};

// Helper to construct full API endpoint
export const getApiEndpoint = (path) => {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Helper to construct static file URL
export const getStaticFileUrl = (path) => {
  const backendUrl = getBackendBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendUrl}${cleanPath}`;
};

export default {
  getApiBaseUrl,
  getBackendBaseUrl,
  getFrontendUrl,
  getApiEndpoint,
  getStaticFileUrl
};
