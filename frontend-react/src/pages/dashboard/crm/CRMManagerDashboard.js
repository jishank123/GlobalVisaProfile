import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import CrmStats from './components/CrmStats';
import ProjectsManagement from './components/ProjectsManagement';
import TasksManagement from './components/TasksManagement';
import QueriesManagement from './components/QueriesManagement';
import AppointmentsManagement from './components/AppointmentsManagement';
import PaymentsManagement from './components/PaymentsManagement';

const CRMManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize dashboard
    console.log('🏠 CRM Dashboard initialized');
    console.log('🏠 Current user:', user);
    console.log('🏠 User role:', user?.role);
    console.log('🏠 User email:', user?.email);
    console.log('🏠 User ID:', user?.id || user?._id);
    console.log('🏠 Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('🏠 API Base URL from env:', process.env.REACT_APP_API_URL);
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM dashboard...</p>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <CrmStats />;
      case 'projects':
        return <ProjectsManagement user={user} />;
      case 'tasks':
        return <TasksManagement />;
      case 'queries':
        return <QueriesManagement />;
      case 'appointments':
        return <AppointmentsManagement />;
      case 'payments':
        return <PaymentsManagement />;
      default:
        return <CrmStats />;
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
    <div className="min-h-screen" style={{ background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <TopNavbar user={user} logout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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
};

export default CRMManagerDashboard;