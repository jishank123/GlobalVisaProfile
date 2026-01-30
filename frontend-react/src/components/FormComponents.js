import React, { useState, useEffect } from 'react';
import { getFieldValidation, getPasswordStrengthColor, getPasswordStrengthText, validatePhoneWithCountry, getSupportedCountries } from '../utils/validation';

// Enhanced Input Field with Real-time Validation
export const ValidatedInput = ({ 
  name, 
  label, 
  type = 'text', 
  value, 
  onChange, 
  formData = {},
  required = false, 
  placeholder = '', 
  disabled = false,
  showValidation = true,
  className = 'form-control-custom',
  ...props 
}) => {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });

  useEffect(() => {
    if (touched || value) {
      const result = getFieldValidation(name, value, formData);
      setValidation(result);
    }
  }, [name, value, formData, touched]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e) => {
    onChange(e);
    if (!touched) setTouched(true);
  };

  const hasErrors = touched && validation.errors && validation.errors.length > 0;
  const hasWarnings = touched && validation.warnings && validation.warnings.length > 0;

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} ${hasErrors ? 'border-red-500 focus:border-red-500' : ''} ${
          touched && validation.isValid && value ? 'border-green-500' : ''
        }`}
        {...props}
      />
      
      {showValidation && touched && (
        <>
          {hasErrors && (
            <div className="mt-2">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-600 text-sm flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              ))}
            </div>
          )}
          
          {hasWarnings && !hasErrors && (
            <div className="mt-2">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-yellow-600 text-sm flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {warning}
                </div>
              ))}
            </div>
          )}
          
          {touched && validation.isValid && value && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              Looks good!
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Password Input with Strength Indicator
export const PasswordInput = ({ 
  name, 
  label, 
  value, 
  onChange, 
  formData = {},
  required = false, 
  placeholder = '', 
  disabled = false,
  showStrength = true,
  className = 'form-control-custom',
  ...props 
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [], strength: null });

  useEffect(() => {
    if (touched || value) {
      const result = getFieldValidation(name, value, formData);
      setValidation(result);
    }
  }, [name, value, formData, touched]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleChange = (e) => {
    onChange(e);
    if (!touched) setTouched(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasErrors = touched && validation.errors && validation.errors.length > 0;
  const hasWarnings = touched && validation.warnings && validation.warnings.length > 0;

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} pr-12 ${hasErrors ? 'border-red-500 focus:border-red-500' : ''} ${
            touched && validation.isValid && value ? 'border-green-500' : ''
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={disabled}
        >
          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      </div>
      
      {/* Password Strength Indicator */}
      {showStrength && value && validation.strength && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Password Strength:</span>
            <span 
              className="text-sm font-semibold"
              style={{ color: getPasswordStrengthColor(validation.strength.score) }}
            >
              {getPasswordStrengthText(validation.strength.score)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${validation.strength.percentage}%`,
                backgroundColor: getPasswordStrengthColor(validation.strength.score)
              }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Validation Messages */}
      {touched && (
        <>
          {hasErrors && (
            <div className="mt-2">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-600 text-sm flex items-start">
                  <i className="fas fa-exclamation-circle mr-2 mt-0.5 flex-shrink-0"></i>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
          
          {hasWarnings && !hasErrors && (
            <div className="mt-2">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="text-yellow-600 text-sm flex items-start">
                  <i className="fas fa-exclamation-triangle mr-2 mt-0.5 flex-shrink-0"></i>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}
          
          {touched && validation.isValid && value && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              Password meets all requirements
            </div>
          )}
        </>
      )}
      
      {/* Password Requirements */}
      {name === 'password' && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-2">Password Requirements:</div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-1 text-xs">
            <div className={`flex items-center ${value && value.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
              <i className={`fas ${value && value.length >= 8 ? 'fa-check' : 'fa-circle'} mr-2`}></i>
              At least 8 characters
            </div>
            <div className={`flex items-center ${value && /[A-Z]/.test(value) ? 'text-green-600' : 'text-gray-500'}`}>
              <i className={`fas ${value && /[A-Z]/.test(value) ? 'fa-check' : 'fa-circle'} mr-2`}></i>
              One uppercase letter
            </div>
            <div className={`flex items-center ${value && /[a-z]/.test(value) ? 'text-green-600' : 'text-gray-500'}`}>
              <i className={`fas ${value && /[a-z]/.test(value) ? 'fa-check' : 'fa-circle'} mr-2`}></i>
              One lowercase letter
            </div>
            <div className={`flex items-center ${value && /\d/.test(value) ? 'text-green-600' : 'text-gray-500'}`}>
              <i className={`fas ${value && /\d/.test(value) ? 'fa-check' : 'fa-circle'} mr-2`}></i>
              One number
            </div>
            <div className={`flex items-center ${value && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value) ? 'text-green-600' : 'text-gray-500'}`}>
              <i className={`fas ${value && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value) ? 'fa-check' : 'fa-circle'} mr-2`}></i>
              One special character
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Phone Input with Country Code Selection
export const PhoneInputWithCountry = ({ 
  name, 
  label, 
  value, 
  onChange, 
  countryCode = 'US',
  onCountryChange,
  required = false, 
  placeholder = '', 
  disabled = false,
  className = 'form-control-custom',
  ...props 
}) => {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [] });
  const [selectedCountry, setSelectedCountry] = useState(countryCode);
  
  const countries = getSupportedCountries();
  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  useEffect(() => {
    if (touched || value) {
      const result = validatePhoneWithCountry(value, selectedCountry);
      setValidation(result);
    }
  }, [value, selectedCountry, touched]);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleCountryChange = (e) => {
    const newCountryCode = e.target.value;
    setSelectedCountry(newCountryCode);
    if (onCountryChange) {
      onCountryChange(newCountryCode);
    }
    // Clear phone number when country changes to avoid confusion
    if (value) {
      const syntheticEvent = {
        target: {
          name,
          value: ''
        }
      };
      onChange(syntheticEvent);
    }
  };

  const handlePhoneChange = (e) => {
    let inputValue = e.target.value;
    
    // Remove all non-digits for length validation
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    // Enforce max length based on country
    if (digitsOnly.length > currentCountry.maxDigits) {
      return; // Don't allow more digits than the maximum
    }
    
    // Auto-format based on country
    if (selectedCountry === 'US') {
      // Format as (XXX) XXX-XXXX
      if (digitsOnly.length <= 3) {
        inputValue = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        inputValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
      } else {
        inputValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
      }
    } else if (selectedCountry === 'UK') {
      // Format as +44 XXXX XXXXXX
      if (digitsOnly.length <= 4) {
        inputValue = digitsOnly;
      } else {
        inputValue = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
      }
    } else if (selectedCountry === 'IN') {
      // Format as XXXXX XXXXX
      if (digitsOnly.length <= 5) {
        inputValue = digitsOnly;
      } else {
        inputValue = `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
      }
    }
    
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: inputValue
      }
    };
    
    onChange(syntheticEvent);
    if (!touched) setTouched(true);
  };

  const hasErrors = touched && validation.errors && validation.errors.length > 0;
  const digitsOnly = value.replace(/\D/g, '');

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return currentCountry.example;
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex gap-2">
        {/* Country Code Selector - Smaller */}
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          disabled={disabled}
          className={`${className} ${hasErrors ? 'border-red-500 focus:border-red-500' : ''}`}
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
          name={name}
          value={value}
          onChange={handlePhoneChange}
          onBlur={handleBlur}
          placeholder={getPlaceholder()}
          disabled={disabled}
          minLength={currentCountry.minDigits}
          maxLength={currentCountry.maxDigits}
          className={`${className} ${hasErrors ? 'border-red-500 focus:border-red-500 bg-red-50' : ''} ${
            touched && validation.isValid && value ? 'border-green-500' : ''
          }`}
          style={{ flex: 1, minWidth: '200px' }}
          {...props}
        />
      </div>
      
      {/* Country Info and Digit Counter */}
      <div className="mt-1 flex justify-between items-center text-xs">
        <span className="text-gray-500">
          Selected: {currentCountry.flag} {currentCountry.name} ({currentCountry.dialCode})
        </span>
        <span className={`${digitsOnly.length < currentCountry.minDigits || digitsOnly.length > currentCountry.maxDigits ? 'text-red-500' : 'text-gray-500'}`}>
          {digitsOnly.length}/{currentCountry.maxDigits} digits
        </span>
      </div>
      
      {touched && (
        <>
          {hasErrors && (
            <div className="mt-2">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-600 text-sm flex items-center validation-error">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              ))}
            </div>
          )}
          
          {touched && validation.isValid && value && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              Valid {currentCountry.name} phone number
            </div>
          )}
        </>
      )}
      
      {/* Format Example */}
      {!value && !hasErrors && (
        <div className="mt-1 text-xs text-gray-400">
          Example: {currentCountry.example}
        </div>
      )}
    </div>
  );
};

// Country Select with Autocomplete
export const CountrySelect = ({ 
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  disabled = false,
  className = 'form-control-custom',
  ...props 
}) => {
  const [touched, setTouched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, errors: [], suggestions: [] });

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Brazil', 'Bulgaria',
    'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic',
    'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany',
    'Ghana', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
    'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania',
    'Malaysia', 'Mexico', 'Morocco', 'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
    'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
    'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden',
    'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Uruguay', 'Venezuela', 'Vietnam'
  ];

  useEffect(() => {
    if (touched || value) {
      const result = getFieldValidation(name, value);
      setValidation(result);
    }
  }, [name, value, touched]);

  const handleBlur = () => {
    setTouched(true);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFocus = () => {
    if (value) {
      setShowSuggestions(true);
    }
  };

  const handleChange = (e) => {
    onChange(e);
    if (!touched) setTouched(true);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (country) => {
    const syntheticEvent = {
      target: {
        name,
        value: country
      }
    };
    onChange(syntheticEvent);
    setShowSuggestions(false);
  };

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 5);

  const hasErrors = touched && validation.errors && validation.errors.length > 0;

  return (
    <div className="form-group relative">
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="Enter your country"
        disabled={disabled}
        className={`${className} ${hasErrors ? 'border-red-500 focus:border-red-500' : ''} ${
          touched && validation.isValid && value ? 'border-green-500' : ''
        }`}
        autoComplete="country"
        {...props}
      />
      
      {/* Country Suggestions Dropdown */}
      {showSuggestions && filteredCountries.length > 0 && value && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filteredCountries.map((country, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(country)}
            >
              {country}
            </div>
          ))}
        </div>
      )}
      
      {touched && (
        <>
          {hasErrors && (
            <div className="mt-2">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-600 text-sm flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              ))}
            </div>
          )}
          
          {touched && validation.isValid && value && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              Valid country
            </div>
          )}
        </>
      )}
    </div>
  );
};