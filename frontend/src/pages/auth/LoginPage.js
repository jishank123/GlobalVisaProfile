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
  const [userStatus, setUserStatus] = useState(null); // null, 'existing', 'needs_password'
  const [userInfo, setUserInfo] = useState(null);
  const [isLoginAttempt, setIsLoginAttempt] = useState(false); // Flag to prevent redirects during login
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    // Don't redirect during login attempts
    if (isLoginAttempt) return;
    
    if (isAuthenticated() && user) {
      const role = user.role;
      
      // Redirect based on role to appropriate dashboard
      switch (role) {
        case 'admin':
          navigate('/dashboard/admin', { replace: true });
          break;
        case 'lead_manager':
          navigate('/dashboard/lead-manager', { replace: true });
          break;
        case 'crm_manager':
          navigate('/dashboard/crm-manager', { replace: true });
          break;
        case 'project_manager':
          navigate('/dashboard/project-manager', { replace: true });
          break;
        case 'employee':
          navigate('/dashboard/employee', { replace: true });
          break;
        case 'client':
          navigate('/dashboard/client', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLoginAttempt]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  // Step 1: Verify email and check user status
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
      
      if (!data.exists) {
        // No account found
        setError('No account found with this email address. Please check your email or create an account by filling out one of our forms.');
        setIsLoading(false);
        return;
      }

      // Account exists - check password status
      if (data.hasPassword && !data.needsPasswordSetup) {
        // Existing user with password set
        setUserStatus('existing');
        setUserInfo({
          email: formData.email,
          first_name: data.first_name || 'User',
          last_name: data.last_name || ''
        });
        setSuccess('Email verified! Please enter your password.');
      } else {
        // Existing user needs to set password
        setUserStatus('needs_password');
        setUserInfo({
          email: formData.email,
          first_name: data.first_name || 'User',
          last_name: data.last_name || ''
        });
        setSuccess('Email verified! Please create a password for your account.');
      }
      
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

  // Step 2: Handle password entry or setup
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Password form submitted');
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (userStatus === 'existing') {
        // Existing user - validate password and login
        if (!formData.password) {
          setError('Password is required.');
          setIsLoading(false);
          return;
        }
        
        console.log('🔐 Attempting login for existing user:', formData.email);
        setIsLoginAttempt(true); // Set flag to prevent redirects
        
        try {
          const response = await login(formData.email, formData.password, false);
          console.log('🔐 Login response:', response);
          
          if (response && response.success) {
            const userData = response.data?.user || response.data;
            console.log('✅ Login successful:', userData);
            setSuccess(`Welcome back, ${userData?.first_name || 'User'}!`);
            
            // Redirect to client dashboard
            setTimeout(() => {
              navigate('/dashboard/client', { replace: true });
            }, 1500);
          } else {
            // Handle unsuccessful login
            console.log('❌ Login unsuccessful:', response);
            setError('Password entered is wrong, please check password.');
            setIsLoginAttempt(false); // Reset flag
            // Prevent any automatic redirects by stopping here
            return;
          }
        } catch (loginError) {
          console.error('❌ Login API error:', loginError);
          setIsLoginAttempt(false); // Reset flag
          
          // Check for specific error codes and messages from backend
          const errorMessage = loginError.message || 'Login failed';
          const errorCode = loginError.code;
          
          // Handle specific backend error codes
          if (errorCode === 'ACCOUNT_INACTIVE') {
            setError('Your account is inactive. Please contact support to reactivate your account.');
          } else if (errorCode === 'INVALID_CREDENTIALS') {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (errorCode === 'ACCESS_DENIED') {
            setError('This login is for clients only. Managers should use the manager login.');
          } else if (errorCode === 'USER_NOT_FOUND') {
            setError('No account found with this email address.');
          } else if (errorCode === 'MISSING_CREDENTIALS') {
            setError('Please provide email and password.');
          } else if (errorCode === 'INVALID_EMAIL') {
            setError('Please provide a valid email address.');
          } else {
            // Display the actual error message from backend
            setError(errorMessage);
          }
          // Prevent any automatic redirects by stopping here
          return;
        }
      } else if (userStatus === 'needs_password') {
        // User needs to set password - validate password creation
        if (!formData.password || !formData.confirmPassword) {
          setError('Please enter and confirm your new password.');
          setIsLoading(false);
          return;
        }

        const passwordValidation = validatePassword(formData.password, formData.confirmPassword);
        if (!passwordValidation.isValid) {
          setError(passwordValidation.errors[0]);
          setIsLoading(false);
          return;
        }
        
        try {
          // Set password and login
          const response = await login(formData.email, formData.password, true);
          
          if (response && response.success) {
            const userData = response.data?.user || response.data;
            setSuccess(`Welcome, ${userData?.first_name || 'User'}! Your password has been set up successfully.`);
            
            // Redirect to client dashboard
            setTimeout(() => {
              navigate('/dashboard/client', { replace: true });
            }, 1500);
          } else {
            setError('Password setup failed. Please try again.');
          }
        } catch (setupError) {
          console.error('Password setup error:', setupError);
          
          // Check for specific error codes and messages from backend
          const errorMessage = setupError.message || 'Password setup failed';
          const errorCode = setupError.code;
          
          // Handle specific backend error codes
          if (errorCode === 'WEAK_PASSWORD') {
            // Display the specific password validation error from backend
            setError(errorMessage);
          } else if (errorCode === 'ACCOUNT_INACTIVE') {
            setError('Your account is inactive. Please contact support to reactivate your account.');
          } else if (errorCode === 'PASSWORD_SETUP_REQUIRED') {
            setError('Password setup is required for this account.');
          } else {
            // Display the actual error message from backend
            setError(errorMessage);
          }
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep(1);
    setUserStatus(null);
    setUserInfo(null);
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
                : userStatus === 'existing' 
                  ? 'Enter your password to continue'
                  : 'Create a password for your account'
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    <span className="text-green-700 font-medium">
                      {userInfo?.first_name} {userInfo?.last_name} ({userInfo?.email})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
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
                // User needs password - password creation with confirmation
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
                disabled={isLoading || !formData.password || (userStatus === 'needs_password' && !formData.confirmPassword)}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> 
                    {userStatus === 'existing' ? 'Signing In...' : 'Setting Up Account...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i> 
                    {userStatus === 'existing' ? 'Sign In' : 'Create Password & Sign In'}
                  </>
                )}
              </button>
            </form>
          )}

          <div className="footer-links">
            Don't have an account? <Link to="/register">Signup Form</Link> | 
            <Link to="/"> Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;