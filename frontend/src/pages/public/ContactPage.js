import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contactAPI, authAPI } from '../../services/api';
import { validateEmailRealTime, validateNameRealTime, validatePhoneRealTime, getSupportedCountries, getPhoneMaxLength } from '../../utils/validation';

const ContactPage = () => {
  const navigate = useNavigate();
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [contactForm, setContactForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country_code: 'US',
    'visa-type': '',
    message: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Check if email exists with debouncing
  useEffect(() => {
    const checkEmailExists = async () => {
      const email = contactForm.email;
      
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
          // Auto-fill user data if available
          if (response.user) {
            setContactForm(prev => ({
              ...prev,
              first_name: response.user.first_name || prev.first_name,
              last_name: response.user.last_name || prev.last_name,
              phone: response.user.phone || prev.phone,
              country_code: response.user.phone_country_code || prev.country_code
            }));
          }
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
      if (contactForm.email) {
        checkEmailExists();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [contactForm.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle first_name and last_name - only allow letters and numbers
    if (name === 'first_name' || name === 'last_name') {
      // Only allow letters and numbers
      const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
      
      setContactForm(prev => ({
        ...prev,
        [name]: filteredValue
      }));
      
      // Validate name
      const validation = validateNameRealTime(filteredValue, name === 'first_name' ? 'First name' : 'Last name');
      
      // Update field validation state
      setFieldValidation(prev => ({
        ...prev,
        [name]: validation
      }));
      
      // Update validation errors for form submission
      if (validation.showError && validation.errors.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: validation.errors[0]
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      
      return; // Exit early for name inputs
    }
    
    // Handle phone number - only allow digits
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      const maxLength = getPhoneMaxLength(contactForm.country_code);
      
      // Don't allow more digits than the maximum
      if (digitsOnly.length > maxLength) {
        return;
      }
      
      // Update with digits only
      const newFormData = {
        ...contactForm,
        [name]: digitsOnly
      };
      
      setContactForm(newFormData);
      
      // Validate phone
      const validation = validatePhoneRealTime(digitsOnly, contactForm.country_code);
      
      // Update field validation state
      setFieldValidation(prev => ({
        ...prev,
        [name]: validation
      }));
      
      // Update validation errors for form submission
      if (validation.showError && validation.errors.length > 0) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: validation.errors[0]
        }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      
      return; // Exit early for phone input
    }
    
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation based on field type
    let validation;
    switch (name) {
      case 'email':
        validation = validateEmailRealTime(value);
        break;
      case 'message':
        // Check minimum 10 characters for message
        if (!value || value.trim().length < 10) {
          validation = { 
            isValid: false, 
            errors: ['Message must be at least 10 characters long'],
            showError: value.length > 0 && value.trim().length < 10
          };
        } else {
          validation = { isValid: true, errors: [], showError: false };
        }
        break;
      default:
        validation = { isValid: true, errors: [], showError: false };
    }
    
    // Update field validation state
    setFieldValidation(prev => ({
      ...prev,
      [name]: validation
    }));
    
    // Update validation errors for form submission
    if (validation.showError && validation.errors.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.errors[0]
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCountryChange = (e) => {
    const newCountryCode = e.target.value;
    setContactForm(prev => ({
      ...prev,
      country_code: newCountryCode,
      phone: '' // Clear phone when country changes
    }));
    
    // Clear phone validation when country changes
    setFieldValidation(prev => {
      const newValidation = { ...prev };
      delete newValidation.phone;
      return newValidation;
    });
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.phone;
      return newErrors;
    });
  };

  // Removed unused validateField function - using real-time validation instead

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'visa-type', 'message'];
    
    // Check if email already exists - for contact forms, just note it (do NOT block)
    // Contact forms can be submitted multiple times with the same email
    
    requiredFields.forEach(field => {
      let validation;
      switch (field) {
        case 'first_name':
          validation = validateNameRealTime(contactForm[field], 'First name');
          break;
        case 'last_name':
          validation = validateNameRealTime(contactForm[field], 'Last name');
          break;
        case 'email':
          validation = validateEmailRealTime(contactForm[field]);
          break;
        case 'message':
          // Check minimum 10 characters for message
          if (!contactForm[field] || contactForm[field].trim().length < 10) {
            validation = { isValid: false, errors: ['Message must be at least 10 characters long'] };
          } else {
            validation = { isValid: true, errors: [] };
          }
          break;
        default:
          validation = { isValid: !!contactForm[field], errors: contactForm[field] ? [] : [`${field.replace(/[-_]/g, ' ')} is required`] };
      }
      
      if (!validation.isValid || (field !== 'email' && !contactForm[field])) {
        errors[field] = validation.errors[0] || `${field.replace(/[-_]/g, ' ')} is required`;
      }
    });
    
    // Validate phone if provided
    if (contactForm.phone) {
      const phoneValidation = validatePhoneRealTime(contactForm.phone, contactForm.country_code);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.errors[0];
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      // Transform field names for API and combine first_name and last_name
      const apiData = {
        ...contactForm,
        name: `${contactForm.first_name} ${contactForm.last_name}`.trim(),
        visa_type: contactForm['visa-type']
      };
      delete apiData['visa-type'];
      delete apiData.first_name;
      delete apiData.last_name;

      // Submit the contact form
      const response = await contactAPI.submit(apiData);
      
      if (response.success) {
        // Auto-create account and login user
        try {
          const authResponse = await authAPI.emailLogin(
            contactForm.email, 
            {
              name: `${contactForm.first_name} ${contactForm.last_name}`.trim(),
              email: contactForm.email,
              phone: contactForm.phone,
              phone_country_code: contactForm.country_code,
              current_location: '',
              company: ''
            }, 
            'contact_form'
          );
          
          if (authResponse.success) {
            // Store auth data
            localStorage.setItem('token', authResponse.token);
            localStorage.setItem('user', JSON.stringify(authResponse.data.user));
            localStorage.setItem('userRole', 'client');
            
            // Redirect to success page with account creation info
            const queryParams = new URLSearchParams({
              type: 'contact',
              email: contactForm.email,
              accountCreated: authResponse.data.isNewUser ? 'true' : 'false'
            });
            navigate(`/form-success?${queryParams.toString()}`);
          } else {
            // Contact form submitted but account creation failed - still redirect to success
            const queryParams = new URLSearchParams({
              type: 'contact',
              email: contactForm.email
            });
            navigate(`/form-success?${queryParams.toString()}`);
          }
        } catch (authError) {
          console.error('Auto-login failed:', authError);
          // Contact form submitted but auto-login failed - still redirect to success
          const queryParams = new URLSearchParams({
            type: 'contact',
            email: contactForm.email
          });
          navigate(`/form-success?${queryParams.toString()}`);
        }
      } else {
        setSubmitError(response.error?.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removed unused handleCountryCodeChange function - using handleCountryChange instead

  const renderInputField = (name, label, type = 'text', required = false, placeholder = '') => {
    const hasError = validationErrors[name];
    const validation = fieldValidation[name];
    const isValid = validation?.isValid && contactForm[name];
    const isEmailField = name === 'email';
    const showEmailExistsWarning = false; // contact forms allow multiple submissions per email
    
    return (
      <div className="form-group">
        <label className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={contactForm[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`form-control-custom ${
            hasError ? 'border-red-500' : 
            isValid ? 'border-green-500' : ''
          }`}
        />
        {hasError && (
          <div className="validation-error">
            <i className="fas fa-exclamation-circle"></i>
            {hasError}
          </div>
        )}
        {isEmailField && emailExists && !hasError && (
          <div className="mt-2 text-blue-600 text-sm flex items-center border-l-4 border-blue-400 bg-blue-50 p-3 rounded">
            <i className="fas fa-info-circle mr-2"></i>
            <span>This email is already registered. Your message will be linked to your existing account.</span>
          </div>
        )}
        {checkingEmail && isEmailField && !hasError && !emailExists && (
          <div className="mt-2 text-gray-500 text-sm flex items-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Checking email...
          </div>
        )}
        {isValid && !hasError && !showEmailExistsWarning && (
          <div className="mt-2 text-green-600 text-sm flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            Looks good!
          </div>
        )}
      </div>
    );
  };

  const renderSelectField = (name, label, options, required = false) => {
    const hasError = validationErrors[name];
    
    return (
      <div className="form-group">
        <label className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={contactForm[name]}
          onChange={handleInputChange}
          className={`form-control-custom form-select ${hasError ? 'border-red-500' : ''}`}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasError && (
          <div className="validation-error">
            <i className="fas fa-exclamation-circle"></i>
            {hasError}
          </div>
        )}
      </div>
    );
  };

  const renderTextareaField = (name, label, required = false, placeholder = '') => {
    const hasError = validationErrors[name];
    const value = contactForm[name] || '';
    const charCount = value.length;
    const minLength = 10;
    const maxLength = 2000;
    const isValid = value.trim().length >= minLength && charCount <= maxLength;
    const showWarning = value.trim().length > 0 && value.trim().length < minLength;
    
    return (
      <div className="form-group">
        <label className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          rows={5}
          maxLength={maxLength}
          className={`form-control-custom form-textarea ${
            hasError ? 'border-red-500' : 
            showWarning ? 'border-yellow-500' : 
            isValid && value.trim().length >= minLength ? 'border-green-500' : ''
          }`}
        />
        
        {/* Character count and validation feedback */}
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm">
            {showWarning && (
              <span className="text-yellow-600 flex items-center">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                {minLength - value.trim().length} more characters needed (minimum {minLength})
              </span>
            )}
            {isValid && value.trim().length >= minLength && (
              <span className="text-green-600 flex items-center">
                <i className="fas fa-check-circle mr-1"></i>
                Looks good!
              </span>
            )}
            {!value.trim() && (
              <span className="text-gray-500">
                Minimum {minLength} characters required
              </span>
            )}
          </div>
          <div className={`text-sm ${
            charCount > maxLength * 0.9 ? 'text-red-500 font-semibold' : 
            charCount > maxLength * 0.8 ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {charCount}/{maxLength}
          </div>
        </div>
        
        {hasError && (
          <div className="validation-error">
            <i className="fas fa-exclamation-circle"></i>
            {hasError}
          </div>
        )}
      </div>
    );
  };

  const renderPhoneInputField = () => {
    const hasError = validationErrors.phone;
    const validation = fieldValidation.phone;
    const isValid = validation?.isValid && contactForm.phone;
    const countries = getSupportedCountries();
    const currentCountry = countries.find(c => c.code === contactForm.country_code) || countries[0];
    const digitsOnly = contactForm.phone.replace(/\D/g, '');
    
    return (
      <div className="form-group">
        <label className="form-label">
          Phone Number <span className="text-gray-500 text-sm">(Optional)</span>
        </label>
        
        <div className="flex gap-2">
          {/* Country Code Selector - Smaller */}
          <select
            value={contactForm.country_code}
            onChange={handleCountryChange}
            className={`form-control-custom form-select ${hasError ? 'border-red-500' : ''}`}
            style={{ width: '100px', flexShrink: 0 }}
          >
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
          
          {/* Phone Number Input - Larger with min-width for 10+ digits */}
          <input
            type="tel"
            name="phone"
            value={contactForm.phone}
            onChange={handleInputChange}
            placeholder={`Enter ${currentCountry.maxDigits} digits`}
            maxLength={currentCountry.maxDigits + 5}
            inputMode="numeric"
            pattern="[0-9]*"
            className={`form-control-custom ${
              hasError ? 'border-red-500' : 
              isValid ? 'border-green-500' : ''
            }`}
            style={{ flex: 1, minWidth: '200px', fontFamily: 'monospace' }}
          />
        </div>
        
        {/* Country Info and Digit Counter */}
        <div className="mt-1 flex justify-between items-center text-xs">
          <span className="text-gray-500">
            {currentCountry.flag} {currentCountry.name} ({currentCountry.dialCode})
          </span>
          <span className={`${
            digitsOnly.length > 0 && digitsOnly.length !== currentCountry.maxDigits ? 'text-red-500' : 'text-gray-500'
          }`}>
            {digitsOnly.length}/{currentCountry.maxDigits} digits
          </span>
        </div>
        
        {hasError && (
          <div className="validation-error">
            <i className="fas fa-exclamation-circle"></i>
            {hasError}
          </div>
        )}
        {isValid && !hasError && (
          <div className="mt-2 text-green-600 text-sm flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            Valid {currentCountry.name} phone number
          </div>
        )}
      </div>
    );
  };

  const visaTypeOptions = [
    { value: 'eb1a-eligibility', label: 'EB-1A Eligibility' },
    { value: 'profile-building', label: 'Profile Building' },
    { value: 'eb2-niw', label: 'EB-2 NIW' },
    { value: 'o1-visa', label: 'O-1 Visa' },
    { value: 'career-coaching', label: 'Career Coaching' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div>
      
      {/* Hero Section */}
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Get in touch with our immigration experts. We're here to help you with your U.S. immigration journey.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div className="form-container">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    <i className="fas fa-envelope text-blue-600 mr-3"></i>
                    Get in Touch
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Have questions about your immigration case? We're here to help. Send us a message and we'll get back to you within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleContactSubmit}>
                  {/* Personal Information */}
                  <div className="form-grid-2">
                    {renderInputField('first_name', 'First Name', 'text', true, 'Enter your first name')}
                    {renderInputField('last_name', 'Last Name', 'text', true, 'Enter your last name')}
                  </div>

                  {renderInputField('email', 'Email Address', 'email', true, 'your.email@example.com')}
                  {renderPhoneInputField()}

                  {renderSelectField('visa-type', 'Visa Category', visaTypeOptions, true)}

                  {renderTextareaField('message', 'Your Message', true, 'Please describe your situation, questions, or how we can help you...')}

                  {/* Messages */}
                  {submitMessage && (
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle mr-2"></i>
                      {submitMessage}
                    </div>
                  )}
                  
                  {submitError && (
                    <div className="alert alert-error">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      {submitError}
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Contact Info & Quick Actions */}
              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Contact Information</h3>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-map-marker-alt text-xl text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Office Address</h4>
                      <p className="text-gray-600">123 Immigration Plaza, Suite 500<br />New York, NY 10001</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-phone text-xl text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Phone</h4>
                      <p className="text-gray-600">(555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-envelope text-xl text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Email</h4>
                      <p className="text-gray-600">info@immigrationpro.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-clock text-xl text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Business Hours</h4>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white mb-8">
                  <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link 
                      to="/assessment" 
                      className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all text-white hover:text-white no-underline"
                    >
                      <i className="fas fa-chart-line mr-2"></i>
                      Free Profile Assessment
                    </Link>
                    <Link 
                      to="/schedule" 
                      className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all text-white hover:text-white no-underline"
                    >
                      <i className="fas fa-calendar mr-2"></i>
                      Schedule Consultation
                    </Link>
                    <Link 
                      to="/services" 
                      className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all text-white hover:text-white no-underline"
                    >
                      <i className="fas fa-briefcase mr-2"></i>
                      View Our Services
                    </Link>
                    <Link 
                      to="/pricing" 
                      className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all text-white hover:text-white no-underline"
                    >
                      <i className="fas fa-dollar-sign mr-2"></i>
                      View Pricing
                    </Link>
                  </div>
                </div>
                
                {/* Social Media */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a 
                      href="https://linkedin.com/company/immigrationpro" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all text-blue-600"
                    >
                      <i className="fab fa-linkedin text-xl"></i>
                    </a>
                    <a 
                      href="https://twitter.com/immigrationpro" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all text-blue-600"
                    >
                      <i className="fab fa-twitter text-xl"></i>
                    </a>
                    <a 
                      href="https://facebook.com/immigrationpro" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all text-blue-600"
                    >
                      <i className="fab fa-facebook text-xl"></i>
                    </a>
                    <a 
                      href="https://instagram.com/immigrationpro" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all text-blue-600"
                    >
                      <i className="fab fa-instagram text-xl"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;