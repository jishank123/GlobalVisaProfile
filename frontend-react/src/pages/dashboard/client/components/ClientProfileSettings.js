import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { authAPI } from '../../../../services/api';

const ClientProfileSettings = () => {
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    country: '',
    profile_picture: '',
    linkedin_url: ''
  });
  
  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        company: user.company || '',
        country: user.country || '',
        profile_picture: user.profile_picture || '',
        linkedin_url: user.linkedin_url || ''
      });
    }
  }, [user]);

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.first_name || !profileData.last_name) {
      setMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(profileData);

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update user context
        if (updateUser) {
          updateUser(response.data.user);
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error?.message || 'Failed to update profile' 
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

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    // Skip current password check if user has temp password
    if (!user?.is_temp_password && !passwordData.current_password) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: '👤' },
    { id: 'password', name: 'Change Password', icon: '🔒' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile information and account security
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mx-6 mt-4 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="px-6 -mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company/University
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={profileData.company}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={profileData.country}
                    onChange={handleProfileChange}
                  />
                </div>

                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={profileData.linkedin_url}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  id="profile_picture"
                  name="profile_picture"
                  placeholder="https://example.com/your-photo.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={profileData.profile_picture}
                  onChange={handleProfileChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a URL to your profile picture (optional)
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              {!user?.is_temp_password && (
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    required={!user?.is_temp_password}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                  />
                </div>
              )}

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  New Password *
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  required
                  minLength={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  required
                  minLength={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfileSettings;