import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    country: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, isAuthenticated, user } = useAuth();
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
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...registrationData } = formData;
      
      const response = await register(registrationData);
      
      if (response.success) {
        const userData = response.data?.user || response.data;
        setSuccess(`Welcome, ${userData?.first_name || 'User'}! Your account has been created successfully.`);
        
        // Since this is client-only registration, always redirect to client dashboard
        setTimeout(() => {
          navigate('/dashboard/client', { replace: true });
        }, 1500);
      } else {
        setError(response.error?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Connection error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-5">
      <div className="login-container" style={{ maxWidth: '1200px' }}>
        <div className="login-left">
          <h1>Join ImmigrationPro</h1>
          <p>
            Create your account to access personalized immigration services, track your progress, and connect with our expert team.
          </p>
          <p>
            Start your journey to U.S. immigration success today.
          </p>
          <div style={{ marginTop: '40px' }}>
            <p style={{ fontSize: '14px', opacity: '0.8' }}>
              <i className="fas fa-check-circle"></i> Free Profile Assessment<br />
              <i className="fas fa-check-circle"></i> Expert Consultation<br />
              <i className="fas fa-check-circle"></i> Progress Tracking<br />
              <i className="fas fa-check-circle"></i> Document Management
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <h2>Create Client Account</h2>
            <p>Fill in your details to start your immigration journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name" 
                    required 
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter your last name" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
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

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Password *</label>
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
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input 
                    type="password" 
                    className="form-control-custom" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-control-custom" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number" 
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your company" 
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Enter your country" 
                  />
                </div>
              </div>
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
                  <i className="fas fa-spinner fa-spin mr-2"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i> Create Account
                </>
              )}
            </button>
          </form>

          <div className="footer-links">
            Already have an account? <Link to="/login">Sign In</Link> | 
            <Link to="/"> Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;