import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ValidatedInput, PasswordInput } from '../../components/FormComponents';
import { validateEmail } from '../../utils/validation';

const ManagerLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoginAttempt, setIsLoginAttempt] = useState(false); // Flag to prevent redirects during login
  
  const { isAuthenticated, user, managerLogin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as manager
  useEffect(() => {
    console.log('🔐 ManagerLoginPage useEffect triggered');
    console.log('🔐 isLoginAttempt:', isLoginAttempt);
    console.log('🔐 isAuthenticated():', isAuthenticated());
    console.log('🔐 user:', user);
    
    // Don't redirect during login attempts
    if (isLoginAttempt) {
      console.log('🔐 Skipping redirect - login attempt in progress');
      return;
    }
    
    if (isAuthenticated() && user) {
      const role = user.role;
      console.log('🔐 Manager login page - User already logged in with role:', role);
      const managerRoles = ['admin', 'lead_manager', 'crm_manager', 'project_manager', 'employee'];
      
      if (managerRoles.includes(role)) {
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
          case 'project_manager':
            redirectPath = '/dashboard/project-manager';
            break;
          case 'employee':
            redirectPath = '/dashboard/employee';
            break;
          default:
            redirectPath = '/';
        }
        
        console.log('🔐 Will redirect to:', redirectPath);
        console.log('🔐 Calling navigate now...');
        navigate(redirectPath, { replace: true });
        console.log('🔐 Navigate called');
      } else if (role === 'client') {
        // If client is logged in, redirect to client dashboard
        console.log('🔐 Client detected, redirecting to client dashboard');
        navigate('/dashboard/client', { replace: true });
      }
    } else {
      console.log('🔐 No user logged in or not authenticated, staying on manager login page');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Manager login form submitted');
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

    if (!formData.password) {
      setError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting manager login for:', formData.email);
      setIsLoginAttempt(true); // Set flag to prevent redirects
      
      // Use manager login from auth context
      const response = await managerLogin(formData.email, formData.password);
      console.log('🔐 Manager login response:', response);
      
      if (response && response.success) {
        const userData = response.data?.user || response.data;
        console.log('✅ Manager login successful:', userData);
        console.log('✅ Redirect path from backend:', userData?.redirectTo);
        
        setSuccess(`Welcome back, ${userData?.first_name || 'Manager'}!`);
        
        // Use the redirectTo from backend response
        const redirectPath = userData?.redirectTo || '/dashboard/admin';
        console.log('✅ Final redirect path:', redirectPath);
        
        setTimeout(() => {
          console.log('✅ Navigating to:', redirectPath);
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        // Handle unsuccessful login
        console.log('❌ Manager login unsuccessful:', response);
        setError('Password entered is wrong, please check password.');
        setIsLoginAttempt(false); // Reset flag
        // Prevent any automatic redirects by stopping here
        return;
      }
    } catch (error) {
      console.error('❌ Manager login error:', error);
      setIsLoginAttempt(false); // Reset flag
      const errorMessage = error.message || 'Login failed';
      if (errorMessage.toLowerCase().includes('password') || 
          errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('incorrect') ||
          errorMessage.toLowerCase().includes('wrong') ||
          errorMessage.toLowerCase().includes('credentials')) {
        setError('Password entered is wrong, please check password.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      // Prevent any automatic redirects by stopping here
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 flex items-center justify-center p-5">
      <div className="login-container">
        <div className="login-left">
          <h1>Manager Portal</h1>
          <p>
            Access your management dashboard to oversee operations, manage teams, and drive business growth.
          </p>
          <p>
            Comprehensive tools for administrators, managers, project managers, and employees.
          </p>
          <div style={{ marginTop: '40px' }}>
            <p style={{ fontSize: '14px', opacity: '0.8' }}>
              <i className="fas fa-shield-alt"></i> Admin Controls<br />
              <i className="fas fa-users-cog"></i> Team Management<br />
              <i className="fas fa-tasks"></i> Project & Task Management<br />
              <i className="fas fa-chart-line"></i> Analytics & Reports<br />
              <i className="fas fa-cogs"></i> System Configuration
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                <i className="fas fa-user-shield text-2xl text-white"></i>
              </div>
            </div>
            <h2>Manager Sign In</h2>
            <p>Enter your credentials to access the management portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <ValidatedInput
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required={true}
              placeholder="Enter your manager email"
              disabled={isLoading}
            />

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

            <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4a5568' }}>
                <input type="checkbox" disabled={isLoading} /> Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: '#667eea', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                  <div>
                    <h4 className="text-red-800 font-semibold text-sm">Access Denied</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-400 mr-3"></i>
                  <div>
                    <h4 className="text-green-800 font-semibold text-sm">Login Successful</h4>
                    <p className="text-green-700 text-sm mt-1">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-login"
              disabled={isLoading}
              style={{ 
                background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-shield-alt mr-2"></i> Manager Sign In
                </>
              )}
            </button>
          </form>

          <div className="footer-links">
            <Link to="/login">Client Login</Link> | 
            <Link to="/"> Back to Home</Link>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-amber-600 mr-3 mt-0.5"></i>
              <div>
                <h4 className="text-amber-800 font-semibold text-sm">Manager Access Only</h4>
                <p className="text-amber-700 text-xs mt-1">
                  This portal is restricted to administrators, managers, project managers, and employees. 
                  Clients should use the <Link to="/login" className="underline font-semibold">regular login</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerLoginPage;