import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import {
  LeadStats,
  QuickActions,
  LeadFilters,
  LeadsTable,
  ProjectsManagement,
  ConvertToProjectModal,
  AssignProjectsToCrmModal,
  LeadDetailsModal
} from './components';

const LeadManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  
  // Modal states
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [leadDetailsModal, setLeadDetailsModal] = useState({ open: false, lead: null });
  const [preSelectedLeadId, setPreSelectedLeadId] = useState(null);

  // API configuration
  const API_BASE = 'https://backend.immigrationprofile.com/api';
  const authToken = localStorage.getItem('client_token') || localStorage.getItem('token') || localStorage.getItem('authToken');

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }, [API_BASE, authToken, navigate]);

  const loadStats = useCallback(async () => {
    try {
      const response = await apiCall('/leads/stats/summary');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Stats load error:', error);
    }
  }, [apiCall]);

  const loadLeads = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page,
        limit: 20,
        ...filters
      });
      
      const response = await apiCall(`/leads?${params}`);
      if (response.success) {
        setLeads(response.data);
        setCurrentPage(response.page);
        setPagination(response);
      }
    } catch (error) {
      console.error('Leads load error:', error);
      alert('Failed to load leads: ' + error.message);
    }
  }, [apiCall, filters]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadLeads()
      ]);
    } catch (error) {
      console.error('Dashboard load error:', error);
      alert('Failed to load dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [loadStats, loadLeads]);

  useEffect(() => {
    if (!authToken) {
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [authToken, navigate, loadDashboard]);

  const handleFilterByStatus = (status) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    loadLeads(1);
  };

  const handleApplyFilters = () => {
    loadLeads(1);
  };

  const handleViewLead = async (leadId) => {
    try {
      const response = await apiCall(`/leads/${leadId}`);
      if (response.success) {
        setLeadDetailsModal({ open: true, lead: response.data });
      }
    } catch (error) {
      alert('Failed to load lead details: ' + error.message);
    }
  };

  const handleContactLead = async (leadId) => {
    try {
      const response = await apiCall(`/leads/${leadId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'contacted',
          lastContact: new Date().toISOString(),
          notes: 'Lead contacted by phone/email'
        })
      });
      
      if (response.success) {
        alert('Lead marked as contacted successfully!');
        loadLeads(currentPage);
        loadStats();
      }
    } catch (error) {
      alert('Failed to update lead: ' + error.message);
    }
  };

  const handleQualifyLead = async (leadId) => {
    const lead = leads.find(l => l._id === leadId);
    const leadName = lead ? `${lead.firstName} ${lead.lastName}` : 'this lead';
    
    if (window.confirm(`Mark "${leadName}" as qualified?\n\nThis will make the lead available for CRM assignment.`)) {
      try {
        const response = await apiCall(`/leads/${leadId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'qualified',
            lastContact: new Date().toISOString(),
            notes: 'Lead qualified by Lead Manager'
          })
        });
        
        if (response.success) {
          alert(`✅ "${leadName}" has been marked as qualified successfully!\n\nYou can now assign this lead to a CRM Manager.`);
          loadLeads(currentPage);
          loadStats();
        }
      } catch (error) {
        alert('Failed to qualify lead: ' + error.message);
      }
    }
  };

  const handleConvertToProject = (leadId = null) => {
    setPreSelectedLeadId(leadId);
    setConvertModalOpen(true);
  };

  const handleAssignProjectsToCrm = () => {
    setAssignModalOpen(true);
  };

  const handleRefreshData = () => {
    loadDashboard();
  };

  const handleShowAnalytics = () => {
    // Create analytics modal
    const modalHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="analyticsModal">
        <div class="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-screen overflow-y-auto">
          <div class="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 class="text-lg font-semibold">
              <i class="fas fa-chart-line mr-2"></i>Lead Analytics Dashboard
            </h3>
            <button onclick="document.getElementById('analyticsModal').remove()" class="absolute top-4 right-4 text-white hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">${stats.total || 0}</div>
                <div class="text-sm text-gray-600">Total Leads</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">${stats.byStatus?.find(s => s._id === 'converted')?.count || 0}</div>
                <div class="text-sm text-gray-600">Converted</div>
              </div>
              <div class="text-center p-4 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">${stats.qualifiedCount || 0}</div>
                <div class="text-sm text-gray-600">Qualified</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">${stats.conversionRate || 0}%</div>
                <div class="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>
            <div class="text-center">
              <p class="text-gray-600">Detailed analytics coming soon...</p>
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-b-lg">
            <button onclick="document.getElementById('analyticsModal').remove()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      alert('No leads to export');
      return;
    }
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'University', 'Country', 'Status', 'Priority', 'Source', 'Estimated Value', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.firstName} ${lead.lastName}"`,
        `"${lead.email}"`,
        `"${lead.phone || ''}"`,
        `"${lead.university || ''}"`,
        `"${lead.country || ''}"`,
        `"${lead.status}"`,
        `"${lead.priority}"`,
        `"${lead.source}"`,
        `"${lead.estimatedValue || 0}"`,
        `"${new Date(lead.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Leads exported successfully!');
  };

  const handleViewProjectDetails = async (leadId) => {
    try {
      const response = await apiCall(`/leads/${leadId}`);
      if (response.success) {
        const lead = response.data;
        if (lead.convertedToProject) {
          const projectResponse = await apiCall(`/projects/${lead.convertedToProject._id}`);
          if (projectResponse.success) {
            // Show project details modal
            alert('Project details functionality will be implemented');
          }
        } else {
          alert('No project found for this lead');
        }
      }
    } catch (error) {
      alert('Failed to load project details: ' + error.message);
    }
  };

  const handleModalSuccess = () => {
    loadLeads(currentPage);
    loadStats();
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <LeadStats 
              stats={stats}
              onFilterByStatus={handleFilterByStatus}
            />
            <QuickActions 
              onConvertToProject={() => handleConvertToProject()}
              onAssignProjectsToCrm={handleAssignProjectsToCrm}
              onRefreshData={handleRefreshData}
              onShowAnalytics={handleShowAnalytics}
              onExportLeads={handleExportLeads}
            />
          </>
        );
      case 'leads':
        return (
          <>
            <LeadFilters 
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
            />
            <LeadsTable 
              leads={leads}
              loading={loading}
              onViewLead={handleViewLead}
              onContactLead={handleContactLead}
              onQualifyLead={handleQualifyLead}
              onConvertToProject={handleConvertToProject}
              onViewProjectDetails={handleViewProjectDetails}
            />
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * 20) + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total} leads
                </div>
                <div className="flex gap-2">
                  {pagination.page > 1 && (
                    <button 
                      onClick={() => loadLeads(pagination.page - 1)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <span className="px-3 py-1 bg-gray-200 rounded">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  {pagination.page < pagination.totalPages && (
                    <button 
                      onClick={() => loadLeads(pagination.page + 1)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        );
      case 'qualified':
        return (
          <LeadsTable 
            leads={leads.filter(lead => lead.status === 'qualified')}
            loading={loading}
            onViewLead={handleViewLead}
            onContactLead={handleContactLead}
            onQualifyLead={handleQualifyLead}
            onConvertToProject={handleConvertToProject}
            onViewProjectDetails={handleViewProjectDetails}
          />
        );
      case 'projects':
        return (
          <ProjectsManagement 
            projects={[]} 
            clients={[]} 
            apiCall={apiCall} 
            onRefresh={handleRefreshData}
          />
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              <i className="fas fa-chart-line mr-2"></i>Lead Analytics
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                <div className="text-sm text-gray-600">Total Leads</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.byStatus?.find(s => s._id === 'converted')?.count || 0}</div>
                <div className="text-sm text-gray-600">Converted</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.qualifiedCount || 0}</div>
                <div className="text-sm text-gray-600">Qualified</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.conversionRate || 0}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Detailed analytics coming soon...</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              <i className="fas fa-file-alt mr-2"></i>Reports & Export
            </h3>
            <div className="space-y-4">
              <button 
                onClick={handleExportLeads}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-download mr-2"></i>Export Leads to CSV
              </button>
              <p className="text-gray-600">More reporting features coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <LeadStats 
              stats={stats}
              onFilterByStatus={handleFilterByStatus}
            />
            <QuickActions 
              onConvertToProject={() => handleConvertToProject()}
              onAssignProjectsToCrm={handleAssignProjectsToCrm}
              onRefreshData={handleRefreshData}
              onShowAnalytics={handleShowAnalytics}
              onExportLeads={handleExportLeads}
            />
          </>
        );
    }
  };

  // Responsive styles
  const getMainContentStyle = () => {
    const baseStyle = {
      marginTop: '70px', 
      padding: '30px',
      minHeight: 'calc(100vh - 70px)',
      overflow: 'auto',
      transition: 'margin-left 0.3s ease'
    };

    // Desktop: sidebar always visible
    if (window.innerWidth >= 768) {
      return {
        ...baseStyle,
        marginLeft: '250px',
        width: 'calc(100% - 250px)'
      };
    }

    // Mobile: sidebar toggleable
    return {
      ...baseStyle,
      marginLeft: sidebarOpen ? '250px' : '0',
      width: sidebarOpen ? 'calc(100% - 250px)' : '100%'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <TopNavbar user={user} logout={logout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        stats={stats}
      />
      
      <div style={getMainContentStyle()}>
        {renderActiveSection()}
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Modals */}
      <ConvertToProjectModal 
        isOpen={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setPreSelectedLeadId(null);
        }}
        apiCall={apiCall}
        onSuccess={handleModalSuccess}
        preSelectedLeadId={preSelectedLeadId}
      />
      
      <AssignProjectsToCrmModal 
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        apiCall={apiCall}
        onSuccess={handleModalSuccess}
      />
      
      <LeadDetailsModal 
        lead={leadDetailsModal.lead}
        isOpen={leadDetailsModal.open}
        onClose={() => setLeadDetailsModal({ open: false, lead: null })}
        onContactLead={handleContactLead}
        onQualifyLead={handleQualifyLead}
        onConvertToProject={handleConvertToProject}
      />
    </div>
  );
};

export default LeadManagerDashboard;