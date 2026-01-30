import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ValidatedInput, PasswordInput } from '../../components/FormComponents';
import { validateEmail } from '../../utils/validation';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const { login, emailLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated() && user) {
      const role = user.role;
      
      // If user is a manager, redirect to manager login
      if (['admin', 'lead_manager', 'crm_manager'].includes(role)) {
        navigate('/manager', { replace: true });
        return;
      }
      
      // If user is a client, redirect to client dashboard
      if (role === 'client') {
        navigate('/dashboard/client', { replace: true });
        return;
      }
      
      // Default redirect
      navigate('/', { replace: true });
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

  const checkUserExists = async (email) => {
    try {
      // Check if user exists by attempting to find them
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.exists && !data.needsPasswordSetup;
      }
      return false;
    } catch (error) {
      console.error('User check failed:', error);
      return false;
    }
  };

  const handleEmailBlur = async () => {
    if (formData.email && validateEmail(formData.email).isValid) {
      setIsLoading(true);
      try {
        const userExists = await checkUserExists(formData.email);
        setShowPasswordField(userExists);
        setIsNewUser(!userExists);
      } catch (error) {
        // If check fails, show password field by default
        setShowPasswordField(true);
        setIsNewUser(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Enhanced validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      setIsLoading(false);
      return;
    }

    try {
      let response;
      
      if (showPasswordField && formData.password) {
        // Existing user with password
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        
        response = await login(formData.email, formData.password);
      } else {
        // New user or email-only login
        response = await emailLogin(formData.email, { email: formData.email }, 'client_login');
      }
      
      if (response.success) {
        const userData = response.data?.user || response.data;
        
        // This login is only for clients
        if (userData?.role !== 'client') {
          setError('This login is for clients only. Managers should use the manager login.');
          setIsLoading(false);
          return;
        }
        
        if (response.data?.isNewUser) {
          setSuccess(`Welcome! Account created for ${userData?.first_name || 'User'}. Please check your email to set up your password.`);
        } else if (response.data?.needsPasswordSetup) {
          setSuccess(`Welcome back! Please check your email to set up your password.`);
        } else {
          setSuccess(`Welcome back, ${userData?.first_name || 'User'}!`);
        }
        
        // Redirect to client dashboard
        setTimeout(() => {
          navigate('/dashboard/client', { replace: true });
        }, 2000);
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
            <ValidatedInput
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleEmailBlur}
              required={true}
              placeholder="Enter your email"
              disabled={isLoading}
            />

            {showPasswordField && (
              <PasswordInput
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange}
                required={true}
                placeholder="Enter your password"
                disabled={isLoading}
                showStrength={false}
              />
            )}

            {!showPasswordField && formData.email && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-start">
                  <i className="fas fa-info-circle text-blue-400 mr-3 mt-0.5"></i>
                  <div>
                    <h4 className="text-blue-800 font-semibold text-sm">New User</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      {isNewUser ? 
                        'We\'ll create an account for you and send password setup instructions to your email.' :
                        'Click Sign In to continue with email-only login.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4a5568' }}>
                <input type="checkbox" disabled={isLoading} /> Remember me
              </label>
              {showPasswordField && (
                <Link to="/forgot-password" style={{ fontSize: '14px', color: '#667eea', textDecoration: 'none' }}>Forgot Password?</Link>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-red-400 mr-3 mt-0.5"></i>
                  <div>
                    <h4 className="text-red-800 font-semibold text-sm">Login Failed</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-green-400 mr-3 mt-0.5"></i>
                  <div>
                    <h4 className="text-green-800 font-semibold text-sm">Welcome Back!</h4>
                    <p className="text-green-700 text-sm mt-1">{success}</p>
                  </div>
                </div>
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