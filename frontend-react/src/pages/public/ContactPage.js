import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contactAPI } from '../../services/api';
import { validateEmail, validateName, validatePhoneWithCountry, getSupportedCountries } from '../../utils/validation';

const ContactPage = () => {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Real-time validation for message field
    if (name === 'message' && value.trim().length > 0) {
      const validation = validateField(name, value);
      if (!validation.isValid) {
        setTimeout(() => {
          setValidationErrors(prev => ({
            ...prev,
            [name]: validation.errors[0]
          }));
        }, 500); // Small delay to avoid too aggressive validation
      }
    }
  };

  const validateField = (name, value) => {
    let validation = { isValid: true, errors: [] };
    
    switch (name) {
      case 'first_name':
        validation = validateName(value, 'First name');
        break;
      case 'last_name':
        validation = validateName(value, 'Last name');
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'phone':
        if (value) { // Phone is optional
          validation = validatePhoneWithCountry(value, contactForm.country_code);
        }
        break;
      case 'message':
        if (!value || value.trim().length === 0) {
          validation = { isValid: false, errors: ['Message is required'] };
        } else if (value.trim().length < 10) {
          validation = { isValid: false, errors: ['Message must be at least 10 characters long'] };
        } else if (value.length > 2000) {
          validation = { isValid: false, errors: ['Message cannot exceed 2000 characters'] };
        }
        break;
      default:
        if (!value && ['visa-type'].includes(name)) {
          validation = { isValid: false, errors: [`${name.replace('-', ' ')} is required`] };
        }
        break;
    }
    
    return validation;
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'visa-type', 'message'];
    
    requiredFields.forEach(field => {
      const validation = validateField(field, contactForm[field]);
      if (!validation.isValid) {
        errors[field] = validation.errors[0];
      }
    });
    
    // Validate phone if provided
    if (contactForm.phone) {
      const phoneValidation = validateField('phone', contactForm.phone);
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

      const response = await contactAPI.submit(apiData);
      
      if (response.success) {
        // Redirect to success page with account creation info
        const queryParams = new URLSearchParams({
          type: 'contact',
          email: contactForm.email
        });
        navigate(`/form-success?${queryParams.toString()}`);
      } else {
        setSubmitError(response.error?.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountryCodeChange = (countryCode) => {
    setContactForm(prev => ({
      ...prev,
      country_code: countryCode,
      phone: '' // Clear phone when country changes
    }));
  };

  const renderInputField = (name, label, type = 'text', required = false, placeholder = '') => {
    const hasError = validationErrors[name];
    
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
          className={`form-control-custom ${hasError ? 'border-red-500' : ''}`}
        />
        {hasError && (
          <div className="validation-error">
            <i className="fas fa-exclamation-circle"></i>
            {hasError}
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
    const countries = getSupportedCountries();
    
    return (
      <div className="form-group">
        <label className="form-label">
          Phone Number <span className="text-gray-500 text-sm">(Optional)</span>
        </label>
        
        <div className="flex gap-2">
          {/* Country Code Selector - Smaller */}
          <select
            value={contactForm.country_code}
            onChange={(e) => handleCountryCodeChange(e.target.value)}
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
            placeholder="Enter phone number"
            className={`form-control-custom ${hasError ? 'border-red-500' : ''}`}
            style={{ flex: 1, minWidth: '200px' }}
          />
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

  const visaTypeOptions = [
    { value: 'eb1a', label: 'EB-1A (Extraordinary Ability)' },
    { value: 'eb2-niw', label: 'EB-2 NIW (National Interest Waiver)' },
    { value: 'o1', label: 'O-1 Visa' },
    { value: 'profile', label: 'Profile Building' },
    { value: 'other', label: 'Other / Not Sure' }
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

                  <div className="form-grid-2">
                    {renderInputField('email', 'Email Address', 'email', true, 'your.email@example.com')}
                    {renderPhoneInputField()}
                  </div>

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
                      href="#" 
                      className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all text-blue-600"
                    >
                      <i className="fab fa-linkedin text-xl"></i>
                    </a>
                    <a 
                      href="#" 
                      className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all text-blue-600"
                    >
                      <i className="fab fa-twitter text-xl"></i>
                    </a>
                    <a 
                      href="#" 
                      className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all text-blue-600"
                    >
                      <i className="fab fa-facebook text-xl"></i>
                    </a>
                    <a 
                      href="#" 
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