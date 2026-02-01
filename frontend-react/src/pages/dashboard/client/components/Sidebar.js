import { designSystem } from '../../../../styles/designSystem';

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }) => {
  const sidebarItems = [
    { id: 'overview', icon: 'fas fa-tachometer-alt', label: 'Dashboard Overview' },
    { id: 'services', icon: 'fas fa-concierge-bell', label: 'Browse Services' },
    { id: 'projects', icon: 'fas fa-project-diagram', label: 'My Projects' },
    { id: 'payments', icon: 'fas fa-credit-card', label: 'Payments & Billing' },
    { id: 'appointments', icon: 'fas fa-calendar-alt', label: 'Appointments' },
    { id: 'queries', icon: 'fas fa-question-circle', label: 'Support & Queries' },
    { id: 'timeline', icon: 'fas fa-history', label: 'Activity Timeline' },
    { id: 'settings', icon: 'fas fa-user-cog', label: 'Profile Settings' }
  ];

  const getSidebarStyle = () => {
    const baseStyle = {
      position: 'fixed',
      left: 0,
      top: '70px',
      width: '250px',
      height: 'calc(100vh - 70px)',
      background: 'white',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      zIndex: 999,
      transition: 'transform 0.3s ease'
    };

    // Desktop: always visible
    if (window.innerWidth >= 768) {
      return baseStyle;
    }

    // Mobile: slide in/out
    return {
      ...baseStyle,
      transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
    };
  };

  const handleItemClick = (itemId) => {
    setActiveSection(itemId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768 && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const itemStyle = (isActive) => ({
    padding: '15px 20px',
    color: isActive ? '#1e3a8a' : '#4b5563',
    textDecoration: 'none',
    display: 'block',
    transition: 'all 0.3s',
    borderLeft: `3px solid ${isActive ? '#1e3a8a' : 'transparent'}`,
    background: isActive ? '#f3f4f6' : 'transparent',
    cursor: 'pointer'
  });

  return (
    <div style={getSidebarStyle()}>
      {/* Sidebar Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '10px'
      }}>
        <h6 style={{
          color: designSystem.colors.dark,
          fontWeight: '600',
          fontSize: '14px',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Client Portal
        </h6>
      </div>

      {/* Navigation Items */}
      <nav>
        {sidebarItems.map((item) => (
          <div
            key={item.id}
            style={itemStyle(activeSection === item.id)}
            onClick={() => handleItemClick(item.id)}
            onMouseEnter={(e) => {
              if (activeSection !== item.id) {
                e.target.style.background = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            <i className={item.icon} style={{ marginRight: '12px', width: '16px' }}></i>
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;