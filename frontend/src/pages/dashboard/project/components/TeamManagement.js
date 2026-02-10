import { useState, useEffect } from 'react';
import { projectsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';

const TeamManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading team members (assigned employees)...');
      
      // Get all tasks from assigned projects
      const response = await projectsAPI.getMyTasks();
      console.log('📊 Full Tasks API response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        const tasks = response.data || [];
        console.log('📊 Total tasks received:', tasks.length);
        
        if (tasks.length === 0) {
          console.warn('⚠️ No tasks found! You need to create tasks first.');
          setEmployees([]);
          setLoading(false);
          return;
        }
        
        // Log first task to see structure
        console.log('📊 First task structure:', JSON.stringify(tasks[0], null, 2));
        
        // Extract unique employees from tasks
        const employeeMap = new Map();
        let tasksWithAssignment = 0;
        let tasksWithoutAssignment = 0;
        
        tasks.forEach((task, index) => {
          const hasAssignedTo = !!task.assigned_to;
          
          console.log(`📋 Task ${index + 1}:`, {
            title: task.title,
            status: task.status,
            assigned_to_exists: hasAssignedTo,
            assigned_to_type: typeof task.assigned_to,
            assigned_to_value: task.assigned_to
          });
          
          if (hasAssignedTo) {
            tasksWithAssignment++;
            
            // Handle both populated and non-populated assigned_to
            const empId = task.assigned_to._id || task.assigned_to;
            const empData = typeof task.assigned_to === 'object' ? task.assigned_to : null;
            
            console.log(`   ✓ Employee ID: ${empId}`);
            console.log(`   ✓ Employee Data:`, empData);
            
            if (empId) {
              const empIdStr = empId.toString();
              
              if (!employeeMap.has(empIdStr)) {
                const employee = {
                  _id: empId,
                  first_name: empData?.first_name || 'Unknown',
                  last_name: empData?.last_name || 'Employee',
                  email: empData?.email || 'N/A',
                  tasks: [],
                  totalTasks: 0,
                  completedTasks: 0,
                  inProgressTasks: 0,
                  pendingTasks: 0
                };
                
                console.log(`   ✓ Adding new employee to map:`, employee);
                employeeMap.set(empIdStr, employee);
              }
              
              const emp = employeeMap.get(empIdStr);
              emp.tasks.push(task);
              emp.totalTasks++;
              
              if (task.status === 'completed') emp.completedTasks++;
              else if (task.status === 'in_progress') emp.inProgressTasks++;
              else if (task.status === 'pending') emp.pendingTasks++;
              
              console.log(`   ✓ Updated employee stats:`, {
                id: empIdStr,
                totalTasks: emp.totalTasks,
                completedTasks: emp.completedTasks
              });
            }
          } else {
            tasksWithoutAssignment++;
            console.log(`   ✗ Task has NO assigned employee`);
          }
        });
        
        const employeesList = Array.from(employeeMap.values());
        
        console.log('📊 Summary:');
        console.log(`   - Total tasks: ${tasks.length}`);
        console.log(`   - Tasks with assignment: ${tasksWithAssignment}`);
        console.log(`   - Tasks without assignment: ${tasksWithoutAssignment}`);
        console.log(`   - Unique employees: ${employeesList.length}`);
        console.log('✅ Final employees list:', employeesList);
        
        if (employeesList.length === 0) {
          console.warn('⚠️ No employees found! Make sure you assign employees when creating tasks.');
        }
        
        setEmployees(employeesList);
      } else {
        console.error('❌ API call failed:', response);
        setEmployees([]);
      }
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      console.error('❌ Error stack:', error.stack);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const viewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
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

  return (
    <div style={componentStyles.managementCard}>
      {/* Header */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-users fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Team Management</h4>
            <p style={componentStyles.headerSubtitle}>View employees assigned to your project tasks</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.success
          }}
          onClick={loadTeamMembers}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-users"
          number={employees.length}
          label="Team Members"
          borderColor="#0dcaf0"
          iconColor="#0dcaf0"
        />
        <StatCard
          icon="fas fa-tasks"
          number={employees.reduce((sum, emp) => sum + emp.totalTasks, 0)}
          label="Total Tasks"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={employees.reduce((sum, emp) => sum + emp.completedTasks, 0)}
          label="Completed"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-play-circle"
          number={employees.reduce((sum, emp) => sum + emp.inProgressTasks, 0)}
          label="In Progress"
          borderColor="#3b82f6"
          iconColor="#3b82f6"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading team members...</p>
        </div>
      )}

      {/* Team Members Table */}
      {!loading && employees.length > 0 && (
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Employee</th>
                <th style={componentStyles.tableHeaderCell}>Email</th>
                <th style={componentStyles.tableHeaderCell}>Total Tasks</th>
                <th style={componentStyles.tableHeaderCell}>Completed</th>
                <th style={componentStyles.tableHeaderCell}>In Progress</th>
                <th style={componentStyles.tableHeaderCell}>Pending</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr 
                  key={employee._id}
                  style={componentStyles.tableRow}
                  {...hoverEffects.tableRow}
                >
                  <td style={componentStyles.tableCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#0dcaf0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                          {employee.first_name} {employee.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <small style={{ color: designSystem.colors.gray[600] }}>
                      {employee.email}
                    </small>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: '#8b5cf6',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {employee.totalTasks}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: '#10b981',
                      color: 'white'
                    }}>
                      {employee.completedTasks}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: '#3b82f6',
                      color: 'white'
                    }}>
                      {employee.inProgressTasks}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <span style={{
                      ...componentStyles.badge,
                      background: '#f59e0b',
                      color: 'white'
                    }}>
                      {employee.pendingTasks}
                    </span>
                  </td>
                  <td style={componentStyles.tableCell}>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => viewEmployeeDetails(employee)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i> View Tasks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Team Members Message */}
      {!loading && employees.length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-users fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
          <h6 style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.md }}>No team members yet</h6>
          <p style={{ color: designSystem.colors.gray[500] }}>Employees will appear here once you assign tasks to them</p>
        </div>
      )}

      {/* Employee Details Modal */}
      {showModal && selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onHide={() => {
            setShowModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

// Employee Details Modal Component
const EmployeeDetailsModal = ({ employee, onHide }) => {
  return (
    <div className="modal" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-user me-2"></i>
              {employee.first_name} {employee.last_name} - Tasks
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {/* Employee Info */}
            <div className="mb-4">
              <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                Employee Information
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {employee.first_name} {employee.last_name}</p>
                  <p><strong>Email:</strong> {employee.email}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Total Tasks:</strong> {employee.totalTasks}</p>
                  <p><strong>Completed:</strong> {employee.completedTasks} | <strong>In Progress:</strong> {employee.inProgressTasks} | <strong>Pending:</strong> {employee.pendingTasks}</p>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div>
              <h6 style={{ color: designSystem.colors.dark, marginBottom: designSystem.spacing.md }}>
                Assigned Tasks
              </h6>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {employee.tasks.map((task, index) => (
                  <div 
                    key={task._id}
                    style={{
                      padding: designSystem.spacing.md,
                      marginBottom: designSystem.spacing.sm,
                      background: designSystem.colors.gray[100],
                      borderRadius: designSystem.borderRadius.button,
                      borderLeft: `4px solid ${
                        task.status === 'completed' ? '#10b981' :
                        task.status === 'in_progress' ? '#3b82f6' :
                        '#f59e0b'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{task.title}</strong>
                        <div style={{ fontSize: '13px', color: designSystem.colors.gray[600], marginTop: '4px' }}>
                          Project: {task.project?.project_id || 'N/A'}
                        </div>
                      </div>
                      <span style={{
                        ...componentStyles.badge,
                        background: task.status === 'completed' ? '#10b981' :
                                   task.status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                        color: 'white',
                        textTransform: 'uppercase',
                        fontSize: '10px'
                      }}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: designSystem.colors.gray[600] }}>
                      {task.description || 'No description'}
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '12px' }}>
                      <span><strong>Priority:</strong> {task.priority}</span>
                      <span><strong>Progress:</strong> {task.progress}%</span>
                      {task.due_date && (
                        <span><strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
