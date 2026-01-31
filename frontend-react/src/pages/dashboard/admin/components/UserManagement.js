import { useState, useEffect } from 'react';
import { usersAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

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
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadUserManagement();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: {
        minLength: password.length < minLength,
        hasUpperCase: !hasUpperCase,
        hasLowerCase: !hasLowerCase,
        hasNumbers: !hasNumbers,
        hasSpecialChar: !hasSpecialChar
      }
    };
  };

  const validateForm = () => {
    const errors = {};

    // Required field validation
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.role) errors.role = 'Role is required';

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = 'Password does not meet requirements';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loadUserManagement = async () => {
    try {
      setLoading(true);
      
      const response = await usersAPI.getAll();
      
      if (response.success) {
        const users = response.data || [];
        setUsers(users);
      } else {
        throw new Error(response.error?.message || 'Failed to load users');
      }

    } catch (error) {
      console.error('Error loading user management:', error);
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

  const getRoleBadgeStyle = (role) => {
    const roleStyles = {
      'admin': {
        background: '#dc3545',
        color: 'white'
      },
      'lead_manager': {
        background: '#fd7e14',
        color: 'white'
      },
      'crm_manager': {
        background: '#6f42c1',
        color: 'white'
      },
      'client': {
        background: '#198754',
        color: 'white'
      }
    };
    return roleStyles[role] || { background: designSystem.colors.gray[400], color: 'white' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const response = await usersAPI.create(formData);
      
      if (response.success) {
        alert('✅ User created successfully!');
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
        setFormErrors({});
        loadUserManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.message.includes('email already exists') || error.message.includes('USER_EXISTS')) {
        setFormErrors({ email: 'A user with this email already exists' });
      } else {
        alert(`❌ Error creating user: ${error.message}`);
      }
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
    setFormData({ ...formData, role: user.role });
    setShowModal(true);
  };

  const deleteUser = async (userId, userEmail) => {
    const user = users.find(u => u._id === userId);
    setModalData({ user, userEmail });
    setModalType('delete');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
    setModalType('');
  };

  const handleEditUser = async (userId, newRole) => {
    try {
      const response = await usersAPI.update(userId, { role: newRole });
      
      if (response.success) {
        alert('✅ User role updated successfully!');
        handleModalClose();
        loadUserManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`❌ Error updating user role: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await usersAPI.delete(userId);
      
      if (response.success) {
        alert('✅ User deleted successfully!');
        handleModalClose();
        loadUserManagement();
      } else {
        throw new Error(response.error?.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`❌ Error deleting user: ${error.message}`);
    }
  };

  // Unified Modal Component
  const UnifiedModal = ({ show, onHide, type, data }) => {
    if (!show) return null;

    const getModalConfig = () => {
      switch (type) {
        case 'view':
          return {
            title: 'User Details',
            icon: 'fas fa-eye',
            color: designSystem.colors.primary,
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.md }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Name</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.first_name} {data.last_name}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Email</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.email}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Phone</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.phone || 'Not provided'}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Role</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{formatRole(data.role)}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Company</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.company || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Country</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.country || 'Not specified'}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Status</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{formatStatus(data.status || 'active')}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Member Since</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{new Date(data.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Last Login</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                    {data.last_login ? new Date(data.last_login).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Never'}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>User ID</label>
                  <div style={{ 
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    fontFamily: 'monospace',
                    fontSize: designSystem.typography.fontSize.sm
                  }}>{data._id}</div>
                </div>
              </div>
            )
          };
        case 'edit':
          return {
            title: 'Edit User Role',
            icon: 'fas fa-user-cog',
            color: designSystem.colors.warning,
            content: (
              <div>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <h6 className="text-muted">Editing User Role</h6>
                  <p className="small text-muted">
                    Change the role for this user. This will affect their permissions and access level.
                  </p>
                </div>

                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[600],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium
                  }}>User: <strong>{data.first_name} {data.last_name}</strong></label>
                  <p style={{ fontSize: designSystem.typography.fontSize.sm, color: designSystem.colors.gray[500] }}>
                    {data.email} • Current Role: {formatRole(data.role)}
                  </p>
                </div>

                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[600],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium
                  }}>New Role <span className="text-danger">*</span></label>
                  <select 
                    value={formData.role || data.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    style={componentStyles.formInput}
                    required
                  >
                    <option value="client">Client</option>
                    <option value="lead_manager">Lead Manager</option>
                    <option value="crm_manager">CRM Manager</option>
                  </select>
                </div>

                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> Changing a user's role will immediately affect their access permissions and dashboard view.
                </div>
              </div>
            )
          };
        case 'delete':
          return {
            title: 'Delete User',
            icon: 'fas fa-trash',
            color: designSystem.colors.danger,
            content: (
              <div>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <h6 className="text-danger">Confirm User Deletion</h6>
                  <p className="small text-muted">
                    This will move the user to the deleted section where they can be restored if needed.
                  </p>
                </div>

                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[600],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium
                  }}>User to Delete:</label>
                  <div style={{
                    padding: designSystem.spacing.md,
                    background: designSystem.colors.gray[50],
                    borderRadius: designSystem.borderRadius.button,
                    border: `1px solid ${designSystem.colors.gray[200]}`
                  }}>
                    <strong>{data.user.first_name} {data.user.last_name}</strong><br/>
                    <small className="text-muted">{data.userEmail} • {formatRole(data.user.role)}</small>
                  </div>
                </div>

                <div className="alert alert-warning">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> The user will be moved to the deleted section and can be restored later if needed. The user will lose access to the system immediately.
                </div>
              </div>
            )
          };
        default:
          return { title: '', icon: '', color: '', content: null };
      }
    };

    const config = getModalConfig();

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
              <h5 className="modal-title">
                <i className={`${config.icon} me-2`}></i>
                {config.title}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              {config.content}
            </div>
            <div className="modal-footer">
              {type === 'edit' ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onHide}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning" 
                    onClick={() => handleEditUser(data._id, formData.role || data.role)}
                  >
                    <i className="fas fa-save me-1"></i>
                    Update Role
                  </button>
                </>
              ) : type === 'delete' ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onHide}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteUser(data.user._id)}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete User
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={onHide}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserTable = (userType) => {
    const filteredUsers = getFilteredUsers(userType);
    
    if (filteredUsers.length === 0) {
      return (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-users fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>
            No {userType} found in the system
          </p>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>User ID</th>
              <th style={componentStyles.tableHeaderCell}>Name</th>
              <th style={componentStyles.tableHeaderCell}>Email</th>
              {userType !== 'admins' && <th style={componentStyles.tableHeaderCell}>Phone</th>}
              <th style={componentStyles.tableHeaderCell}>Role</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const isAdmin = user.role === 'admin';
              const statusStyle = getStatusBadgeStyle(user.status || 'active');
              const roleBadgeStyle = getRoleBadgeStyle(user.role);
              
              return (
                <tr 
                  key={user._id}
                  style={componentStyles.tableRow}
                  {...hoverEffects.tableRow}
                >
                  <td style={componentStyles.tableCell}>
                    <span 
                      style={{
                        ...componentStyles.badge,
                        background: designSystem.colors.gray[100],
                        color: designSystem.colors.gray[600],
                        fontFamily: 'monospace'
                      }}
                    >
                      {user._id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: designSystem.borderRadius.button,
                          background: designSystem.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: designSystem.typography.fontSize.base,
                          fontWeight: designSystem.typography.fontWeight.semibold,
                          marginRight: designSystem.spacing.sm,
                          boxShadow: designSystem.shadows.button
                        }}
                      >
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ 
                          color: designSystem.colors.dark, 
                          fontSize: designSystem.typography.fontSize.base,
                          fontWeight: designSystem.typography.fontWeight.medium
                        }}>
                          {`${user.first_name} ${user.last_name}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>{user.email}</td>
                  {userType !== 'admins' && <td style={componentStyles.tableCell}>{user.phone || '-'}</td>}
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: roleBadgeStyle.background,
                      color: roleBadgeStyle.color,
                      fontWeight: designSystem.typography.fontWeight.semibold
                    }}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: statusStyle.background,
                      color: statusStyle.color
                    }}>
                      {formatStatus(user.status || 'active')}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    {isAdmin ? (
                      <span style={{ color: designSystem.colors.gray[500], fontSize: designSystem.typography.fontSize.sm }}>
                        <i className="fas fa-shield-alt"></i> Protected
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => viewUserDetails(user)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => editUser(user._id)}
                          title="Edit Role"
                        >
                          <i className="fas fa-user-cog"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
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

  const StatCard = ({ number, label, borderColor, iconColor }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: 'pointer'
      }}
      {...hoverEffects.card}
    >
      <div style={{ 
        fontSize: designSystem.typography.fontSize['2xl'], 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px',
        color: iconColor
      }}>
        {number}
      </div>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  return (
    <div style={componentStyles.managementCard}>
      {/* Header with Stats */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-users fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>User Management</h4>
            <p style={componentStyles.headerSubtitle}>Manage system users and their roles</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadUserManagement}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>
      
      {/* Enhanced Overview Stats */}
      <div style={componentStyles.statsContainer}>
        <StatCard 
          number={getUserCounts().total}
          label="Total Users"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard 
          number={getUserCounts().clients}
          label="Clients"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard 
          number={getUserCounts().managers}
          label="Managers"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard 
          number={getUserCounts().admins}
          label="Admins"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary.split(' ')[0].split('(')[1] }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading users...</p>
        </div>
      )}

      {/* User Type Tabs */}
      {!loading && (
        <>
          {/* Enhanced User Type Tabs */}
          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                <button 
                  style={{
                    ...componentStyles.primaryButton,
                    background: activeTab === 'clients' ? designSystem.colors.success : designSystem.colors.gray[100],
                    color: activeTab === 'clients' ? 'white' : designSystem.colors.gray[600],
                    boxShadow: activeTab === 'clients' ? designSystem.shadows.button : 'none'
                  }}
                  onClick={() => setActiveTab('clients')}
                  {...hoverEffects.button}
                >
                  Clients ({getUserCounts().clients})
                </button>
                <button 
                  style={{
                    ...componentStyles.primaryButton,
                    background: activeTab === 'managers' ? designSystem.colors.warning : designSystem.colors.gray[100],
                    color: activeTab === 'managers' ? 'white' : designSystem.colors.gray[600],
                    boxShadow: activeTab === 'managers' ? designSystem.shadows.button : 'none'
                  }}
                  onClick={() => setActiveTab('managers')}
                  {...hoverEffects.button}
                >
                  Managers ({getUserCounts().managers})
                </button>
                <button 
                  style={{
                    ...componentStyles.primaryButton,
                    background: activeTab === 'admins' ? designSystem.colors.danger : designSystem.colors.gray[100],
                    color: activeTab === 'admins' ? 'white' : designSystem.colors.gray[600],
                    boxShadow: activeTab === 'admins' ? designSystem.shadows.button : 'none'
                  }}
                  onClick={() => setActiveTab('admins')}
                  {...hoverEffects.button}
                >
                  Admins ({getUserCounts().admins})
                </button>
              </div>
              <button 
                style={{
                  ...componentStyles.primaryButton,
                  background: designSystem.colors.primary,
                  fontSize: designSystem.typography.fontSize.base,
                  padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`
                }}
                onClick={() => setShowAddModal(true)}
                {...hoverEffects.button}
              >
                <i className="fas fa-plus me-2"></i>Add User
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {renderUserTable(activeTab)}
          </div>
        </>
      )}

      {/* No Users Message */}
      {!loading && users.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-users fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No users found in the system</h6>
          <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.lg }}>Get started by adding your first user to the platform</p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  Add New User
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <h6 style={{ color: designSystem.colors.primary, marginBottom: designSystem.spacing.sm }}>
                    <i className="fas fa-info-circle me-2"></i>Add New User Section
                  </h6>
                  <p style={{ fontSize: designSystem.typography.fontSize.sm, color: designSystem.colors.gray[500] }}>
                    Create a new user account with appropriate role and permissions.
                  </p>
                </div>

                <form onSubmit={handleAddUser}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.lg }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        First Name <span style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1] }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        style={{
                          ...componentStyles.formInput,
                          borderColor: formErrors.first_name ? designSystem.colors.danger.split(' ')[0].split('(')[1] : componentStyles.formInput.borderColor
                        }}
                        required 
                      />
                      {formErrors.first_name && (
                        <small style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1], fontSize: designSystem.typography.fontSize.xs }}>
                          {formErrors.first_name}
                        </small>
                      )}
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        Last Name <span style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1] }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        style={{
                          ...componentStyles.formInput,
                          borderColor: formErrors.last_name ? designSystem.colors.danger.split(' ')[0].split('(')[1] : componentStyles.formInput.borderColor
                        }}
                        required 
                      />
                      {formErrors.last_name && (
                        <small style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1], fontSize: designSystem.typography.fontSize.xs }}>
                          {formErrors.last_name}
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.lg, marginTop: designSystem.spacing.lg }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        Email Address <span style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1] }}>*</span>
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        style={{
                          ...componentStyles.formInput,
                          borderColor: formErrors.email ? designSystem.colors.danger.split(' ')[0].split('(')[1] : componentStyles.formInput.borderColor
                        }}
                        required 
                      />
                      {formErrors.email && (
                        <small style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1], fontSize: designSystem.typography.fontSize.xs }}>
                          {formErrors.email}
                        </small>
                      )}
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        Password <span style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1] }}>*</span>
                      </label>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        style={{
                          ...componentStyles.formInput,
                          borderColor: formErrors.password ? designSystem.colors.danger.split(' ')[0].split('(')[1] : componentStyles.formInput.borderColor
                        }}
                        required 
                      />
                      {formErrors.password && (
                        <small style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1], fontSize: designSystem.typography.fontSize.xs }}>
                          {formErrors.password}
                        </small>
                      )}
                      {formData.password && (
                        <div style={{ marginTop: designSystem.spacing.xs }}>
                          <small style={{ fontSize: designSystem.typography.fontSize.xs, color: designSystem.colors.gray[500] }}>
                            Password Requirements:
                          </small>
                          <div style={{ marginTop: '2px' }}>
                            {(() => {
                              const validation = validatePassword(formData.password);
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                  <small style={{ 
                                    fontSize: '10px', 
                                    color: validation.errors.minLength ? designSystem.colors.danger.split(' ')[0].split('(')[1] : designSystem.colors.success 
                                  }}>
                                    <i className={`fas ${validation.errors.minLength ? 'fa-times' : 'fa-check'} me-1`}></i>
                                    At least 8 characters
                                  </small>
                                  <small style={{ 
                                    fontSize: '10px', 
                                    color: validation.errors.hasUpperCase ? designSystem.colors.danger.split(' ')[0].split('(')[1] : designSystem.colors.success 
                                  }}>
                                    <i className={`fas ${validation.errors.hasUpperCase ? 'fa-times' : 'fa-check'} me-1`}></i>
                                    One uppercase letter
                                  </small>
                                  <small style={{ 
                                    fontSize: '10px', 
                                    color: validation.errors.hasLowerCase ? designSystem.colors.danger.split(' ')[0].split('(')[1] : designSystem.colors.success 
                                  }}>
                                    <i className={`fas ${validation.errors.hasLowerCase ? 'fa-times' : 'fa-check'} me-1`}></i>
                                    One lowercase letter
                                  </small>
                                  <small style={{ 
                                    fontSize: '10px', 
                                    color: validation.errors.hasNumbers ? designSystem.colors.danger.split(' ')[0].split('(')[1] : designSystem.colors.success 
                                  }}>
                                    <i className={`fas ${validation.errors.hasNumbers ? 'fa-times' : 'fa-check'} me-1`}></i>
                                    One number
                                  </small>
                                  <small style={{ 
                                    fontSize: '10px', 
                                    color: validation.errors.hasSpecialChar ? designSystem.colors.danger.split(' ')[0].split('(')[1] : designSystem.colors.success 
                                  }}>
                                    <i className={`fas ${validation.errors.hasSpecialChar ? 'fa-times' : 'fa-check'} me-1`}></i>
                                    One special character
                                  </small>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.lg, marginTop: designSystem.spacing.lg }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        User Role <span style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1] }}>*</span>
                      </label>
                      <select 
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        style={{
                          ...componentStyles.formInput,
                          borderColor: formErrors.role ? designSystem.colors.danger.split(' ')[0].split('(')[1] : componentStyles.formInput.borderColor
                        }}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="client">Client</option>
                        <option value="lead_manager">Lead Manager</option>
                        <option value="crm_manager">CRM Manager</option>
                      </select>
                      {formErrors.role && (
                        <small style={{ color: designSystem.colors.danger.split(' ')[0].split('(')[1], fontSize: designSystem.typography.fontSize.xs }}>
                          {formErrors.role}
                        </small>
                      )}
                      <div style={{ 
                        marginTop: designSystem.spacing.xs,
                        fontSize: designSystem.typography.fontSize.xs,
                        color: designSystem.colors.gray[500]
                      }}>
                        Choose the appropriate role for this user
                      </div>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        Phone Number
                      </label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        style={componentStyles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.lg, marginTop: designSystem.spacing.lg }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        Company
                      </label>
                      <input 
                        type="text" 
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Company"
                        style={componentStyles.formInput}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: designSystem.spacing.xs,
                        color: designSystem.colors.gray[600],
                        fontSize: designSystem.typography.fontSize.sm,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        Country
                      </label>
                      <input 
                        type="text" 
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        style={componentStyles.formInput}
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddUser}
                >
                  <i className="fas fa-save me-1"></i>
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Modal */}
      <UnifiedModal
        show={showModal}
        onHide={handleModalClose}
        type={modalType}
        data={modalData}
      />
    </div>
  );
};

export default UserManagement;