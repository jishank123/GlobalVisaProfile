const TopNavbar = ({ user, logout, sidebarOpen, setSidebarOpen }) => {
  return (
    <div 
      className="top-navbar"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* Mobile menu toggle */}
            <button 
              className="btn btn-link text-white d-md-none me-3"
              onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
              style={{ border: 'none', fontSize: '18px' }}
            >
              <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
            <h4 className="mb-0">
              <i className="fas fa-shield-alt me-2"></i>
              Admin Control Panel
            </h4>
          </div>
          <div>
            <a href="/CRM" className="btn btn-light btn-sm me-2">
              <i className="fas fa-home me-1"></i>Home
            </a>
            <span className="me-3 d-none d-sm-inline">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Administrator'}
            </span>
            <button onClick={logout} className="btn btn-outline-light btn-sm">
              <i className="fas fa-sign-out-alt me-1"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;