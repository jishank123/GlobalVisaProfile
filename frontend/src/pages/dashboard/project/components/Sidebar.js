const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }) => {
  const sidebarItems = [
    { id: 'overview', icon: 'fas fa-tachometer-alt', label: 'Dashboard Overview' },
    { id: 'projects', icon: 'fas fa-project-diagram', label: 'Projects Management' },
    { id: 'tasks', icon: 'fas fa-tasks', label: 'Tasks Management' },
    { id: 'team', icon: 'fas fa-users', label: 'Team Management' }
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
    color: isActive ? '#0891b2' : '#4b5563',
    textDecoration: 'none',
    display: 'block',
    transition: 'all 0.3s',
    borderLeft: `3px solid ${isActive ? '#0dcaf0' : 'transparent'}`,
    background: isActive ? '#f0f9ff' : 'transparent',
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
              e.target.style.background = '#f0f9ff';
              e.target.style.color = '#0891b2';
              e.target.style.borderLeftColor = '#0dcaf0';
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
          <i className={`${item.icon} me-2`}></i>
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
