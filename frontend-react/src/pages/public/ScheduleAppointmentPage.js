import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import { validateEmail, validateName, validatePhoneWithCountry, getSupportedCountries } from '../../utils/validation';

const ScheduleAppointmentPage = () => {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    
    // Real-time validation for details field
    if (name === 'details' && value.trim().length > 0) {
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
        validation = validatePhoneWithCountry(value, formData.country_code);
        break;
      case 'details':
        if (!value || value.trim().length === 0) {
          validation = { isValid: false, errors: ['Background & Goals is required'] };
        } else if (value.trim().length < 10) {
          validation = { isValid: false, errors: ['Please provide at least 10 characters to help us understand your background'] };
        }
        break;
      default:
        if (!value && ['visa_category', 'timezone', 'preferred_date', 'preferred_time'].includes(name)) {
          validation = { isValid: false, errors: [`${name.replace('_', ' ')} is required`] };
        }
        break;
    }
    
    return validation;
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'visa_category', 'timezone', 'preferred_date', 'preferred_time', 'details'];
    
    requiredFields.forEach(field => {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        errors[field] = validation.errors[0];
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
      
      const response = await appointmentsAPI.submit(submissionData);
      
      if (response.success) {
        // Redirect to success page with account creation info
        const queryParams = new URLSearchParams({
          type: 'appointment',
          email: formData.email
        });
        navigate(`/form-success?${queryParams.toString()}`);
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
          className={`form-control-custom ${hasError ? 'border-red-500' : ''}`}
          min={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
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
          value={formData[name]}
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
    const countries = getSupportedCountries();
    
    return (
      <div className="form-group">
        <label className="form-label">
          Phone Number <span className="text-red-500">*</span>
        </label>
        
        <div className="flex gap-2">
          {/* Country Code Selector - Smaller */}
          <select
            value={formData.country_code}
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
            value={formData.phone}
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
                  disabled={isSubmitting}
                  className="btn-primary"
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