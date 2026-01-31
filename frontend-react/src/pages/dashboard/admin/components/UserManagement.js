import { useState, useEffect } from 'react';
import { usersAPI } from '../../../../services/api';

// Unified Design System
const designSystem = {
  colors: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    danger: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    light: '#f8fafc',
    dark: '#1e293b'
  },
  shadows: {
    card: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.03)',
    button: '0 4px 15px rgba(102, 126, 234, 0.3)',
    modal: '0 25px 50px rgba(0, 0, 0, 0.25)'
  },
  borderRadius: {
    card: '16px',
    button: '12px',
    modal: '20px',
    input: '12px'
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    company: '',
    country: ''
  });

  useEffect(() => {
    loadUserManagement();
  }, []);

  const loadUserManagement = async () => {
    try {
      setLoading(true);
      
      const response = await usersAPI.getAll();
      
      if (response.success) {
        const users = response.data || [];
        setUsers(users);
        
        // Calculate statistics
        // Calculate user statistics for potential future use
        // const stats = {
        //   total: users.length,
        //   clients: users.filter(u => u.role === 'client').length,
        //   managers: users.filter(u => ['lead_manager', 'crm_manager'].includes(u.role)).length,
        //   admins: users.filter(u => u.role === 'admin').length
        // };
      } else {
        throw new Error(response.error?.message || 'Failed to load users');
      }

    } catch (error) {
      console.error('Error loading user management:', error);
      // Set empty state on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by role/type
  const getFilteredUsers = (type) => {
    switch (type) {
      case 'clients':
        return users.filter(user => user.role === 'client');
      case 'managers':
        return users.filter(user => ['lead_manager', 'crm_manager'].includes(user.role));
      case 'admins':
        return users.filter(user => user.role === 'admin');
      default:
        return users;
    }
  };

  // Get user counts for each section
  const getUserCounts = () => {
    return {
      clients: users.filter(user => user.role === 'client').length,
      managers: users.filter(user => ['lead_manager', 'crm_manager'].includes(user.role)).length,
      admins: users.filter(user => user.role === 'admin').length,
      total: users.length
    };
  };

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      'admin': 'bg-danger',
      'lead_manager': 'bg-primary',
      'crm_manager': 'bg-info',
      'client': 'bg-secondary'
    };
    return roleClasses[role] || 'bg-secondary';
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'active': 'bg-success',
      'inactive': 'bg-warning',
      'suspended': 'bg-danger',
      'deleted': 'bg-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const formatRole = (role) => {
    const roleNames = {
      'admin': 'Admin',
      'lead_manager': 'Lead Manager',
      'crm_manager': 'CRM Manager',
      'client': 'Client'
    };
    return roleNames[role] || role;
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'password', 'role'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    // Validate password length
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const response = await usersAPI.create(formData);
      
      if (response.success) {
        alert('User created successfully!');
        setShowAddModal(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          role: '',
          phone: '',
          company: '',
          country: ''
        });
        loadUserManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error.message}`);
    }
  };

  const viewUserDetails = (user) => {
    setModalData(user);
    setModalType('view');
    setShowModal(true);
  };

  const editUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    setModalData(user);
    setModalType('edit');
    setShowModal(true);
  };

  const handleEditUser = async (userId, newRole) => {
    try {
      const response = await usersAPI.update(userId, { role: newRole });
      
      if (response.success) {
        setModalData({ message: 'User role updated successfully!', type: 'success' });
        setModalType('success');
        setShowModal(true);
        loadUserManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setModalData({ message: `Error updating user role: ${error.message}`, type: 'error' });
      setModalType('error');
      setShowModal(true);
    }
  };

  const deleteUser = async (userId, userEmail) => {
    const user = users.find(u => u._id === userId);
    setModalData({ user, userEmail });
    setModalType('delete');
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await usersAPI.delete(userId);
      
      if (response.success) {
        setModalData({ message: 'User deleted successfully!', type: 'success' });
        setModalType('success');
        setShowModal(true);
        loadUserManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setModalData({ message: `Error deleting user: ${error.message}`, type: 'error' });
      setModalType('error');
      setShowModal(true);
    }
  };

  const renderUserTable = (userType) => {
    const filteredUsers = getFilteredUsers(userType);
    
    if (filteredUsers.length === 0) {
      return (
        <div className="text-center py-4">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <p className="text-muted">No {userType} found in the system</p>
          {userType !== 'admins' && (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => {
                setFormData(prev => ({ ...prev, role: userType === 'clients' ? 'client' : 'lead_manager' }));
                setShowAddModal(true);
              }}
            >
              <i className="fas fa-plus me-1"></i>Add {userType === 'clients' ? 'Client' : 'Manager'}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <thead 
            style={{ 
              background: primaryGradient,
              color: 'white'
            }}
          >
            <tr>
              <th style={{ border: 'none', padding: '16px' }}>User ID</th>
              <th style={{ border: 'none', padding: '16px' }}>Name</th>
              <th style={{ border: 'none', padding: '16px' }}>Email</th>
              {userType !== 'admins' && <th style={{ border: 'none', padding: '16px' }}>Phone</th>}
              {userType === 'clients' && <th style={{ border: 'none', padding: '16px' }}>Company</th>}
              {userType === 'clients' && <th style={{ border: 'none', padding: '16px' }}>Country</th>}
              {userType === 'managers' && <th style={{ border: 'none', padding: '16px' }}>Role</th>}
              <th style={{ border: 'none', padding: '16px' }}>Status</th>
              <th style={{ border: 'none', padding: '16px' }}>Last Login</th>
              <th style={{ border: 'none', padding: '16px' }}>Member Since</th>
              <th style={{ border: 'none', padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const lastLogin = user.last_login ? 
                new Date(user.last_login).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never';
              
              const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              const isAdmin = user.role === 'admin';
              
              return (
                <tr 
                  key={user._id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px', border: 'none' }}>
                    <span 
                      className="badge"
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        padding: '6px 10px',
                        borderRadius: '8px'
                      }}
                    >
                      {user._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px', border: 'none' }}>
                    <div className="d-flex align-items-center">
                      <div 
                        className="avatar-circle me-3" 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          background: primaryGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ color: '#1e293b', fontSize: '15px' }}>
                          {`${user.first_name} ${user.last_name}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  {userType !== 'admins' && <td>{user.phone || '-'}</td>}
                  {userType === 'clients' && <td>{user.company || '-'}</td>}
                  {userType === 'clients' && <td>{user.country || '-'}</td>}
                  {userType === 'managers' && (
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                  )}
                  <td>
                    <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                      {formatStatus(user.status)}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">{lastLogin}</small>
                  </td>
                  <td>
                    <small className="text-muted">{memberSince}</small>
                  </td>
                  <td>
                    {isAdmin ? (
                      <span className="text-muted small">
                        <i className="fas fa-shield-alt"></i> Protected
                      </span>
                    ) : (
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => viewUserDetails(user)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-warning"
                          onClick={() => editUser(user._id)}
                          title="Edit Role"
                        >
                          <i className="fas fa-user-cog"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => deleteUser(user._id, user.email)}
                          title="Delete User"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const managementCardStyle = {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.03)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    marginBottom: '24px'
  };

  const primaryGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const successGradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
  const warningGradient = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
  const dangerGradient = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';

  return (
    <div className="management-card user-management" style={managementCardStyle}>
      {/* Header with Stats */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8">
          <div className="d-flex align-items-center mb-3">
            <div 
              className="icon-wrapper me-3"
              style={{
                background: primaryGradient,
                borderRadius: '12px',
                padding: '12px',
                color: 'white'
              }}
            >
              <i className="fas fa-users fa-lg"></i>
            </div>
            <div>
              <h4 className="mb-1" style={{ color: '#1e293b', fontWeight: '600' }}>
                User Management
              </h4>
              <p className="text-muted mb-0">Manage system users and their roles</p>
            </div>
          </div>
          
          {/* Enhanced Overview Stats */}
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <div 
                className="stat-card text-center py-3 px-2"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                <div className="fw-bold fs-4">{getUserCounts().total}</div>
                <small className="opacity-90">Total Users</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div 
                className="stat-card text-center py-3 px-2"
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
                }}
              >
                <div className="fw-bold fs-4">{getUserCounts().clients}</div>
                <small className="opacity-90">Clients</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div 
                className="stat-card text-center py-3 px-2"
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)'
                }}
              >
                <div className="fw-bold fs-4">{getUserCounts().managers}</div>
                <small className="opacity-90">Managers</small>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div 
                className="stat-card text-center py-3 px-2"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                }}
              >
                <div className="fw-bold fs-4">{getUserCounts().admins}</div>
                <small className="opacity-90">Admins</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-lg px-4 py-2"
            onClick={() => setShowAddModal(true)}
            style={{
              background: primaryGradient,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '500',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            <i className="fas fa-plus me-2"></i>Add User
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p className="mt-3 text-muted">Loading users...</p>
        </div>
      )}

      {/* User Type Tabs */}
      {!loading && (
        <>
          {/* Enhanced User Type Tabs */}
          <div className="mb-4">
            <ul className="nav nav-pills" role="tablist" style={{ gap: '8px' }}>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`}
                  onClick={() => setActiveTab('clients')}
                  type="button"
                  style={{
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontWeight: '500',
                    border: 'none',
                    background: activeTab === 'clients' ? successGradient : '#f1f5f9',
                    color: activeTab === 'clients' ? 'white' : '#64748b',
                    boxShadow: activeTab === 'clients' ? '0 4px 15px rgba(79, 172, 254, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-user-tie me-2"></i>
                  Clients ({getUserCounts().clients})
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'managers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('managers')}
                  type="button"
                  style={{
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontWeight: '500',
                    border: 'none',
                    background: activeTab === 'managers' ? warningGradient : '#f1f5f9',
                    color: activeTab === 'managers' ? 'white' : '#64748b',
                    boxShadow: activeTab === 'managers' ? '0 4px 15px rgba(250, 112, 154, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-user-cog me-2"></i>
                  Managers ({getUserCounts().managers})
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'admins' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admins')}
                  type="button"
                  style={{
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontWeight: '500',
                    border: 'none',
                    background: activeTab === 'admins' ? dangerGradient : '#f1f5f9',
                    color: activeTab === 'admins' ? 'white' : '#64748b',
                    boxShadow: activeTab === 'admins' ? '0 4px 15px rgba(255, 107, 107, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-shield-alt me-2"></i>
                  Admins ({getUserCounts().admins})
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div className="tab-pane fade show active">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-muted mb-0">
                    <i className="fas fa-user-tie me-2"></i>
                    Client Users - People who use our immigration services
                  </h6>
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, role: 'client' }));
                      setShowAddModal(true);
                    }}
                  >
                    <i className="fas fa-plus me-1"></i>Add Client
                  </button>
                </div>
                {renderUserTable('clients')}
              </div>
            )}

            {/* Managers Tab */}
            {activeTab === 'managers' && (
              <div className="tab-pane fade show active">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-muted mb-0">
                    <i className="fas fa-user-cog me-2"></i>
                    Manager Users - Lead Managers and CRM Managers
                  </h6>
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, role: 'lead_manager' }));
                      setShowAddModal(true);
                    }}
                  >
                    <i className="fas fa-plus me-1"></i>Add Manager
                  </button>
                </div>
                {renderUserTable('managers')}
              </div>
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && (
              <div className="tab-pane fade show active">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-muted mb-0">
                    <i className="fas fa-shield-alt me-2"></i>
                    Admin Users - System administrators with full access
                  </h6>
                  <small className="text-warning">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    Admin accounts are protected and cannot be modified
                  </small>
                </div>
                {renderUserTable('admins')}
              </div>
            )}
          </div>
        </>
      )}

      {/* No Users Message */}
      {!loading && users.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-users fa-4x text-muted mb-4"></i>
          <h6 className="text-muted mb-3">No users found in the system</h6>
          <p className="text-muted mb-4">Get started by adding your first user to the platform</p>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-2"></i>Add First User
          </button>
        </div>
      )}

      {/* Enhanced Add User Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div 
              className="modal-content"
              style={{
                border: 'none',
                borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div 
                className="modal-header border-0 pb-0"
                style={{ 
                  background: primaryGradient,
                  color: 'white',
                  padding: '24px 32px 20px'
                }}
              >
                <div>
                  <h4 className="modal-title mb-1" style={{ fontWeight: '600' }}>
                    <i className="fas fa-user-plus me-3"></i>Add New User
                  </h4>
                  <p className="mb-0 opacity-90">Create a new user account for the system</p>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                  style={{
                    fontSize: '14px',
                    opacity: '0.8'
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '32px' }}>
                <form onSubmit={handleAddUser}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="firstName"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                          required 
                        />
                        <label htmlFor="firstName" className="text-muted">
                          First Name <span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="lastName"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                          required 
                        />
                        <label htmlFor="lastName" className="text-muted">
                          Last Name <span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row g-4 mt-2">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email Address"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                          required 
                        />
                        <label htmlFor="email" className="text-muted">
                          Email Address <span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="password" 
                          className="form-control" 
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Password"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                          minLength="8" 
                          required 
                        />
                        <label htmlFor="password" className="text-muted">
                          Password <span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row g-4 mt-2">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select 
                          className="form-select" 
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="client">👤 Client - Immigration service user</option>
                          <option value="lead_manager">👨‍💼 Lead Manager - Manages leads and conversions</option>
                          <option value="crm_manager">🏢 CRM Manager - Manages client relationships</option>
                        </select>
                        <label htmlFor="role" className="text-muted">
                          User Role <span className="text-danger">*</span>
                        </label>
                      </div>
                      <div className="form-text mt-2">
                        <small className="text-muted">
                          Choose the appropriate role for this user's responsibilities
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="tel" 
                          className="form-control" 
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Phone Number"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                        />
                        <label htmlFor="phone" className="text-muted">Phone Number</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row g-4 mt-2">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Company"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                        />
                        <label htmlFor="company" className="text-muted">Company</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input 
                          type="text" 
                          className="form-control" 
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Country"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            padding: '12px 16px'
                          }}
                        />
                        <label htmlFor="country" className="text-muted">Country</label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div 
                className="modal-footer border-0"
                style={{ 
                  padding: '20px 32px 32px',
                  background: '#f8fafc'
                }}
              >
                <button 
                  type="button" 
                  className="btn btn-lg px-4 me-3"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-lg px-4"
                  onClick={handleAddUser}
                  style={{
                    background: primaryGradient,
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '500',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <i className="fas fa-save me-2"></i>Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;