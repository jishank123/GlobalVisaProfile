import { useState, useEffect, useRef } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import { validatePassword } from '../../../../utils/validation';

const ClientProfileSettings = ({ clientData, apiCall, onRefresh, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [],
    strength: { score: 0, level: 'Very Weak', percentage: 0 }
  });

  useEffect(() => {
    if (clientData) {
      // Populate from User model data
      const userData = clientData.user || clientData;
      const clientProfile = clientData.client_profile || {};
      
      setProfileData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || clientProfile.phone || '',
        company: userData.company || '',
        country: userData.country || '',
        university: clientProfile.university || '',
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
      });
    }
  }, [clientData]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation - just check if it's an image
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }

      setProfileData({
        ...profileData,
        profile_picture: file
      });
      setMessage({ type: '', text: '' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.first_name || !profileData.last_name) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
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

      const response = await apiCall('/client-accounts/profile', {
        method: 'PUT',
        body: formData
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Reset file input and update current profile picture
        setProfileData(prev => ({
          ...prev,
          profile_picture: null,
          current_profile_picture: response.data?.user?.profile_picture || prev.current_profile_picture
        }));
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Refresh parent data
        onUpdate?.();
        onRefresh?.();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
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

    // Validate password strength
    const validation = validatePassword(passwordData.new_password, passwordData.confirm_password);
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors[0] });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await apiCall('/client-accounts/change-password', {
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
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
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
            <div style={{ marginBottom: designSystem.spacing.xl }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md
              }}>
                Profile Picture
              </h6>
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: designSystem.spacing.xl,
                flexWrap: 'wrap'
              }}>
                {/* Current Profile Picture */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: designSystem.spacing.sm
                }}>
                  <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `4px solid ${designSystem.colors.primary.split('(')[0]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: profileData.current_profile_picture 
                      ? `url(${profileData.current_profile_picture}) center/cover` 
                      : designSystem.colors.primary,
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: designSystem.typography.fontWeight.bold,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {!profileData.current_profile_picture && getInitials(profileData.first_name, profileData.last_name)}
                  </div>
                  
                  <div style={{
                    fontSize: designSystem.typography.fontSize.xs,
                    color: designSystem.colors.gray[500],
                    textAlign: 'center',
                    maxWidth: '140px'
                  }}>
                    Current Photo
                  </div>
                </div>

                {/* Upload Controls */}
                <div style={{ 
                  flex: 1,
                  minWidth: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: designSystem.spacing.md
                }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  
                  <div style={{
                    display: 'flex',
                    gap: designSystem.spacing.sm,
                    flexWrap: 'wrap'
                  }}>
                    <button
                      type="button"
                      style={{
                        ...componentStyles.primaryButton,
                        background: designSystem.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: designSystem.spacing.xs
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      {...hoverEffects.button}
                    >
                      <i className="fas fa-upload"></i>
                      {profileData.profile_picture ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    
                    {profileData.current_profile_picture && (
                      <button
                        type="button"
                        style={{
                          ...componentStyles.secondaryButton,
                          color: designSystem.colors.danger.split('(')[0],
                          borderColor: designSystem.colors.danger.split('(')[0],
                          display: 'flex',
                          alignItems: 'center',
                          gap: designSystem.spacing.xs
                        }}
                        onClick={() => {
                          setProfileData({
                            ...profileData,
                            profile_picture: null,
                            current_profile_picture: ''
                          });
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        {...hoverEffects.button}
                      >
                        <i className="fas fa-trash"></i>Remove
                      </button>
                    )}
                  </div>
                  
                  {profileData.profile_picture && (
                    <div style={{
                      padding: designSystem.spacing.sm,
                      backgroundColor: `${designSystem.colors.success}15`,
                      borderRadius: designSystem.borderRadius.button,
                      border: `1px solid ${designSystem.colors.success}30`,
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.success.split('(')[0],
                      display: 'flex',
                      alignItems: 'center',
                      gap: designSystem.spacing.xs
                    }}>
                      <i className="fas fa-check-circle"></i>
                      <span>New photo selected: <strong>{profileData.profile_picture.name}</strong></span>
                    </div>
                  )}
                  
                  <div style={{
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
                      <i className="fas fa-info-circle me-2"></i>Photo Guidelines
                    </div>
                    <ul style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.gray[600],
                      margin: 0,
                      paddingLeft: '20px',
                      lineHeight: '1.4'
                    }}>
                      <li>All image formats supported</li>
                      <li>Any file size accepted</li>
                      <li>Professional photo recommended</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div style={{ 
              marginBottom: designSystem.spacing.xl,
              padding: designSystem.spacing.lg,
              backgroundColor: designSystem.colors.gray[25],
              borderRadius: designSystem.borderRadius.card,
              border: `1px solid ${designSystem.colors.gray[100]}`
            }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.lg,
                fontSize: designSystem.typography.fontSize.lg,
                display: 'flex',
                alignItems: 'center',
                gap: designSystem.spacing.sm
              }}>
                <i className="fas fa-user-circle" style={{ color: designSystem.colors.primary.split('(')[0] }}></i>
                Basic Information
              </h6>
              
              {/* Name Fields Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: designSystem.spacing.lg,
                marginBottom: designSystem.spacing.lg
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.sm
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.base,
                      padding: designSystem.spacing.md
                    }}
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.sm
                  }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.base,
                      padding: designSystem.spacing.md
                    }}
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email Field - Full Width */}
              <div style={{ marginBottom: designSystem.spacing.lg }}>
                <label style={{
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  color: designSystem.colors.dark,
                  marginBottom: designSystem.spacing.sm
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
                    fontSize: designSystem.typography.fontSize.base,
                    padding: designSystem.spacing.md
                  }}
                  value={clientData?.user?.email || clientData?.email || ''}
                  disabled
                  readOnly
                />
                <div style={{
                  fontSize: designSystem.typography.fontSize.xs,
                  color: designSystem.colors.gray[500],
                  marginTop: designSystem.spacing.sm,
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  gap: designSystem.spacing.xs
                }}>
                  <i className="fas fa-lock"></i>
                  Email address cannot be changed for security reasons
                </div>
              </div>

              {/* Contact & Location Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: designSystem.spacing.lg
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <i className="fas fa-phone me-2" style={{ color: designSystem.colors.success.split('(')[0] }}></i>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.base,
                      padding: designSystem.spacing.md
                    }}
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <i className="fas fa-globe me-2" style={{ color: designSystem.colors.warning.split('(')[0] }}></i>
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.base,
                      padding: designSystem.spacing.md
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
              padding: designSystem.spacing.lg,
              backgroundColor: designSystem.colors.gray[25],
              borderRadius: designSystem.borderRadius.card,
              border: `1px solid ${designSystem.colors.gray[100]}`
            }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.lg,
                fontSize: designSystem.typography.fontSize.lg,
                display: 'flex',
                alignItems: 'center',
                gap: designSystem.spacing.sm
              }}>
                <i className="fas fa-briefcase" style={{ color: designSystem.colors.primary.split('(')[0] }}></i>
                Professional Information
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: designSystem.spacing.lg
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <i className="fas fa-building me-2" style={{ color: designSystem.colors.info.split('(')[0] }}></i>
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.base,
                      padding: designSystem.spacing.md
                    }}
                    value={profileData.company}
                    onChange={handleProfileChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.sm
                  }}>
                    <i className="fas fa-university me-2" style={{ color: designSystem.colors.warning.split('(')[0] }}></i>
                    University/Institution
                  </label>
                  <input
                    type="text"
                    name="university"
                    style={{
                      ...componentStyles.formInput,
                      fontSize: designSystem.typography.fontSize.base,
                      padding: designSystem.spacing.md
                    }}
                    value={profileData.university}
                    onChange={handleProfileChange}
                    placeholder="Enter university name"
                  />
                </div>
              </div>
            </div>

            {/* External Links */}
            <div style={{ marginBottom: designSystem.spacing.xl }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md
              }}>
                External Links & Portfolio
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: designSystem.spacing.lg
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fab fa-linkedin me-2" style={{ color: '#0077B5' }}></i>LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin_url"
                    style={componentStyles.formInput}
                    value={profileData.linkedin_url}
                    onChange={handleProfileChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-briefcase me-2" style={{ color: designSystem.colors.primary.split('(')[0] }}></i>Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolio_url"
                    style={componentStyles.formInput}
                    value={profileData.portfolio_url}
                    onChange={handleProfileChange}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fas fa-globe me-2" style={{ color: designSystem.colors.info.split('(')[0] }}></i>Website URL
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    style={componentStyles.formInput}
                    value={profileData.website_url}
                    onChange={handleProfileChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: designSystem.spacing.xl }}>
              <label style={{
                display: 'block',
                fontSize: designSystem.typography.fontSize.sm,
                fontWeight: designSystem.typography.fontWeight.medium,
                color: designSystem.colors.dark,
                marginBottom: designSystem.spacing.xs
              }}>
                <i className="fas fa-user-edit me-2"></i>Bio/About Me
              </label>
              <textarea
                name="bio"
                rows="4"
                style={{
                  ...componentStyles.formInput,
                  resize: 'vertical',
                  minHeight: '120px',
                  fontFamily: designSystem.typography.fontFamily
                }}
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself, your background, goals, and what you're looking to achieve..."
              />
              <div style={{
                fontSize: designSystem.typography.fontSize.xs,
                color: designSystem.colors.gray[500],
                marginTop: designSystem.spacing.xs
              }}>
                Share your professional background, achievements, and immigration goals to help us serve you better.
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
                    {clientData?.user?.createdAt ? new Date(clientData.user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              paddingTop: designSystem.spacing.lg,
              borderTop: `1px solid ${designSystem.colors.gray[200]}`
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...componentStyles.primaryButton,
                  background: loading ? designSystem.colors.gray[400] : designSystem.colors.success,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: `${designSystem.spacing.md} ${designSystem.spacing.xl}`,
                  fontSize: designSystem.typography.fontSize.base,
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  display: 'flex',
                  alignItems: 'center',
                  gap: designSystem.spacing.sm,
                  minWidth: '160px',
                  justifyContent: 'center'
                }}
                {...(!loading ? hoverEffects.button : {})}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>Update Profile
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
                <input
                  type="password"
                  name="current_password"
                  required
                  style={componentStyles.formInput}
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                />
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
                <input
                  type="password"
                  name="new_password"
                  required
                  minLength={8}
                  style={componentStyles.formInput}
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                />
                
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
                <input
                  type="password"
                  name="confirm_password"
                  required
                  minLength={8}
                  style={componentStyles.formInput}
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                />
                
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