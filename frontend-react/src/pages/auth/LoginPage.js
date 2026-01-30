import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated() && user) {
      const role = user.role;
      let redirectPath = '/';
      
      switch (role) {
        case 'admin':
          redirectPath = '/dashboard/admin';
          break;
        case 'lead_manager':
          redirectPath = '/dashboard/lead-manager';
          break;
        case 'crm_manager':
          redirectPath = '/dashboard/crm-manager';
          break;
        case 'client':
          redirectPath = '/dashboard/client';
          break;
        default:
          redirectPath = '/';
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success) {
        const userData = response.data?.user || response.data;
        setSuccess(`Welcome back, ${userData?.first_name || 'User'}!`);
        
        // Redirect based on role
        setTimeout(() => {
          const role = userData?.role;
          let redirectPath = '/';
          
          switch (role) {
            case 'admin':
              redirectPath = '/dashboard/admin';
              break;
            case 'lead_manager':
              redirectPath = '/dashboard/lead-manager';
              break;
            case 'crm_manager':
              redirectPath = '/dashboard/crm-manager';
              break;
            case 'client':
              redirectPath = '/dashboard/client';
              break;
            default:
              redirectPath = '/';
          }
          
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        setError(response.error?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Connection error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-5">
      <div className="login-container">
        <div className="login-left">
          <h1>Welcome to ImmigrationPro</h1>
          <p>
            Access your personalized dashboard to manage your immigration journey, track progress, and connect with our expert team.
          </p>
          <p>
            Manage leads, clients, projects, and teams all in one place.
          </p>
          <div style={{ marginTop: '40px' }}>
            <p style={{ fontSize: '14px', opacity: '0.8' }}>
              <i className="fas fa-check-circle"></i> Lead Management<br />
              <i className="fas fa-check-circle"></i> CRM Dashboard<br />
              <i className="fas fa-check-circle"></i> Project Tracking<br />
              <i className="fas fa-check-circle"></i> Payment Management
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <h2>Client Sign In</h2>
            <p>Enter your credentials to access your client dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control-custom" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control-custom" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password" 
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4a5568' }}>
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: '#667eea', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                <i className="fas fa-check-circle mr-2"></i>
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i> Sign In
                </>
              )}
            </button>
          </form>

          <div className="footer-links">
            Don't have an account? <Link to="/signup">Sign Up</Link> | 
            <Link to="/manager">Manager Login</Link> | 
            <Link to="/"> Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;