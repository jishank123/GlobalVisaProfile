import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validateRegistrationForm } from '../../utils/validation';
import { ValidatedInput, PasswordInput, PhoneInputWithCountry, CountrySelect } from '../../components/FormComponents';
import { authAPI } from '../../services/api';

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
    country: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formValidation, setFormValidation] = useState({ isValid: false, errors: [], warnings: [] });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
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

  // Check if email exists with debouncing
  useEffect(() => {
    const checkEmailExists = async () => {
      const email = formData.email;
      
      // Only check if email is valid format
      const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!email || !emailPattern.test(email)) {
        setEmailExists(false);
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await authAPI.checkEmail(email);
        if (response.success && response.exists) {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    };

    // Debounce the email check
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkEmailExists();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user interacts with form
    if (error) {
      setError('');
    }
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

    // Check terms acceptance first
    if (!formData.acceptTerms) {
      setError('You must accept the Terms & Conditions and Privacy Policy to create an account.');
      setIsLoading(false);
      return;
    }

    // Comprehensive validation
    const validation = validateRegistrationForm(formData);
    
    if (!validation.isValid) {
      setError(validation.errors[0] || 'Please fix the errors in the form.');
      setIsLoading(false);
      return;
    }

    try {
      // Remove confirmPassword and convert acceptTerms to terms_accepted for backend
      const { confirmPassword, acceptTerms, ...registrationData } = formData;
      
      // Add terms_accepted field that backend expects
      registrationData.terms_accepted = acceptTerms;
      
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
              emailExists={emailExists}
              checkingEmail={checkingEmail}
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

            {/* Terms and Conditions Acceptance */}
            <div className="form-group">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Terms & Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Privacy Policy
                  </button>
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {!formData.acceptTerms && error && error.includes('Terms') && (
                <div className="mt-2 text-red-600 text-sm flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  You must accept the Terms & Conditions and Privacy Policy
                </div>
              )}
            </div>

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
              disabled={isLoading || !formValidation.isValid || !formData.acceptTerms || emailExists}
              style={{
                opacity: isLoading || !formValidation.isValid || !formData.acceptTerms || emailExists ? 0.6 : 1,
                cursor: isLoading || !formValidation.isValid || !formData.acceptTerms || emailExists ? 'not-allowed' : 'pointer'
              }}
              title={emailExists ? 'This email is already registered. Please use a different email.' : ''}
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

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                  <p>By accessing and using ImmigrationPro's services, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">2. Service Description</h3>
                  <p>ImmigrationPro provides profile building and application preparation services for employment-based immigration petitions. We are not attorneys and do not provide legal advice or representation.</p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">3. User Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain confidentiality of account credentials</li>
                    <li>Use services only for lawful purposes</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">4. Service Limitations</h3>
                  <p className="mb-2">Our services are limited to profile building and application preparation. We do not:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide legal advice or representation</li>
                    <li>Guarantee approval of any immigration petition</li>
                    <li>Act as attorneys or legal representatives</li>
                    <li>File applications directly with USCIS</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">5. Payment Terms</h3>
                  <p>Payment is required before services are rendered. All fees are non-refundable unless otherwise specified in writing.</p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">6. Limitation of Liability</h3>
                  <p>ImmigrationPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
                </section>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h3>
                  <p className="mb-2">We collect information you provide directly to us, such as:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Personal identification information (name, email, phone number)</li>
                    <li>Professional background and qualifications</li>
                    <li>Immigration-related documentation and information</li>
                    <li>Payment and billing information</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h3>
                  <p className="mb-2">We use the information we collect to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide and improve our services</li>
                    <li>Communicate with you about your case</li>
                    <li>Process payments and transactions</li>
                    <li>Send you updates and marketing communications (with consent)</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">3. Information Sharing</h3>
                  <p className="mb-2">We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>With your explicit consent</li>
                    <li>To trusted service providers who assist in our operations</li>
                    <li>When required by law or legal process</li>
                    <li>To protect our rights, property, or safety</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">4. Data Security</h3>
                  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">5. Your Rights</h3>
                  <p className="mb-2">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request data portability</li>
                  </ul>
                </section>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;