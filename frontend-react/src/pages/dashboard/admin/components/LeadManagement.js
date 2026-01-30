import { useState, useEffect } from 'react';
import { leadsAPI, usersAPI } from '../../../../services/api';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
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
      
      // Mock data for demonstration
      setLeads([
        {
          id: 1,
          name: 'Alice Johnson',
          email: 'alice.j@email.com',
          phone: '+1-555-0201',
          status: 'new',
          priority: 'high',
          assigned_to: null,
          source: 'Website',
          created_at: '2024-01-20T10:30:00Z'
        },
        {
          id: 2,
          name: 'Robert Chen',
          email: 'robert.chen@email.com',
          phone: '+1-555-0202',
          status: 'contacted',
          priority: 'medium',
          assigned_to: 'Lead Manager 1',
          source: 'Referral',
          created_at: '2024-01-19T14:20:00Z'
        },
        {
          id: 3,
          name: 'Maria Rodriguez',
          email: 'maria.r@email.com',
          phone: '+1-555-0203',
          status: 'qualified',
          priority: 'high',
          assigned_to: 'Lead Manager 2',
          source: 'LinkedIn',
          created_at: '2024-01-18T09:15:00Z'
        },
        {
          id: 4,
          name: 'David Kim',
          email: 'david.kim@email.com',
          phone: '+1-555-0204',
          status: 'negotiation',
          priority: 'medium',
          assigned_to: 'Lead Manager 1',
          source: 'Google Ads',
          created_at: '2024-01-17T16:45:00Z'
        },
        {
          id: 5,
          name: 'Emily Wilson',
          email: 'emily.w@email.com',
          phone: '+1-555-0205',
          status: 'converted',
          priority: 'low',
          assigned_to: 'Lead Manager 2',
          source: 'Website',
          created_at: '2024-01-16T11:30:00Z'
        }
      ]);

      setStats({
        totalLeads: 5,
        unassignedLeads: 1,
        qualifiedLeads: 1,
        conversionRate: 20
      });

    } catch (error) {
      console.error('Error loading leads data:', error);
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
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
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
          <i className="fas fa-user-plus me-2"></i>
          Lead Management
        </h5>
        <div className="btn-group" role="group">
          <button className="btn btn-outline-primary btn-sm" onClick={loadLeadsData}>
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
          <button className="btn btn-success btn-sm">
            <i className="fas fa-user-cog me-1"></i>Assign Leads
          </button>
        </div>
      </div>

      {/* Lead Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <i className="fas fa-users fa-2x text-info mb-2"></i>
              <h4 className="text-info">{stats.totalLeads}</h4>
              <small className="text-muted">Total Leads</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <i className="fas fa-user-clock fa-2x text-warning mb-2"></i>
              <h4 className="text-warning">{stats.unassignedLeads}</h4>
              <small className="text-muted">Unassigned</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <i className="fas fa-user-check fa-2x text-success mb-2"></i>
              <h4 className="text-success">{stats.qualifiedLeads}</h4>
              <small className="text-muted">Qualified</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-primary">
            <div className="card-body text-center">
              <i className="fas fa-percentage fa-2x text-primary mb-2"></i>
              <h4 className="text-primary">{stats.conversionRate}%</h4>
              <small className="text-muted">Conversion Rate</small>
            </div>
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

      {/* Leads Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Source</th>
              <th>Created</th>
              <th>Actions</th>
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
                <tr key={lead.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleLeadSelection(lead.id)}
                    />
                  </td>
                  <td><strong>{lead.name}</strong></td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
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
                    {lead.assigned_to ? (
                      <span className="badge bg-info">{lead.assigned_to}</span>
                    ) : (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-secondary">{lead.source}</span>
                  </td>
                  <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" title="View Details">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn btn-outline-success" title="Contact">
                        <i className="fas fa-phone"></i>
                      </button>
                      <button className="btn btn-outline-info" title="Email">
                        <i className="fas fa-envelope"></i>
                      </button>
                      <button className="btn btn-outline-warning" title="Assign">
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
    </div>
  );
};

export default LeadManagement;