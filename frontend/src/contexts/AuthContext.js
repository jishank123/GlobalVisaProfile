import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const emailLogin = async (email, formData, source) => {
    try {
      const response = await authAPI.emailLogin(email, formData, source);
      
      if (response.success) {
        const newToken = response.token || response.data?.token;
        const userData = response.data?.user || response.data;
        
        // Store in state
        setToken(newToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData?.role || 'client');
        
        // For client users, also store as clientToken and clientId for compatibility
        if (userData?.role === 'client') {
          localStorage.setItem('clientToken', newToken);
          localStorage.setItem('clientId', userData.user_id || userData.id || userData._id);
          localStorage.setItem('clientEmail', userData.email);
          localStorage.setItem('clientName', `${userData.first_name} ${userData.last_name || ''}`);
          if (userData.phone) {
            localStorage.setItem('clientPhone', userData.phone);
          }
        }
        
        return response;
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password, isPasswordSetup = false) => {
    try {
      const response = await authAPI.login(email, password, isPasswordSetup);
      
      if (response.success) {
        const newToken = response.token || response.data?.token;
        const userData = response.data?.user || response.data;
        
        // Store in state
        setToken(newToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData?.role || 'client');
        
        // For client users, also store as clientToken and clientId for compatibility
        if (userData?.role === 'client') {
          localStorage.setItem('clientToken', newToken);
          localStorage.setItem('clientId', userData.user_id || userData.id || userData._id);
          localStorage.setItem('clientEmail', userData.email);
          localStorage.setItem('clientName', `${userData.first_name} ${userData.last_name || ''}`);
          if (userData.phone) {
            localStorage.setItem('clientPhone', userData.phone);
          }
        }
        
        return response;
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const managerLogin = async (email, password) => {
    try {
      const response = await authAPI.managerLogin(email, password);
      
      if (response.success) {
        const newToken = response.token || response.data?.token;
        const userData = response.data?.user || response.data;
        
        // Store in state
        setToken(newToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData?.role || 'admin');
        
        return response;
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const newToken = response.token || response.data?.token;
        const newUser = response.data?.user || response.data;
        
        // Store in state
        setToken(newToken);
        setUser(newUser);
        
        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('userRole', newUser?.role || 'client');
        
        return response;
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientEmail');
    localStorage.removeItem('clientName');
    localStorage.removeItem('clientPhone');
    
    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('clientToken');
    sessionStorage.removeItem('clientId');
    sessionStorage.removeItem('clientEmail');
    sessionStorage.removeItem('clientName');
    sessionStorage.removeItem('clientPhone');
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const getCurrentUser = () => {
    return user;
  };

  const getToken = () => {
    return token;
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    emailLogin,
    managerLogin,
    register,
    logout,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    getCurrentUser,
    getToken,
    updateUser,
    setToken,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};