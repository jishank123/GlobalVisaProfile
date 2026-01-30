import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAssessmentsAPI } from '../../services/api';
import { validateEmail, validateName, validatePhoneWithCountry, validateLocation, validateFieldOfExpertise, getSupportedCountries } from '../../utils/validation';

const ProfileAssessmentPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    client_name: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState(null);

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
    
    // Real-time validation for better UX (debounced)
    if (value.trim()) {
      setTimeout(() => {
        const validation = validateField(name, value);
        if (!validation.isValid && value === formData[name]) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: validation.errors[0]
          }));
        }
      }, 1000); // 1 second delay for real-time validation
    }
  };

  const validateField = (name, value) => {
    let validation = { isValid: true, errors: [] };
    
    switch (name) {
      case 'client_name':
        validation = validateName(value, 'Full name');
        break;
      case 'client_email':
        validation = validateEmail(value);
        break;
      case 'client_phone':
        validation = validatePhoneWithCountry(value, formData.client_country_code);
        break;
      case 'field_of_expertise':
        validation = validateFieldOfExpertise(value);
        break;
      case 'years_of_experience':
        if (!value) {
          validation = { isValid: false, errors: ['Years of experience is required'] };
        }
        break;
      case 'current_location':
        validation = validateLocation(value);
        break;
      default:
        break;
    }
    
    return validation;
  };

  const validateStep1 = () => {
    const errors = {};
    const requiredFields = ['client_name', 'client_email', 'field_of_expertise', 'years_of_experience', 'current_location'];
    
    requiredFields.forEach(field => {
      const validation = validateField(field, formData[field]);
      if (!validation.isValid) {
        errors[field] = validation.errors[0];
      }
    });
    
    // Validate phone if provided
    if (formData.client_phone) {
      const phoneValidation = validateField('client_phone', formData.client_phone);
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
      
      const submissionData = {
        ...formData,
        overall_score: result.totalScore,
        profile_strength: result.strength.toLowerCase(),
        criteria_met: result.criteriaCount
      };

      const response = await profileAssessmentsAPI.submit(submissionData);
      
      if (response.success) {
        // Redirect to success page with account creation info
        const queryParams = new URLSearchParams({
          type: 'profile_assessment',
          email: formData.client_email
        });
        navigate(`/form-success?${queryParams.toString()}`);
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
      <div className="step-indicator flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className={`step-circle w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
              currentStep >= 1 ? 'bg-primary text-white active' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 1 ? <i className="fas fa-check"></i> : '1'}
            </div>
            <span className={`ml-3 font-medium text-lg ${currentStep >= 1 ? 'text-primary' : 'text-gray-500'}`}>
              Personal Information
            </span>
          </div>
          
          {/* Connector */}
          <div className={`step-connector w-20 h-1 rounded ${currentStep > 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          
          {/* Step 2 */}
          <div className="flex items-center">
            <div className={`step-circle w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
              currentStep >= 2 ? 'bg-primary text-white active' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className={`ml-3 font-medium text-lg ${currentStep >= 2 ? 'text-primary' : 'text-gray-500'}`}>
              Assessment
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderPhoneInputField = () => {
    const hasError = validationErrors.client_phone;
    const hasValue = formData.client_phone && formData.client_phone.trim();
    const countries = getSupportedCountries();
    const currentCountry = countries.find(c => c.code === formData.client_country_code) || countries[0];
    const digitsOnly = formData.client_phone.replace(/\D/g, '');
    
    return (
      <div className="form-input-container">
        <label className="block text-gray-700 font-semibold mb-2">
          Phone Number <span className="text-gray-500 text-sm">(Optional)</span>
        </label>
        
        <div className="flex gap-2">
          {/* Country Code Selector */}
          <select
            value={formData.client_country_code}
            onChange={(e) => handleCountryCodeChange(e.target.value)}
            className={`px-3 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            style={{ minWidth: '140px' }}
          >
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
          
          {/* Phone Number Input */}
          <input
            type="tel"
            name="client_phone"
            value={formData.client_phone}
            onChange={handleInputChange}
            placeholder={`Enter phone number`}
            minLength={currentCountry.minDigits}
            maxLength={currentCountry.maxDigits}
            className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
              hasError 
                ? 'form-input-error border-red-500 bg-red-50' 
                : hasValue 
                  ? 'form-input-success'
                  : 'border-gray-300 focus:ring-primary focus:border-primary'
            }`}
          />
        </div>
        
        {/* Country Info and Digit Counter */}
        <div className="mt-1 flex justify-between items-center text-xs">
          <span className="text-gray-500">
            Selected: {currentCountry.flag} {currentCountry.name} ({currentCountry.dialCode})
          </span>
          <span className={`${digitsOnly.length < currentCountry.minDigits || digitsOnly.length > currentCountry.maxDigits ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
            {digitsOnly.length}/{currentCountry.maxDigits} digits
          </span>
        </div>
        
        {/* Format Example */}
        {!formData.client_phone && !hasError && (
          <div className="mt-1 text-xs text-gray-400">
            Example: {currentCountry.example}
          </div>
        )}
        
        {hasError && (
          <div className="validation-error mt-2 text-red-600 text-sm flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {hasError}
          </div>
        )}
        {hasValue && !hasError && (
          <div className="mt-2 text-green-600 text-sm flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            Valid {currentCountry.name} phone number
          </div>
        )}
      </div>
    );
  };

  const renderInputField = (name, label, type = 'text', required = false, placeholder = '', helpText = '') => {
    const hasError = validationErrors[name];
    const hasValue = formData[name] && formData[name].trim();
    
    return (
      <div className="form-input-container">
        <label className="block text-gray-700 font-semibold mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            hasError 
              ? 'form-input-error' 
              : hasValue 
                ? 'form-input-success'
                : 'border-gray-300 focus:ring-primary focus:border-primary'
          }`}
        />
        {helpText && !hasError && !hasValue && (
          <div className="mt-1 text-gray-500 text-xs">
            <i className="fas fa-info-circle mr-1"></i>
            {helpText}
          </div>
        )}
        {hasError && (
          <div className="validation-error mt-2 text-red-600 text-sm flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {hasError}
          </div>
        )}
        {hasValue && !hasError && (
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
    const hasValue = formData[name];
    
    return (
      <div className="form-input-container">
        <label className="block text-gray-700 font-semibold mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            hasError 
              ? 'form-input-error' 
              : hasValue 
                ? 'form-input-success'
                : 'border-gray-300 focus:ring-primary focus:border-primary'
          }`}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasError && (
          <div className="validation-error mt-2 text-red-600 text-sm flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {hasError}
          </div>
        )}
        {hasValue && !hasError && (
          <div className="mt-2 text-green-600 text-sm flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            Looks good!
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
      <div className="step-content bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-user text-primary mr-3"></i>
            Personal Information
          </h2>
          <p className="text-gray-600 text-lg">
            Please provide your basic information to get started with your EB-1A profile assessment.
          </p>
          
          {/* Progress Bar */}
          <div className="progress-bar-container w-full h-2 mt-6">
            <div className="progress-bar-fill h-full" style={{ width: '50%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Step 1 of 2</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {renderInputField('client_name', 'Full Name', 'text', true, 'Enter your full name', 'Please enter your first and last name')}
          {renderInputField('client_email', 'Email Address', 'email', true, 'your.email@example.com', 'We\'ll use this to send your assessment results')}
          {renderPhoneInputField()}
          {renderInputField('current_location', 'Current Location', 'text', true, 'City, Country', 'e.g., New York, USA or London, UK')}
          {renderInputField('field_of_expertise', 'Field of Expertise', 'text', true, 'e.g., Artificial Intelligence, Biotechnology', 'Your primary area of professional expertise')}
          {renderSelectField('years_of_experience', 'Years of Experience', experienceOptions, true)}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNextStep}
            className="btn-step bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105 flex items-center"
          >
            Continue to Assessment
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    );
  };
  const renderCriteriaInput = (criteriaKey) => {
    return (
      <div key={criteriaKey} className="criteria-card bg-gray-50 rounded-lg p-6 mb-6 border-l-4 border-primary">
        <h4 className="font-semibold text-gray-900 mb-3 text-lg">
          {criteriaLabels[criteriaKey]}
        </h4>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {criteriaDescriptions[criteriaKey]}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(value => (
            <label key={value} className={`criteria-option flex items-center cursor-pointer p-3 rounded-lg border-2 transition-all ${
              formData[criteriaKey] === value 
                ? 'border-primary bg-primary text-white' 
                : 'border-gray-200 hover:border-primary'
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
      <div className="step-content bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            <i className="fas fa-trophy text-primary mr-3"></i>
            EB-1A Criteria Assessment
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Rate each criterion based on your current achievements. You need to demonstrate excellence in at least 3 out of 10 criteria for EB-1A eligibility.
          </p>
          
          {/* Progress Bar */}
          <div className="progress-bar-container w-full h-2 mb-4">
            <div className="progress-bar-fill h-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mb-4">Step 2 of 2</p>
          
          {/* Criteria Progress */}
          {completedCriteria > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-green-800 text-sm">
                <i className="fas fa-check-circle mr-2"></i>
                You've rated {completedCriteria} out of {totalCriteria} criteria
                {completedCriteria >= 3 && (
                  <span className="font-semibold"> - Great! You meet the minimum requirement.</span>
                )}
              </p>
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
            className="btn-step bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Information
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-step bg-primary text-white px-12 py-3 rounded-lg text-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center relative"
          >
            {isSubmitting && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Analyzing Your Profile...
              </>
            ) : (
              <>
                <i className="fas fa-chart-line mr-2"></i>
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

      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {renderStepIndicator()}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}

              {/* Messages */}
              {submitMessage && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <i className="fas fa-check-circle mr-2"></i>
                  {submitMessage}
                </div>
              )}
              
              {submitError && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {submitError}
                </div>
              )}
            </form>

            {/* Assessment Results */}
            {assessmentResult && (
              <div id="assessment-results" className="mt-12 bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <i className="fas fa-chart-bar text-primary mr-3"></i>
                  Your Assessment Results
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-4xl font-bold ${assessmentResult.color} mb-2`}>
                      {assessmentResult.percentage}%
                    </div>
                    <div className="text-gray-600">Overall Score</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-4xl font-bold ${assessmentResult.color} mb-2`}>
                      {assessmentResult.criteriaCount}/10
                    </div>
                    <div className="text-gray-600">Strong Criteria</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${assessmentResult.color} mb-2`}>
                      {assessmentResult.strength}
                    </div>
                    <div className="text-gray-600">Profile Strength</div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-lg mb-6">
                  <h3 className="font-bold text-blue-900 mb-2">Recommendation:</h3>
                  <p className="text-blue-800">{assessmentResult.recommendation}</p>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    Ready to take the next step in your immigration journey?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/schedule" 
                      className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-all"
                    >
                      <i className="fas fa-calendar mr-2"></i>
                      Schedule Expert Consultation
                    </Link>
                    <Link 
                      to="/profile-building" 
                      className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Learn About Profile Building
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileAssessmentPage;