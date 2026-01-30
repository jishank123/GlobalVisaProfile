// Comprehensive form validation utilities

// Email validation with RFC 5322 compliance and .com requirement
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  if (typeof email !== 'string') {
    errors.push('Email must be a string');
    return { isValid: false, errors };
  }
  
  // Trim whitespace
  email = email.trim();
  
  // Check length
  if (email.length > 254) {
    errors.push('Email is too long (maximum 254 characters)');
  }
  
  // Check for @ symbol
  if (!email.includes('@')) {
    errors.push('Email must contain @ symbol');
    return { isValid: false, errors };
  }
  
  // Check for .com requirement
  if (!email.toLowerCase().includes('.com')) {
    errors.push('Email must contain .com domain');
  }
  
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const domain = email.split('@')[1];
  if (domain) {
    const suspiciousDomains = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
    if (suspiciousDomains.includes(domain.toLowerCase())) {
      errors.push('Please check your email domain for typos');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: email
  };
};

// Password validation with comprehensive security requirements
export const validatePassword = (password, confirmPassword = null) => {
  const errors = [];
  const warnings = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings };
  }
  
  // Length requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }
  
  // Character requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  
  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }
  
  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number (0-9)');
  }
  
  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  // Common password patterns to avoid
  const commonPatterns = [
    /^(.)\1+$/, // All same character
    /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential
    /^(qwerty|asdfgh|zxcvbn|password|admin|user|guest|test)/i // Common words
  ];
  
  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      warnings.push('Password contains common patterns that are easy to guess');
    }
  });
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty', 'abc123',
    'password1', 'admin', 'user', 'guest', 'test', 'welcome', 'login'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common and easily guessed');
  }
  
  // Confirm password validation
  if (confirmPassword !== null) {
    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
  }
  
  // Calculate password strength
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (hasUppercase) strength += 1;
  if (hasLowercase) strength += 1;
  if (hasNumbers) strength += 1;
  if (hasSpecialChars) strength += 1;
  if (password.length >= 16) strength += 1;
  
  const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
  const strengthLevel = strengthLevels[Math.min(strength, 6)];
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength: {
      score: strength,
      level: strengthLevel,
      percentage: Math.min((strength / 6) * 100, 100)
    }
  };
};

// Enhanced phone number validation with country code support and real-time validation
export const validatePhoneWithCountry = (phone, countryCode = 'US') => {
  const errors = [];
  
  if (!phone) {
    return { isValid: true, errors: [], formatted: '', digitsOnly: '', maxLength: getPhoneMaxLength(countryCode) }; // Phone is optional in most forms
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 0) {
    errors.push('Phone number must contain at least one digit');
    return { isValid: false, errors, maxLength: getPhoneMaxLength(countryCode) };
  }
  
  // Enhanced country-specific validation patterns
  const countryPatterns = {
    'US': {
      exactLength: 10,
      pattern: /^[2-9]\d{9}$/,
      format: '(XXX) XXX-XXXX',
      example: '(555) 123-4567',
      code: '+1'
    },
    'UK': {
      exactLength: 10,
      pattern: /^[1-9]\d{9}$/,
      format: '+44 XXXX XXXXXX',
      example: '+44 20 7946 0958',
      code: '+44'
    },
    'IN': {
      exactLength: 10,
      pattern: /^[6-9]\d{9}$/,
      format: '+91 XXXXX XXXXX',
      example: '+91 98765 43210',
      code: '+91'
    }
  };
  
  // Get pattern for the specified country
  const pattern = countryPatterns[countryCode.toUpperCase()];
  
  if (!pattern) {
    errors.push(`Country code ${countryCode} is not supported`);
    return { isValid: false, errors, maxLength: 10 };
  }
  
  // Validate exact length requirement
  if (digitsOnly.length !== pattern.exactLength) {
    if (digitsOnly.length < pattern.exactLength) {
      errors.push(`Phone number must be exactly ${pattern.exactLength} digits for ${countryCode}`);
    } else {
      errors.push(`Phone number must be exactly ${pattern.exactLength} digits for ${countryCode}`);
    }
  }
  
  // Check pattern using digits only for more reliable validation
  if (digitsOnly.length === pattern.exactLength && !pattern.pattern.test(digitsOnly)) {
    if (countryCode === 'US') {
      errors.push('US phone numbers must start with 2-9');
    } else if (countryCode === 'IN') {
      errors.push('Indian phone numbers must start with 6, 7, 8, or 9');
    } else if (countryCode === 'UK') {
      errors.push('UK phone numbers must start with 1-9');
    } else {
      errors.push(`Please enter a valid ${countryCode} phone number (${pattern.example})`);
    }
  }
  
  // Format phone number for display
  let formatted = phone;
  if (errors.length === 0 && digitsOnly.length === pattern.exactLength) {
    if (countryCode === 'US') {
      formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    } else {
      formatted = `${pattern.code} ${phone}`;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    formatted,
    digitsOnly,
    countryCode: pattern.code,
    maxLength: pattern.exactLength
  };
};

// Get phone max length for a country
export const getPhoneMaxLength = (countryCode) => {
  const lengths = {
    'US': 10,
    'UK': 10,
    'IN': 10
  };
  return lengths[countryCode.toUpperCase()] || 10;
};

// Real-time email validation
export const validateEmailRealTime = (email) => {
  const errors = [];
  
  if (!email) {
    return { isValid: true, errors: [], showError: false }; // Don't show error for empty field initially
  }
  
  // Check for @ symbol
  if (!email.includes('@')) {
    errors.push('Email must contain @ symbol');
  }
  
  // Check for .com requirement
  if (!email.toLowerCase().includes('.com')) {
    errors.push('Email must contain .com domain');
  }
  
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (email.length > 0 && !emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    showError: email.length > 0 && errors.length > 0
  };
};

// Real-time phone validation
export const validatePhoneRealTime = (phone, countryCode = 'US') => {
  if (!phone) {
    return { isValid: true, errors: [], showError: false, maxLength: getPhoneMaxLength(countryCode) };
  }
  
  const result = validatePhoneWithCountry(phone, countryCode);
  return {
    ...result,
    showError: phone.length > 0 && result.errors.length > 0
  };
};

// Real-time name validation
export const validateNameRealTime = (name, fieldName = 'Name') => {
  if (!name) {
    return { isValid: true, errors: [], showError: false };
  }
  
  const result = validateName(name, fieldName);
  return {
    ...result,
    showError: name.length > 0 && result.errors.length > 0
  };
};

// Get list of supported countries for dropdown (limited to US, UK, IN as requested)
export const getSupportedCountries = () => {
  return [
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', minDigits: 10, maxDigits: 10 },
    { code: 'UK', name: 'United Kingdom', dialCode: '+44', flag: 'UK', minDigits: 10, maxDigits: 10 },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', minDigits: 10, maxDigits: 10 }
  ];
};

// Basic phone validation (for backward compatibility)
export const validatePhone = (phone) => {
  return validatePhoneWithCountry(phone, 'US');
};

// Name validation (first name, last name)
export const validateName = (name, fieldName = 'Name') => {
  const errors = [];
  
  if (!name) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }
  
  if (typeof name !== 'string') {
    errors.push(`${fieldName} must be text`);
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    errors.push(`${fieldName} cannot be empty`);
    return { isValid: false, errors };
  }
  
  if (trimmedName.length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  }
  
  if (trimmedName.length > 50) {
    errors.push(`${fieldName} is too long (maximum 50 characters)`);
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const namePattern = /^[a-zA-Z\s\-'\.]+$/;
  if (!namePattern.test(trimmedName)) {
    errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`);
  }
  
  // Check for suspicious patterns
  if (/^\s+|\s+$/.test(name)) {
    errors.push(`${fieldName} cannot start or end with spaces`);
  }
  
  if (/\s{2,}/.test(trimmedName)) {
    errors.push(`${fieldName} cannot contain multiple consecutive spaces`);
  }
  
  if (/^[^a-zA-Z]/.test(trimmedName)) {
    errors.push(`${fieldName} must start with a letter`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedName
  };
};

// Company name validation
export const validateCompany = (company) => {
  const errors = [];
  
  if (!company) {
    return { isValid: true, errors: [], value: '' }; // Company is optional
  }
  
  if (typeof company !== 'string') {
    errors.push('Company name must be text');
    return { isValid: false, errors };
  }
  
  const trimmedCompany = company.trim();
  
  if (trimmedCompany.length > 100) {
    errors.push('Company name is too long (maximum 100 characters)');
  }
  
  // Allow letters, numbers, spaces, and common business punctuation
  const companyPattern = /^[a-zA-Z0-9\s\-'&.,()]+$/;
  if (!companyPattern.test(trimmedCompany)) {
    errors.push('Company name contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedCompany
  };
};

// Country validation
export const validateCountry = (country) => {
  const errors = [];
  
  if (!country) {
    return { isValid: true, errors: [], value: '' }; // Country is optional
  }
  
  if (typeof country !== 'string') {
    errors.push('Country must be text');
    return { isValid: false, errors };
  }
  
  const trimmedCountry = country.trim();
  
  if (trimmedCountry.length > 60) {
    errors.push('Country name is too long (maximum 60 characters)');
  }
  
  // Only allow letters, spaces, and hyphens
  const countryPattern = /^[a-zA-Z\s\-]+$/;
  if (!countryPattern.test(trimmedCountry)) {
    errors.push('Country name can only contain letters, spaces, and hyphens');
  }
  
  // List of valid countries (abbreviated list - you can expand this)
  const validCountries = [
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
  
  const isValidCountry = validCountries.some(validCountry => 
    validCountry.toLowerCase() === trimmedCountry.toLowerCase()
  );
  
  if (trimmedCountry.length > 0 && !isValidCountry) {
    errors.push('Please enter a valid country name');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedCountry,
    suggestions: validCountries.filter(country => 
      country.toLowerCase().includes(trimmedCountry.toLowerCase())
    ).slice(0, 5)
  };
};

// Comprehensive form validation
export const validateRegistrationForm = (formData) => {
  const validationResults = {
    first_name: validateName(formData.first_name, 'First name'),
    last_name: validateName(formData.last_name, 'Last name'),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password, formData.confirmPassword),
    phone: validatePhone(formData.phone),
    company: validateCompany(formData.company),
    country: validateCountry(formData.country)
  };
  
  const isValid = Object.values(validationResults).every(result => result.isValid);
  const errors = [];
  const warnings = [];
  
  Object.entries(validationResults).forEach(([field, result]) => {
    if (result.errors && result.errors.length > 0) {
      errors.push(...result.errors);
    }
    if (result.warnings && result.warnings.length > 0) {
      warnings.push(...result.warnings);
    }
  });
  
  return {
    isValid,
    errors,
    warnings,
    fields: validationResults
  };
};

// Real-time validation helper
export const getFieldValidation = (fieldName, value, formData = {}) => {
  switch (fieldName) {
    case 'first_name':
      return validateName(value, 'First name');
    case 'last_name':
      return validateName(value, 'Last name');
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value, formData.confirmPassword);
    case 'confirmPassword':
      return validatePassword(formData.password, value);
    case 'phone':
      return validatePhone(value);
    case 'company':
      return validateCompany(value);
    case 'country':
      return validateCountry(value);
    default:
      return { isValid: true, errors: [] };
  }
};

// Password strength indicator component data
export const getPasswordStrengthColor = (strength) => {
  if (strength <= 1) return '#ef4444'; // red
  if (strength <= 2) return '#f59e0b'; // orange
  if (strength <= 3) return '#eab308'; // yellow
  if (strength <= 4) return '#22c55e'; // green
  if (strength <= 5) return '#10b981'; // emerald
  return '#059669'; // dark green
};

export const getPasswordStrengthText = (strength) => {
  const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
  return levels[Math.min(strength, 6)];
};

// Location validation
export const validateLocation = (location) => {
  const errors = [];
  
  if (!location) {
    errors.push('Location is required');
    return { isValid: false, errors };
  }
  
  if (typeof location !== 'string') {
    errors.push('Location must be text');
    return { isValid: false, errors };
  }
  
  const trimmedLocation = location.trim();
  
  if (trimmedLocation.length === 0) {
    errors.push('Location cannot be empty');
    return { isValid: false, errors };
  }
  
  if (trimmedLocation.length < 2) {
    errors.push('Location must be at least 2 characters long');
  }
  
  if (trimmedLocation.length > 100) {
    errors.push('Location is too long (maximum 100 characters)');
  }
  
  // Allow letters, numbers, spaces, commas, hyphens, and periods
  const locationPattern = /^[a-zA-Z0-9\s,\-\.]+$/;
  if (!locationPattern.test(trimmedLocation)) {
    errors.push('Location can only contain letters, numbers, spaces, commas, hyphens, and periods');
  }
  
  // Check for at least one letter (to avoid just numbers or symbols)
  if (!/[a-zA-Z]/.test(trimmedLocation)) {
    errors.push('Location must contain at least one letter');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedLocation
  };
};

// Field of expertise validation
export const validateFieldOfExpertise = (field) => {
  const errors = [];
  
  if (!field) {
    errors.push('Field of expertise is required');
    return { isValid: false, errors };
  }
  
  if (typeof field !== 'string') {
    errors.push('Field of expertise must be text');
    return { isValid: false, errors };
  }
  
  const trimmedField = field.trim();
  
  if (trimmedField.length === 0) {
    errors.push('Field of expertise cannot be empty');
    return { isValid: false, errors };
  }
  
  if (trimmedField.length < 2) {
    errors.push('Field of expertise must be at least 2 characters long');
  }
  
  if (trimmedField.length > 100) {
    errors.push('Field of expertise is too long (maximum 100 characters)');
  }
  
  // Allow letters, numbers, spaces, hyphens, and common punctuation
  const fieldPattern = /^[a-zA-Z0-9\s\-&.,()\/]+$/;
  if (!fieldPattern.test(trimmedField)) {
    errors.push('Field of expertise contains invalid characters');
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(trimmedField)) {
    errors.push('Field of expertise must contain at least one letter');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: trimmedField
  };
};

// Profile assessment form validation
export const validateProfileAssessmentForm = (formData, step = 'all') => {
  const validationResults = {};
  
  if (step === 'all' || step === 1) {
    validationResults.client_name = validateName(formData.client_name, 'Full name');
    validationResults.client_email = validateEmail(formData.client_email);
    validationResults.client_phone = validatePhone(formData.client_phone);
    validationResults.current_location = validateLocation(formData.current_location);
    validationResults.field_of_expertise = validateFieldOfExpertise(formData.field_of_expertise);
    
    // Years of experience validation
    if (!formData.years_of_experience) {
      validationResults.years_of_experience = {
        isValid: false,
        errors: ['Years of experience is required']
      };
    } else {
      validationResults.years_of_experience = {
        isValid: true,
        errors: []
      };
    }
  }
  
  const isValid = Object.values(validationResults).every(result => result.isValid);
  const errors = [];
  
  Object.entries(validationResults).forEach(([field, result]) => {
    if (result.errors && result.errors.length > 0) {
      errors.push(...result.errors);
    }
  });
  
  return {
    isValid,
    errors,
    fields: validationResults
  };
};