const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, stats }) => {
  const sidebarItems = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard Overview' },
    { id: 'leads', icon: 'fas fa-user-plus', label: 'Lead Management', count: stats?.total },
    { id: 'qualified', icon: 'fas fa-user-check', label: 'Qualified Leads', count: stats?.qualifiedCount },
    { id: 'projects', icon: 'fas fa-project-diagram', label: 'Converted Projects', count: stats?.convertedCount },
    { id: 'analytics', icon: 'fas fa-chart-line', label: 'Lead Analytics' },
    { id: 'reports', icon: 'fas fa-file-alt', label: 'Reports & Export' }
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s',
    borderLeft: `3px solid ${isActive ? '#1e3a8a' : 'transparent'}`,
    background: isActive ? '#f3f4f6' : 'transparent',
    cursor: 'pointer'
  });

  return (
    <div style={getSidebarStyle()}>
      {sidebarItems.map(item => (
        <div
          key={item.id}
          style={itemStyle(activeSection === item.id)}
          onClick={() => handleItemClick(item.id)}
          onMouseEnter={(e) => {
            if (activeSection !== item.id) {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#1e3a8a';
              e.target.style.borderLeftColor = '#1e3a8a';
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== item.id) {
              e.target.style.background = 'transparent';
              e.target.style.color = '#4b5563';
              e.target.style.borderLeftColor = 'transparent';
            }
          }}
        >
          <div>
            <i className={`${item.icon} me-2`}></i>
            {item.label}
          </div>
          {item.count !== undefined && item.count > 0 && (
            <span className="badge bg-danger rounded-pill" style={{ fontSize: '10px' }}>
              {item.count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;