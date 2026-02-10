import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { designSystem, componentStyles, hoverEffects } from '../../../styles/designSystem';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import LeadDetailsModal from './components/LeadDetailsModal';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import MeetingScheduleModal from './components/MeetingScheduleModal';
import AppointmentDetailsModal from './components/AppointmentDetailsModal';

// Import API services
import { leadsAPI, projectsAPI, usersAPI, clientsAPI, appointmentsAPI, servicesAPI } from '../../../services/api';

const LeadManagerDashboard = () => {
  // CACHE DETECTION - Force refresh if old code is detected
  const CURRENT_VERSION = '2024-01-31-FINAL-v4';
  
  useEffect(() => {
    console.log('=== LEAD MANAGER DASHBOARD VERSION:', CURRENT_VERSION, '===');
    console.log('🔍 User:', user);
    console.log('🔍 Loading all data...');
    
    // Check if we have the latest version by looking for specific elements
    const hasLatestFeatures = document.querySelector('[data-version]');
    if (!hasLatestFeatures) {
      console.log('Adding version marker to DOM');
      const versionMarker = document.createElement('div');
      versionMarker.setAttribute('data-version', CURRENT_VERSION);
      versionMarker.style.display = 'none';
      document.body.appendChild(versionMarker);
    }
    
    // Load all data when component mounts
    loadAllData();
  }, []);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('leads');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data states
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [crmManagers, setCrmManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMeetingLinkModal, setShowMeetingLinkModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalType, setModalType] = useState('');

  // Load data functions
  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll();
      
      if (response.success) {
        // Filter only leads assigned to current lead manager
        // Try different ID fields to ensure compatibility
        const userId = user._id || user.id || user.user_id;
        
        const assignedLeads = response.data.filter(lead => {
          return lead.assignedTo && (
            lead.assignedTo._id === userId || 
            lead.assignedTo === userId ||
            (typeof lead.assignedTo === 'object' && lead.assignedTo.toString() === userId)
          );
        });
        
        setLeads(assignedLeads);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      console.log('🔍 Starting to load projects...');
      console.log('🔍 Projects API URL:', `${process.env.REACT_APP_API_URL || 'https://backend.immigrationprofile.com/api'}/projects/my-created-projects`);
      
      const response = await projectsAPI.getMyCreatedProjects();
      console.log('🔍 Projects API response:', response);
      
      if (response && response.success) {
        console.log('🔍 Lead manager created projects loaded:', response.data?.length || 0);
        console.log('🔍 Sample project:', response.data?.[0]);
        console.log('🔍 All projects:', response.data);
        
        const projectsData = response.data || [];
        
        // Filter out any projects that might not have created_by set (fallback)
        const validProjects = projectsData.filter(project => {
          if (!project.created_by) {
            console.warn('⚠️ Found project without created_by field:', project._id);
            return false;
          }
          return true;
        });
        
        console.log('🔍 Setting valid projects for lead manager:', validProjects.length);
        setProjects(validProjects);
        
        if (validProjects.length !== projectsData.length) {
          console.warn(`⚠️ ${projectsData.length - validProjects.length} projects were filtered out due to missing created_by field`);
        }
      } else {
        console.error('🔍 Projects API failed or returned no success flag:', response);
        setProjects([]);
      }
    } catch (error) {
      console.error('🔍 Error loading projects:', error);
      console.error('🔍 Error details:', error.message, error.stack);
      setProjects([]);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      if (response.success) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    }
  };

  const loadCrmManagers = async () => {
    try {
      const response = await usersAPI.getAll({ role: 'crm_manager' });
      if (response.success) {
        setCrmManagers(response.data);
      }
    } catch (error) {
      console.error('Error loading CRM managers:', error);
      setCrmManagers([]);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Get appointments created by current lead manager using the specific endpoint
      const response = await appointmentsAPI.getMyCreatedAppointments();
      
      if (response.success) {
        const allAppointments = response.data || [];
        console.log('🔍 Lead manager created appointments loaded:', allAppointments.length);
        console.log('🔍 Sample appointment:', allAppointments[0]);
        
        // Filter out any appointments that might not have created_by set (fallback)
        const validAppointments = allAppointments.filter(appointment => {
          if (!appointment.created_by) {
            console.warn('⚠️ Found appointment without created_by field:', appointment._id);
            return false;
          }
          return true;
        });
        
        console.log('🔍 Setting valid appointments for lead manager:', validAppointments.length);
        setAppointments(validAppointments);
        
        if (validAppointments.length !== allAppointments.length) {
          console.warn(`⚠️ ${allAppointments.length - validAppointments.length} appointments were filtered out due to missing created_by field`);
        }
      } else {
        console.log('🔍 Failed to load appointments:', response);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    console.log('🔍 Starting to load all data...');
    try {
      await Promise.all([
        loadLeads(),
        loadProjects(),
        loadClients(),
        loadCrmManagers(),
        loadAppointments()
      ]);
      console.log('🔍 All data loaded successfully');
      console.log('🔍 Final counts:', {
        leads: leads.length,
        projects: projects.length,
        appointments: appointments.length
      });
    } catch (error) {
      console.error('🔍 Error loading data:', error);
    }
  };



  // Lead management functions
  const handleContactLead = async (leadId) => {
    try {
      const response = await leadsAPI.update(leadId, {
        status: 'contacted',
        lastContact: new Date().toISOString(),
        notes: 'Lead contacted by Lead Manager'
      });
      if (response.success) {
        await loadLeads();
        alert('✅ Lead marked as contacted successfully!');
      }
    } catch (error) {
      console.error('Error contacting lead:', error);
      alert('❌ Failed to contact lead');
    }
  };

  const handleQualifyLead = async (leadId, qualified) => {
    try {
      const newStatus = qualified ? 'qualified' : 'lost';
      const response = await leadsAPI.update(leadId, {
        status: newStatus,
        lastContact: new Date().toISOString()
      });
      if (response.success) {
        await loadLeads();
        alert(`✅ Lead ${qualified ? 'qualified' : 'disqualified'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('❌ Failed to update lead status');
    }
  };

  const handleCreateProject = async (leadId, projectData) => {
    try {
      // FORCE BROWSER TO USE NEW CODE - Add timestamp to break cache
      const timestamp = Date.now();
      console.log(`🔄 PROJECT CREATION - TIMESTAMP: ${timestamp}`);
      
      // If we're still getting old errors, force page reload
      if (!projectData.start_date || !projectData.due_date) {
        console.error('❌ OLD CODE DETECTED - Missing date fields');
        alert('🔄 Updating to latest version. Page will refresh...');
        setTimeout(() => window.location.reload(true), 1000);
        return;
      }

      // Get lead data
      const leadResponse = await leadsAPI.getById(leadId);
      if (!leadResponse.success) {
        throw new Error('Failed to fetch lead data');
      }
      
      const lead = leadResponse.data;
      
      // Handle client creation/lookup
      let clientId = lead.client_id;
      
      if (!clientId) {
        try {
          const existingClientsResponse = await clientsAPI.getAll({ email: lead.email });
          if (existingClientsResponse.success && existingClientsResponse.data && existingClientsResponse.data.length > 0) {
            clientId = existingClientsResponse.data[0]._id;
          }
        } catch (searchError) {
          // No existing client found
        }
        
        if (!clientId) {
          const clientData = {
            name: `${lead.firstName.trim()} ${lead.lastName.trim()}`,
            email: lead.email.toLowerCase().trim(),
            country: lead.country || 'Not specified',
            university: lead.university || '',
            status: 'active'
          };
          
          if (lead.phone && lead.phone.trim()) {
            const cleanPhone = lead.phone.trim();
            if (/^[\d\s\-\+\(\)]+$/.test(cleanPhone) && cleanPhone.replace(/\D/g, '').length >= 7) {
              clientData.phone = cleanPhone;
            }
          }
          
          const clientResponse = await clientsAPI.create(clientData);
          
          if (clientResponse.success) {
            clientId = clientResponse.data._id;
            await leadsAPI.update(leadId, { client_id: clientId });
          } else {
            throw new Error('Failed to create client: ' + (clientResponse.message || 'Unknown error'));
          }
        }
      }
      
      if (!clientId) {
        throw new Error('Could not create or find client');
      }
      
      // Extract amount from budget
      let amount = 1000;
      if (projectData.budget) {
        const budgetStr = String(projectData.budget);
        const match = budgetStr.match(/[\d.]+/);
        if (match) {
          const parsed = parseFloat(match[0]);
          if (parsed > 0) amount = parsed;
        }
      }
      
      // GUARANTEED VALID PROJECT PAYLOAD
      const projectPayload = {
        client: clientId,
        service: projectData.service_id,
        service_name: projectData.service_name || 'Lead Conversion Project',
        description: projectData.description || 'Project created from qualified lead',
        priority: projectData.priority || 'medium',
        amount: amount,
        assigned_to: projectData.assigned_to,
        created_by: user._id, // Add created_by field for filtering
        start_date: new Date(projectData.start_date),
        due_date: new Date(projectData.due_date),
        status: 'pending'  // FIXED: Use valid enum value
      };
      
      console.log('✅ SENDING VALID PAYLOAD:', JSON.stringify(projectPayload, null, 2));
      
      const response = await projectsAPI.create(projectPayload);
      
      if (response.success) {
        await leadsAPI.update(leadId, { status: 'converted' });
        await loadProjects();
        await loadLeads();
        alert('✅ Project created successfully!');
        setShowLeadModal(false);
      } else {
        console.error('❌ API ERROR:', response);
        throw new Error('API Error: ' + (response.message || response.error?.message || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('❌ PROJECT CREATION ERROR:', error);
      
      // If error still mentions 'planning', it's definitely cache
      if (error.message && error.message.includes('planning')) {
        alert('🔄 Browser cache issue detected. Forcing refresh...');
        window.location.reload(true);
        return;
      }
      
      alert('❌ Failed to create project: ' + error.message);
    }
  };

  const handleAssignProjectToCrm = async (projectId, crmManagerId) => {
    try {
      const response = await projectsAPI.update(projectId, {
        assigned_to: crmManagerId,
        status: 'in_progress'
      });
      if (response.success) {
        await loadProjects();
        alert('✅ Project assigned to CRM Manager successfully!');
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      alert('❌ Failed to assign project');
    }
  };

  // Statistics calculations
  const getLeadStats = () => {
    return {
      total: leads.length,
      new: leads.filter(lead => lead.status === 'new').length,
      contacted: leads.filter(lead => lead.status === 'contacted').length,
      qualified: leads.filter(lead => lead.status === 'qualified').length,
      converted: leads.filter(lead => lead.status === 'converted').length
    };
  };

  const getProjectStats = () => {
    return {
      total: projects.length,
      pending: projects.filter(project => project.status === 'pending').length,
      active: projects.filter(project => project.status === 'active').length,
      completed: projects.filter(project => project.status === 'completed').length,
      onHold: projects.filter(project => project.status === 'on_hold').length
    };
  };

  // Modal handlers
  const viewLeadDetails = (lead, type = 'view') => {
    setSelectedLead(lead);
    setModalType(type);
    setShowLeadModal(true);
  };

  const viewProjectDetails = (project, type = 'view') => {
    setSelectedProject(project);
    setModalType(type);
    setShowProjectModal(true);
  };

  const scheduleMeeting = (lead) => {
    setSelectedLead(lead);
    setShowMeetingModal(true);
  };

  const assignProject = (project) => {
    setSelectedProject(project);
    setShowAssignModal(true);
  };

  const handleMeetingLink = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMeetingLinkModal(true);
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const updateMeetingLink = async (appointmentId, meetingLink) => {
    try {
      const response = await appointmentsAPI.schedule(appointmentId, {
        meeting_link: meetingLink,
        scheduled_date: selectedAppointment.scheduled_date,
        scheduled_time: selectedAppointment.scheduled_time
      });
      if (response.success) {
        await loadAppointments();
        alert('✅ Meeting link updated successfully!');
        setShowMeetingLinkModal(false);
      }
    } catch (error) {
      console.error('Error updating meeting link:', error);
      alert('❌ Failed to update meeting link');
    }
  };

  // Component for statistics cards
  const StatCard = ({ icon, number, label, borderColor, iconColor, onClick }) => (
    <div 
      style={{
        ...componentStyles.contactsStatCard,
        borderColor: borderColor,
        cursor: onClick ? 'pointer' : 'default'
      }}
      {...(onClick ? hoverEffects.card : {})}
      onClick={onClick}
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

  // Render different sections
  const renderLeadsManagement = () => {
    const leadStats = getLeadStats();
    
    return (
      <div style={componentStyles.managementCard}>
        {/* Header with Refresh Button */}
        <div style={componentStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={componentStyles.headerIcon}>
              <i className="fas fa-user-tie fa-lg"></i>
            </div>
            <div>
              <h4 style={componentStyles.headerTitle}>Assigned Leads Management</h4>
              <p style={componentStyles.headerSubtitle}>Manage your assigned leads and convert them to projects</p>
            </div>
          </div>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadLeads}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Lead Statistics */}
        <div style={componentStyles.statsContainer}>
          <StatCard
            icon="fas fa-user-tie"
            number={leadStats.total}
            label="Total Assigned Leads"
            borderColor="#8b5cf6"
            iconColor="#8b5cf6"
          />
          <StatCard
            icon="fas fa-user-plus"
            number={leadStats.new}
            label="New Leads"
            borderColor="#3b82f6"
            iconColor="#3b82f6"
          />
          <StatCard
            icon="fas fa-phone"
            number={leadStats.contacted}
            label="Contacted"
            borderColor="#f59e0b"
            iconColor="#f59e0b"
          />
          <StatCard
            icon="fas fa-check-circle"
            number={leadStats.qualified}
            label="Qualified"
            borderColor="#10b981"
            iconColor="#10b981"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div style={componentStyles.loading}>
            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
            <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading leads...</p>
          </div>
        )}

        {/* Leads Table */}
        {!loading && (
          <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={componentStyles.tableHeader}>
                <tr>
                  <th style={componentStyles.tableHeaderCell}>Lead ID</th>
                  <th style={componentStyles.tableHeaderCell}>Name</th>
                  <th style={componentStyles.tableHeaderCell}>Email</th>
                  <th style={componentStyles.tableHeaderCell}>Source</th>
                  <th style={componentStyles.tableHeaderCell}>Status</th>
                  <th style={componentStyles.tableHeaderCell}>Priority</th>
                  <th style={componentStyles.tableHeaderCell}>Last Contact</th>
                  <th style={componentStyles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={componentStyles.emptyState}>
                      <i className="fas fa-user-tie fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                      <p style={{ color: designSystem.colors.gray[500] }}>No assigned leads found</p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr 
                      key={lead._id}
                      style={componentStyles.tableRow}
                      {...hoverEffects.tableRow}
                    >
                      <td style={componentStyles.tableCell}>
                        <span 
                          style={{
                            ...componentStyles.badge,
                            background: designSystem.colors.primary,
                            color: 'white',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: '600',
                            padding: '6px 12px'
                          }}
                        >
                          #{lead._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ 
                            fontWeight: designSystem.typography.fontWeight.medium,
                            marginBottom: '2px'
                          }}>
                            {lead.firstName} {lead.lastName}
                          </div>
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        {lead.email}
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          background: getSourceColor(lead.source),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {getSourceDisplayName(lead.source)}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          ...componentStyles.badge,
                          background: getStatusColor(lead.status),
                          color: 'white',
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {lead.status}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          color: getPriorityColor(lead.priority),
                          fontWeight: designSystem.typography.fontWeight.bold,
                          textTransform: 'uppercase',
                          fontSize: '12px'
                        }}>
                          ● {lead.priority || 'Medium'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => viewLeadDetails(lead, 'view')}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handleContactLead(lead._id)}
                            title="Contact Lead"
                          >
                            <i className="fas fa-phone"></i>
                          </button>
                          <button 
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => scheduleMeeting(lead)}
                            title="Schedule Meeting"
                          >
                            <i className="fas fa-calendar"></i>
                          </button>
                          {lead.status === 'contacted' && (
                            <>
                              <button 
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleQualifyLead(lead._id, true)}
                                title="Qualify Lead"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleQualifyLead(lead._id, false)}
                                title="Disqualify Lead"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderProjectsManagement = () => {
    console.log('🔍 Rendering projects section, projects count:', projects.length);
    const projectStats = getProjectStats();
    
    return (
      <div style={componentStyles.managementCard}>
        {/* Header with Refresh Button */}
        <div style={componentStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={componentStyles.headerIcon}>
              <i className="fas fa-project-diagram fa-lg"></i>
            </div>
            <div>
              <h4 style={componentStyles.headerTitle}>My Created Projects</h4>
              <p style={componentStyles.headerSubtitle}>Projects created by you from qualified leads</p>
            </div>
          </div>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadProjects}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Project Statistics */}
        <div style={componentStyles.statsContainer}>
          <StatCard
            icon="fas fa-project-diagram"
            number={projectStats.total}
            label="Total Projects"
            borderColor="#8b5cf6"
            iconColor="#8b5cf6"
          />
          <StatCard
            icon="fas fa-clock"
            number={projectStats.pending}
            label="Pending Assignment"
            borderColor="#f59e0b"
            iconColor="#f59e0b"
          />
          <StatCard
            icon="fas fa-play-circle"
            number={projectStats.active}
            label="Active Projects"
            borderColor="#3b82f6"
            iconColor="#3b82f6"
          />
          <StatCard
            icon="fas fa-check-circle"
            number={projectStats.completed}
            label="Completed"
            borderColor="#10b981"
            iconColor="#10b981"
          />
        </div>

        {/* Projects Table */}
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Project ID</th>
                <th style={componentStyles.tableHeaderCell}>Client</th>
                <th style={componentStyles.tableHeaderCell}>Service</th>
                <th style={componentStyles.tableHeaderCell}>CRM Manager</th>
                <th style={componentStyles.tableHeaderCell}>Status</th>
                <th style={componentStyles.tableHeaderCell}>Progress</th>
                <th style={componentStyles.tableHeaderCell}>Tasks</th>
                <th style={componentStyles.tableHeaderCell}>Created</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="9" style={componentStyles.emptyState}>
                    <i className="fas fa-project-diagram fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>No projects created by you found</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr 
                    key={project._id}
                    style={componentStyles.tableRow}
                    {...hoverEffects.tableRow}
                  >
                    <td style={componentStyles.tableCell}>
                      <span 
                        style={{
                          ...componentStyles.badge,
                          background: designSystem.colors.primary,
                          color: 'white',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '6px 12px'
                        }}
                      >
                        {project.project_id || `#${project._id.slice(-8).toUpperCase()}`}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.medium,
                          marginBottom: '2px'
                        }}>
                          {project.client?.name || 'Unknown Client'}
                        </div>
                        <small style={{ color: designSystem.colors.gray[500] }}>
                          {project.client?.email || 'No email'}
                        </small>
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        background: '#8b5cf6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {project.service_name || 'Unknown Service'}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {project.assigned_to ? (
                        <div>
                          <div style={{ 
                            fontWeight: designSystem.typography.fontWeight.medium,
                            marginBottom: '2px'
                          }}>
                            {project.assigned_to.first_name} {project.assigned_to.last_name}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            CRM Manager
                          </small>
                        </div>
                      ) : (
                        <span style={{ 
                          color: designSystem.colors.gray[500],
                          fontStyle: 'italic'
                        }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        ...componentStyles.badge,
                        background: getStatusColor(project.status),
                        color: 'white',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                        <div style={{ 
                          width: '60px', 
                          height: '8px',
                          background: designSystem.colors.gray[200],
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div 
                            style={{
                              width: `${project.progress || 0}%`,
                              height: '100%',
                              background: getProgressColor(project.progress || 0),
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>
                        <small style={{ 
                          fontSize: designSystem.typography.fontSize.xs,
                          fontWeight: '600'
                        }}>
                          {project.progress || 0}%
                        </small>
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.xs }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{
                            background: project.milestones && project.milestones.length > 0 ? '#10b981' : '#6b7280',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {project.milestones ? project.milestones.length : 0}
                          </span>
                          <small style={{ 
                            fontSize: designSystem.typography.fontSize.xs,
                            color: designSystem.colors.gray[500]
                          }}>
                            tasks
                          </small>
                        </div>
                        {project.milestones && project.milestones.length > 0 && (
                          <small style={{
                            fontSize: '10px',
                            color: '#10b981',
                            fontWeight: '600'
                          }}>
                            {project.milestones.filter(m => m.status === 'completed').length}/{project.milestones.length} done
                          </small>
                        )}
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => viewProjectDetails(project, 'view')}
                          title="View Project Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-info btn-sm"
                          onClick={() => viewProjectDetails(project, 'tasks')}
                          title="View Project Tasks"
                        >
                          <i className="fas fa-tasks"></i>
                        </button>
                        {!project.assigned_to && (
                          <button 
                            className="btn btn-outline-success btn-sm"
                            onClick={() => assignProject(project)}
                            title="Assign to CRM Manager"
                          >
                            <i className="fas fa-user-plus"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper functions for styling
  const getStatusColor = (status) => {
    const colors = {
      'new': '#3b82f6',
      'contacted': '#f59e0b',
      'qualified': '#10b981',
      'converted': '#8b5cf6',
      'lost': '#ef4444',
      'pending': '#f59e0b',
      'active': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#6b7280',
      'on_hold': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[priority] || '#f59e0b';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
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
    return sourceMap[source] || source || 'Unknown';
  };

  const getSourceColor = (source) => {
    const colors = {
      'profile_assessment': '#8b5cf6',
      'contact_form': '#3b82f6',
      'appointment': '#10b981',
      'website': '#f59e0b',
      'referral': '#ef4444',
      'social_media': '#06b6d4',
      'advertisement': '#f97316',
      'event': '#84cc16',
      'cold_call': '#6366f1',
      'email_campaign': '#ec4899',
      'other': '#6b7280'
    };
    return colors[source] || '#6366f1';
  };

  // Render qualified leads section
  const renderQualifiedLeads = () => {
    const qualifiedLeads = leads.filter(lead => lead.status === 'qualified');
    
    return (
      <div style={componentStyles.managementCard}>
        {/* Header */}
        <div style={componentStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={componentStyles.headerIcon}>
              <i className="fas fa-user-check fa-lg"></i>
            </div>
            <div>
              <h4 style={componentStyles.headerTitle}>Qualified Leads</h4>
              <p style={componentStyles.headerSubtitle}>Leads ready for project conversion</p>
            </div>
          </div>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadLeads}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Qualified Leads Statistics */}
        <div style={componentStyles.statsContainer}>
          <StatCard
            icon="fas fa-user-check"
            number={qualifiedLeads.length}
            label="Qualified Leads"
            borderColor="#10b981"
            iconColor="#10b981"
          />
          <StatCard
            icon="fas fa-project-diagram"
            number={qualifiedLeads.filter(lead => lead.hasProject).length}
            label="With Projects"
            borderColor="#3b82f6"
            iconColor="#3b82f6"
          />
          <StatCard
            icon="fas fa-clock"
            number={qualifiedLeads.filter(lead => !lead.hasProject).length}
            label="Awaiting Projects"
            borderColor="#f59e0b"
            iconColor="#f59e0b"
          />
        </div>

        {/* Qualified Leads Table */}
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Lead ID</th>
                <th style={componentStyles.tableHeaderCell}>Name</th>
                <th style={componentStyles.tableHeaderCell}>Email</th>
                <th style={componentStyles.tableHeaderCell}>Source</th>
                <th style={componentStyles.tableHeaderCell}>Priority</th>
                <th style={componentStyles.tableHeaderCell}>Qualified Date</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qualifiedLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" style={componentStyles.emptyState}>
                    <i className="fas fa-user-check fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>No qualified leads found</p>
                  </td>
                </tr>
              ) : (
                qualifiedLeads.map((lead) => (
                  <tr 
                    key={lead._id}
                    style={componentStyles.tableRow}
                    {...hoverEffects.tableRow}
                  >
                    <td style={componentStyles.tableCell}>
                      <span 
                        style={{
                          ...componentStyles.badge,
                          background: designSystem.colors.primary,
                          color: 'white',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          fontWeight: '600',
                          padding: '6px 12px'
                        }}
                      >
                        #{lead._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.medium,
                          marginBottom: '2px'
                        }}>
                          {lead.firstName} {lead.lastName}
                        </div>
                      </div>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {lead.email}
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        background: getSourceColor(lead.source),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getSourceDisplayName(lead.source)}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      <span style={{
                        color: getPriorityColor(lead.priority),
                        fontWeight: designSystem.typography.fontWeight.bold,
                        textTransform: 'uppercase',
                        fontSize: '12px'
                      }}>
                        ● {lead.priority || 'Medium'}
                      </span>
                    </td>
                    <td style={componentStyles.tableCell}>
                      {lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td style={componentStyles.tableCell}>
                      <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => viewLeadDetails(lead, 'view')}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => viewLeadDetails(lead, 'create_project')}
                          title="Create Project"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render meetings management section
  const renderMeetingsManagement = () => {
    return (
      <div style={componentStyles.managementCard}>
        {/* Header */}
        <div style={componentStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={componentStyles.headerIcon}>
              <i className="fas fa-calendar-alt fa-lg"></i>
            </div>
            <div>
              <h4 style={componentStyles.headerTitle}>Appointments</h4>
              <p style={componentStyles.headerSubtitle}>Manage scheduled appointments with assigned clients</p>
            </div>
          </div>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={loadAppointments}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>

        {/* Appointment Statistics */}
        <div style={componentStyles.statsContainer}>
          <StatCard
            icon="fas fa-calendar-alt"
            number={appointments.length}
            label="Total Appointments"
            borderColor="#8b5cf6"
            iconColor="#8b5cf6"
          />
          <StatCard
            icon="fas fa-clock"
            number={appointments.filter(a => a.status === 'confirmed').length}
            label="Confirmed"
            borderColor="#3b82f6"
            iconColor="#3b82f6"
          />
          <StatCard
            icon="fas fa-calendar-day"
            number={appointments.filter(a => {
              const appointmentDate = a.scheduled_date ? new Date(a.scheduled_date) : null;
              const today = new Date();
              return appointmentDate && appointmentDate.toDateString() === today.toDateString();
            }).length}
            label="Today"
            borderColor="#f59e0b"
            iconColor="#f59e0b"
          />
          <StatCard
            icon="fas fa-check-circle"
            number={appointments.filter(a => a.status === 'completed').length}
            label="Completed"
            borderColor="#10b981"
            iconColor="#10b981"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div style={componentStyles.loading}>
            <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
            <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading appointments...</p>
          </div>
        )}

        {/* Appointments Table */}
        {!loading && (
          <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={componentStyles.tableHeader}>
                <tr>
                  <th style={componentStyles.tableHeaderCell}>Client Name</th>
                  <th style={componentStyles.tableHeaderCell}>Email</th>
                  <th style={componentStyles.tableHeaderCell}>Visa Category</th>
                  <th style={componentStyles.tableHeaderCell}>Scheduled Date</th>
                  <th style={componentStyles.tableHeaderCell}>Time</th>
                  <th style={componentStyles.tableHeaderCell}>Status</th>
                  <th style={componentStyles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={componentStyles.emptyState}>
                      <i className="fas fa-calendar-alt fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                      <p style={{ color: designSystem.colors.gray[500] }}>No appointments created by you</p>
                      <small style={{ color: designSystem.colors.gray[400] }}>
                        Appointments you create for clients will appear here
                      </small>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr 
                      key={appointment._id}
                      style={componentStyles.tableRow}
                      {...hoverEffects.tableRow}
                    >
                      <td style={componentStyles.tableCell}>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.medium,
                          marginBottom: '2px'
                        }}>
                          {appointment.name}
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ 
                            fontWeight: designSystem.typography.fontWeight.medium,
                            marginBottom: '2px'
                          }}>
                            {appointment.email}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {appointment.phone}
                          </small>
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          background: '#8b5cf6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {appointment.visa_category_display || appointment.visa_category || 'N/A'}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        {appointment.scheduled_date ? 
                          new Date(appointment.scheduled_date).toLocaleDateString() : 
                          (appointment.preferred_date || 'Not scheduled')
                        }
                      </td>
                      <td style={componentStyles.tableCell}>
                        {appointment.scheduled_time || appointment.preferred_time || 'Not set'}
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          ...componentStyles.badge,
                          background: getStatusColor(appointment.status),
                          color: 'white',
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {appointment.status}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => viewAppointmentDetails(appointment)}
                            title="View Appointment Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {appointment.meeting_link && (
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => {
                                window.open(appointment.meeting_link, '_blank');
                              }}
                              title="Join Meeting"
                            >
                              <i className="fas fa-video"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'leads':
        return renderLeadsManagement();
      case 'qualified':
        return renderQualifiedLeads();
      case 'projects':
        return renderProjectsManagement();
      case 'meetings':
        return renderMeetingsManagement();
      default:
        return renderLeadsManagement();
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

    if (window.innerWidth >= 768) {
      return {
        ...baseStyle,
        marginLeft: '250px',
        width: 'calc(100% - 250px)'
      };
    }

    return {
      ...baseStyle,
      marginLeft: sidebarOpen ? '250px' : '0',
      width: sidebarOpen ? 'calc(100% - 250px)' : '100%'
    };
  };

  if (loading && leads.length === 0 && projects.length === 0 && appointments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <TopNavbar 
        user={user}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
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

      {/* Lead Details Modal */}
      {showLeadModal && (
        <LeadDetailsModal
          show={showLeadModal}
          onHide={() => setShowLeadModal(false)}
          lead={selectedLead}
          type={modalType}
          onContact={handleContactLead}
          onQualify={handleQualifyLead}
          onScheduleMeeting={scheduleMeeting}
          onCreateProject={handleCreateProject}
        />
      )}

      {/* Project Details Modal */}
      {showProjectModal && (
        <ProjectDetailsModal
          show={showProjectModal}
          onHide={() => setShowProjectModal(false)}
          project={selectedProject}
          type={modalType}
          onAssignToCrm={handleAssignProjectToCrm}
          crmManagers={crmManagers}
        />
      )}

      {/* Meeting Schedule Modal */}
      {showMeetingModal && (
        <MeetingScheduleModal
          show={showMeetingModal}
          onHide={() => setShowMeetingModal(false)}
          lead={selectedLead}
          onSchedule={async (meetingInfo) => {
            try {
              // Create appointment in database
              const appointmentData = {
                name: `${selectedLead.firstName} ${selectedLead.lastName}`,
                email: selectedLead.email,
                phone: selectedLead.phone || '',
                visa_category: 'other',
                timezone: 'EST',
                preferred_date: meetingInfo.date,
                preferred_time: meetingInfo.time,
                consultation_type: meetingInfo.type === 'video_call' ? 'video' : 'phone',
                details: meetingInfo.agenda || meetingInfo.notes || '',
                status: 'confirmed',
                priority: 'medium',
                assigned_to: user._id,
                created_by: user._id, // Add created_by field for filtering
                scheduled_date: new Date(`${meetingInfo.date}T${meetingInfo.time}`),
                scheduled_time: meetingInfo.time,
                duration_minutes: parseInt(meetingInfo.duration) || 60,
                meeting_link: meetingInfo.meetingLink || '',
                consultation_notes: `Meeting scheduled by Lead Manager for lead: ${selectedLead.firstName} ${selectedLead.lastName}`
              };
              
              const response = await appointmentsAPI.submit(appointmentData);
              
              if (response.success) {
                await loadAppointments();
                alert('✅ Meeting scheduled successfully!');
                setShowMeetingModal(false);
              } else {
                alert('⚠️ Meeting scheduled but failed to save: ' + (response.message || 'Unknown error'));
                setShowMeetingModal(false);
              }
            } catch (error) {
              console.error('Error creating appointment:', error);
              console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
              });
              
              let errorMessage = 'Failed to schedule meeting';
              
              if (error.response?.data?.error) {
                const errorData = error.response.data.error;
                if (errorData.code === 'VALIDATION_ERROR' && errorData.validationErrors) {
                  errorMessage = 'Validation errors: ' + errorData.validationErrors.join(', ');
                } else if (errorData.code === 'RATE_LIMIT_EXCEEDED') {
                  errorMessage = 'Too many requests. Please wait a moment and try again.';
                } else if (errorData.message) {
                  errorMessage = errorData.message;
                }
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              alert('❌ ' + errorMessage);
            }
          }}
        />
      )}

      {/* CRM Assignment Modal */}
      {showAssignModal && (
        <ProjectDetailsModal
          show={showAssignModal}
          onHide={() => setShowAssignModal(false)}
          project={selectedProject}
          type="assign"
          onAssignToCrm={handleAssignProjectToCrm}
          crmManagers={crmManagers}
        />
      )}

      {/* Meeting Link Modal */}
      {showMeetingLinkModal && selectedAppointment && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
          onClick={() => setShowMeetingLinkModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h5 style={{ margin: 0, color: '#1f2937', fontWeight: '600' }}>
                Set Meeting Link
              </h5>
              <button 
                onClick={() => setShowMeetingLinkModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
                <strong>Client:</strong> {selectedAppointment.name}
              </p>
              <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
                <strong>Email:</strong> {selectedAppointment.email}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const meetingLink = e.target.meetingLink.value.trim();
              if (meetingLink) {
                updateMeetingLink(selectedAppointment._id, meetingLink);
              }
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Meeting Link *
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  defaultValue={selectedAppointment.meeting_link || ''}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/xxxxxxxxx"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  Enter the meeting link that will be shared with the client
                </small>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowMeetingLinkModal(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    color: '#374151',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Save Meeting Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showAppointmentModal && (
        <AppointmentDetailsModal
          show={showAppointmentModal}
          onHide={() => setShowAppointmentModal(false)}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
};

export default LeadManagerDashboard;