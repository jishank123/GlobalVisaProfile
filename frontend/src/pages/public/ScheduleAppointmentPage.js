import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, authAPI } from '../../services/api';
import { validateEmailRealTime, validateNameRealTime, validatePhoneRealTime, getSupportedCountries, getPhoneMaxLength } from '../../utils/validation';

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country_code: 'US',
    visa_category: '',
    timezone: '',
    preferred_date: '',
    preferred_time: '',
    consultation_type: 'video',
    details: ''
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
    const { name, value } = e.target;
    
    // Handle first_name and last_name - only allow letters and numbers
    if (name === 'first_name' || name === 'last_name') {
      // Only allow letters and numbers
      const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
      
      const newFormData = {
        ...formData,
        [name]: filteredValue
      };
      
      setFormData(newFormData);
      
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
      const maxLength = getPhoneMaxLength(formData.country_code);
      
      // Don't allow more digits than the maximum
      if (digitsOnly.length > maxLength) {
        return;
      }
      
      // Update with digits only
      const newFormData = {
        ...formData,
        [name]: digitsOnly
      };
      
      setFormData(newFormData);
      
      // Validate phone
      const validation = validatePhoneRealTime(digitsOnly, formData.country_code);
      
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
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Real-time validation based on field type
    let validation;
    switch (name) {
      case 'email':
        validation = validateEmailRealTime(value);
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
    setFormData(prev => ({
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

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'visa_category', 'timezone', 'preferred_date', 'preferred_time', 'details'];
    
    // Check if email already exists - block submission
    if (emailExists) {
      errors.email = 'This email is already registered. Please use a different email address.';
    }
    
    requiredFields.forEach(field => {
      let validation;
      switch (field) {
        case 'first_name':
          validation = validateNameRealTime(formData[field], 'First name');
          break;
        case 'last_name':
          validation = validateNameRealTime(formData[field], 'Last name');
          break;
        case 'email':
          validation = validateEmailRealTime(formData[field]);
          break;
        case 'phone':
          if (!formData[field]) {
            validation = { isValid: false, errors: ['Phone number is required'] };
          } else {
            validation = validatePhoneRealTime(formData[field], formData.country_code);
          }
          break;
        case 'details':
          // Check minimum 10 characters for details
          if (!formData[field] || formData[field].trim().length < 10) {
            validation = { isValid: false, errors: ['Details must be at least 10 characters long'] };
          } else {
            validation = { isValid: true, errors: [] };
          }
          break;
        default:
          validation = { isValid: !!formData[field], errors: formData[field] ? [] : [`${field.replace('_', ' ')} is required`] };
      }
      
      if (!validation.isValid || !formData[field]) {
        errors[field] = validation.errors[0] || `${field.replace(/_/g, ' ')} is required`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCountryCodeChange = (countryCode) => {
    setFormData(prev => ({
      ...prev,
      country_code: countryCode,
      phone: '' // Clear phone when country changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      // Combine first_name and last_name into name for API compatibility
      const submissionData = {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`.trim()
      };
      
      // Submit the appointment request
      const response = await appointmentsAPI.submit(submissionData);
      
      if (response.success) {
        // Auto-create account and login user
        try {
          const authResponse = await authAPI.emailLogin(
            formData.email, 
            {
              name: `${formData.first_name} ${formData.last_name}`.trim(),
              email: formData.email,
              phone: formData.phone,
              current_location: formData.timezone,
              company: ''
            }, 
            'appointment'
          );
          
          if (authResponse.success) {
            // Store auth data
            localStorage.setItem('token', authResponse.token);
            localStorage.setItem('user', JSON.stringify(authResponse.data.user));
            localStorage.setItem('userRole', 'client');
            
            // Redirect to success page with account creation info
            const queryParams = new URLSearchParams({
              type: 'appointment',
              email: formData.email,
              accountCreated: authResponse.data.isNewUser ? 'true' : 'false'
            });
            navigate(`/form-success?${queryParams.toString()}`);
          } else {
            // Appointment submitted but account creation failed - still redirect to success
            const queryParams = new URLSearchParams({
              type: 'appointment',
              email: formData.email
            });
            navigate(`/form-success?${queryParams.toString()}`);
          }
        } catch (authError) {
          console.error('Auto-login failed:', authError);
          // Appointment submitted but auto-login failed - still redirect to success
          const queryParams = new URLSearchParams({
            type: 'appointment',
            email: formData.email
          });
          navigate(`/form-success?${queryParams.toString()}`);
        }
      } else {
        setSubmitError(response.error?.message || 'Failed to submit appointment request. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (name, label, type = 'text', required = false, placeholder = '') => {
    const hasError = validationErrors[name];
    const validation = fieldValidation[name];
    const isValid = validation?.isValid && formData[name];
    const isEmailField = name === 'email';
    const showEmailExistsWarning = isEmailField && emailExists && !hasError;
    
    return (
      <div className="form-group">
        <label className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`form-control-custom ${
            hasError || showEmailExistsWarning ? 'border-red-500' : 
            isValid ? 'border-green-500' : ''
          }`}
          min={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
        />
        {hasError && (
          <div className="validation-error">
            <i className="fas fa-exclamation-circle"></i>
            {hasError}
          </div>
        )}
        {showEmailExistsWarning && (
          <div className="mt-2 text-red-600 text-sm flex items-center border-l-4 border-red-500 bg-red-50 p-3 rounded">
            <i className="fas fa-exclamation-circle mr-2"></i>
            <span><strong>This email is already used.</strong> You cannot submit another public form with this email.</span>
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
          value={formData[name]}
          onChange={handleInputChange}
          className={`form-control-custom form-select ${hasError ? 'border-red-500 border-2' : ''}`}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderTextareaField = (name, label, required = false, placeholder = '') => {
    const hasError = validationErrors[name];
    const value = formData[name] || '';
    const charCount = value.length;
    const minLength = 10;
    const isValid = value.trim().length >= minLength;
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
          rows={4}
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
          <div className="text-sm text-gray-500">
            {charCount} characters
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
    const isValid = validation?.isValid && formData.phone;
    const countries = getSupportedCountries();
    const currentCountry = countries.find(c => c.code === formData.country_code) || countries[0];
    const digitsOnly = formData.phone.replace(/\D/g, '');
    
    return (
      <div className="form-group">
        <label className="form-label">
          Phone Number <span className="text-red-500">*</span>
        </label>
        
        <div className="flex gap-2">
          {/* Country Code Selector - Smaller */}
          <select
            value={formData.country_code}
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
            value={formData.phone}
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

  const visaCategoryOptions = [
    { value: 'eb1a', label: 'EB-1A (Extraordinary Ability)' },
    { value: 'eb2-niw', label: 'EB-2 NIW (National Interest Waiver)' },
    { value: 'o1', label: 'O-1 Visa' },
    { value: 'multiple', label: 'Multiple Categories' },
    { value: 'other', label: 'Other / Not Sure' }
  ];

  const timezoneOptions = [
    { value: 'EST', label: 'Eastern Time (EST)' },
    { value: 'CST', label: 'Central Time (CST)' },
    { value: 'MST', label: 'Mountain Time (MST)' },
    { value: 'PST', label: 'Pacific Time (PST)' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)' },
    { value: 'CET', label: 'Central European Time (CET)' },
    { value: 'IST', label: 'India Standard Time (IST)' },
    { value: 'CST-China', label: 'China Standard Time (CST)' },
    { value: 'JST', label: 'Japan Standard Time (JST)' },
    { value: 'AEST', label: 'Australian Eastern Time (AEST)' },
    { value: 'other', label: 'Other' }
  ];

  const timeOptions = [
    { value: '9:00 AM', label: '9:00 AM' },
    { value: '10:00 AM', label: '10:00 AM' },
    { value: '11:00 AM', label: '11:00 AM' },
    { value: '12:00 PM', label: '12:00 PM' },
    { value: '1:00 PM', label: '1:00 PM' },
    { value: '2:00 PM', label: '2:00 PM' },
    { value: '3:00 PM', label: '3:00 PM' },
    { value: '4:00 PM', label: '4:00 PM' },
    { value: '5:00 PM', label: '5:00 PM' }
  ];

  const consultationTypeOptions = [
    { value: 'video', label: 'Video Call (Zoom/Teams)' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'in-person', label: 'In-Person Meeting' }
  ];

  return (
    <div>
      
      <div className="pt-28 pb-20 bg-gradient-to-br from-green-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Schedule Your Consultation
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Book a personalized consultation with our immigration experts to discuss your case and explore your options.
            </p>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="form-container">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <i className="fas fa-calendar-alt text-green-600 mr-3"></i>
                  Book Your Consultation
                </h2>
                <p className="text-gray-600 text-lg">
                  Fill out the form below and we'll get back to you within 24 hours to confirm your appointment.
                </p>
              </div>

              {/* Personal Information */}
              <div className="form-grid-2">
                {renderInputField('first_name', 'First Name', 'text', true, 'Enter your first name')}
                {renderInputField('last_name', 'Last Name', 'text', true, 'Enter your last name')}
              </div>

              <div className="form-grid-2">
                {renderInputField('email', 'Email Address', 'email', true, 'your.email@example.com')}
                {renderPhoneInputField()}
              </div>

              {/* Consultation Details */}
              <div className="form-grid-2">
                {renderSelectField('visa_category', 'Visa Category', visaCategoryOptions, true)}
                {renderSelectField('timezone', 'Your Timezone', timezoneOptions, true)}
              </div>

              <div className="form-grid-2">
                {renderInputField('preferred_date', 'Preferred Date', 'date', true)}
                {renderSelectField('preferred_time', 'Preferred Time', timeOptions, true)}
              </div>

              {renderSelectField('consultation_type', 'Consultation Type', consultationTypeOptions, false)}

              {renderTextareaField('details', 'Background & Goals', true, 'Please tell us about your background, current situation, and what you hope to achieve through this consultation...')}

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
                  disabled={isSubmitting || emailExists}
                  className={`btn-primary ${emailExists ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={emailExists ? 'This email is already registered. Please use a different email to continue.' : ''}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-check"></i>
                      Schedule Consultation
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAppointmentPage;