import { useState, useEffect } from 'react';
import { leadsAPI } from '../../../../services/api';

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

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    unassignedLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadLeadsData();
  }, []);

  const loadLeadsData = async () => {
    try {
      setLoading(true);
      
      // Load leads
      const leadsResponse = await leadsAPI.getAll();
      if (leadsResponse.success) {
        setLeads(leadsResponse.data || []);
      }

      // Load lead statistics
      const statsResponse = await leadsAPI.getStats();
      if (statsResponse.success) {
        setStats({
          totalLeads: statsResponse.data.total || 0,
          unassignedLeads: statsResponse.data.byStatus?.find(s => s._id === 'new')?.count || 0,
          qualifiedLeads: statsResponse.data.qualifiedCount || 0,
          conversionRate: statsResponse.data.conversionRate || 0
        });
      }

    } catch (error) {
      console.error('Error loading leads data:', error);
      // Set empty state on error
      setLeads([]);
      setStats({ totalLeads: 0, unassignedLeads: 0, qualifiedLeads: 0, conversionRate: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'new': 'bg-primary',
      'contacted': 'bg-info',
      'qualified': 'bg-success',
      'negotiation': 'bg-warning',
      'converted': 'bg-success',
      'lost': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getPriorityClass = (priority) => {
    const priorityClasses = {
      'low': 'text-success',
      'medium': 'text-warning',
      'high': 'text-danger'
    };
    return priorityClasses[priority] || 'text-secondary';
  };

  const handleLeadSelection = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(lead => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const viewLeadDetails = (lead) => {
    setModalData(lead);
    setModalType('view');
    setShowModal(true);
  };

  const contactLead = (lead) => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self');
    } else {
      setModalData({ message: 'No phone number available for this lead.' });
      setModalType('error');
      setShowModal(true);
    }
  };

  const emailLead = (lead) => {
    const subject = encodeURIComponent('Follow-up on your immigration inquiry');
    const body = encodeURIComponent(`Dear ${lead.firstName},\n\nThank you for your interest in our immigration services. I wanted to follow up on your inquiry.\n\nBest regards,\nImmigration Team`);
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_self');
  };

  const assignLead = (lead) => {
    setModalData(lead);
    setModalType('assign');
    setShowModal(true);
  };

  const handleAssignLead = async (leadId, managerId) => {
    try {
      const response = await leadsAPI.update(leadId, { 
        assignedTo: managerId,
        status: 'assigned'
      });
      
      if (response.success) {
        setModalData({ message: 'Lead assigned successfully!', type: 'success' });
        setModalType('success');
        setShowModal(true);
        loadLeadsData();
      } else {
        throw new Error(response.error?.message || 'Failed to assign lead');
      }
    } catch (error) {
      console.error('Error assigning lead:', error);
      setModalData({ message: `Error assigning lead: ${error.message}`, type: 'error' });
      setModalType('error');
      setShowModal(true);
    }
  };

  const managementCardStyle = {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: designSystem.borderRadius.card,
    padding: '32px',
    boxShadow: designSystem.shadows.card,
    border: '1px solid rgba(226, 232, 240, 0.8)',
    marginBottom: '24px'
  };

  // Unified Modal Component
  const UnifiedModal = ({ show, onHide, type, data, onConfirm }) => {
    if (!show) return null;

    const getModalConfig = () => {
      switch (type) {
        case 'view':
          return {
            title: 'Lead Details',
            icon: 'fas fa-eye',
            color: designSystem.colors.primary,
            content: (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Name</label>
                  <div className="fw-semibold">{data.firstName} {data.lastName}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Email</label>
                  <div className="fw-semibold">{data.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Phone</label>
                  <div className="fw-semibold">{data.phone || 'Not provided'}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Status</label>
                  <div className="fw-semibold">{data.status.replace('_', ' ').toUpperCase()}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Priority</label>
                  <div className="fw-semibold">{data.priority.toUpperCase()}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Source</label>
                  <div className="fw-semibold">{data.source}</div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Assigned To</label>
                  <div className="fw-semibold">
                    {data.assignedTo ? `${data.assignedTo.first_name} ${data.assignedTo.last_name}` : 'Unassigned'}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Created</label>
                  <div className="fw-semibold">{new Date(data.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            )
          };
        case 'assign':
          return {
            title: 'Assign Lead',
            icon: 'fas fa-user-cog',
            color: designSystem.colors.warning,
            content: (
              <div>
                <div className="mb-3">
                  <label className="form-label">Lead: <strong>{data.firstName} {data.lastName}</strong></label>
                </div>
                <div className="form-floating">
                  <input 
                    type="email" 
                    className="form-control" 
                    id="managerEmail"
                    placeholder="Manager Email"
                    style={{
                      borderRadius: designSystem.borderRadius.input,
                      border: '2px solid #e2e8f0'
                    }}
                  />
                  <label htmlFor="managerEmail">Manager Email</label>
                </div>
              </div>
            )
          };
        case 'success':
          return {
            title: 'Success',
            icon: 'fas fa-check-circle',
            color: designSystem.colors.success,
            content: <div className="text-center py-3">{data.message}</div>
          };
        case 'error':
          return {
            title: 'Error',
            icon: 'fas fa-exclamation-triangle',
            color: designSystem.colors.danger,
            content: <div className="text-center py-3">{data.message}</div>
          };
        default:
          return { title: '', icon: '', color: '', content: null };
      }
    };

    const config = getModalConfig();

    return (
      <div className="modal fade show" style={{ 
        display: 'block', 
        backgroundColor: 'rgba(15, 23, 42, 0.7)', 
        backdropFilter: 'blur(8px)' 
      }}>
        <div className="modal-dialog modal-dialog-centered">
          <div 
            className="modal-content"
            style={{
              border: 'none',
              borderRadius: designSystem.borderRadius.modal,
              boxShadow: designSystem.shadows.modal,
              overflow: 'hidden'
            }}
          >
            <div 
              className="modal-header border-0"
              style={{ 
                background: config.color,
                color: 'white',
                padding: '24px 32px 20px'
              }}
            >
              <h5 className="modal-title mb-0" style={{ fontWeight: '600' }}>
                <i className={`${config.icon} me-3`}></i>{config.title}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: '32px' }}>
              {config.content}
            </div>
            <div 
              className="modal-footer border-0"
              style={{ 
                padding: '20px 32px 32px',
                background: designSystem.colors.light
              }}
            >
              {type === 'assign' ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-lg px-4 me-3"
                    onClick={onHide}
                    style={{
                      background: '#e2e8f0',
                      border: 'none',
                      borderRadius: designSystem.borderRadius.button,
                      color: '#64748b',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-lg px-4"
                    onClick={() => {
                      const email = document.getElementById('managerEmail').value;
                      if (email) {
                        onConfirm(data._id, email);
                        onHide();
                      }
                    }}
                    style={{
                      background: config.color,
                      border: 'none',
                      borderRadius: designSystem.borderRadius.button,
                      color: 'white',
                      fontWeight: '500',
                      boxShadow: designSystem.shadows.button
                    }}
                  >
                    <i className="fas fa-save me-2"></i>Assign Lead
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-lg px-4"
                  onClick={onHide}
                  style={{
                    background: config.color,
                    border: 'none',
                    borderRadius: designSystem.borderRadius.button,
                    color: 'white',
                    fontWeight: '500',
                    boxShadow: designSystem.shadows.button
                  }}
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

  return (
    <div className="management-card" style={managementCardStyle}>
      {/* Unified Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <div 
            className="icon-wrapper me-3"
            style={{
              background: designSystem.colors.primary,
              borderRadius: designSystem.borderRadius.button,
              padding: '12px',
              color: 'white'
            }}
          >
            <i className="fas fa-user-plus fa-lg"></i>
          </div>
          <div>
            <h4 className="mb-1" style={{ color: designSystem.colors.dark, fontWeight: '600' }}>
              Lead Management
            </h4>
            <p className="text-muted mb-0">Manage and convert leads to clients</p>
          </div>
        </div>
        <div className="btn-group" role="group">
          <button 
            className="btn btn-lg px-4 py-2 me-2"
            onClick={loadLeadsData}
            style={{
              background: designSystem.colors.success,
              border: 'none',
              borderRadius: designSystem.borderRadius.button,
              color: 'white',
              fontWeight: '500',
              boxShadow: designSystem.shadows.button
            }}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
          <button 
            className="btn btn-lg px-4 py-2"
            style={{
              background: designSystem.colors.primary,
              border: 'none',
              borderRadius: designSystem.borderRadius.button,
              color: 'white',
              fontWeight: '500',
              boxShadow: designSystem.shadows.button
            }}
          >
            <i className="fas fa-user-cog me-2"></i>Assign Leads
          </button>
        </div>
      </div>

      {/* Unified Statistics Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div 
            className="stat-card text-center py-3"
            style={{
              background: designSystem.colors.primary,
              borderRadius: designSystem.borderRadius.button,
              color: 'white',
              boxShadow: designSystem.shadows.button
            }}
          >
            <i className="fas fa-users fa-2x mb-2 opacity-90"></i>
            <h4 className="fw-bold">{stats.totalLeads}</h4>
            <small className="opacity-90">Total Leads</small>
          </div>
        </div>
        <div className="col-md-3">
          <div 
            className="stat-card text-center py-3"
            style={{
              background: designSystem.colors.warning,
              borderRadius: designSystem.borderRadius.button,
              color: 'white',
              boxShadow: designSystem.shadows.button
            }}
          >
            <i className="fas fa-user-clock fa-2x mb-2 opacity-90"></i>
            <h4 className="fw-bold">{stats.unassignedLeads}</h4>
            <small className="opacity-90">Unassigned</small>
          </div>
        </div>
        <div className="col-md-3">
          <div 
            className="stat-card text-center py-3"
            style={{
              background: designSystem.colors.success,
              borderRadius: designSystem.borderRadius.button,
              color: 'white',
              boxShadow: designSystem.shadows.button
            }}
          >
            <i className="fas fa-user-check fa-2x mb-2 opacity-90"></i>
            <h4 className="fw-bold">{stats.qualifiedLeads}</h4>
            <small className="opacity-90">Qualified</small>
          </div>
        </div>
        <div className="col-md-3">
          <div 
            className="stat-card text-center py-3"
            style={{
              background: designSystem.colors.info,
              borderRadius: designSystem.borderRadius.button,
              color: 'white',
              boxShadow: designSystem.shadows.button
            }}
          >
            <i className="fas fa-percentage fa-2x mb-2 opacity-90"></i>
            <h4 className="fw-bold">{stats.conversionRate}%</h4>
            <small className="opacity-90">Conversion Rate</small>
          </div>
        </div>
      </div>

      {/* Lead Filters and Actions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="negotiation">Negotiation</option>
            <option value="converted">Converted</option>
          </select>
          <select className="form-select form-select-sm">
            <option value="">All Managers</option>
            <option value="unassigned">Unassigned</option>
            <option value="lead_manager_1">Lead Manager 1</option>
            <option value="lead_manager_2">Lead Manager 2</option>
          </select>
          <select className="form-select form-select-sm">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="btn-group" role="group">
          {selectedLeads.length > 0 && (
            <button className="btn btn-warning btn-sm">
              <i className="fas fa-user-cog me-1"></i>
              Assign Selected ({selectedLeads.length})
            </button>
          )}
        </div>
      </div>

      {/* Unified Table */}
      <div className="table-responsive">
        <table className="table table-hover" style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden' }}>
          <thead 
            style={{ 
              background: designSystem.colors.primary,
              color: 'white'
            }}
          >
            <tr>
              <th style={{ border: 'none', padding: '16px' }}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                />
              </th>
              <th style={{ border: 'none', padding: '16px' }}>Name</th>
              <th style={{ border: 'none', padding: '16px' }}>Email</th>
              <th style={{ border: 'none', padding: '16px' }}>Phone</th>
              <th style={{ border: 'none', padding: '16px' }}>Status</th>
              <th style={{ border: 'none', padding: '16px' }}>Priority</th>
              <th style={{ border: 'none', padding: '16px' }}>Assigned To</th>
              <th style={{ border: 'none', padding: '16px' }}>Source</th>
              <th style={{ border: 'none', padding: '16px' }}>Created</th>
              <th style={{ border: 'none', padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center">
                  <div className="spinner-border spinner-border-sm me-2"></div>
                  Loading leads...
                </td>
              </tr>
            ) : (
              leads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.includes(lead._id)}
                      onChange={() => handleLeadSelection(lead._id)}
                    />
                  </td>
                  <td><strong>{lead.firstName} {lead.lastName}</strong></td>
                  <td>{lead.email}</td>
                  <td>{lead.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={getPriorityClass(lead.priority)}>
                      <strong>{lead.priority.toUpperCase()}</strong>
                    </span>
                  </td>
                  <td>
                    {lead.assignedTo ? (
                      <span className="badge bg-info">{lead.assignedTo.first_name} {lead.assignedTo.last_name}</span>
                    ) : (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-secondary">{lead.source}</span>
                  </td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={() => viewLeadDetails(lead)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-success" 
                        onClick={() => contactLead(lead)}
                        title="Contact"
                      >
                        <i className="fas fa-phone"></i>
                      </button>
                      <button 
                        className="btn btn-outline-info" 
                        onClick={() => emailLead(lead)}
                        title="Email"
                      >
                        <i className="fas fa-envelope"></i>
                      </button>
                      <button 
                        className="btn btn-outline-warning" 
                        onClick={() => assignLead(lead)}
                        title="Assign"
                      >
                        <i className="fas fa-user-cog"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="mt-3 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <strong>{selectedLeads.length}</strong> lead(s) selected
            </span>
            <div className="btn-group" role="group">
              <button className="btn btn-primary btn-sm">
                <i className="fas fa-user-cog me-1"></i>
                Assign to Manager
              </button>
              <button className="btn btn-success btn-sm">
                <i className="fas fa-user-tie me-1"></i>
                Convert to CRM
              </button>
              <button className="btn btn-info btn-sm">
                <i className="fas fa-envelope me-1"></i>
                Send Email
              </button>
              <button className="btn btn-warning btn-sm">
                <i className="fas fa-edit me-1"></i>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Modal */}
      <UnifiedModal
        show={showModal}
        onHide={() => setShowModal(false)}
        type={modalType}
        data={modalData}
        onConfirm={handleAssignLead}
      />
    </div>
  );
};

export default LeadManagement;