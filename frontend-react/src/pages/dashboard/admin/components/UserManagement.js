import { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');
  const [showAddModal, setShowAddModal] = useState(false);
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
      
      // Mock data for demonstration - expanded with more users
      setUsers([
        // Admin Users
        {
          _id: '507f1f77bcf86cd799439014',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@system.com',
          role: 'admin',
          status: 'active',
          last_login: '2026-01-21T08:15:00Z',
          created_at: '2025-01-01T00:00:00Z'
        },
        
        // Manager Users
        {
          _id: '507f1f77bcf86cd799439011',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@email.com',
          role: 'lead_manager',
          status: 'active',
          last_login: '2026-01-20T10:30:00Z',
          created_at: '2025-06-15T00:00:00Z',
          phone: '+1 (555) 123-4567',
          company: 'Immigration Pro'
        },
        {
          _id: '507f1f77bcf86cd799439012',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.j@email.com',
          role: 'crm_manager',
          status: 'active',
          last_login: '2026-01-19T14:20:00Z',
          created_at: '2025-07-20T00:00:00Z',
          phone: '+1 (555) 987-6543',
          company: 'Immigration Pro'
        },
        {
          _id: '507f1f77bcf86cd799439015',
          first_name: 'David',
          last_name: 'Wilson',
          email: 'david.w@email.com',
          role: 'lead_manager',
          status: 'inactive',
          last_login: '2026-01-10T09:00:00Z',
          created_at: '2025-08-10T00:00:00Z',
          phone: '+1 (555) 456-7890',
          company: 'Immigration Pro'
        },
        
        // Client Users
        {
          _id: '507f1f77bcf86cd799439013',
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael.c@email.com',
          role: 'client',
          status: 'active',
          last_login: '2026-01-21T16:45:00Z',
          created_at: '2025-12-01T00:00:00Z',
          phone: '+1 (555) 234-5678',
          company: 'Tech Innovations Inc',
          country: 'United States'
        },
        {
          _id: '507f1f77bcf86cd799439016',
          first_name: 'Priya',
          last_name: 'Patel',
          email: 'priya.p@email.com',
          role: 'client',
          status: 'active',
          last_login: '2026-01-20T12:30:00Z',
          created_at: '2025-11-15T00:00:00Z',
          phone: '+91 98765 43210',
          company: 'Global Solutions Ltd',
          country: 'India'
        },
        {
          _id: '507f1f77bcf86cd799439017',
          first_name: 'Carlos',
          last_name: 'Rodriguez',
          email: 'carlos.r@email.com',
          role: 'client',
          status: 'inactive',
          last_login: null,
          created_at: '2025-12-20T00:00:00Z',
          phone: '+52 55 1234 5678',
          company: 'Mexican Enterprises',
          country: 'Mexico'
        },
        {
          _id: '507f1f77bcf86cd799439018',
          first_name: 'Emma',
          last_name: 'Thompson',
          email: 'emma.t@email.com',
          role: 'client',
          status: 'active',
          last_login: '2026-01-18T14:20:00Z',
          created_at: '2025-10-05T00:00:00Z',
          phone: '+44 20 7946 0958',
          company: 'British Consulting',
          country: 'United Kingdom'
        },
        {
          _id: '507f1f77bcf86cd799439019',
          first_name: 'Yuki',
          last_name: 'Tanaka',
          email: 'yuki.t@email.com',
          role: 'client',
          status: 'active',
          last_login: '2026-01-19T08:15:00Z',
          created_at: '2025-09-12T00:00:00Z',
          phone: '+81 3 1234 5678',
          company: 'Tokyo Tech Corp',
          country: 'Japan'
        }
      ]);

    } catch (error) {
      console.error('Error loading users:', error);
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
      // In real implementation, call API
      // await usersAPI.create(formData);
      
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
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    }
  };

  const editUser = async (userId) => {
    const newRole = prompt(`Select new role for user:
    
1. lead_manager (Lead Manager)
2. crm_manager (CRM Manager)
3. client (Client)

Enter role name:`);
    
    if (!newRole) return;
    
    const validRoles = ['lead_manager', 'crm_manager', 'client'];
    if (!validRoles.includes(newRole)) {
      alert('Invalid role. Please enter: lead_manager, crm_manager, or client');
      return;
    }

    try {
      // In real implementation, call API
      // await usersAPI.update(userId, { role: newRole });
      
      alert('User role updated successfully!');
      loadUserManagement();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user role. Please try again.');
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?

This action cannot be undone.`)) {
      return;
    }

    try {
      // In real implementation, call API
      // await usersAPI.delete(userId);
      
      alert('User deleted successfully!');
      loadUserManagement();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const managementCardStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
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
        <table className="table table-hover">
          <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              {userType !== 'admins' && <th>Phone</th>}
              {userType === 'clients' && <th>Company</th>}
              {userType === 'clients' && <th>Country</th>}
              {userType === 'managers' && <th>Role</th>}
              <th>Status</th>
              <th>Last Login</th>
              <th>Member Since</th>
              <th>Actions</th>
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
                <tr key={user._id}>
                  <td><strong>{user._id.slice(-6).toUpperCase()}</strong></td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-circle me-2" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-semibold">{`${user.first_name} ${user.last_name}`}</div>
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

  const viewUserDetails = (user) => {
    alert(`User Details:
    
Name: ${user.first_name} ${user.last_name}
Email: ${user.email}
Role: ${formatRole(user.role)}
Status: ${formatStatus(user.status)}
Phone: ${user.phone || 'Not provided'}
Company: ${user.company || 'Not provided'}
Country: ${user.country || 'Not provided'}
Member Since: ${new Date(user.created_at).toLocaleDateString()}
Last Login: ${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}`);
  };

  return (
    <div className="management-card user-management" style={managementCardStyle}>
      {/* Header with Stats */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1">
            <i className="fas fa-users me-2"></i>
            User Management
          </h5>
          <div className="d-flex gap-3 mt-2">
            <small className="text-muted">
              <i className="fas fa-users me-1"></i>
              Total: <strong>{getUserCounts().total}</strong>
            </small>
            <small className="text-muted">
              <i className="fas fa-user-tie me-1"></i>
              Clients: <strong>{getUserCounts().clients}</strong>
            </small>
            <small className="text-muted">
              <i className="fas fa-user-cog me-1"></i>
              Managers: <strong>{getUserCounts().managers}</strong>
            </small>
            <small className="text-muted">
              <i className="fas fa-shield-alt me-1"></i>
              Admins: <strong>{getUserCounts().admins}</strong>
            </small>
          </div>
        </div>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-1"></i>Add New User
        </button>
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
          <ul className="nav nav-pills mb-4" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
                type="button"
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
              >
                <i className="fas fa-shield-alt me-2"></i>
                Admins ({getUserCounts().admins})
              </button>
            </li>
          </ul>

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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>Add New User
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddUser}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          First Name <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Last Name <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="email" 
                          className="form-control" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Password <span className="text-danger">*</span>
                        </label>
                        <input 
                          type="password" 
                          className="form-control" 
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          minLength="8" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Role <span className="text-danger">*</span>
                        </label>
                        <select 
                          className="form-select" 
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Role</option>
                          <optgroup label="Client Users">
                            <option value="client">Client - Immigration service user</option>
                          </optgroup>
                          <optgroup label="Manager Users">
                            <option value="lead_manager">Lead Manager - Manages leads and conversions</option>
                            <option value="crm_manager">CRM Manager - Manages client relationships</option>
                          </optgroup>
                        </select>
                        <div className="form-text">
                          <small>
                            <strong>Client:</strong> Regular users who use immigration services<br/>
                            <strong>Lead Manager:</strong> Manages leads and lead conversion<br/>
                            <strong>CRM Manager:</strong> Manages existing client relationships
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Phone Number</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Company</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Country</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleAddUser}
                >
                  <i className="fas fa-save me-1"></i>Create User
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