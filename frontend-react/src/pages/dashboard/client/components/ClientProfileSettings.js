import { useState, useEffect, useRef } from 'react';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const ClientProfileSettings = ({ clientData, apiCall, onRefresh, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  
  // Profile form data
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
    current_profile_picture: ''
  });
  
  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (clientData) {
      setProfileData({
        first_name: clientData.first_name || '',
        last_name: clientData.last_name || '',
        phone: clientData.phone || '',
        company: clientData.company || '',
        country: clientData.country || '',
        university: clientData.university || '',
        linkedin_url: clientData.linkedin_url || '',
        portfolio_url: clientData.portfolio_url || '',
        website_url: clientData.website_url || '',
        bio: clientData.bio || '',
        profile_picture: null,
        current_profile_picture: clientData.profile_picture || ''
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
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
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
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('phone', profileData.phone);
      formData.append('company', profileData.company);
      formData.append('country', profileData.country);
      formData.append('university', profileData.university);
      formData.append('linkedin_url', profileData.linkedin_url);
      formData.append('portfolio_url', profileData.portfolio_url);
      formData.append('website_url', profileData.website_url);
      formData.append('bio', profileData.bio);
      
      if (profileData.profile_picture) {
        formData.append('profile_picture', profileData.profile_picture);
      }

      const response = await apiCall('/client-accounts/profile', {
        method: 'PUT',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('client_token')}`
        }
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Reset file input
        setProfileData({
          ...profileData,
          profile_picture: null,
          current_profile_picture: response.data.profile_picture || profileData.current_profile_picture
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh parent data
        onUpdate?.();
        onRefresh?.();
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.new_password || !passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    if (!passwordData.current_password) {
      setMessage({ type: 'error', text: 'Current password is required' });
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
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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
        border: `1px solid ${designSystem.colors.gray[200]}`
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
                alignItems: 'center',
                gap: designSystem.spacing.lg
              }}>
                {/* Current Profile Picture */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `3px solid ${designSystem.colors.primary.split('(')[0]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: profileData.current_profile_picture 
                    ? `url(${profileData.current_profile_picture}) center/cover` 
                    : designSystem.colors.primary,
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: designSystem.typography.fontWeight.bold
                }}>
                  {!profileData.current_profile_picture && getInitials(profileData.first_name, profileData.last_name)}
                </div>

                {/* Upload Controls */}
                <div style={{ flex: 1 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  
                  <div style={{ marginBottom: designSystem.spacing.sm }}>
                    <button
                      type="button"
                      style={{
                        ...componentStyles.primaryButton,
                        background: designSystem.colors.primary,
                        marginRight: designSystem.spacing.sm
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      {...hoverEffects.button}
                    >
                      <i className="fas fa-upload me-2"></i>
                      {profileData.profile_picture ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    
                    {profileData.current_profile_picture && (
                      <button
                        type="button"
                        style={{
                          ...componentStyles.secondaryButton,
                          color: designSystem.colors.danger.split('(')[0]
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
                        <i className="fas fa-trash me-2"></i>Remove
                      </button>
                    )}
                  </div>
                  
                  {profileData.profile_picture && (
                    <div style={{
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.success.split('(')[0],
                      marginBottom: designSystem.spacing.sm
                    }}>
                      <i className="fas fa-check me-2"></i>
                      New photo selected: {profileData.profile_picture.name}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: designSystem.typography.fontSize.xs,
                    color: designSystem.colors.gray[500]
                  }}>
                    Supported formats: JPG, PNG, GIF (max 5MB)
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div style={{ marginBottom: designSystem.spacing.xl }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md
              }}>
                Basic Information
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: designSystem.spacing.md
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    style={componentStyles.formInput}
                    value={profileData.first_name}
                    onChange={handleProfileChange}
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
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    style={componentStyles.formInput}
                    value={profileData.last_name}
                    onChange={handleProfileChange}
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    style={componentStyles.formInput}
                    value={profileData.phone}
                    onChange={handleProfileChange}
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
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    style={componentStyles.formInput}
                    value={profileData.country}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div style={{ marginBottom: designSystem.spacing.xl }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md
              }}>
                Professional Information
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: designSystem.spacing.md
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    style={componentStyles.formInput}
                    value={profileData.company}
                    onChange={handleProfileChange}
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
                    University/Institution
                  </label>
                  <input
                    type="text"
                    name="university"
                    style={componentStyles.formInput}
                    value={profileData.university}
                    onChange={handleProfileChange}
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
                External Links
              </h6>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: designSystem.spacing.md
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium,
                    color: designSystem.colors.dark,
                    marginBottom: designSystem.spacing.xs
                  }}>
                    <i className="fab fa-linkedin me-2"></i>LinkedIn Profile
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
                    <i className="fas fa-briefcase me-2"></i>Portfolio URL
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
                    <i className="fas fa-globe me-2"></i>Website URL
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
                Bio/About Me
              </label>
              <textarea
                name="bio"
                rows="4"
                style={{
                  ...componentStyles.formInput,
                  resize: 'vertical',
                  minHeight: '100px'
                }}
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself, your background, and your goals..."
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...componentStyles.primaryButton,
                  background: loading ? designSystem.colors.gray[400] : designSystem.colors.success,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                {...(!loading ? hoverEffects.button : {})}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ maxWidth: '400px' }}>
              <h6 style={{
                color: designSystem.colors.dark,
                fontWeight: designSystem.typography.fontWeight.semibold,
                marginBottom: designSystem.spacing.md
              }}>
                Change Password
              </h6>

              <div style={{ marginBottom: designSystem.spacing.md }}>
                <label style={{
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.medium,
                  color: designSystem.colors.dark,
                  marginBottom: designSystem.spacing.xs
                }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  name="current_password"
                  required
                  style={componentStyles.formInput}
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div style={{ marginBottom: designSystem.spacing.md }}>
                <label style={{
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.medium,
                  color: designSystem.colors.dark,
                  marginBottom: designSystem.spacing.xs
                }}>
                  New Password *
                </label>
                <input
                  type="password"
                  name="new_password"
                  required
                  minLength={8}
                  style={componentStyles.formInput}
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                />
                <div style={{
                  fontSize: designSystem.typography.fontSize.xs,
                  color: designSystem.colors.gray[500],
                  marginTop: designSystem.spacing.xs
                }}>
                  Must be at least 8 characters long
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
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  minLength={8}
                  style={componentStyles.formInput}
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...componentStyles.primaryButton,
                    background: loading ? designSystem.colors.gray[400] : designSystem.colors.warning,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  {...(!loading ? hoverEffects.button : {})}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>Changing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key me-2"></i>Change Password
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