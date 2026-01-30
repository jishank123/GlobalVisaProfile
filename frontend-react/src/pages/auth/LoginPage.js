import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ValidatedInput, PasswordInput } from '../../components/FormComponents';
import { validateEmail, validatePassword } from '../../utils/validation';
import { authAPI } from '../../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Email verification, 2: Password entry/creation
  const [userStatus, setUserStatus] = useState(null); // null, 'existing', 'new', 'needs_password'
  const [emailVerified, setEmailVerified] = useState(false);
  
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

  const verifyEmail = async () => {
    setIsLoading(true);
    setError('');
    
    // Validate email first
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authAPI.checkUser(formData.email);
      
      if (data.exists && data.hasPassword) {
        // Existing user with password
        setUserStatus('existing');
        setSuccess('Email verified! Please enter your password.');
      } else if (data.exists && !data.hasPassword) {
        // Existing user without password (needs to create one)
        setUserStatus('needs_password');
        setSuccess('Email verified! Please create a password for your account.');
      } else {
        // New user
        setUserStatus('new');
        setSuccess('Email verified! Please create a password to set up your account.');
      }
      
      setEmailVerified(true);
      setStep(2);
    } catch (error) {
      console.error('Email verification failed:', error);
      setError(error.message || 'Email verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    verifyEmail();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (userStatus === 'existing') {
        // Existing user - validate password and login
        if (!formData.password) {
          setError('Password is required.');
          setIsLoading(false);
          return;
        }
        
        response = await login(formData.email, formData.password);
      } else if (userStatus === 'new' || userStatus === 'needs_password') {
        // New user or existing user without password - validate password creation
        const passwordValidation = validatePassword(formData.password, formData.confirmPassword);
        
        if (!passwordValidation.isValid) {
          setError(passwordValidation.errors[0]);
          setIsLoading(false);
          return;
        }
        
        // Create/update password and login
        await authAPI.setupPassword(formData.email, formData.password, userStatus === 'new');
        
        // Now login with the new password
        response = await login(formData.email, formData.password);
      }
      
      if (response.success) {
        const userData = response.data?.user || response.data;
        
        // This login is only for clients
        if (userData?.role !== 'client') {
          setError('This login is for clients only. Managers should use the manager login.');
          setIsLoading(false);
          return;
        }
        
        if (userStatus === 'new') {
          setSuccess(`Welcome! Your account has been created successfully.`);
        } else if (userStatus === 'needs_password') {
          setSuccess(`Welcome back! Your password has been set up successfully.`);
        } else {
          setSuccess(`Welcome back, ${userData?.first_name || 'User'}!`);
        }
        
        // Redirect to client dashboard
        setTimeout(() => {
          navigate('/dashboard/client', { replace: true });
        }, 1500);
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

  const goBackToEmail = () => {
    setStep(1);
    setEmailVerified(false);
    setUserStatus(null);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setError('');
    setSuccess('');
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
            <p>
              {step === 1 
                ? 'Enter your email address to get started' 
                : `${userStatus === 'existing' ? 'Enter your password' : 'Create a password for your account'}`
              }
            </p>
          </div>

          {step === 1 ? (
            // Step 1: Email Verification
            <form onSubmit={handleEmailSubmit}>
              <ValidatedInput
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required={true}
                placeholder="Enter your email address"
                disabled={isLoading}
              />

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-triangle text-red-400 mr-3 mt-0.5"></i>
                    <div>
                      <h4 className="text-red-800 font-semibold text-sm">Error</h4>
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
                      <h4 className="text-green-800 font-semibold text-sm">Success!</h4>
                      <p className="text-green-700 text-sm mt-1">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-login"
                disabled={isLoading || !formData.email}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Verifying Email...
                  </>
                ) : (
                  <>
                    <i className="fas fa-envelope-check mr-2"></i> Verify Email
                  </>
                )}
              </button>
            </form>
          ) : (
            // Step 2: Password Entry/Creation
            <form onSubmit={handlePasswordSubmit}>
              {/* Show verified email */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span className="text-green-700 font-medium">{formData.email}</span>
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    className="ml-auto text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Change Email
                  </button>
                </div>
              </div>

              {userStatus === 'existing' ? (
                // Existing user - just password
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
              ) : (
                // New user or needs password - password creation with confirmation
                <>
                  <div className="form-grid-2">
                    <PasswordInput
                      name="password"
                      label="Create Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      formData={formData}
                      required={true}
                      placeholder="Create a strong password"
                      disabled={isLoading}
                      showStrength={true}
                    />
                    <PasswordInput
                      name="confirmPassword"
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      formData={formData}
                      required={true}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      showStrength={false}
                    />
                  </div>
                </>
              )}

              {userStatus === 'existing' && (
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4a5568' }}>
                    <input type="checkbox" disabled={isLoading} /> Remember me
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: '14px', color: '#667eea', textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-triangle text-red-400 mr-3 mt-0.5"></i>
                    <div>
                      <h4 className="text-red-800 font-semibold text-sm">
                        {userStatus === 'existing' ? 'Login Failed' : 'Password Setup Failed'}
                      </h4>
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
                      <h4 className="text-green-800 font-semibold text-sm">Welcome!</h4>
                      <p className="text-green-700 text-sm mt-1">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-login"
                disabled={isLoading || !formData.password || (userStatus !== 'existing' && !formData.confirmPassword)}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> 
                    {userStatus === 'existing' ? 'Signing In...' : 'Setting Up Account...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i> 
                    {userStatus === 'existing' ? 'Sign In' : 'Create Account & Sign In'}
                  </>
                )}
              </button>
            </form>
          )}

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