import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getApiBaseUrl } from '../../../utils/apiConfig';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import { designSystem, componentStyles } from '../../../styles/designSystem';
import ClientOverview from './components/ClientOverview';
import ClientProjects from './components/ClientProjects';
import ClientPayments from './components/ClientPayments';
import ClientServices from './components/ClientServices';
import ClientAppointments from './components/ClientAppointments';
import ClientTimeline from './components/ClientTimeline';
import ClientQueries from './components/ClientQueries';
import ClientProfileSettings from './components/ClientProfileSettings';

const ClientProfileDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API configuration
    const API_BASE = getApiBaseUrl();
    const authToken = localStorage.getItem('token') || localStorage.getItem('client_token');

    useEffect(() => {
        loadClientProfile();
    }, []);

    const apiCall = async (endpoint, options = {}) => {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            ...options
        };

        // Only set Content-Type for non-FormData requests
        if (!(options.body instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

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
            console.error('❌ Client API Error:', error);
            return { success: false, error: error.message, message: error.message };
        }
    };

    const loadClientProfile = async () => {
        console.log('🔄 Loading client profile...');
        setLoading(true);
        setError(null);

        try {
            if (!authToken) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }

            // Load client profile data using the correct auth endpoint
            const profileResponse = await apiCall('/auth/me');
            
            if (profileResponse.success) {
                setClientData(profileResponse.data);
                // Update AuthContext user to keep TopNavbar in sync
                if (profileResponse.data?.user) {
                    updateUser(profileResponse.data.user);
                } else if (profileResponse.data) {
                    updateUser(profileResponse.data);
                }
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
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: designSystem.colors.light,
                fontFamily: designSystem.typography.fontFamily
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: `4px solid ${designSystem.colors.gray[200]}`,
                        borderTop: `4px solid ${designSystem.colors.primary.split('(')[0]}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }}></div>
                    <p style={{ color: designSystem.colors.gray[600] }}>Loading client dashboard...</p>
                </div>
            </div>
        );
    }

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'overview':
                return <ClientOverview clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
            case 'services':
                return <ClientServices clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
            case 'projects':
                return <ClientProjects clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
            case 'payments':
                return <ClientPayments clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
            case 'appointments':
                return <ClientAppointments clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
            case 'queries':
                return <ClientQueries clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
            case 'timeline':
                return <ClientTimeline clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
            case 'settings':
                return <ClientProfileSettings 
                    clientData={clientData} 
                    apiCall={apiCall} 
                    onRefresh={loadClientProfile} 
                    onUpdate={loadClientProfile} 
                />;
            default:
                return <ClientOverview clientData={clientData} apiCall={apiCall} onRefresh={loadClientProfile} />;
        }
    };

    // Responsive styles matching admin dashboard
    const getMainContentStyle = () => {
        const baseStyle = {
            marginTop: '70px',
            padding: '30px',
            minHeight: 'calc(100vh - 70px)',
            overflow: 'auto',
            transition: 'margin-left 0.3s ease',
            background: designSystem.colors.light,
            fontFamily: designSystem.typography.fontFamily
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
        <div style={{ 
            minHeight: '100vh', 
            background: designSystem.colors.light, 
            fontFamily: designSystem.typography.fontFamily 
        }}>
            <TopNavbar 
                user={user} 
                clientData={clientData}
                logout={logout} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
            />
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            
            <div style={getMainContentStyle()}>
                {renderActiveSection()}
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
    );

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: designSystem.colors.light,
                fontFamily: designSystem.typography.fontFamily
            }}>
                <div style={{
                    ...componentStyles.managementCard,
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        ...componentStyles.headerIcon,
                        background: designSystem.colors.danger,
                        margin: '0 auto 16px',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="fas fa-exclamation-triangle fa-2x"></i>
                    </div>
                    <h5 style={{ color: designSystem.colors.dark, marginBottom: '16px' }}>Error Loading Profile</h5>
                    <p style={{ color: designSystem.colors.gray[600], marginBottom: '24px' }}>{error}</p>
                    <button 
                        style={componentStyles.primaryButton}
                        onClick={loadClientProfile}
                    >
                        <i className="fas fa-sync-alt me-2"></i>Try Again
                    </button>
                </div>
            </div>
        );
    }
};

export default ClientProfileDashboard;
