import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAssessmentsAPI, authAPI } from '../../services/api';
import { validateEmailRealTime, validateNameRealTime, validatePhoneRealTime, validateLocation, validateFieldOfExpertise, getSupportedCountries, getPhoneMaxLength } from '../../utils/validation';

const ProfileAssessmentPage = () => {
  const navigate = useNavigate();
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    client_email: '',
    client_phone: '',
    client_country_code: 'US',
    service_interest: '', // New service field
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
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [previousAssessment, setPreviousAssessment] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const criteriaLabels = {
    awards_recognition: 'Awards & Prizes',
    membership_associations: 'Membership in Associations',
    published_material: 'Published Material About You',
    judging_others_work: 'Judging the Work of Others',
    original_contributions: 'Original Contributions of Major Significance',
    scholarly_articles: 'Authorship of Scholarly Articles',
    leading_role: 'Leading or Critical Role',
    high_salary: 'High Salary or Remuneration',
    exhibitions_showcases: 'Exhibitions or Showcases',
    commercial_success: 'Commercial Success'
  };

  const criteriaDescriptions = {
    awards_recognition: 'Receipt of nationally or internationally recognized prizes or awards for excellence',
    membership_associations: 'Membership in associations requiring outstanding achievements judged by experts',
    published_material: 'Published material about you in professional or major media',
    judging_others_work: 'Participation as a judge of others\' work',
    original_contributions: 'Original contributions that significantly advanced your field',
    scholarly_articles: 'Scholarly articles in professional or major publications',
    leading_role: 'Leading or critical role for organizations with distinguished reputation',
    high_salary: 'High salary or significantly high remuneration compared to others in field',
    exhibitions_showcases: 'Display of work at artistic exhibitions or showcases',
    commercial_success: 'Commercial success in performing arts'
  };

  const criteriaIcons = {
    awards_recognition: { icon: 'fas fa-trophy', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    membership_associations: { icon: 'fas fa-users', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    published_material: { icon: 'fas fa-newspaper', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    judging_others_work: { icon: 'fas fa-gavel', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    original_contributions: { icon: 'fas fa-lightbulb', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    scholarly_articles: { icon: 'fas fa-file-alt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    leading_role: { icon: 'fas fa-crown', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    high_salary: { icon: 'fas fa-dollar-sign', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    exhibitions_showcases: { icon: 'fas fa-palette', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
    commercial_success: { icon: 'fas fa-chart-line', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' }
  };

  // Check if email exists with debouncing
  useEffect(() => {
    const checkEmailExists = async () => {
      const email = formData.client_email;
      
      // Only check if email is valid format
      const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!email || !emailPattern.test(email)) {
        setEmailExists(false);
        setPreviousAssessment(null);
        return;
      }

      setCheckingEmail(true);
      try {
        const response = await authAPI.checkEmail(email);
        console.log('📧 Email check response:', response);
        
        if (response.success && response.exists) {
          // Only block if they already have an assessment (not just a registration)
          if (response.hasAssessment) {
            setEmailExists(true);
            console.log('✅ Email exists with assessment:', email);
            if (response.assessment) {
              setPreviousAssessment(response.assessment);
            }
          } else {
            // Has registration but no assessment — allow them to proceed
            setEmailExists(false);
            setPreviousAssessment(null);
            console.log('✅ Email exists (registered) but no assessment — allowing submission');
          }
          
          // Auto-fill user data if available
          if (response.user) {
            setFormData(prev => ({
              ...prev,
              first_name: response.user.first_name || prev.first_name,
              last_name: response.user.last_name || prev.last_name,
              client_phone: response.user.phone || prev.client_phone,
              client_country_code: response.user.phone_country_code || prev.client_country_code
            }));
          }
        } else {
          setEmailExists(false);
          setPreviousAssessment(null);
          console.log('✅ Email is available (new)');
        }
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailExists(false);
        setPreviousAssessment(null);
      } finally {
        setCheckingEmail(false);
      }
    };

    // Debounce the email check
    const timeoutId = setTimeout(() => {
      if (formData.client_email) {
        checkEmailExists();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [formData.client_email]);

  const handleDownloadPreviousAssessment = async () => {
    if (!previousAssessment) return;
    
    setDownloadingPDF(true);
    try {
      // Fetch full assessment data
      const response = await profileAssessmentsAPI.getByEmail(
        formData.client_email, 
        previousAssessment.id
      );
      
      if (response.success && response.data) {
        const { generateAssessmentPDF } = await import('../../utils/pdfGenerator');
        generateAssessmentPDF(response.data);
      } else {
        alert('Failed to fetch assessment data. Please try again.');
      }
    } catch (error) {
      console.error('Failed to download assessment:', error);
      alert('Failed to download assessment. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

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
    if (name === 'client_phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      const maxLength = getPhoneMaxLength(formData.client_country_code);
      
      // Don't allow more digits than the maximum
      if (digitsOnly.length > maxLength) {
        return; // Prevent entering more than max digits
      }
      
      // Update with digits only
      const newFormData = {
        ...formData,
        [name]: digitsOnly
      };
      
      setFormData(newFormData);
      
      // Validate phone
      const validation = validatePhoneRealTime(digitsOnly, formData.client_country_code);
      
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
      case 'client_email':
        validation = validateEmailRealTime(value);
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
    const requiredFields = ['first_name', 'last_name', 'client_email', 'client_phone', 'service_interest', 'field_of_expertise', 'years_of_experience', 'current_location'];
    
    // Check if email already exists - block submission
    if (emailExists) {
      errors.client_email = 'This email is already registered. Please use a different email address.';
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
        case 'client_email':
          validation = validateEmailRealTime(formData[field]);
          break;
        case 'client_phone':
          if (!formData[field]) {
            validation = { isValid: false, errors: ['Phone number is required'] };
          } else {
            validation = validatePhoneRealTime(formData[field], formData.client_country_code);
          }
          break;
        case 'current_location':
          validation = validateLocation(formData[field]);
          break;
        case 'service_interest':
          validation = { isValid: !!formData[field], errors: formData[field] ? [] : ['Service is required'] };
          break;
        case 'field_of_expertise':
          validation = validateFieldOfExpertise(formData[field]);
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

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      // Map frontend field names to backend expected field names
      const submissionData = {
        client_name: `${formData.first_name} ${formData.last_name}`.trim(),
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        service_interest: formData.service_interest,
        field_of_expertise: formData.field_of_expertise,
        years_of_experience: formData.years_of_experience,
        current_location: formData.current_location,
        // Map criteria fields to backend expected names
        criterion_1_awards: formData.awards_recognition,
        criterion_2_memberships: formData.membership_associations,
        criterion_3_media: formData.published_material,
        criterion_4_judging: formData.judging_others_work,
        criterion_5_contributions: formData.original_contributions,
        criterion_6_publications: formData.scholarly_articles,
        criterion_7_exhibitions: formData.exhibitions_showcases,
        criterion_8_leadership: formData.leading_role,
        criterion_9_salary: formData.high_salary,
        criterion_10_commercial: formData.commercial_success,
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
              phone: formData.client_phone,
              phone_country_code: formData.client_country_code,
              service_interest: formData.service_interest,
              field_of_expertise: formData.field_of_expertise,
              current_location: formData.current_location,
              company: ''
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
          Phone Number <span className="text-red-500">*</span>
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

  const renderInputField = (name, label, type = 'text', required = false, placeholder = '') => {
    const hasError = validationErrors[name];
    const validation = fieldValidation[name];
    const isValid = validation?.isValid && formData[name];
    const isEmailField = name === 'client_email';
    // Always show red warning if email exists (even if there's an assessment)
    const showEmailExistsWarning = isEmailField && emailExists && !hasError;
    const showPreviousAssessment = isEmailField && previousAssessment && !hasError;
    
    // Debug logging for email field
    if (isEmailField && formData[name]) {
      console.log('🔍 Email field render state:', {
        email: formData[name],
        emailExists,
        previousAssessment: previousAssessment,
        previousAssessmentExists: !!previousAssessment,
        hasError,
        showEmailExistsWarning,
        showPreviousAssessment
      });
      
      if (previousAssessment) {
        console.log('📊 Previous assessment data:', previousAssessment);
      } else {
        console.log('⚠️ No previous assessment data available');
      }
    }
    
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
            showPreviousAssessment ? 'border-blue-500' :
            isValid ? 'border-green-500' : ''
          }`}
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
            <span><strong>This email is already used.</strong> A profile assessment already exists for this email. You can only submit one assessment per email.</span>
          </div>
        )}
        {showPreviousAssessment && (
          <div className="mt-2 border-l-4 border-blue-500 bg-blue-50 p-3 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-700 text-sm">
                <i className="fas fa-file-pdf mr-2"></i>
                <span>
                  Previous assessment found ({new Date(previousAssessment.createdAt).toLocaleDateString()}) - 
                  Score: {previousAssessment.overall_score}% ({previousAssessment.profile_strength})
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadPreviousAssessment}
                disabled={downloadingPDF}
                className="ml-3 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download Assessment Report"
              >
                {downloadingPDF ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-download"></i>
                )}
              </button>
            </div>
          </div>
        )}
        {checkingEmail && isEmailField && !hasError && !emailExists && (
          <div className="mt-2 text-gray-500 text-sm flex items-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Checking email...
          </div>
        )}
        {isValid && !hasError && !showEmailExistsWarning && !showPreviousAssessment && (
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

    const serviceOptions = [
      { value: 'eb1a-eligibility', label: 'EB-1A Eligibility' },
      { value: 'profile-building', label: 'Profile Building' },
      { value: 'eb2-niw', label: 'EB-2 NIW' },
      { value: 'o1-visa', label: 'O-1 Visa' },
      { value: 'career-coaching', label: 'Career Coaching' },
      { value: 'other', label: 'Other' }
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
        
        <div className="form-grid-2">
          {renderInputField('client_email', 'Email Address', 'email', true, 'your.email@example.com')}
          {renderPhoneInputField()}
        </div>
        
        <div className="form-grid-2">
          {renderSelectField('service_interest', 'Service', serviceOptions, true)}
          {renderInputField('current_location', 'Current Location', 'text', true, 'City, Country')}
        </div>
        
        <div className="form-grid-2">
          {renderInputField('field_of_expertise', 'Field of Expertise', 'text', true, 'e.g., Artificial Intelligence, Biotechnology')}
          {renderSelectField('years_of_experience', 'Years of Experience', experienceOptions, true)}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleNextStep}
            disabled={emailExists}
            className={`btn-primary ${emailExists ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={emailExists ? 'This email is already registered. Please use a different email to continue.' : ''}
          >
            Continue to Assessment
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    );
  };

  const renderCriteriaInput = (criteriaKey) => {
    const iconConfig = criteriaIcons[criteriaKey];
    const criteriaNumber = Object.keys(criteriaLabels).indexOf(criteriaKey) + 1;
    
    // Specific descriptions for each criterion level
    const getOptionDescriptions = (key) => {
      const descriptions = {
        awards_recognition: {
          3: 'Multiple national/international awards (3+) from recognized organizations',
          2: '1-2 national or regional awards',
          1: 'Only local or organizational awards',
          0: 'No relevant awards'
        },
        membership_associations: {
          3: 'Fellow or senior member in prestigious organizations (IEEE Fellow, etc.)',
          2: 'Member of selective professional organizations requiring achievements',
          1: 'General membership in professional organizations',
          0: 'No relevant memberships'
        },
        published_material: {
          3: 'Featured in major national/international media or highly cited (100+ citations)',
          2: 'Articles in professional publications or regional media (20-100 citations)',
          1: 'Limited media mentions or citations (<20)',
          0: 'No media coverage or citations'
        },
        judging_others_work: {
          3: 'Regular reviewer for top journals/conferences or grant panels (25+ reviews)',
          2: 'Reviewer for journals or program committees (5-20 reviews)',
          1: 'Limited judging experience (<5 reviews)',
          0: 'No judging experience'
        },
        original_contributions: {
          3: 'Groundbreaking work widely adopted/cited, patents with commercial use',
          2: 'Notable contributions recognized by peers, some patents/innovations',
          1: 'Limited documented impact',
          0: 'No documented major contributions'
        },
        scholarly_articles: {
          3: '5+ publications in top-tier journals/conferences',
          2: '5-15 publications in recognized venues',
          1: 'Less than 5 publications',
          0: 'No scholarly publications'
        },
        leading_role: {
          3: 'C-level or senior leadership in distinguished organizations',
          2: 'Department head or significant leadership role',
          1: 'Team lead or minor leadership positions',
          0: 'No leadership experience'
        },
        high_salary: {
          3: 'Top 10% salary in field with documentation',
          2: 'Above average salary (top 25%) with evidence',
          1: 'Average or slightly above average salary',
          0: 'Below average compensation'
        },
        exhibitions_showcases: {
          3: 'Major international exhibitions or showcases',
          2: 'National or significant regional exhibitions',
          1: 'Local exhibitions or limited showcases',
          0: 'No exhibitions or showcases'
        },
        commercial_success: {
          3: 'Significant commercial success with documented revenue/impact',
          2: 'Moderate commercial success or recognition',
          1: 'Limited commercial impact',
          0: 'No commercial success'
        }
      };
      return descriptions[key] || {
        3: 'Strong evidence',
        2: 'Moderate evidence', 
        1: 'Weak evidence',
        0: 'No evidence'
      };
    };

    const optionDescriptions = getOptionDescriptions(criteriaKey);
    
    return (
      <div key={criteriaKey} className={`bg-white rounded-lg border ${iconConfig.border} p-6 shadow-sm hover:shadow-md transition-shadow`}>
        {/* Header with icon and title */}
        <div className="flex items-start mb-4">
          <div className={`w-12 h-12 ${iconConfig.bg} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
            <i className={`${iconConfig.icon} ${iconConfig.color} text-xl`}></i>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              Criterion {criteriaNumber}: {criteriaLabels[criteriaKey]}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {criteriaDescriptions[criteriaKey]}
            </p>
          </div>
        </div>

        {/* Radio button options */}
        <div className="space-y-2">
          {[
            { value: 3, label: 'Strong' },
            { value: 2, label: 'Moderate' },
            { value: 1, label: 'Weak' },
            { value: 0, label: 'None' }
          ].map(option => (
            <label key={option.value} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
              formData[criteriaKey] === option.value 
                ? `border-blue-500 bg-blue-50` 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name={criteriaKey}
                value={option.value}
                checked={formData[criteriaKey] === option.value}
                onChange={(e) => handleCriteriaChange(criteriaKey, parseInt(e.target.value))}
                className="w-4 h-4 text-blue-600 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-2">{option.label}:</span>
                  <span className="text-sm text-gray-600">{optionDescriptions[option.value]}</span>
                </div>
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
        {/* Header with step number */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-3">
              2
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Evaluate Your Profile Against 10 Criteria
            </h2>
          </div>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            For each criterion below, honestly assess your current achievements. You need to meet at least 3 criteria to qualify for EB-1A.
          </p>
        </div>

        <div className="space-y-4">
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