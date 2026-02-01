import { designSystem } from '../../../../styles/designSystem';

const TopNavbar = ({ user, clientData, logout, sidebarOpen, setSidebarOpen }) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const displayName = clientData?.user?.full_name || 
                     `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 
                     clientData?.name || 
                     'Client';

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        padding: '0 30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: designSystem.typography.fontFamily
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Mobile menu toggle */}
        <button 
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          style={{ 
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            marginRight: '20px',
            cursor: 'pointer',
            display: window.innerWidth < 768 ? 'block' : 'none'
          }}
        >
          <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <i className="fas fa-user-circle" style={{ fontSize: '24px', marginRight: '12px' }}></i>
          <h4 style={{ margin: 0, fontWeight: '600' }}>Client Portal</h4>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Client Profile Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white'
          }}>
            {getInitials(user?.first_name, user?.last_name)}
          </div>
          <div style={{ display: window.innerWidth < 640 ? 'none' : 'block' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{displayName}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{clientData?.user?.email || user?.email}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <a 
            href="/" 
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            <i className="fas fa-home"></i>
            <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Home</span>
          </a>
          
          <button 
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;