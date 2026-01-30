import { useState, useEffect } from 'react';
import { usersAPI } from '../../../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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
      
      // Mock data for demonstration
      setUsers([
        {
          _id: '507f1f77bcf86cd799439011',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@email.com',
          role: 'lead_manager',
          status: 'active',
          last_login: '2024-01-20T10:30:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439012',
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.j@email.com',
          role: 'crm_manager',
          status: 'active',
          last_login: '2024-01-19T14:20:00Z'
        },
        {
          _id: '507f1f77bcf86cd799439013',
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael.c@email.com',
          role: 'client',
          status: 'inactive',
          last_login: null
        },
        {
          _id: '507f1f77bcf86cd799439014',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@system.com',
          role: 'admin',
          status: 'active',
          last_login: '2024-01-21T08:15:00Z'
        }
      ]);

    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="management-card" style={managementCardStyle}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <i className="fas fa-users me-2"></i>
          User Management
        </h5>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-1"></i>Add New User
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
          <p className="mt-2 text-muted">Loading users...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const lastLogin = user.last_login ? 
                  new Date(user.last_login).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Never';
                
                const isAdmin = user.role === 'admin';
                
                return (
                  <tr key={user._id}>
                    <td><strong>{user._id.slice(-6).toUpperCase()}</strong></td>
                    <td>{`${user.first_name} ${user.last_name}`}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                        {formatStatus(user.status)}
                      </span>
                    </td>
                    <td>{lastLogin}</td>
                    <td>
                      {isAdmin ? (
                        <span className="text-muted small">
                          <i className="fas fa-shield-alt"></i> Protected
                        </span>
                      ) : (
                        <div className="btn-group btn-group-sm">
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
      )}

      {/* No Users Message */}
      {!loading && users.length === 0 && (
        <div className="text-center py-4">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <p className="text-muted">No users found in the system</p>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-1"></i>Add First User
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
                        <div className="form-text">Minimum 8 characters</div>
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
                          <option value="client">Client</option>
                          <option value="lead_manager">Lead Manager</option>
                          <option value="crm_manager">CRM Manager</option>
                        </select>
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