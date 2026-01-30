import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAssessmentsAPI, authAPI } from '../../services/api';
import { validateEmailRealTime, validateNameRealTime, validatePhoneRealTime, validateLocation, validateFieldOfExpertise, getSupportedCountries, getPhoneMaxLength } from '../../utils/validation';

const ProfileAssessmentPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    client_email: '',
    client_phone: '',
    client_country_code: 'US',
    field_of_expertise: '',
    years_of_experience: '',
    current_location: '',
    // EB-1A Criteria (0-3 scale)
    original_contributions: 0,
    published_material: 0,
    judging_others_work: 0,
    scholarly_articles: 0,
    leading_role: 0,
    high_salary: 0,
    exhibitions_showcases: 0,
    membership_associations: 0,
    awards_recognition: 0,
    commercial_success: 0
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const criteriaLabels = {
    original_contributions: 'Original Contributions',
    published_material: 'Published Material About You',
    judging_others_work: 'Judging Others\' Work',
    scholarly_articles: 'Scholarly Articles',
    leading_role: 'Leading Role in Organizations',
    high_salary: 'High Salary/Remuneration',
    exhibitions_showcases: 'Exhibitions/Showcases',
    membership_associations: 'Membership in Associations',
    awards_recognition: 'Awards & Recognition',
    commercial_success: 'Commercial Success'
  };

  const criteriaDescriptions = {
    original_contributions: 'Have you made original scientific, scholarly, artistic, athletic, or business-related contributions of major significance?',
    published_material: 'Has material been published about you in professional publications, major trade publications, or major media?',
    judging_others_work: 'Have you judged the work of others in your field as a panel member or reviewer?',
    scholarly_articles: 'Have you authored scholarly articles in professional journals or major media?',
    leading_role: 'Have you performed in a leading or critical role for organizations with a distinguished reputation?',
    high_salary: 'Do you command a high salary or significantly high remuneration compared to others in your field?',
    exhibitions_showcases: 'Have your works been displayed at artistic exhibitions or showcases?',
    membership_associations: 'Are you a member of associations that require outstanding achievements for membership?',
    awards_recognition: 'Have you received nationally or internationally recognized prizes or awards for excellence?',
    commercial_success: 'Have you achieved commercial success in the performing arts (box office, record sales, etc.)?'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number length restriction
    if (name === 'client_phone') {
      const digitsOnly = value.replace(/\D/g, '');
      const maxLength = getPhoneMaxLength(formData.client_country_code);
      if (digitsOnly.length > maxLength) {
        return; // Don't allow more digits than the maximum
      }
    }
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Real-time validation based on field type
    let validation;
    switch (name) {
      case 'first_name':
        validation = validateNameRealTime(value, 'First name');
        break;
      case 'last_name':
        validation = validateNameRealTime(value, 'Last name');
        break;
      case 'client_email':
        validation = validateEmailRealTime(value);
        break;
      case 'client_phone':
        validation = validatePhoneRealTime(value, formData.client_country_code);
        break;
      case 'current_location':
        validation = validateLocation(value);
        break;
      case 'field_of_expertise':
        validation = validateFieldOfExpertise(value);
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
      client_country_code: newCountryCode,
      client_phone: '' // Clear phone when country changes
    }));
    
    // Clear phone validation when country changes
    setFieldValidation(prev => {
      const newValidation = { ...prev };
      delete newValidation.client_phone;
      return newValidation;
    });
    
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.client_phone;
      return newErrors;
    });
  };

  const validateStep1 = () => {
    const errors = {};
    const requiredFields = ['first_name', 'last_name', 'client_email', 'field_of_expertise', 'years_of_experience', 'current_location'];
    
    requiredFields.forEach(field => {
      let validation;
      switch (field) {
        case 'first_name':
          validation = validateNameRealTime(formData[field], 'First name');
          break;
        case 'last_name':
          validation = validateNameRealTime(formData[field], 'Last name');
          break;
        case 'client_email':
          validation = validateEmailRealTime(formData[field]);
          break;
        case 'current_location':
          validation = validateLocation(formData[field]);
          break;
        case 'field_of_expertise':
          validation = validateFieldOfExpertise(formData[field]);
          break;
        default:
          validation = { isValid: !!formData[field], errors: formData[field] ? [] : [`${field.replace('_', ' ')} is required`] };
      }
      
      if (!validation.isValid || (field !== 'client_email' && !formData[field])) {
        errors[field] = validation.errors[0] || `${field.replace('_', ' ')} is required`;
      }
    });
    
    // Validate phone if provided
    if (formData.client_phone) {
      const phoneValidation = validatePhoneRealTime(formData.client_phone, formData.client_country_code);
      if (!phoneValidation.isValid) {
        errors.client_phone = phoneValidation.errors[0];
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleCountryCodeChange = (countryCode) => {
    setFormData(prev => ({
      ...prev,
      client_country_code: countryCode,
      client_phone: '' // Clear phone when country changes
    }));
  };

  const handleCriteriaChange = (criteria, value) => {
    setFormData(prev => ({
      ...prev,
      [criteria]: parseInt(value)
    }));
  };

  const calculateScore = () => {
    const criteriaKeys = Object.keys(criteriaLabels);
    const totalScore = criteriaKeys.reduce((sum, key) => sum + formData[key], 0);
    const maxScore = criteriaKeys.length * 3;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    let strength = 'Weak';
    let recommendation = 'Significant profile building required';
    let color = 'text-red-600';
    
    if (percentage >= 80) {
      strength = 'Excellent';
      recommendation = 'Strong EB-1A candidate';
      color = 'text-green-600';
    } else if (percentage >= 60) {
      strength = 'Good';
      recommendation = 'Good EB-1A potential with some improvements';
      color = 'text-blue-600';
    } else if (percentage >= 40) {
      strength = 'Fair';
      recommendation = 'Moderate profile building needed';
      color = 'text-yellow-600';
    }
    
    return {
      totalScore,
      maxScore,
      percentage,
      strength,
      recommendation,
      color,
      criteriaCount: criteriaKeys.filter(key => formData[key] >= 2).length
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const result = calculateScore();
      
      // Combine first_name and last_name into client_name for API compatibility
      const submissionData = {
        ...formData,
        client_name: `${formData.first_name} ${formData.last_name}`.trim(),
        overall_score: result.totalScore,
        profile_strength: result.strength.toLowerCase(),
        criteria_met: result.criteriaCount
      };

      // Submit the profile assessment
      const response = await profileAssessmentsAPI.submit(submissionData);
      
      if (response.success) {
        // Auto-create account and login user
        try {
          const authResponse = await authAPI.emailLogin(
            formData.client_email, 
            {
              name: `${formData.first_name} ${formData.last_name}`.trim(),
              email: formData.client_email,
              phone: formData.phone,
              field_of_expertise: formData.field_of_expertise,
              current_location: formData.current_location,
              company: formData.company
            }, 
            'profile_assessment'
          );
          
          if (authResponse.success) {
            // Store auth data
            localStorage.setItem('token', authResponse.token);
            localStorage.setItem('user', JSON.stringify(authResponse.data.user));
            localStorage.setItem('userRole', 'client');
            
            // Redirect to success page with account creation info
            const queryParams = new URLSearchParams({
              type: 'profile_assessment',
              email: formData.client_email,
              accountCreated: authResponse.data.isNewUser ? 'true' : 'false'
            });
            navigate(`/form-success?${queryParams.toString()}`);
          } else {
            // Assessment submitted but account creation failed - still redirect to success
            const queryParams = new URLSearchParams({
              type: 'profile_assessment',
              email: formData.client_email
            });
            navigate(`/form-success?${queryParams.toString()}`);
          }
        } catch (authError) {
          console.error('Auto-login failed:', authError);
          // Assessment submitted but auto-login failed - still redirect to success
          const queryParams = new URLSearchParams({
            type: 'profile_assessment',
            email: formData.client_email
          });
          navigate(`/form-success?${queryParams.toString()}`);
        }
      } else {
        setSubmitError(response.error?.message || 'Failed to submit assessment. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while submitting your assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 1 ? <i className="fas fa-check"></i> : '1'}
            </div>
            <span className={`ml-3 font-medium text-lg ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Personal Information
            </span>
          </div>
          
          {/* Connector */}
          <div className={`w-20 h-1 rounded ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          {/* Step 2 */}
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className={`ml-3 font-medium text-lg ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Assessment
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderPhoneInputField = () => {
    const hasError = validationErrors.client_phone;
    const validation = fieldValidation.client_phone;
    const isValid = validation?.isValid && formData.client_phone;
    const countries = getSupportedCountries();
    const currentCountry = countries.find(c => c.code === formData.client_country_code) || countries[0];
    const digitsOnly = formData.client_phone.replace(/\D/g, '');
    
    return (
      <div className="form-group">
        <label className="form-label">
          Phone Number <span className="text-gray-500 text-sm">(Optional)</span>
        </label>
        
        <div className="flex gap-2">
          {/* Country Code Selector - Smaller */}
          <select
            value={formData.client_country_code}
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
            name="client_phone"
            value={formData.client_phone}
            onChange={handleInputChange}
            placeholder={`Enter ${currentCountry.maxDigits} digits`}
            maxLength={currentCountry.maxDigits + 5} // Allow for formatting characters
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

  const renderInputField = (name, label, type = 'text', required = false, placeholder = '') => {
    const hasError = validationErrors[name];
    const validation = fieldValidation[name];
    const isValid = validation?.isValid && formData[name];
    
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
        {isValid && !hasError && (
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

  const renderStep1 = () => {
    const experienceOptions = [
      { value: '0-2', label: '0-2 years' },
      { value: '3-5', label: '3-5 years' },
      { value: '6-10', label: '6-10 years' },
      { value: '11-15', label: '11-15 years' },
      { value: '16+', label: '16+ years' }
    ];

    return (
      <div className="form-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-user text-blue-600 mr-3"></i>
            Personal Information
          </h2>
          <p className="text-gray-600 text-lg">
            Please provide your basic information to get started with your EB-1A profile assessment.
          </p>
        </div>
        
        <div className="form-grid-2">
          {renderInputField('first_name', 'First Name', 'text', true, 'Enter your first name')}
          {renderInputField('last_name', 'Last Name', 'text', true, 'Enter your last name')}
        </div>
        
        <div className="form-grid">
          {renderInputField('client_email', 'Email Address', 'email', true, 'your.email@example.com')}
          {renderPhoneInputField()}
          {renderInputField('current_location', 'Current Location', 'text', true, 'City, Country')}
          {renderInputField('field_of_expertise', 'Field of Expertise', 'text', true, 'e.g., Artificial Intelligence, Biotechnology')}
          {renderSelectField('years_of_experience', 'Years of Experience', experienceOptions, true)}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNextStep}
            className="btn-primary"
          >
            Continue to Assessment
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    );
  };

  const renderCriteriaInput = (criteriaKey) => {
    return (
      <div key={criteriaKey} className="bg-gray-50 rounded-lg p-6 mb-6 border-l-4 border-blue-600">
        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
          {criteriaLabels[criteriaKey]}
        </h4>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {criteriaDescriptions[criteriaKey]}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(value => (
            <label key={value} className={`flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
              formData[criteriaKey] === value 
                ? 'border-blue-600 bg-blue-600 text-white' 
                : 'border-gray-200 hover:border-blue-600'
            }`}>
              <input
                type="radio"
                name={criteriaKey}
                value={value}
                checked={formData[criteriaKey] === value}
                onChange={(e) => handleCriteriaChange(criteriaKey, e.target.value)}
                className="sr-only"
              />
              <div className="text-center w-full">
                <div className="font-semibold">
                  {value === 0 && 'No'}
                  {value === 1 && 'Weak'}
                  {value === 2 && 'Good'}
                  {value === 3 && 'Strong'}
                </div>
                <div className="text-xs opacity-75">({value})</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const completedCriteria = Object.keys(criteriaLabels).filter(key => formData[key] > 0).length;
    const totalCriteria = Object.keys(criteriaLabels).length;
    
    return (
      <div className="form-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-trophy text-blue-600 mr-3"></i>
            EB-1A Criteria Assessment
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Rate each criterion based on your current achievements. You need to demonstrate excellence in at least 3 out of 10 criteria for EB-1A eligibility.
          </p>
          
          {/* Criteria Progress */}
          {completedCriteria > 0 && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle mr-2"></i>
              You've rated {completedCriteria} out of {totalCriteria} criteria
              {completedCriteria >= 3 && (
                <span className="font-semibold"> - Great! You meet the minimum requirement.</span>
              )}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
              <div className="text-left">
                <h4 className="font-semibold text-blue-900 mb-2">Assessment Guidelines:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>No (0):</strong> You don't have evidence for this criterion</li>
                  <li>• <strong>Weak (1):</strong> You have some evidence but it's limited</li>
                  <li>• <strong>Good (2):</strong> You have solid evidence that meets the criterion</li>
                  <li>• <strong>Strong (3):</strong> You have exceptional evidence that clearly exceeds the criterion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Object.keys(criteriaLabels).map(renderCriteriaInput)}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Information
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Analyzing Your Profile...
              </>
            ) : (
              <>
                <i className="fas fa-chart-line"></i>
                Get My Assessment Results
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Free EB-1A Profile Assessment
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Evaluate your current profile strength for EB-1A extraordinary ability petition. 
              Get personalized recommendations to improve your chances of success.
            </p>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {renderStepIndicator()}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}

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
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileAssessmentPage;