import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ChatWidget from '../../../components/ChatWidget';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import {
  ClientOverview,
  ClientProjects,
  ClientPayments,
  ClientServices,
  ClientAppointments,
  ClientTimeline,
  ClientQueries,
  ClientProfileSettings
} from './components';

const ClientProfileDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE = 'http://localhost:5000/api';
  const authToken = localStorage.getItem('token') || localStorage.getItem('client_token');

  useEffect(() => {
    loadClientProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          logout();
          return;
        }
        throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.message,
        message: error.message
      };
    }
  };

  const loadClientProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!authToken) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      // Load client profile data
      const profileResponse = await apiCall('/client-accounts/profile');
      if (profileResponse.success) {
        setClientData(profileResponse.data);
      } else {
        setError(profileResponse.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-danger m-4">
          <h5>Error Loading Profile</h5>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadClientProfile}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <ClientOverview clientData={clientData} apiCall={apiCall} />;
      case 'projects':
        return <ClientProjects clientData={clientData} apiCall={apiCall} />;
      case 'payments':
        return <ClientPayments clientData={clientData} apiCall={apiCall} />;
      case 'services':
        return <ClientServices clientData={clientData} apiCall={apiCall} />;
      case 'appointments':
        return <ClientAppointments clientData={clientData} apiCall={apiCall} />;
      case 'timeline':
        return <ClientTimeline clientData={clientData} apiCall={apiCall} />;
      case 'queries':
        return <ClientQueries clientData={clientData} apiCall={apiCall} />;
      case 'settings':
        return <ClientProfileSettings clientData={clientData} apiCall={apiCall} onUpdate={loadClientProfile} />;
      default:
        return <ClientOverview clientData={clientData} apiCall={apiCall} />;
    }
  };

  // Responsive styles
  const getMainContentStyle = () => {
    const baseStyle = {
      marginTop: '70px', 
      padding: '30px',
      minHeight: 'calc(100vh - 70px)',
      overflow: 'auto',
      transition: 'margin-left 0.3s ease'
    };

    // Desktop: sidebar always visible
    if (window.innerWidth >= 768) {
      return {
        ...baseStyle,
        marginLeft: '250px',
        width: 'calc(100% - 250px)'
      };
    }

    // Mobile: sidebar toggleable
    return {
      ...baseStyle,
      marginLeft: sidebarOpen ? '250px' : '0',
      width: sidebarOpen ? 'calc(100% - 250px)' : '100%'
    };
  };

  return (
    <>
      <div className="min-h-screen" style={{ background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
        <TopNavbar user={clientData} logout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <div style={getMainContentStyle()}>
          {/* Profile Header Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-avatar me-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}>
                  {getInitials(clientData?.first_name, clientData?.last_name)}
                </div>
              </div>
              <div className="profile-info">
                <h2 className="mb-1">{clientData?.first_name} {clientData?.last_name}</h2>
                <div className="text-muted">
                  <i className="fas fa-envelope me-2"></i>
                  {clientData?.email}
                  {clientData?.phone && (
                    <>
                      <span className="mx-2">•</span>
                      <i className="fas fa-phone me-2"></i>
                      {clientData?.phone}
                    </>
                  )}
                </div>
                <div className="mt-2">
                  <span className="badge bg-success me-2">Active Client</span>
                  <span className="badge bg-primary">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {renderContent()}
          </div>
        </div>
        
        {/* Mobile overlay */}
        {sidebarOpen && window.innerWidth < 768 && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 998
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
      
      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
};

export default ClientProfileDashboard;