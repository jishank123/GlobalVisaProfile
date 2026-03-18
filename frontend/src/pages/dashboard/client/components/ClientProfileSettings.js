import { useState, useEffect, useRef } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import { validatePassword, validatePhoneWithCountry } from '../../../../utils/validation';
import { getApiEndpoint } from '../../../../utils/apiConfig';

const ClientProfileSettings = ({ clientData, apiCall, onRefresh, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  // Profile form data - comprehensive structure matching both User and Client models
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    country: '',
    university: '',
    linkedin_url: '',
    portfolio_url: '',
    website_url: '',
    bio: '',
    profile_picture: null,
    current_profile_picture: '',
    // Additional fields from models
    status: '',
    satisfaction_rating: 0,
    tags: [],
    notes: '',
    crm_manager: null
  });
  
  // Password form data with validation
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [],
    strength: { score: 0, level: 'Very Weak', percentage: 0 }
  });

  // Form validation states
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(true);

  // Reset image states when current_profile_picture changes
  useEffect(() => {
    if (profileData.current_profile_picture) {
      setImageLoadError(false);
      setImageLoaded(false);
      console.log('Profile picture changed, resetting image states:', profileData.current_profile_picture);
    }
  }, [profileData.current_profile_picture]);

  // Fetch client's profile assessment
  useEffect(() => {
    const fetchAssessment = async () => {
      setAssessmentLoading(true);
      try {
        const res = await apiCall('/profile-assessments/client');
        if (res?.success && res.data?.length > 0) {
          setAssessment(res.data[0]);
        }
      } catch (e) {
        // non-critical
      } finally {
        setAssessmentLoading(false);
      }
    };
    fetchAssessment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (clientData) {
      // Reset image states when client data changes
      setImageLoadError(false);
      setImageLoaded(false);
      
      // Populate from User model data
      const userData = clientData.user || clientData;
      const clientProfile = clientData.client_profile || {};
      
      const newProfileData = {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || clientProfile.phone || '',
        company: userData.company || '',
        country: userData.country || '',
        university: userData.university || clientProfile.university || '',
        linkedin_url: userData.linkedin_url || '',
        portfolio_url: userData.portfolio_url || '',
        website_url: userData.website_url || '',
        bio: userData.bio || '',
        profile_picture: null,
        current_profile_picture: userData.profile_picture || userData.avatar || '',
        // Additional fields from Client model
        status: clientProfile.status || userData.status || '',
        satisfaction_rating: clientProfile.satisfaction_rating || 0,
        tags: clientProfile.tags || [],
        notes: clientProfile.notes || '',
        crm_manager: clientProfile.crm_manager || null
      };
      
      setProfileData(newProfileData);
      validateForm(newProfileData);
    }
  }, [clientData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Format phone number as user types
    if (name === 'phone') {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Format as (XXX) XXX-XXXX
      if (digitsOnly.length <= 3) {
        processedValue = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        processedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
      } else {
        processedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
      }
    }
    
    setProfileData({
      ...profileData,
      [name]: processedValue
    });
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setMessage({ type: '', text: '' });
    validateForm({ ...profileData, [name]: processedValue });
  };

  const validateForm = (data = profileData) => {
    const errors = {};
    
    if (!data.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!data.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    // Phone validation using the utility function
    if (data.phone && data.phone.trim()) {
      const phoneValidation = validatePhoneWithCountry(data.phone, 'US');
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.errors[0];
      }
    }
    
    // Validate URLs if provided
    const urlFields = ['linkedin_url', 'portfolio_url', 'website_url'];
    urlFields.forEach(field => {
      if (data[field] && data[field].trim()) {
        try {
          new URL(data[field]);
        } catch {
          errors[field] = 'Please enter a valid URL';
        }
      }
    });
    
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const newPasswordData = {
      ...passwordData,
      [e.target.name]: e.target.value
    };
    
    setPasswordData(newPasswordData);
    
    // Validate password in real-time
    if (e.target.name === 'new_password' || e.target.name === 'confirm_password') {
      const validation = validatePassword(newPasswordData.new_password, newPasswordData.confirm_password);
      setPasswordValidation(validation);
    }
    
    setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    
    // Enhanced validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    
    if (!allowedTypes.includes(file.type)) {
      setMessage({ 
        type: 'error', 
        text: 'Please select a valid image file (JPEG, PNG, GIF, WebP, or AVIF)' 
      });
      return;
    }
    
    if (file.size > maxSize) {
      setMessage({ 
        type: 'error', 
        text: 'Image size must be less than 10MB' 
      });
      return;
    }

    setProfileData({
      ...profileData,
      profile_picture: file
    });
    setMessage({ type: '', text: '' });
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors below' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Basic information
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('phone', profileData.phone || '');
      
      // Professional information
      formData.append('company', profileData.company || '');
      formData.append('country', profileData.country || '');
      formData.append('university', profileData.university || '');
      
      // External links
      formData.append('linkedin_url', profileData.linkedin_url || '');
      formData.append('portfolio_url', profileData.portfolio_url || '');
      formData.append('website_url', profileData.website_url || '');
      
      // Bio
      formData.append('bio', profileData.bio || '');
      
      // Profile picture
      if (profileData.profile_picture) {
        formData.append('profile_picture', profileData.profile_picture);
      }

      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: formData
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Reset image states for fresh loading
        setImageLoadError(false);
        setImageLoaded(false);
        
        // Update the profile data with the response from server
        const updatedUserData = response.data?.user;
        if (updatedUserData) {
          setProfileData(prev => ({
            ...prev,
            // Reset the file input
            profile_picture: null,
            // Update current profile picture with the new one from server
            current_profile_picture: updatedUserData.profile_picture || updatedUserData.avatar || prev.current_profile_picture,
            // Update other fields that might have changed
            first_name: updatedUserData.first_name || prev.first_name,
            last_name: updatedUserData.last_name || prev.last_name,
            phone: updatedUserData.phone || prev.phone,
            company: updatedUserData.company || prev.company,
            country: updatedUserData.country || prev.country,
            university: updatedUserData.university || prev.university,
            linkedin_url: updatedUserData.linkedin_url || prev.linkedin_url,
            portfolio_url: updatedUserData.portfolio_url || prev.portfolio_url,
            website_url: updatedUserData.website_url || prev.website_url,
            bio: updatedUserData.bio || prev.bio
          }));
        }
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Refresh parent data to update the overall client data
        if (onUpdate) {
          onUpdate();
        }
        if (onRefresh) {
          onRefresh();
        }
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.current_password) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    if (!passwordData.new_password || !passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    // Check if new password is same as current password
    if (passwordData.current_password === passwordData.new_password) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    // Validate password strength
    const validation = validatePassword(passwordData.new_password, passwordData.confirm_password);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors[0] });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await apiCall('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password
        })
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setPasswordValidation({
          isValid: false,
          errors: [],
          strength: { score: 0, level: 'Very Weak', percentage: 0 }
        });
        
        // Reset password visibility
        setShowPasswords({
          current_password: false,
          new_password: false,
          confirm_password: false
        });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to change password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getPasswordStrengthColor = (score) => {
    const colors = {
      0: '#ef4444', // red-500
      1: '#f97316', // orange-500
      2: '#eab308', // yellow-500
      3: '#22c55e', // green-500
      4: '#16a34a', // green-600
      5: '#15803d', // green-700
      6: '#166534'  // green-800
    };
    return colors[Math.min(score, 6)] || colors[0];
  };

  const getPasswordStrengthText = (score) => {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
    return texts[Math.min(score, 6)] || texts[0];
  };

  return (
    <div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-user-cog fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Profile Settings</h4>
            <p style={componentStyles.headerSubtitle}>Manage your personal information and account security</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: designSystem.spacing.md,
          borderRadius: designSystem.borderRadius.button,
          marginBottom: designSystem.spacing.lg,
          background: message.type === 'success' 
            ? `${designSystem.colors.success}20` 
            : `${designSystem.colors.danger}20`,
          border: `1px solid ${message.type === 'success' 
            ? designSystem.colors.success.split('(')[0] 
            : designSystem.colors.danger.split('(')[0]}`,
          color: message.type === 'success' 
            ? designSystem.colors.success.split('(')[0] 
            : designSystem.colors.danger.split('(')[0]
        }}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'profile' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'profile' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('profile')}
            {...hoverEffects.button}
          >
            <i className="fas fa-user me-2"></i>Profile Information
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'password' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'password' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('password')}
            {...hoverEffects.button}
          >
            <i className="fas fa-lock me-2"></i>Change Password
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        borderRadius: designSystem.borderRadius.card,
        padding: designSystem.spacing.xl,
        border: `1px solid ${designSystem.colors.gray[200]}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            {/* Profile Picture Section */}
            <div style={{ marginBottom: designSystem.spacing.lg }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md,
                fontSize: designSystem.typography.fontSize.lg,
                display: 'flex',
                alignItems: 'center',
                gap: designSystem.spacing.sm
              }}>
                <i className="fas fa-user-circle" style={{ color: designSystem.colors.primary.split('(')[0] }}></i>
                Profile Picture
              </h6>
              
              {/* Outer row: 4-col image | 8-col assessment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: designSystem.spacing.xl, alignItems: 'flex-start' }}>

                {/* Left 4-col: avatar */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: designSystem.spacing.sm
                }}>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />

                  <div
                    title="Click to upload profile picture"
                    style={{
                      position: 'relative',
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `3px solid ${designSystem.colors.primary.split('(')[0]}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: designSystem.colors.primary,
                      color: 'white',
                      fontWeight: designSystem.typography.fontWeight.bold,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                      margin: '0 auto'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {profileData.current_profile_picture && !imageLoadError ? (
                      <img
                        src={(() => {
                          if (profileData.current_profile_picture.startsWith('http')) return profileData.current_profile_picture;
                          const path = profileData.current_profile_picture.replace(/^\/?(uploads\/profile-pictures\/)/, '');
                          return getApiEndpoint(`/debug/serve-image/profile-pictures/${path}`);
                        })()}
                        alt="Profile"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 2 }}
                        onError={() => { setImageLoadError(true); setImageLoaded(false); }}
                        onLoad={() => { setImageLoadError(false); setImageLoaded(true); }}
                      />
                    ) : (
                      /* No image or load error — show upload icon */
                      <i className="fas fa-upload" style={{ fontSize: '48px', opacity: 0.85 }}></i>
                    )}

                    {/* Hover overlay — always show camera icon on hover */}
                    <div
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '4px',
                        opacity: 0, transition: 'opacity 0.25s ease', zIndex: 3
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <i className="fas fa-camera fa-lg" style={{ color: 'white' }}></i>
                      <span style={{ color: 'white', fontSize: '11px', fontWeight: '500' }}>Change Photo</span>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    fontSize: designSystem.typography.fontSize.xs,
                    color: designSystem.colors.gray[500]
                  }}>
                    {profileData.profile_picture
                      ? `✓ ${profileData.profile_picture.name}`
                      : profileData.current_profile_picture
                        ? 'Click to change photo'
                        : 'Click to upload photo'}
                  </div>
                </div>{/* end left 4-col: avatar */}

                {/* Right 8-col: Assessment Card */}
                <div>
                  {assessmentLoading ? (
                    <div style={{
                      background: designSystem.colors.gray[50],
                      border: `1px solid ${designSystem.colors.gray[200]}`,
                      borderRadius: designSystem.borderRadius.card,
                      padding: designSystem.spacing.lg,
                      display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm,
                      color: designSystem.colors.gray[500],
                      fontSize: designSystem.typography.fontSize.sm
                    }}>
                      <i className="fas fa-spinner fa-spin"></i> Loading assessment...
                    </div>
                  ) : assessment ? (() => {
                    const scoreColor = assessment.overall_score >= 80 ? '#16a34a'
                      : assessment.overall_score >= 60 ? '#2563eb'
                      : assessment.overall_score >= 40 ? '#d97706'
                      : '#dc2626';
                    const criteriaMap = [
                      { key: 'criterion_1_awards', label: 'Awards & Prizes' },
                      { key: 'criterion_2_memberships', label: 'Membership in Associations' },
                      { key: 'criterion_3_media', label: 'Published Material About You' },
                      { key: 'criterion_4_judging', label: 'Judging the Work of Others' },
                      { key: 'criterion_5_contributions', label: 'Original Contributions' },
                      { key: 'criterion_6_publications', label: 'Scholarly Articles' },
                      { key: 'criterion_7_exhibitions', label: 'Exhibitions or Showcases' },
                      { key: 'criterion_8_leadership', label: 'Leading or Critical Role' },
                      { key: 'criterion_9_salary', label: 'High Salary or Remuneration' },
                      { key: 'criterion_10_commercial', label: 'Commercial Success' },
                    ];
                    return (
                      <div style={{
                        background: 'white',
                        border: `1px solid ${designSystem.colors.gray[200]}`,
                        borderRadius: designSystem.borderRadius.card,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}>
                        {/* Card header */}
                        <div style={{
                          background: `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}08)`,
                          borderBottom: `1px solid ${scoreColor}30`,
                          padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
                            <i className="fas fa-chart-bar" style={{ color: scoreColor, fontSize: '16px' }}></i>
                            <span style={{
                              fontWeight: designSystem.typography.fontWeight.semibold,
                              fontSize: designSystem.typography.fontSize.sm,
                              color: designSystem.colors.dark
                            }}>Profile Assessment Report:</span>
                          </div>
                          <span style={{
                            fontSize: designSystem.typography.fontSize.xs,
                            color: designSystem.colors.gray[500]
                          }}>
                            {new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div style={{ padding: designSystem.spacing.lg }}>
                          {/* Score row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.lg, marginBottom: designSystem.spacing.md }}>
                            {/* Circular score */}
                            <div style={{
                              width: '72px', height: '72px', borderRadius: '50%',
                              border: `4px solid ${scoreColor}`,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <span style={{ fontSize: '20px', fontWeight: '700', color: scoreColor, lineHeight: 1 }}>
                                {assessment.overall_score}
                              </span>
                              <span style={{ fontSize: '10px', color: designSystem.colors.gray[500] }}>/ 100</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              {/* Strength + download on same row */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <div style={{
                                  fontSize: designSystem.typography.fontSize.sm,
                                  fontWeight: designSystem.typography.fontWeight.semibold,
                                  color: scoreColor
                                }}>{assessment.profile_strength}</div>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const { generateAssessmentPDF } = await import('../../../../utils/pdfGenerator');
                                    generateAssessmentPDF(assessment);
                                  }}
                                  title="Download Assessment Report"
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    background: scoreColor, color: 'white',
                                    border: 'none', borderRadius: '6px',
                                    padding: '4px 10px', fontSize: '11px',
                                    fontWeight: '500', cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <i className="fas fa-download" style={{ fontSize: '10px' }}></i>
                                  Download Report
                                </button>
                              </div>
                              <div style={{ fontSize: designSystem.typography.fontSize.xs, color: designSystem.colors.gray[600] }}>
                                <i className="fas fa-check-circle" style={{ color: '#16a34a', marginRight: '4px' }}></i>
                                {assessment.criteria_met} of 10 criteria met
                              </div>
                              <div style={{ fontSize: designSystem.typography.fontSize.xs, color: designSystem.colors.gray[500], marginTop: '2px' }}>
                                Service: <span style={{ color: designSystem.colors.dark, fontWeight: '500' }}>
                                  {assessment.service_interest?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Score bar */}
                          <div style={{ marginBottom: designSystem.spacing.md }}>
                            <div style={{
                              height: '6px', borderRadius: '3px',
                              background: designSystem.colors.gray[200], overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%', borderRadius: '3px',
                                width: `${assessment.overall_score}%`,
                                background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}cc)`,
                                transition: 'width 0.6s ease'
                              }} />
                            </div>
                          </div>

                          {/* Criteria Breakdown — 5-col × 2-row compact */}
                          <div style={{
                            borderTop: `1px solid ${designSystem.colors.gray[100]}`,
                            paddingTop: designSystem.spacing.sm
                          }}>
                            <div style={{
                              fontSize: '10px',
                              fontWeight: designSystem.typography.fontWeight.semibold,
                              color: designSystem.colors.gray[500],
                              marginBottom: '6px',
                              textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>Criteria Breakdown</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                              {criteriaMap.map(({ key, label }, idx) => {
                                const val = assessment[key] || 0;
                                const scoreCol = val >= 2 ? '#16a34a' : val === 1 ? '#d97706' : designSystem.colors.gray[400];
                                return (
                                  <div key={key} style={{
                                    background: designSystem.colors.gray[50],
                                    border: `1px solid ${designSystem.colors.gray[200]}`,
                                    borderRadius: '5px',
                                    padding: '5px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '6px'
                                  }}>
                                    <span style={{
                                      fontSize: '10px',
                                      color: designSystem.colors.gray[600],
                                      lineHeight: '1.2',
                                      flex: 1
                                    }}>
                                      {idx + 1}. {label}
                                    </span>
                                    <span style={{
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      color: scoreCol,
                                      flexShrink: 0
                                    }}>
                                      {val}/3
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div style={{
                      background: designSystem.colors.gray[50],
                      border: `2px dashed ${designSystem.colors.gray[300]}`,
                      borderRadius: designSystem.borderRadius.card,
                      padding: designSystem.spacing.xl,
                      textAlign: 'center',
                      color: designSystem.colors.gray[500]
                    }}>
                      <i className="fas fa-chart-bar" style={{ fontSize: '28px', marginBottom: designSystem.spacing.sm, display: 'block', opacity: 0.4 }}></i>
                      <div style={{ fontSize: designSystem.typography.fontSize.sm, fontWeight: '500', marginBottom: '4px' }}>No Assessment Yet</div>
                      <div style={{ fontSize: designSystem.typography.fontSize.xs }}>Complete your profile assessment to see results here.</div>
                    </div>
                  )}
                </div>{/* end right: assessment card */}

              </div>{/* end outer row */}
            </div>

            {/* Basic Information */}
            <div style={{ 
              marginBottom: designSystem.spacing.lg,
              padding: designSystem.spacing.lg,
              backgroundColor: designSystem.colors.gray[50],
              borderRadius: designSystem.borderRadius.card,
              border: `1px solid ${designSystem.colors.gray[200]}`
            }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md,
                fontSize: designSystem.typography.fontSize.lg,
                display: 'flex',
                alignItems: 'center',
                gap: designSystem.spacing.sm
              }}>
                <i className="fas fa-user-circle" style={{ color: designSystem.colors.primary.split('(')[0] }}></i>
                Basic Information
              </h6>
              
              {/* Name and Email Fields Row - All in one row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: designSystem.spacing.md,
                marginBottom: designSystem.spacing.md
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.sm,
                      padding: designSystem.spacing.sm,
                      height: '40px',
                      borderColor: formErrors.first_name 
                        ? designSystem.colors.danger.split('(')[0] 
                        : profileData.first_name 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[300]
                    }}
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    placeholder="Enter first name"
                  />
                  {formErrors.first_name && (
                    <div style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.danger.split('(')[0],
                      marginTop: designSystem.spacing.xs
                    }}>
                      {formErrors.first_name}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.sm,
                      padding: designSystem.spacing.sm,
                      height: '40px',
                      borderColor: formErrors.last_name 
                        ? designSystem.colors.danger.split('(')[0] 
                        : profileData.last_name 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[300]
                    }}
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    placeholder="Enter last name"
                  />
                  {formErrors.last_name && (
                    <div style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.danger.split('(')[0],
                      marginTop: designSystem.spacing.xs
                    }}>
                      {formErrors.last_name}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-envelope me-2" style={{ color: designSystem.colors.info.split('(')[0] }}></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    style={{
                      ...componentStyles.formInput,
                      backgroundColor: designSystem.colors.gray[100],
                      cursor: 'not-allowed',
                      color: designSystem.colors.gray[600],
                      fontSize: designSystem.typography.fontSize.sm,
                      padding: designSystem.spacing.sm,
                      height: '40px'
                    }}
                    value={clientData?.user?.email || clientData?.email || ''}
                    disabled
                    readOnly
                  />
                  <div style={{
                    fontSize: designSystem.typography.fontSize.xs,
                    color: designSystem.colors.gray[500],
                    marginTop: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-lock me-1"></i>
                    Email cannot be changed
                  </div>
                </div>
              </div>

              {/* Contact & Location Row - Compact */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: designSystem.spacing.md
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-phone me-2" style={{ color: designSystem.colors.success.split('(')[0] }}></i>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.sm,
                      padding: designSystem.spacing.sm,
                      height: '40px',
                      borderColor: formErrors.phone 
                        ? designSystem.colors.danger.split('(')[0] 
                        : profileData.phone 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[300]
                    }}
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="(555) 123-4567"
                    maxLength={14} // For formatted US phone number
                  />
                  {formErrors.phone && (
                    <div style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.danger.split('(')[0],
                      marginTop: designSystem.spacing.xs
                    }}>
                      {formErrors.phone}
                    </div>
                  )}
                  <div style={{
                    fontSize: designSystem.typography.fontSize.xs,
                    color: designSystem.colors.gray[500],
                    marginTop: designSystem.spacing.xs
                  }}>
                    US format: (555) 123-4567
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-globe me-2" style={{ color: designSystem.colors.warning.split('(')[0] }}></i>
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.sm,
                      padding: designSystem.spacing.sm,
                      height: '40px'
                    }}
                    value={profileData.country}
                    onChange={handleProfileChange}
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div style={{ 
              marginBottom: designSystem.spacing.xl,
              padding: designSystem.spacing.xl,
              backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: designSystem.borderRadius.card,
              border: `1px solid ${designSystem.colors.gray[200]}`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.bold,
                marginBottom: designSystem.spacing.xl,
                fontSize: designSystem.typography.fontSize.xl,
                display: 'flex',
                alignItems: 'center',
                gap: designSystem.spacing.md,
                paddingBottom: designSystem.spacing.md,
                borderBottom: `2px solid ${designSystem.colors.primary.split('(')[0]}20`
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${designSystem.colors.primary} 0%, ${designSystem.colors.primary}CC 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  <i className="fas fa-briefcase"></i>
                </div>
                Professional Information
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: designSystem.spacing.xl
              }}>
                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.bold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-building" style={{ 
                      color: designSystem.colors.info.split('(')[0],
                      fontSize: '14px'
                    }}></i>
                    Company/Organization
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="company"
                      style={{
                        ...componentStyles.formInput,
                        fontSize: designSystem.typography.fontSize.base,
                        padding: `${designSystem.spacing.lg} ${designSystem.spacing.md}`,
                        paddingLeft: '48px',
                        height: '56px',
                        borderRadius: designSystem.borderRadius.button,
                        border: `2px solid ${profileData.company 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[300]}`,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        boxShadow: profileData.company 
                          ? `0 0 0 3px ${designSystem.colors.success}20`
                          : 'none'
                      }}
                      value={profileData.company}
                      onChange={handleProfileChange}
                      placeholder="Enter your company name"
                      onFocus={(e) => {
                        e.target.style.borderColor = designSystem.colors.primary.split('(')[0];
                        e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = profileData.company 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[300];
                        e.target.style.boxShadow = profileData.company 
                          ? `0 0 0 3px ${designSystem.colors.success}20`
                          : 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: profileData.company 
                        ? designSystem.colors.success.split('(')[0] 
                        : designSystem.colors.gray[400],
                      fontSize: '16px',
                      pointerEvents: 'none'
                    }}>
                      <i className="fas fa-building"></i>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.bold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-university" style={{ 
                      color: designSystem.colors.warning.split('(')[0],
                      fontSize: '14px'
                    }}></i>
                    University/Institution
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="university"
                      style={{
                        ...componentStyles.formInput,
                        fontSize: designSystem.typography.fontSize.base,
                        padding: `${designSystem.spacing.lg} ${designSystem.spacing.md}`,
                        paddingLeft: '48px',
                        height: '56px',
                        borderRadius: designSystem.borderRadius.button,
                        border: `2px solid ${profileData.university 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[300]}`,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        boxShadow: profileData.university 
                          ? `0 0 0 3px ${designSystem.colors.success}20`
                          : 'none'
                      }}
                      value={profileData.university}
                      onChange={handleProfileChange}
                      placeholder="Enter your university name"
                      onFocus={(e) => {
                        e.target.style.borderColor = designSystem.colors.primary.split('(')[0];
                        e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = profileData.university 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[300];
                        e.target.style.boxShadow = profileData.university 
                          ? `0 0 0 3px ${designSystem.colors.success}20`
                          : 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: profileData.university 
                        ? designSystem.colors.success.split('(')[0] 
                        : designSystem.colors.gray[400],
                      fontSize: '16px',
                      pointerEvents: 'none'
                    }}>
                      <i className="fas fa-university"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div style={{ 
              marginBottom: designSystem.spacing.xl,
              padding: designSystem.spacing.xl,
              backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: designSystem.borderRadius.card,
              border: `1px solid ${designSystem.colors.gray[200]}`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.bold,
                marginBottom: designSystem.spacing.xl,
                fontSize: designSystem.typography.fontSize.xl,
                display: 'flex',
                alignItems: 'center',
                gap: designSystem.spacing.md,
                paddingBottom: designSystem.spacing.md,
                borderBottom: `2px solid ${designSystem.colors.primary.split('(')[0]}20`
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${designSystem.colors.primary} 0%, ${designSystem.colors.primary}CC 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  <i className="fas fa-link"></i>
                </div>
                External Links & Portfolio
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: designSystem.spacing.xl
              }}>
                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.bold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.xs
                  }}>
                    <i className="fab fa-linkedin" style={{ 
                      color: '#0077B5',
                      fontSize: '14px'
                    }}></i>
                    LinkedIn Profile
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="url"
                      name="linkedin_url"
                      style={{
                        ...componentStyles.formInput,
                        fontSize: designSystem.typography.fontSize.base,
                        padding: `${designSystem.spacing.lg} ${designSystem.spacing.md}`,
                        paddingLeft: '48px',
                        height: '56px',
                        borderRadius: designSystem.borderRadius.button,
                        border: `2px solid ${formErrors.linkedin_url 
                          ? designSystem.colors.danger.split('(')[0] 
                          : profileData.linkedin_url 
                            ? designSystem.colors.success.split('(')[0] 
                            : designSystem.colors.gray[300]}`,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        boxShadow: formErrors.linkedin_url 
                          ? `0 0 0 3px ${designSystem.colors.danger}20`
                          : profileData.linkedin_url 
                            ? `0 0 0 3px ${designSystem.colors.success}20`
                            : 'none'
                      }}
                      value={profileData.linkedin_url}
                      onChange={handleProfileChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      onFocus={(e) => {
                        e.target.style.borderColor = designSystem.colors.primary.split('(')[0];
                        e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = formErrors.linkedin_url 
                          ? designSystem.colors.danger.split('(')[0] 
                          : profileData.linkedin_url 
                            ? designSystem.colors.success.split('(')[0] 
                            : designSystem.colors.gray[300];
                        e.target.style.boxShadow = formErrors.linkedin_url 
                          ? `0 0 0 3px ${designSystem.colors.danger}20`
                          : profileData.linkedin_url 
                            ? `0 0 0 3px ${designSystem.colors.success}20`
                            : 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: formErrors.linkedin_url 
                        ? designSystem.colors.danger.split('(')[0] 
                        : profileData.linkedin_url 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[400],
                      fontSize: '16px',
                      pointerEvents: 'none'
                    }}>
                      <i className="fab fa-linkedin"></i>
                    </div>
                  </div>
                  {formErrors.linkedin_url && (
                    <div style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.danger.split('(')[0],
                      marginTop: designSystem.spacing.sm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: designSystem.spacing.xs,
                      padding: designSystem.spacing.sm,
                      backgroundColor: `${designSystem.colors.danger}10`,
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px solid ${designSystem.colors.danger}30`
                    }}>
                      <i className="fas fa-exclamation-triangle"></i>
                      {formErrors.linkedin_url}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.bold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-briefcase" style={{ 
                      color: designSystem.colors.primary.split('(')[0],
                      fontSize: '14px'
                    }}></i>
                    Portfolio URL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="url"
                      name="portfolio_url"
                      style={{
                        ...componentStyles.formInput,
                        fontSize: designSystem.typography.fontSize.base,
                        padding: `${designSystem.spacing.lg} ${designSystem.spacing.md}`,
                        paddingLeft: '48px',
                        height: '56px',
                        borderRadius: designSystem.borderRadius.button,
                        border: `2px solid ${formErrors.portfolio_url 
                          ? designSystem.colors.danger.split('(')[0] 
                          : profileData.portfolio_url 
                            ? designSystem.colors.success.split('(')[0] 
                            : designSystem.colors.gray[300]}`,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        boxShadow: formErrors.portfolio_url 
                          ? `0 0 0 3px ${designSystem.colors.danger}20`
                          : profileData.portfolio_url 
                            ? `0 0 0 3px ${designSystem.colors.success}20`
                            : 'none'
                      }}
                      value={profileData.portfolio_url}
                      onChange={handleProfileChange}
                      placeholder="https://yourportfolio.com"
                      onFocus={(e) => {
                        e.target.style.borderColor = designSystem.colors.primary.split('(')[0];
                        e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = formErrors.portfolio_url 
                          ? designSystem.colors.danger.split('(')[0] 
                          : profileData.portfolio_url 
                            ? designSystem.colors.success.split('(')[0] 
                            : designSystem.colors.gray[300];
                        e.target.style.boxShadow = formErrors.portfolio_url 
                          ? `0 0 0 3px ${designSystem.colors.danger}20`
                          : profileData.portfolio_url 
                            ? `0 0 0 3px ${designSystem.colors.success}20`
                            : 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: formErrors.portfolio_url 
                        ? designSystem.colors.danger.split('(')[0] 
                        : profileData.portfolio_url 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[400],
                      fontSize: '16px',
                      pointerEvents: 'none'
                    }}>
                      <i className="fas fa-briefcase"></i>
                    </div>
                  </div>
                  {formErrors.portfolio_url && (
                    <div style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.danger.split('(')[0],
                      marginTop: designSystem.spacing.sm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: designSystem.spacing.xs,
                      padding: designSystem.spacing.sm,
                      backgroundColor: `${designSystem.colors.danger}10`,
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px solid ${designSystem.colors.danger}30`
                    }}>
                      <i className="fas fa-exclamation-triangle"></i>
                      {formErrors.portfolio_url}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.bold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-globe" style={{ 
                      color: designSystem.colors.info.split('(')[0],
                      fontSize: '14px'
                    }}></i>
                    Website URL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="url"
                      name="website_url"
                      style={{
                        ...componentStyles.formInput,
                        fontSize: designSystem.typography.fontSize.base,
                        padding: `${designSystem.spacing.lg} ${designSystem.spacing.md}`,
                        paddingLeft: '48px',
                        height: '56px',
                        borderRadius: designSystem.borderRadius.button,
                        border: `2px solid ${formErrors.website_url 
                          ? designSystem.colors.danger.split('(')[0] 
                          : profileData.website_url 
                            ? designSystem.colors.success.split('(')[0] 
                            : designSystem.colors.gray[300]}`,
                        backgroundColor: 'white',
                        transition: 'all 0.3s ease',
                        boxShadow: formErrors.website_url 
                          ? `0 0 0 3px ${designSystem.colors.danger}20`
                          : profileData.website_url 
                            ? `0 0 0 3px ${designSystem.colors.success}20`
                            : 'none'
                      }}
                      value={profileData.website_url}
                      onChange={handleProfileChange}
                      placeholder="https://yourwebsite.com"
                      onFocus={(e) => {
                        e.target.style.borderColor = designSystem.colors.primary.split('(')[0];
                        e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = formErrors.website_url 
                          ? designSystem.colors.danger.split('(')[0] 
                          : profileData.website_url 
                            ? designSystem.colors.success.split('(')[0] 
                            : designSystem.colors.gray[300];
                        e.target.style.boxShadow = formErrors.website_url 
                          ? `0 0 0 3px ${designSystem.colors.danger}20`
                          : profileData.website_url 
                            ? `0 0 0 3px ${designSystem.colors.success}20`
                            : 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: formErrors.website_url 
                        ? designSystem.colors.danger.split('(')[0] 
                        : profileData.website_url 
                          ? designSystem.colors.success.split('(')[0] 
                          : designSystem.colors.gray[400],
                      fontSize: '16px',
                      pointerEvents: 'none'
                    }}>
                      <i className="fas fa-globe"></i>
                    </div>
                  </div>
                  {formErrors.website_url && (
                    <div style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.danger.split('(')[0],
                      marginTop: designSystem.spacing.sm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: designSystem.spacing.xs,
                      padding: designSystem.spacing.sm,
                      backgroundColor: `${designSystem.colors.danger}10`,
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px solid ${designSystem.colors.danger}30`
                    }}>
                      <i className="fas fa-exclamation-triangle"></i>
                      {formErrors.website_url}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ 
              marginBottom: designSystem.spacing.xl,
              padding: designSystem.spacing.xl,
              backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: designSystem.borderRadius.card,
              border: `1px solid ${designSystem.colors.gray[200]}`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: designSystem.spacing.md,
                marginBottom: designSystem.spacing.xl,
                paddingBottom: designSystem.spacing.md,
                borderBottom: `2px solid ${designSystem.colors.primary.split('(')[0]}20`
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${designSystem.colors.primary} 0%, ${designSystem.colors.primary}CC 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  <i className="fas fa-user-edit"></i>
                </div>
                <div>
                  <h6 style={{
                    color: designSystem.colors.dark,
                    fontWeight: designSystem.typography.fontWeight.bold,
                    fontSize: designSystem.typography.fontSize.xl,
                    margin: 0,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    Bio/About Me
                  </h6>
                  <p style={{
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[600],
                    margin: 0
                  }}>
                    Share your professional background and immigration goals
                  </p>
                </div>
              </div>
              
              <div style={{ position: 'relative' }}>
                <textarea
                  name="bio"
                  rows="6"
                  style={{
                    ...componentStyles.formInput,
                    width: '100%',
                    resize: 'vertical',
                    minHeight: '180px',
                    maxHeight: '400px',
                    fontFamily: designSystem.typography.fontFamily,
                    fontSize: designSystem.typography.fontSize.base,
                    padding: designSystem.spacing.lg,
                    lineHeight: '1.7',
                    borderRadius: designSystem.borderRadius.button,
                    border: `2px solid ${profileData.bio 
                      ? designSystem.colors.success.split('(')[0] 
                      : designSystem.colors.gray[300]}`,
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    boxShadow: profileData.bio 
                      ? `0 0 0 3px ${designSystem.colors.success}20`
                      : 'none',
                    '::placeholder': {
                      color: designSystem.colors.gray[400],
                      fontSize: designSystem.typography.fontSize.sm
                    }
                  }}
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself, your background, goals, and what you're looking to achieve...

Examples:
• Your professional background and current role
• Educational qualifications and achievements
• Immigration goals (EB-1A, EB-2 NIW, O-1, etc.)
• Notable accomplishments or publications
• Future career aspirations"
                  onFocus={(e) => {
                    e.target.style.borderColor = designSystem.colors.primary.split('(')[0];
                    e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = profileData.bio 
                      ? designSystem.colors.success.split('(')[0] 
                      : designSystem.colors.gray[300];
                    e.target.style.boxShadow = profileData.bio 
                      ? `0 0 0 3px ${designSystem.colors.success}20`
                      : 'none';
                  }}
                />
                
                {/* Character count and guidelines */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginTop: designSystem.spacing.md,
                  gap: designSystem.spacing.lg
                }}>
                  <div style={{
                    flex: 1,
                    padding: designSystem.spacing.md,
                    backgroundColor: designSystem.colors.gray[50],
                    borderRadius: designSystem.borderRadius.button,
                    border: `1px solid ${designSystem.colors.gray[200]}`
                  }}>
                    <div style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.dark,
                      fontWeight: designSystem.typography.fontWeight.medium,
                      marginBottom: designSystem.spacing.sm,
                      display: 'flex',
                      alignItems: 'center',
                      gap: designSystem.spacing.xs
                    }}>
                      <i className="fas fa-lightbulb" style={{ color: designSystem.colors.warning.split('(')[0] }}></i>
                      Tips for a great bio:
                    </div>
                    <ul style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.gray[600],
                      margin: 0,
                      paddingLeft: '16px',
                      lineHeight: '1.5'
                    }}>
                      <li>Be specific about your achievements</li>
                      <li>Mention your immigration category of interest</li>
                      <li>Include relevant work experience</li>
                      <li>Highlight unique qualifications</li>
                    </ul>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: designSystem.spacing.xs
                  }}>
                    <div style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: (profileData.bio?.length || 0) > 800 
                        ? designSystem.colors.warning.split('(')[0]
                        : (profileData.bio?.length || 0) > 950 
                          ? designSystem.colors.danger.split('(')[0]
                          : designSystem.colors.gray[500],
                      fontWeight: designSystem.typography.fontWeight.medium,
                      padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                      backgroundColor: (profileData.bio?.length || 0) > 800 
                        ? `${designSystem.colors.warning}10`
                        : 'transparent',
                      borderRadius: designSystem.borderRadius.button,
                      border: (profileData.bio?.length || 0) > 800 
                        ? `1px solid ${designSystem.colors.warning}30`
                        : 'none'
                    }}>
                      {profileData.bio?.length || 0} / 1000 characters
                    </div>
                    
                    {(profileData.bio?.length || 0) > 0 && (
                      <div style={{
                        fontSize: designSystem.typography.fontSize.xs,
                        color: designSystem.colors.success.split('(')[0],
                        display: 'flex',
                        alignItems: 'center',
                        gap: designSystem.spacing.xs
                      }}>
                        <i className="fas fa-check-circle"></i>
                        Looking good!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information (Read-only) */}
            <div style={{ marginBottom: designSystem.spacing.xl }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md
              }}>
                Account Information
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: designSystem.spacing.lg,
                padding: designSystem.spacing.lg,
                backgroundColor: designSystem.colors.gray[50],
                borderRadius: designSystem.borderRadius.card,
                border: `1px solid ${designSystem.colors.gray[200]}`
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.gray[600],
                    marginBottom: designSystem.spacing.xs
                  }}>
                    Account Status
                  </label>
                  <div style={{
                    padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
                    backgroundColor: profileData.status === 'active' ? `${designSystem.colors.success}20` : `${designSystem.colors.warning}20`,
                    color: profileData.status === 'active' ? designSystem.colors.success.split('(')[0] : designSystem.colors.warning.split('(')[0],
                    borderRadius: designSystem.borderRadius.button,
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    textTransform: 'capitalize',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}>
                    <i className={`fas ${profileData.status === 'active' ? 'fa-check-circle' : 'fa-clock'} me-2`}></i>
                    {profileData.status || 'Active'}
                  </div>
                </div>

                {profileData.crm_manager && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: designSystem.typography.fontSize.sm,
                      fontWeight: designSystem.typography.fontWeight.medium,
                      color: designSystem.colors.gray[600],
                      marginBottom: designSystem.spacing.xs
                    }}>
                      Assigned Manager
                    </label>
                    <div style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.dark,
                      fontWeight: designSystem.typography.fontWeight.medium
                    }}>
                      <i className="fas fa-user-tie me-2"></i>
                      {profileData.crm_manager.first_name} {profileData.crm_manager.last_name}
                    </div>
                    <div style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.gray[500]
                    }}>
                      {profileData.crm_manager.email}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.gray[600],
                    marginBottom: designSystem.spacing.xs
                  }}>
                    Member Since
                  </label>
                  <div style={{
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.dark
                  }}>
                    <i className="fas fa-calendar me-2"></i>
                    {(() => {
                      const createdDate = clientData?.user?.createdAt || clientData?.createdAt;
                      return createdDate ? new Date(createdDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A';
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              paddingTop: designSystem.spacing.xl,
              borderTop: `2px solid ${designSystem.colors.gray[200]}`,
              marginTop: designSystem.spacing.lg
            }}>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                style={{
                  ...componentStyles.primaryButton,
                  background: loading 
                    ? designSystem.colors.gray[400] 
                    : !isFormValid 
                      ? designSystem.colors.gray[400]
                      : designSystem.colors.success,
                  cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
                  padding: `${designSystem.spacing.lg} ${designSystem.spacing.xxl}`,
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.bold,
                  display: 'flex',
                  alignItems: 'center',
                  gap: designSystem.spacing.md,
                  minWidth: '200px',
                  justifyContent: 'center',
                  borderRadius: designSystem.borderRadius.card,
                  boxShadow: loading || !isFormValid 
                    ? 'none' 
                    : '0 8px 25px rgba(34, 197, 94, 0.3)',
                  transform: loading ? 'none' : 'translateY(0)',
                  transition: 'all 0.3s ease'
                }}
                {...((!loading && isFormValid) ? {
                  onMouseEnter: (e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(34, 197, 94, 0.4)';
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                  }
                } : {})}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save fa-lg"></i>
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{
                textAlign: 'center',
                marginBottom: designSystem.spacing.xl,
                padding: designSystem.spacing.lg,
                backgroundColor: designSystem.colors.warning + '10',
                borderRadius: designSystem.borderRadius.card,
                border: `1px solid ${designSystem.colors.warning}30`
              }}>
                <i className="fas fa-shield-alt fa-2x" style={{ 
                  color: designSystem.colors.warning.split('(')[0],
                  marginBottom: designSystem.spacing.sm
                }}></i>
                <h6 style={{
                  color: designSystem.colors.dark,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  marginBottom: designSystem.spacing.xs
                }}>
                  Change Your Password
                </h6>
                <p style={{
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[600],
                  margin: 0
                }}>
                  Choose a strong password to keep your account secure
                </p>
              </div>

              <div style={{ marginBottom: designSystem.spacing.lg }}>
                <label style={{
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.medium,
                  color: designSystem.colors.dark,
                  marginBottom: designSystem.spacing.xs
                }}>
                  <i className="fas fa-lock me-2"></i>Current Password *
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPasswords.current_password ? "text" : "password"}
                    name="current_password"
                    required
                    style={{
                      ...componentStyles.formInput,
                      paddingRight: '45px',
                      width: '100%'
                    }}
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current_password: !prev.current_password }))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: designSystem.colors.gray[500],
                      padding: '4px 8px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = designSystem.colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = designSystem.colors.gray[500]}
                  >
                    <i className={`fas ${showPasswords.current_password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: designSystem.spacing.lg }}>
                <label style={{
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.medium,
                  color: designSystem.colors.dark,
                  marginBottom: designSystem.spacing.xs
                }}>
                  <i className="fas fa-key me-2"></i>New Password *
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPasswords.new_password ? "text" : "password"}
                    name="new_password"
                    required
                    minLength={8}
                    style={{
                      ...componentStyles.formInput,
                      paddingRight: '45px',
                      width: '100%'
                    }}
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new_password: !prev.new_password }))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: designSystem.colors.gray[500],
                      padding: '4px 8px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = designSystem.colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = designSystem.colors.gray[500]}
                  >
                    <i className={`fas ${showPasswords.new_password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordData.new_password && passwordValidation.strength && (
                  <div style={{ marginTop: designSystem.spacing.sm }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: designSystem.spacing.xs
                    }}>
                      <span style={{
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[600]
                      }}>
                        Password Strength:
                      </span>
                      <span style={{
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.semibold,
                        color: getPasswordStrengthColor(passwordValidation.strength.score)
                      }}>
                        {getPasswordStrengthText(passwordValidation.strength.score)}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      backgroundColor: designSystem.colors.gray[200],
                      borderRadius: '4px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '8px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease',
                        width: `${passwordValidation.strength.percentage}%`,
                        backgroundColor: getPasswordStrengthColor(passwordValidation.strength.score)
                      }}></div>
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                <div style={{
                  marginTop: designSystem.spacing.sm,
                  padding: designSystem.spacing.sm,
                  backgroundColor: designSystem.colors.gray[50],
                  borderRadius: designSystem.borderRadius.button,
                  border: `1px solid ${designSystem.colors.gray[200]}`
                }}>
                  <div style={{
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.dark,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-info-circle me-2"></i>Password Requirements:
                  </div>
                  <ul style={{
                    fontSize: designSystem.typography.fontSize.xs,
                    color: designSystem.colors.gray[600],
                    margin: 0,
                    paddingLeft: '20px',
                    lineHeight: '1.4'
                  }}>
                    <li>At least 8 characters long</li>
                    <li>Contains uppercase letter (A-Z)</li>
                    <li>Contains lowercase letter (a-z)</li>
                    <li>Contains number (0-9)</li>
                    <li>Contains special character (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>

              <div style={{ marginBottom: designSystem.spacing.xl }}>
                <label style={{
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.medium,
                  color: designSystem.colors.dark,
                  marginBottom: designSystem.spacing.xs
                }}>
                  <i className="fas fa-check-double me-2"></i>Confirm New Password *
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPasswords.confirm_password ? "text" : "password"}
                    name="confirm_password"
                    required
                    minLength={8}
                    style={{
                      ...componentStyles.formInput,
                      paddingRight: '45px',
                      width: '100%'
                    }}
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm_password: !prev.confirm_password }))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: designSystem.colors.gray[500],
                      padding: '4px 8px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = designSystem.colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = designSystem.colors.gray[500]}
                  >
                    <i className={`fas ${showPasswords.confirm_password ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {passwordData.confirm_password && (
                  <div style={{
                    marginTop: designSystem.spacing.xs,
                    fontSize: designSystem.typography.fontSize.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.xs
                  }}>
                    {passwordData.new_password === passwordData.confirm_password ? (
                      <>
                        <i className="fas fa-check-circle" style={{ color: designSystem.colors.success.split('(')[0] }}></i>
                        <span style={{ color: designSystem.colors.success.split('(')[0] }}>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times-circle" style={{ color: designSystem.colors.danger.split('(')[0] }}></i>
                        <span style={{ color: designSystem.colors.danger.split('(')[0] }}>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Validation Errors */}
              {passwordValidation.errors.length > 0 && (
                <div style={{
                  marginBottom: designSystem.spacing.lg,
                  padding: designSystem.spacing.sm,
                  backgroundColor: `${designSystem.colors.danger}15`,
                  borderRadius: designSystem.borderRadius.button,
                  border: `1px solid ${designSystem.colors.danger}30`
                }}>
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.danger.split('(')[0],
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: designSystem.spacing.xs,
                      marginBottom: index < passwordValidation.errors.length - 1 ? designSystem.spacing.xs : 0
                    }}>
                      <i className="fas fa-exclamation-circle" style={{ marginTop: '2px', flexShrink: 0 }}></i>
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                paddingTop: designSystem.spacing.lg,
                borderTop: `1px solid ${designSystem.colors.gray[200]}`
              }}>
                <button
                  type="submit"
                  disabled={loading || !passwordValidation.isValid}
                  style={{
                    ...componentStyles.primaryButton,
                    background: loading || !passwordValidation.isValid 
                      ? designSystem.colors.gray[400] 
                      : designSystem.colors.warning,
                    cursor: loading || !passwordValidation.isValid ? 'not-allowed' : 'pointer',
                    padding: `${designSystem.spacing.md} ${designSystem.spacing.xl}`,
                    fontSize: designSystem.typography.fontSize.base,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.sm,
                    minWidth: '180px',
                    justifyContent: 'center'
                  }}
                  {...(!loading && passwordValidation.isValid ? hoverEffects.button : {})}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>Changing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i>Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientProfileSettings;