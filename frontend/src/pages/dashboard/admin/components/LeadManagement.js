import { useState, useEffect } from 'react';
import { leadsAPI, usersAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [leadManagers, setLeadManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [formData, setFormData] = useState({
    managerId: '',
    notes: '',
    estimatedValue: 0
  });
  const [stats, setStats] = useState({
    totalLeads: 0,
    unassignedLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadLeadsData();
    loadLeadManagers();
  }, []);

  const loadLeadManagers = async () => {
    try {
      const response = await usersAPI.getAll({ role: 'lead_manager' });
      if (response.success) {
        setLeadManagers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading lead managers:', error);
      setLeadManagers([]);
    }
  };

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

  const getPriorityStyle = (priority) => {
    const priorityColors = {
      'low': designSystem.colors.success,
      'medium': designSystem.colors.warning,
      'high': designSystem.colors.danger
    };
    return { color: priorityColors[priority] || designSystem.colors.gray[500] };
  };

  const getSourceDisplayName = (source) => {
    const sourceMap = {
      'profile_assessment': 'Assessment',
      'contact_form': 'Contact Us',
      'appointment': 'Appointment',
      'website': 'Registration',
      'referral': 'Referral',
      'social_media': 'Social Media',
      'advertisement': 'Advertisement',
      'event': 'Event',
      'cold_call': 'Cold Call',
      'email_campaign': 'Email Campaign',
      'other': 'Other'
    };
    return sourceMap[source] || source;
  };

  const viewLeadDetails = (lead) => {
    setModalData(lead);
    setModalType('view');
    setShowModal(true);
  };

  const qualifyLead = async (lead) => {
    // Check if lead is already qualified
    if (lead.status === 'qualified') {
      alert('⚠️ This lead is already qualified.');
      return;
    }

    try {
      const response = await leadsAPI.patch(`${lead._id}/qualify`, {
        notes: `Lead qualified by admin on ${new Date().toLocaleDateString()}`
      });
      
      if (response.success) {
        alert('✅ Lead qualified successfully!');
        loadLeadsData(); // Refresh the leads list
      } else {
        throw new Error(response.error?.message || 'Failed to qualify lead');
      }
    } catch (error) {
      console.error('Error qualifying lead:', error);
      alert(`❌ Error qualifying lead: ${error.message}`);
    }
  };

  const assignLead = (lead) => {
    // Check if lead is qualified before allowing assignment
    if (lead.status !== 'qualified') {
      alert('⚠️ This lead must be qualified first before it can be assigned to a Lead Manager. Please qualify the lead and try again.');
      return;
    }
    
    // Set all modal state at once to prevent blinking
    setModalData(lead);
    setModalType('assign');
    setFormData({ managerId: '', notes: '', estimatedValue: 0 });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalData(null);
    setModalType('');
    setFormData({ managerId: '', notes: '', estimatedValue: 0 });
  };

  const handleAssignLead = async () => {
    if (!modalData?._id || !formData.managerId) {
      alert('Please select a lead and a lead manager.');
      return;
    }

    try {
      const response = await leadsAPI.patch(`${modalData._id}/assign`, {
        managerId: formData.managerId
      });
      
      if (response.success) {
        alert('✅ Lead assigned successfully!');
        handleModalClose();
        loadLeadsData();
      } else {
        throw new Error(response.error?.message || 'Failed to assign lead');
      }
    } catch (error) {
      console.error('Error assigning lead:', error);
      alert(`❌ Error assigning lead: ${error.message}`);
    }
  };

  const StatCard = ({ icon, number, label, borderColor, iconColor }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: 'pointer'
      }}
      {...hoverEffects.card}
    >
      <i className={`${icon} fa-2x mb-2`} style={{ color: iconColor }}></i>
      <h4 style={{ 
        color: iconColor,
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px'
      }}>
        {number}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  // Unified Modal Component - Simplified to prevent re-renders
  const UnifiedModal = ({ show, onHide, type, data }) => {
    if (!show) return null;

    const getModalConfig = () => {
      switch (type) {
        case 'view':
          return {
            title: 'Lead Details',
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
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.firstName} {data.lastName}</div>
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
                  }}>Status</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                    {(data.assignedTo && 
                      (typeof data.assignedTo === 'object' 
                        ? (data.assignedTo._id || data.assignedTo.id)
                        : data.assignedTo
                      )) 
                      ? 'ASSIGNED' 
                      : data.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Priority</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.priority.toUpperCase()}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Source</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{getSourceDisplayName(data.source)}</div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>University</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data.university || 'Not specified'}</div>
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
                  }}>Created</label>
                  <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{new Date(data.createdAt).toLocaleDateString()}</div>
                </div>
                {(data.assignedTo && 
                  (typeof data.assignedTo === 'object' 
                    ? (data.assignedTo._id || data.assignedTo.id)
                    : data.assignedTo
                  )) && (
                  <>
                    <div style={{ gridColumn: '1 / -1', marginTop: designSystem.spacing.md }}>
                      <h6 style={{ 
                        color: designSystem.colors.primary,
                        borderBottom: `1px solid ${designSystem.colors.gray[200]}`,
                        paddingBottom: designSystem.spacing.xs,
                        marginBottom: designSystem.spacing.md
                      }}>
                        <i className="fas fa-user-tie me-2"></i>Lead Manager Details
                      </h6>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block',
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginBottom: designSystem.spacing.xs
                      }}>Manager Name</label>
                      <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                        {(() => {
                          if (typeof data.assignedTo === 'object' && data.assignedTo) {
                            // Try different field combinations
                            if (data.assignedTo.first_name) {
                              return `${data.assignedTo.first_name} ${data.assignedTo.last_name || ''}`.trim();
                            } else if (data.assignedTo.firstName) {
                              return `${data.assignedTo.firstName} ${data.assignedTo.lastName || ''}`.trim();
                            } else if (data.assignedTo.name) {
                              return data.assignedTo.name;
                            }
                          }
                          return 'Manager details not available';
                        })()}
                      </div>
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block',
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginBottom: designSystem.spacing.xs
                      }}>Manager Email</label>
                      <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                        {typeof data.assignedTo === 'object' && data.assignedTo?.email
                          ? data.assignedTo.email
                          : 'Email not available'
                        }
                      </div>
                    </div>
                    {typeof data.assignedTo === 'object' && data.assignedTo.phone && (
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Manager Phone</label>
                        <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                          {data.assignedTo.phone}
                        </div>
                      </div>
                    )}
                    <div>
                      <label style={{ 
                        display: 'block',
                        fontSize: designSystem.typography.fontSize.sm,
                        color: designSystem.colors.gray[500],
                        marginBottom: designSystem.spacing.xs
                      }}>Assignment Status</label>
                      <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                        <span style={{
                          background: '#28a745',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          ASSIGNED
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: designSystem.typography.fontSize.sm,
                    color: designSystem.colors.gray[500],
                    marginBottom: designSystem.spacing.xs
                  }}>Notes</label>
                  <div style={{ 
                    fontWeight: designSystem.typography.fontWeight.semibold,
                    background: designSystem.colors.gray[50],
                    padding: designSystem.spacing.sm,
                    borderRadius: '4px',
                    minHeight: '60px'
                  }}>
                    {data.notes || 'No notes available'}
                  </div>
                </div>
              </div>
            )
          };
        case 'assign':
          return {
            title: 'Assign Lead to Manager',
            icon: 'fas fa-user-cog',
            color: designSystem.colors.warning,
            content: (
              <div>
                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <h6 className="text-muted">Assigning Qualified Lead</h6>
                  <p className="small text-muted">
                    Assign this qualified lead to a Lead Manager for follow-up and management.
                  </p>
                </div>

                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[600],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium
                  }}>Lead: <strong>{data.firstName} {data.lastName}</strong></label>
                  <p style={{ fontSize: designSystem.typography.fontSize.sm, color: designSystem.colors.gray[500] }}>
                    {data.email} • Priority: {data.priority.toUpperCase()} • Status: 
                    <span style={{ 
                      background: '#28a745', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '3px', 
                      marginLeft: '4px',
                      fontSize: '11px'
                    }}>
                      QUALIFIED
                    </span>
                  </p>
                </div>

                <div style={{ marginBottom: designSystem.spacing.md }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[600],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.medium
                  }}>Select Lead Manager <span className="text-danger">*</span></label>
                  <select 
                    value={formData.managerId}
                    onChange={(e) => {
                      const managerId = e.target.value;
                      setFormData(prev => ({ ...prev, managerId }));
                    }}
                    style={componentStyles.formInput}
                    required
                  >
                    <option value="">Choose a Lead Manager...</option>
                    {leadManagers.map(manager => (
                      <option key={manager._id} value={manager._id}>
                        {manager.first_name} {manager.last_name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="alert alert-success" style={{ marginBottom: designSystem.spacing.md }}>
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>Lead is Qualified:</strong> This lead has been qualified and is ready for assignment to a Lead Manager.
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>What happens next:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Lead will be assigned to the selected Lead Manager</li>
                    <li>Lead status will be updated to "assigned"</li>
                    <li>Lead Manager will be notified of the assignment</li>
                    <li>Lead Manager can then manage and convert the lead</li>
                  </ul>
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
              {type === 'assign' ? (
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
                    onClick={handleAssignLead}
                    disabled={!formData.managerId}
                  >
                    <i className="fas fa-user-cog me-1"></i>
                    Assign Lead
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

  return (
    <div style={componentStyles.managementCard}>
      {/* Unified Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-user-plus fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Lead Management</h4>
            <p style={componentStyles.headerSubtitle}>Manage and convert leads to clients</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadLeadsData}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Unified Statistics Cards */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-users"
          number={stats.totalLeads}
          label="Total Leads"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
        <StatCard
          icon="fas fa-user-clock"
          number={stats.unassignedLeads}
          label="Unassigned"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-user-check"
          number={stats.qualifiedLeads}
          label="Qualified"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-percentage"
          number={`${stats.conversionRate}%`}
          label="Conversion Rate"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
      </div>

      {/* Unified Table */}
      <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={componentStyles.tableHeader}>
            <tr>
              <th style={componentStyles.tableHeaderCell}>Name</th>
              <th style={componentStyles.tableHeaderCell}>Email</th>
              <th style={componentStyles.tableHeaderCell}>Status</th>
              <th style={componentStyles.tableHeaderCell}>Priority</th>
              <th style={componentStyles.tableHeaderCell}>Source</th>
              <th style={componentStyles.tableHeaderCell}>Created</th>
              <th style={componentStyles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ ...componentStyles.tableCell, textAlign: 'center', padding: designSystem.spacing.xl }}>
                  <div style={componentStyles.loading}>
                    <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary.split(' ')[0].split('(')[1] }}></i>
                    <p style={{ marginTop: designSystem.spacing.md }}>Loading leads...</p>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ ...componentStyles.tableCell, textAlign: 'center', padding: designSystem.spacing.xl }}>
                  <div style={componentStyles.emptyState}>
                    <i className="fas fa-user-plus fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>No leads found</p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map(lead => {
                const statusStyle = getStatusBadgeStyle(lead.status);
                const priorityStyle = getPriorityStyle(lead.priority);
                
                // Check if lead is assigned - handle both populated and non-populated cases
                const isAssigned = lead.assignedTo && 
                  (typeof lead.assignedTo === 'object' 
                    ? (lead.assignedTo._id || lead.assignedTo.id)
                    : lead.assignedTo
                  );
                
                return (
                  <tr 
                    key={lead._id}
                    style={componentStyles.tableRow}
                    {...hoverEffects.tableRow}
                  >
                    <td style={componentStyles.tableCell}>
                      <strong>{lead.firstName} {lead.lastName}</strong>
                    </td>
                    <td style={componentStyles.tableCell}>{lead.email}</td>
                    <td style={componentStyles.tableCell}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{
                          ...componentStyles.badge,
                          background: isAssigned ? '#28a745' : statusStyle.background,
                          color: isAssigned ? 'white' : statusStyle.color,
                          fontSize: '11px'
                        }}>
                          {isAssigned ? 'ASSIGNED' : lead.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {!isAssigned && lead.status !== 'qualified' && (
                          <span style={{
                            fontSize: '10px',
                            color: '#dc3545',
                            fontWeight: 'bold'
                          }}>
                            Needs Qualification
                          </span>
                        )}
                        {!isAssigned && lead.status === 'qualified' && (
                          <span style={{
                            fontSize: '10px',
                            color: '#28a745',
                            fontWeight: 'bold'
                          }}>
                            Ready for Assignment
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        ...priorityStyle,
                        fontWeight: designSystem.typography.fontWeight.bold
                      }}>
                        {lead.priority.toUpperCase()}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        ...componentStyles.badge,
                        background: designSystem.colors.gray[400],
                        color: 'white'
                      }}>
                        {getSourceDisplayName(lead.source)}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td style={componentStyles.tableCell}>
                      <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => viewLeadDetails(lead)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => qualifyLead(lead)}
                          title="Qualify Lead"
                          disabled={lead.status === 'qualified'}
                        >
                          <i className="fas fa-star"></i>
                        </button>
                        {!isAssigned && (
                          lead.status === 'qualified' ? (
                            <button 
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => assignLead(lead)}
                              title="Assign to Lead Manager"
                            >
                              <i className="fas fa-user-cog"></i>
                            </button>
                          ) : (
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              disabled
                              title="Lead must be qualified first before assignment"
                            >
                              <i className="fas fa-user-cog"></i>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

export default LeadManagement;