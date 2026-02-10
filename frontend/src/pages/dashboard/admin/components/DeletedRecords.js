import { useState, useEffect } from 'react';
import { 
  usersAPI, 
  servicesAPI
} from '../../../../services/api';
import { componentStyles } from '../../../../styles/designSystem';

const DeletedRecords = () => {
  const [deletedRecords, setDeletedRecords] = useState({
    users: [],
    services: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadDeletedRecords();
  }, []);

  const loadDeletedRecords = async () => {
    try {
      setLoading(true);
      console.log('Loading deleted records for Services and Users...');
      
      // Load deleted services (using status=deleted parameter)
      const loadDeletedServices = async () => {
        try {
          const result = await servicesAPI.getAll({ status: 'deleted' });
          if (result.success && result.data) {
            console.log(`Services: Found ${result.data.length} deleted records`);
            return result.data;
          }
        } catch (error) {
          console.error('Services: Error loading deleted records:', error);
        }
        return [];
      };

      // Load deleted users (filter by status=deleted)
      const loadDeletedUsers = async () => {
        try {
          console.log('🔍 Fetching deleted users with status=deleted parameter...');
          const result = await usersAPI.getAll({ status: 'deleted' });
          console.log('📦 API Response:', result);
          if (result.success && result.data) {
            console.log(`✅ Users: Found ${result.data.length} deleted records`);
            console.log('📋 Deleted users data:', result.data);
            return result.data;
          } else {
            console.log('⚠️ API returned success=false or no data:', result);
          }
        } catch (error) {
          console.error('❌ Users: Error loading deleted records:', error);
        }
        return [];
      };

      // Load deleted records for both entities
      const [services, users] = await Promise.all([
        loadDeletedServices(),
        loadDeletedUsers()
      ]);

      setDeletedRecords({
        services,
        users
      });

      const totalDeleted = services.length + users.length;
      console.log(`Total deleted records loaded: ${totalDeleted}`);
      console.log('Breakdown:', {
        services: services.length,
        users: users.length
      });
      
    } catch (error) {
      console.error('Error loading deleted records:', error);
      setDeletedRecords({
        services: [],
        users: []
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
        case 'users':
          response = await usersAPI.restore(recordId);
          break;
        case 'services':
          response = await servicesAPI.restore(recordId);
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
        case 'users':
          response = await usersAPI.permanentDelete(recordId);
          break;
        case 'services':
          response = await servicesAPI.permanentDelete(recordId);
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
              {type === 'users' && "No deleted users in the system. Deleted users will appear here for restoration."}
              {type === 'services' && "No deleted services in the system. Deleted services will appear here for restoration."}
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
                {type === 'users' && (
                  <>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.first_name} {record.last_name}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.email}</td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>
                      <span className="badge bg-info">{record.role}</span>
                    </td>
                    <td style={{ padding: '16px', borderBottom: 'none' }}>{record.deleted_at ? new Date(record.deleted_at).toLocaleDateString() : 'N/A'}</td>
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

      {/* Statistics Cards - Only Services and Users */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-success" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-cogs fa-2x text-success mb-2"></i>
              <h4 className="text-success">{getRecordCount('services')}</h4>
              <small className="text-muted">Deleted Services</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-secondary" style={componentStyles.contactsStatCard}>
            <div className="card-body text-center">
              <i className="fas fa-user-cog fa-2x text-secondary mb-2"></i>
              <h4 className="text-secondary">{getRecordCount('users')}</h4>
              <small className="text-muted">Deleted Users</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', border: 'none' }}>
          <ul className="nav nav-tabs card-header-tabs" style={{ border: 'none' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
                style={{
                  border: 'none',
                  color: activeTab === 'services' ? '#1e3a8a' : 'rgba(255,255,255,0.8)',
                  backgroundColor: activeTab === 'services' ? 'white' : 'transparent',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: '500'
                }}
              >
                Services 
                <span className="badge bg-danger ms-2">{getRecordCount('services')}</span>
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
                style={{
                  border: 'none',
                  color: activeTab === 'users' ? '#1e3a8a' : 'rgba(255,255,255,0.8)',
                  backgroundColor: activeTab === 'users' ? 'white' : 'transparent',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: '500'
                }}
              >
                Users 
                <span className="badge bg-danger ms-2">{getRecordCount('users')}</span>
              </button>
            </li>
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
                    {selectedRecord.type === 'users' && (
                      <>
                        <p><strong>Name:</strong> {selectedRecord.first_name} {selectedRecord.last_name}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                        <p><strong>Role:</strong> {selectedRecord.role}</p>
                      </>
                    )}
                    {selectedRecord.type === 'services' && (
                      <>
                        <p><strong>Service:</strong> {selectedRecord.name}</p>
                        <p><strong>Category:</strong> {selectedRecord.category}</p>
                        <p><strong>Price:</strong> ${selectedRecord.price}</p>
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