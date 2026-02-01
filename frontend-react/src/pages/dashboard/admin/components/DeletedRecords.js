import { useState, useEffect } from 'react';
import { 
  clientsAPI, 
  leadsAPI, 
  projectsAPI, 
  usersAPI, 
  servicesAPI,
  paymentsAPI,
  queriesAPI 
} from '../../../../services/api';
import { componentStyles } from '../../../../styles/designSystem';

const DeletedRecords = () => {
  const [deletedRecords, setDeletedRecords] = useState({
    clients: [],
    leads: [],
    projects: [],
    users: [],
    services: [],
    payments: [],
    queries: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadDeletedRecords();
    
    // Debug: Log to console to help identify if soft deletes are working
    console.log('DeletedRecords component loaded - checking for soft delete support');
  }, []);

  const loadDeletedRecords = async () => {
    try {
      setLoading(true);
      console.log('Loading deleted records...');
      
      // Load deleted records using the correct filtering logic for each entity type
      const loadDeletedForEntity = async (apiService, entityName) => {
        try {
          let result;
          
          // Different entities use different deletion patterns based on backend implementation
          switch (entityName) {
            case 'Services':
              // Services use status=deleted parameter in backend
              result = await apiService.getAll({ status: 'deleted' });
              break;
              
            case 'Users':
              // Users use status=deleted in enum
              result = await apiService.getAll();
              if (result.success && result.data) {
                const deletedRecords = result.data.filter(record => record.status === 'deleted');
                console.log(`${entityName}: Found ${deletedRecords.length} deleted records (status=deleted)`);
                return deletedRecords;
              }
              break;
              
            case 'Leads':
              // Leads use status=deleted in enum
              result = await apiService.getAll();
              if (result.success && result.data) {
                const deletedRecords = result.data.filter(record => record.status === 'deleted');
                console.log(`${entityName}: Found ${deletedRecords.length} deleted records (status=deleted)`);
                return deletedRecords;
              }
              break;
              
            case 'Clients':
              // Clients use status=deleted (soft delete via status change)
              result = await apiService.getAll();
              if (result.success && result.data) {
                const deletedRecords = result.data.filter(record => 
                  record.status === 'deleted' || 
                  (record.deleted_at !== null && record.deleted_at !== undefined)
                );
                console.log(`${entityName}: Found ${deletedRecords.length} deleted records (status=deleted or deleted_at)`);
                return deletedRecords;
              }
              break;
              
            default:
              // For other entities (Projects, Payments, Queries), try common patterns
              result = await apiService.getAll();
              if (result.success && result.data) {
                const deletedRecords = result.data.filter(record => 
                  record.status === 'deleted' ||
                  record.isDeleted === true ||
                  (record.deletedAt !== null && record.deletedAt !== undefined) ||
                  (record.deleted_at !== null && record.deleted_at !== undefined)
                );
                console.log(`${entityName}: Found ${deletedRecords.length} deleted records (multiple patterns)`);
                return deletedRecords;
              }
              break;
          }
          
          // Handle Services response (which uses backend filtering)
          if (result && result.success && result.data) {
            console.log(`${entityName}: Found ${result.data.length} deleted records via backend filtering`);
            return result.data;
          }
          
        } catch (error) {
          console.error(`${entityName}: Error loading deleted records:`, error);
        }
        
        return [];
      };

      // Load deleted records for each entity
      const [clients, leads, projects, users, services, payments, queries] = await Promise.all([
        loadDeletedForEntity(clientsAPI, 'Clients'),
        loadDeletedForEntity(leadsAPI, 'Leads'),
        loadDeletedForEntity(projectsAPI, 'Projects'),
        loadDeletedForEntity(usersAPI, 'Users'),
        loadDeletedForEntity(servicesAPI, 'Services'),
        loadDeletedForEntity(paymentsAPI, 'Payments'),
        loadDeletedForEntity(queriesAPI, 'Queries')
      ]);

      setDeletedRecords({
        clients,
        leads,
        projects,
        users,
        services,
        payments,
        queries
      });

      const totalDeleted = clients.length + leads.length + projects.length + 
                          users.length + services.length + payments.length + queries.length;

      console.log(`Total deleted records loaded: ${totalDeleted}`);
      console.log('Breakdown:', {
        clients: clients.length,
        leads: leads.length,
        projects: projects.length,
        users: users.length,
        services: services.length,
        payments: payments.length,
        queries: queries.length
      });
      
    } catch (error) {
      console.error('Error loading deleted records:', error);
      // Set empty arrays as fallback
      setDeletedRecords({
        clients: [],
        leads: [],
        projects: [],
        users: [],
        services: [],
        payments: [],
        queries: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (recordType, recordId) => {
    try {
      setLoading(true);
      
      let response;
      switch (recordType) {
        case 'clients':
          response = await clientsAPI.restore(recordId);
          break;
        case 'leads':
          response = await leadsAPI.restore(recordId);
          break;
        case 'projects':
          response = await projectsAPI.restore(recordId);
          break;
        case 'users':
          response = await usersAPI.restore(recordId);
          break;
        case 'services':
          response = await servicesAPI.restore(recordId);
          break;
        case 'payments':
          response = await paymentsAPI.restore(recordId);
          break;
        case 'queries':
          response = await queriesAPI.restore(recordId);
          break;
        default:
          throw new Error('Invalid record type');
      }

      if (response.success) {
        await loadDeletedRecords();
        setShowRestoreModal(false);
        setSelectedRecord(null);
        alert('✅ Record restored successfully!');
      } else {
        throw new Error(response.error?.message || 'Failed to restore record');
      }
    } catch (error) {
      console.error('Error restoring record:', error);
      alert(`❌ Failed to restore record: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async (recordType, recordId) => {
    if (!window.confirm('⚠️ Are you sure you want to permanently delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      let response;
      switch (recordType) {
        case 'clients':
          response = await clientsAPI.permanentDelete(recordId);
          break;
        case 'leads':
          response = await leadsAPI.permanentDelete(recordId);
          break;
        case 'projects':
          response = await projectsAPI.permanentDelete(recordId);
          break;
        case 'users':
          response = await usersAPI.permanentDelete(recordId);
          break;
        case 'services':
          response = await servicesAPI.permanentDelete(recordId);
          break;
        case 'payments':
          response = await paymentsAPI.permanentDelete(recordId);
          break;
        case 'queries':
          response = await queriesAPI.permanentDelete(recordId);
          break;
        default:
          throw new Error('Invalid record type');
      }

      if (response.success) {
        await loadDeletedRecords();
        alert('✅ Record permanently deleted successfully!');
      } else {
        throw new Error(response.error?.message || 'Failed to permanently delete record');
      }
    } catch (error) {
      console.error('Error permanently deleting record:', error);
      alert(`❌ Failed to permanently delete record: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRecordCount = (type) => {
    return deletedRecords[type]?.length || 0;
  };

  const renderRecordsTable = (records, type) => {
    if (!records || records.length === 0) {
      return (
        <div className="text-center py-5">
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '20px',
            padding: '40px',
            border: '2px dashed #cbd5e1'
          }}>
            <i className="fas fa-trash-alt fa-4x text-muted mb-3" style={{ color: '#94a3b8' }}></i>
            <h5 style={{ color: '#64748b', marginBottom: '12px' }}>No Deleted {type.charAt(0).toUpperCase() + type.slice(1)} Found</h5>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              {type === 'clients' && "No deleted clients in the system. Deleted clients will appear here for restoration."}
              {type === 'leads' && "No deleted leads in the system. Deleted leads will appear here for restoration."}
              {type === 'projects' && "No deleted projects in the system. Deleted projects will appear here for restoration."}
              {type === 'users' && "No deleted users in the system. Deleted users will appear here for restoration."}
              {type === 'services' && "No deleted services in the system. Deleted services will appear here for restoration."}
              {type === 'payments' && "No deleted payments in the system. Deleted payments will appear here for restoration."}
              {type === 'queries' && "No deleted queries in the system. Deleted queries will appear here for restoration."}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <table className="table table-hover mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
            color: 'white'
          }}>
            <tr>
              {type === 'clients' && (
                <>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Name</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Email</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>University</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Deleted Date</th>
                </>
              )}
              {type === 'leads' && (
                <>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Name</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Email</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Deleted Date</th>
                </>
              )}
              {type === 'projects' && (
                <>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Service Name</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Client</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Deleted Date</th>
                </>
              )}
              {type === 'users' && (
                <>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Name</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Email</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Role</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Deleted Date</th>
                </>
              )}
              {type === 'services' && (
                <>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Service Name</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Category</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Price</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Deleted Date</th>
                </>
              )}
              {type === 'payments' && (
                <>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Client</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Amount</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Deleted Date</th>
                </>
              )}
              {type === 'queries' && (
                <>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Subject</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Client</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Deleted Date</th>
                </>
              )}
              <th style={{ padding: '16px', fontWeight: '600', fontSize: '0.9rem', borderBottom: 'none' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ background: 'white' }}>
            {records.map((record, index) => (
              <tr 
                key={record._id}
                style={{
                  borderBottom: index === records.length - 1 ? 'none' : '1px solid #f1f5f9',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {type === 'clients' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.email}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.university}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'leads' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.email}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'projects' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.service_name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.client?.name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'users' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.first_name} {record.last_name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.email}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>
                      <span className="badge bg-info">{record.role}</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'services' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.category}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>${record.price}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'payments' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.client?.name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>${record.amount}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                {type === 'queries' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.subject}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.client?.name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>
                      <span className="badge bg-secondary">{record.status}</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deletedAt ? new Date(record.deletedAt).toLocaleDateString() : 'N/A'}</td>
                  </>
                )}
                <td style={{ padding: '16px', borderBottom: 'none' }}>
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      className="btn btn-outline-success"
                      onClick={() => {
                        setSelectedRecord({ ...record, type });
                        setShowRestoreModal(true);
                      }}
                      title="Restore Record"
                      disabled={loading}
                      style={{
                        borderRadius: '8px 0 0 8px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="fas fa-undo me-1"></i>
                      Restore
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handlePermanentDelete(type, record._id)}
                      title="Permanently Delete"
                      disabled={loading}
                      style={{
                        borderRadius: '0 8px 8px 0',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="management-card" style={componentStyles.managementCard}>
      {/* Enhanced Header */}
      <div style={componentStyles.header}>
        <div className="d-flex align-items-center">
          <div 
            className="icon-wrapper me-3"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white'
            }}
          >
            <i className="fas fa-trash-alt fa-lg"></i>
          </div>
          <div>
            <h4 className="mb-1" style={{ color: '#1e293b', fontWeight: '600' }}>
              Deleted Records
            </h4>
            <p className="text-muted mb-0">Manage and restore deleted records</p>
          </div>
        </div>
        <button 
          className="btn btn-lg px-4 py-2"
          onClick={loadDeletedRecords}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '500',
            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <i className="fas fa-sync me-2"></i>
          Refresh
        </button>
      </div>

      {/* Statistics Cards - ContactsManagement Style */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-danger" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-users fa-2x text-danger mb-2"></i>
              <h4 className="text-danger">{getRecordCount('clients')}</h4>
              <small className="text-muted">Deleted Clients</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-user-tie fa-2x text-warning mb-2"></i>
              <h4 className="text-warning">{getRecordCount('leads')}</h4>
              <small className="text-muted">Deleted Leads</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-primary" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-project-diagram fa-2x text-primary mb-2"></i>
              <h4 className="text-primary">{getRecordCount('projects')}</h4>
              <small className="text-muted">Deleted Projects</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-secondary" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-user-cog fa-2x text-secondary mb-2"></i>
              <h4 className="text-secondary">{getRecordCount('users')}</h4>
              <small className="text-muted">Deleted Users</small>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-success" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-cogs fa-2x text-success mb-2"></i>
              <h4 className="text-success">{getRecordCount('services')}</h4>
              <small className="text-muted">Deleted Services</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-info" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-credit-card fa-2x text-info mb-2"></i>
              <h4 className="text-info">{getRecordCount('payments')}</h4>
              <small className="text-muted">Deleted Payments</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-dark" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-question-circle fa-2x text-dark mb-2"></i>
              <h4 className="text-dark">{getRecordCount('queries')}</h4>
              <small className="text-muted">Deleted Queries</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', border: 'none' }}>
          <ul className="nav nav-tabs card-header-tabs" style={{ border: 'none' }}>
            {Object.keys(deletedRecords).map((type) => (
              <li className="nav-item" key={type}>
                <button
                  className={`nav-link ${activeTab === type ? 'active' : ''}`}
                  onClick={() => setActiveTab(type)}
                  style={{
                    border: 'none',
                    color: activeTab === type ? '#1e3a8a' : 'rgba(255,255,255,0.8)',
                    backgroundColor: activeTab === type ? 'white' : 'transparent',
                    borderRadius: '8px 8px 0 0',
                    fontWeight: '500'
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} 
                  <span className="badge bg-danger ms-2">{getRecordCount(type)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body" style={{ padding: '32px' }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            renderRecordsTable(deletedRecords[activeTab], activeTab)
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedRecord && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ border: 'none', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white', border: 'none', padding: '24px 32px 16px' }}>
                <h5 className="modal-title">
                  <i className="fas fa-undo me-2"></i>Restore Record
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedRecord(null);
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '32px' }}>
                <p>Are you sure you want to restore this {selectedRecord.type.slice(0, -1)} record?</p>
                <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <div className="card-body">
                    {selectedRecord.type === 'clients' && (
                      <>
                        <p><strong>Name:</strong> {selectedRecord.name}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                      </>
                    )}
                    {selectedRecord.type === 'leads' && (
                      <>
                        <p><strong>Name:</strong> {selectedRecord.name}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                      </>
                    )}
                    {selectedRecord.type === 'projects' && (
                      <>
                        <p><strong>Service:</strong> {selectedRecord.service_name}</p>
                        <p><strong>Client:</strong> {selectedRecord.client?.name}</p>
                      </>
                    )}
                    {selectedRecord.type === 'users' && (
                      <>
                        <p><strong>Name:</strong> {selectedRecord.first_name} {selectedRecord.last_name}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                      </>
                    )}
                    {selectedRecord.type === 'services' && (
                      <>
                        <p><strong>Service:</strong> {selectedRecord.name}</p>
                        <p><strong>Category:</strong> {selectedRecord.category}</p>
                      </>
                    )}
                    {selectedRecord.type === 'payments' && (
                      <>
                        <p><strong>Client:</strong> {selectedRecord.client?.name}</p>
                        <p><strong>Amount:</strong> ${selectedRecord.amount}</p>
                      </>
                    )}
                    {selectedRecord.type === 'queries' && (
                      <>
                        <p><strong>Subject:</strong> {selectedRecord.subject}</p>
                        <p><strong>Client:</strong> {selectedRecord.client?.name}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '16px 32px 32px', background: '#f8fafc', border: 'none' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedRecord(null);
                  }}
                  style={{ borderRadius: '12px', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleRestore(selectedRecord.type, selectedRecord._id)}
                  disabled={loading}
                  style={{ 
                    borderRadius: '12px', 
                    fontWeight: '500',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {loading ? 'Restoring...' : 'Restore Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedRecords;