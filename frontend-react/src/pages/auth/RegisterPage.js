import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validateRegistrationForm } from '../../utils/validation';
import { ValidatedInput, PasswordInput, PhoneInputWithCountry, CountrySelect } from '../../components/FormComponents';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    phone_country_code: 'US',
    company: '',
    country: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formValidation, setFormValidation] = useState({ isValid: false, errors: [], warnings: [] });
  
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

  // Real-time form validation
  useEffect(() => {
    const validation = validateRegistrationForm(formData);
    setFormValidation(validation);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handlePhoneCountryChange = (countryCode) => {
    setFormData(prev => ({
      ...prev,
      phone_country_code: countryCode,
      phone: '' // Clear phone when country changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Comprehensive validation
    const validation = validateRegistrationForm(formData);
    
    if (!validation.isValid) {
      setError(validation.errors[0] || 'Please fix the errors in the form.');
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
                <ValidatedInput
                  name="first_name"
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  formData={formData}
                  required={true}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-6">
                <ValidatedInput
                  name="last_name"
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  formData={formData}
                  required={true}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <ValidatedInput
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              formData={formData}
              required={true}
              placeholder="Enter your email address"
              disabled={isLoading}
            />

            <div className="row">
              <div className="col-md-6">
                <PasswordInput
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  formData={formData}
                  required={true}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  showStrength={true}
                />
              </div>
              <div className="col-md-6">
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
            </div>

            <PhoneInputWithCountry
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              countryCode={formData.phone_country_code}
              onCountryChange={handlePhoneCountryChange}
              required={false}
              placeholder="Enter phone number"
              disabled={isLoading}
            />

            <div className="row">
              <div className="col-md-6">
                <ValidatedInput
                  name="company"
                  label="Company"
                  value={formData.company}
                  onChange={handleInputChange}
                  formData={formData}
                  required={false}
                  placeholder="Enter your company name"
                  disabled={isLoading}
                />
              </div>
              <div className="col-md-6">
                <CountrySelect
                  name="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required={false}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Form Validation Summary */}
            {formValidation.warnings && formValidation.warnings.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-400 mr-3 mt-0.5"></i>
                  <div>
                    <h4 className="text-yellow-800 font-semibold text-sm">Recommendations</h4>
                    <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
                      {formValidation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-red-400 mr-3 mt-0.5"></i>
                  <div>
                    <h4 className="text-red-800 font-semibold text-sm">Registration Error</h4>
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
              disabled={isLoading || !formValidation.isValid}
              style={{
                opacity: isLoading || !formValidation.isValid ? 0.6 : 1,
                cursor: isLoading || !formValidation.isValid ? 'not-allowed' : 'pointer'
              }}
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