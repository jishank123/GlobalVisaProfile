import { useState, useEffect } from 'react';
import { paymentsAPI } from '../../../../services/api';
import { designSystem, componentStyles, hoverEffects } from '../../../../styles/designSystem';
import { getApiEndpoint, getBackendBaseUrl } from '../../../../utils/apiConfig';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]); // For service purchases
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalType, setModalType] = useState(''); // 'view', 'approve', 'reject'
  const [approvalData, setApprovalData] = useState({
    verification_status: '',
    admin_notes: ''
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'verified', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [existingInvoices, setExistingInvoices] = useState({}); // Store existing invoices by project ID
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0
  });

  // Helper function to get the correct base URL for static files
  const getStaticFileBaseUrl = () => {
    return getBackendBaseUrl();
  };

  useEffect(() => {
    loadPaymentsData(); // This will also load projects data
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading payments data...');
      const response = await paymentsAPI.getAllForAdmin();
      if (response.success) {
        console.log('✅ Payments loaded:', response.data);
        setPayments(response.data || []);
        
        // Also load projects data for comparison
        await loadProjectsData();
      }
    } catch (error) {
      console.error('❌ Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectsData = async () => {
    try {
      // Load projects (service purchases) to get payment information
      const response = await fetch(getApiEndpoint('/projects'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        // Filter projects that have payment information
        const projectsWithPayments = result.data.filter(project => 
          project.payment_method || project.payment_receipt || project.amount
        );
        
        console.log('📊 Admin: Projects with payment info:', projectsWithPayments.length);
        console.log('📊 Admin: Projects with receipts:', projectsWithPayments.filter(p => p.payment_receipt).length);
        
        // Fetch payment status for each project
        const projectsWithPaymentStatus = await Promise.all(
          projectsWithPayments.map(async (project) => {
            try {
              console.log(`🔍 Fetching payment for project: ${project._id}`);
              const paymentResponse = await fetch(getApiEndpoint(`/payments/by-project/${project._id}`), {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  'Content-Type': 'application/json'
                }
              });
              const paymentResult = await paymentResponse.json();
              
              console.log(`📡 Payment API response for ${project._id}:`, paymentResult);
              
              if (paymentResult.success && paymentResult.data && paymentResult.data.length > 0) {
                const payment = paymentResult.data[0];
                console.log(`💳 Admin: Found payment for project ${project._id}:`, {
                  paymentId: payment._id,
                  status: payment.status,
                  statusType: typeof payment.status,
                  statusLower: payment.status?.toLowerCase(),
                  rawPayment: payment
                });
                return {
                  ...project,
                  payment_status: payment.status, // Add actual payment status
                  payment_id: payment._id
                };
              }
              
              // No payment record found, return project as-is
              console.log(`⚠️ Admin: No payment record for project ${project._id}`);
              return project;
            } catch (error) {
              console.error(`❌ Admin: Error fetching payment for project ${project._id}:`, error);
              return project;
            }
          })
        );
        
        console.log('📊 Admin: Projects with payment status:', projectsWithPaymentStatus.map(p => ({
          id: p._id,
          service: p.service_name,
          project_status: p.status,
          payment_status: p.payment_status
        })));
        
        // CRITICAL DEBUG: Check what we're actually getting
        console.log('🚨 CRITICAL DEBUG - RAW PROJECT DATA:');
        projectsWithPaymentStatus.forEach((p, idx) => {
          console.log(`Project ${idx + 1}:`, {
            _id: p._id,
            service_name: p.service_name,
            project_status: p.status,
            payment_status: p.payment_status,
            has_payment_status: !!p.payment_status,
            payment_status_type: typeof p.payment_status,
            payment_status_value: JSON.stringify(p.payment_status)
          });
        });
        
        setProjects(projectsWithPaymentStatus);
        calculateStats(projectsWithPaymentStatus);
        
        // Load existing invoices for these projects
        await loadExistingInvoices(projectsWithPaymentStatus);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadExistingInvoices = async (projectsData) => {
    try {
      console.log('Loading existing invoices for projects:', projectsData.map(p => p._id));
      const invoicesMap = {};
      
      // Only check for invoices for projects that have been confirmed for a while
      // This prevents newly confirmed projects from showing old invoice data
      const eligibleProjects = projectsData.filter(project => {
        const isConfirmed = project.status === 'active' || project.status === 'in_progress' || project.status === 'completed';
        const verifiedAt = project.verified_at ? new Date(project.verified_at) : null;
        const now = new Date();
        
        // If no verified_at date, or verified more than 1 minute ago, check for invoices
        // This gives time for the confirmation process to complete
        const isEligible = !verifiedAt || (now - verifiedAt) > 60000; // 1 minute buffer
        
        console.log(`Project ${project._id}: confirmed=${isConfirmed}, verifiedAt=${verifiedAt}, eligible=${isEligible}`);
        return isConfirmed && isEligible;
      });
      
      // Check for existing invoices for each eligible project individually
      for (const project of eligibleProjects) {
        console.log(`Checking for existing invoice for project: ${project._id}`);
        const invoice = await checkForExistingInvoice(project._id);
        if (invoice) {
          console.log(`Found existing invoice for project ${project._id}:`, invoice.invoice_number);
          invoicesMap[project._id] = invoice;
        } else {
          console.log(`No existing invoice found for project: ${project._id}`);
        }
      }
      
      console.log('Final invoices map:', invoicesMap);
      setExistingInvoices(invoicesMap);
    } catch (error) {
      console.error('Error loading existing invoices:', error);
    }
  };

  const calculateStats = (projectsData) => {
    console.log('📊 === CALCULATING STATS ===');
    console.log('📊 Total projects:', projectsData.length);
    
    // Log each project's status for debugging
    projectsData.forEach((p, i) => {
      const status = p.payment_status || p.status;
      console.log(`📊 Project ${i + 1}:`, {
        id: p._id,
        service: p.service_name,
        projectStatus: p.status,
        paymentStatus: p.payment_status,
        finalStatus: status,
        statusType: typeof status,
        statusLower: status?.toLowerCase().trim(),
        statusIncludes: status?.toLowerCase().includes('pending')
      });
    });
    
    const stats = {
      total: projectsData.length,
      // Count based on payment_status if available, otherwise fall back to project status
      pending: projectsData.filter(p => {
        const status = p.payment_status || p.status;
        const statusLower = status?.toLowerCase().trim();
        const isPending = statusLower === 'pending' || 
                         statusLower === 'pending_verification' || 
                         statusLower === 'due' ||
                         statusLower?.includes('pending');
        
        console.log(`📊 Checking pending for ${p._id}:`, {
          service: p.service_name,
          status: status,
          statusLower: statusLower,
          checkPending: statusLower === 'pending',
          checkPendingVerification: statusLower === 'pending_verification',
          checkDue: statusLower === 'due',
          checkIncludes: statusLower?.includes('pending'),
          finalIsPending: isPending
        });
        
        if (isPending) {
          console.log('📊 ✅ Counted as pending:', {
            id: p._id,
            service: p.service_name,
            status: status,
            statusLower: statusLower
          });
        }
        
        return isPending;
      }).length,
      verified: projectsData.filter(p => {
        const status = p.payment_status || p.status;
        const statusLower = status?.toLowerCase().trim();
        return statusLower === 'verified' || statusLower === 'completed';
      }).length,
      rejected: projectsData.filter(p => {
        const status = p.payment_status || p.status;
        const statusLower = status?.toLowerCase().trim();
        return statusLower === 'rejected' || statusLower === 'cancelled';
      }).length,
      totalAmount: projectsData
        .filter(p => {
          const status = p.payment_status || p.status;
          const statusLower = status?.toLowerCase().trim();
          // Only count completed/verified payments in total revenue
          return statusLower === 'verified' || statusLower === 'completed';
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    };
    
    console.log('📊 Final stats:', stats);
    console.log('📊 === END STATS CALCULATION ===');
    
    setStats(stats);
  };

  const handlePaymentAction = async (projectId, action, notes = '') => {
    try {
      setLoading(true);
      
      console.log('🚀 === HANDLE PAYMENT ACTION CALLED ===');
      console.log('🚀 Project ID:', projectId);
      console.log('🚀 Action:', action);
      console.log('🚀 Notes:', notes);
      
      console.log('💰 Handling payment action:', { projectId, action, notes });
      
      // First, find the payment record for this project
      const paymentResponse = await fetch(getApiEndpoint(`/payments/by-project/${projectId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const paymentResult = await paymentResponse.json();
      
      if (!paymentResult.success || !paymentResult.data || paymentResult.data.length === 0) {
        throw new Error('Payment record not found for this project');
      }
      
      const payment = paymentResult.data[0];
      console.log('💰 Found payment record:', payment._id);
      
      // Update the Payment record status
      const paymentStatus = action === 'verified' ? 'completed' : 'rejected';
      console.log('💰 Updating payment status to:', paymentStatus);
      
      const paymentUpdateResponse = await fetch(getApiEndpoint(`/payments/${payment._id}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: paymentStatus,
          verification_status: action,
          verified_by: 'Admin',
          admin_notes: notes
          // Don't send verified_at - let the backend set it
        })
      });
      
      console.log('💰 Payment update response status:', paymentUpdateResponse.status);
      const paymentUpdateResult = await paymentUpdateResponse.json();
      console.log('💰 Payment update result:', paymentUpdateResult);
      
      if (!paymentUpdateResult.success) {
        throw new Error('Failed to update payment status: ' + (paymentUpdateResult.message || paymentUpdateResult.error || 'Unknown error'));
      }
      
      console.log('✅ Payment status updated to:', paymentStatus);
      
      // Update project status based on action
      const newStatus = action === 'verified' ? 'active' : 'cancelled';
      
      const response = await fetch(getApiEndpoint(`/projects/${projectId}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: notes,
          verification_status: action,
          verified_at: new Date().toISOString(),
          verified_by: 'Admin' // You can get this from user context if available
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Project status updated to:', newStatus);
        
        // If payment was verified, remove any existing invoice from state
        // so it shows "Generate Invoice" button instead of download
        if (action === 'verified') {
          setExistingInvoices(prev => {
            const updated = { ...prev };
            delete updated[projectId]; // Remove invoice for this project
            console.log(`Removed invoice state for newly confirmed project: ${projectId}`);
            return updated;
          });
        }
        
        await loadProjectsData();
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setApprovalData({ verification_status: '', admin_notes: '' });
        alert(`Payment ${action === 'verified' ? 'approved' : 'rejected'} successfully!`);
      } else {
        throw new Error(result.message || result.error?.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (projectId) => {
    try {
      setLoading(true);
      console.log('Generating invoice for project:', projectId);
      
      // Clear any existing invoice state for this project first
      setExistingInvoices(prev => {
        const updated = { ...prev };
        delete updated[projectId];
        console.log(`Cleared existing invoice state for project ${projectId} before generation`);
        return updated;
      });
      
      // API call to generate invoice for project
      const response = await fetch(getApiEndpoint(`/projects/${projectId}/invoice`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        console.log('Invoice generated successfully:', result.data);
        
        // Show success message
        alert(`Invoice ${result.data.invoice_number} generated successfully!`);
        
        // Update the existing invoices state with the new invoice for this specific project
        setExistingInvoices(prev => {
          const updated = {
            ...prev,
            [projectId]: result.data
          };
          console.log('Updated existingInvoices state:', updated);
          console.log(`Invoice for project ${projectId} set to:`, result.data);
          return updated;
        });
        
        // Update the selected payment with invoice info if it matches
        if (selectedPayment && selectedPayment._id === projectId) {
          setSelectedPayment(prev => ({
            ...prev,
            invoice_id: result.data._id,
            invoice_number: result.data.invoice_number
          }));
        }
        
        // Auto-download the generated invoice
        setTimeout(() => {
          downloadInvoice(result.data._id);
        }, 500); // Small delay to ensure state is updated
        
      } else {
        throw new Error(result.error?.message || result.message || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      console.log('Downloading invoice with ID:', invoiceId);
      
      // Use fetch to get the invoice as a blob
      const response = await fetch(getApiEndpoint(`/invoices/${invoiceId}/download`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: localStorage.getItem('token')
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `invoice-${invoiceId}.html`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      console.log('Downloading file:', filename);

      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Invoice download completed successfully');
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkForExistingInvoice = async (projectId) => {
    try {
      console.log(`Checking for existing invoice for project: ${projectId}`);
      // Check if invoice already exists for this project
      const response = await fetch(getApiEndpoint(`/invoices?project=${projectId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log(`Invoice API response for project ${projectId}:`, result);
      
      if (result.success && result.data && result.data.length > 0) {
        console.log(`Found ${result.data.length} invoices for project ${projectId}, returning first one:`, result.data[0]);
        return result.data[0]; // Return the first invoice found
      }
      console.log(`No invoices found for project ${projectId}`);
      return null;
    } catch (error) {
      console.error(`Error checking for existing invoice for project ${projectId}:`, error);
      return null;
    }
  };

  const viewPaymentDetails = async (project, type = 'view') => {
    console.log('Admin: Opening payment details modal for project:', project);
    console.log('Admin: Project receipt fields:', {
      payment_receipt: project.payment_receipt,
      receipt_screenshot: project.receipt_screenshot,
      receipt_path: project.receipt_path
    });
    
    // Start with project data as base
    let paymentData = { ...project };
    
    // If this is a project with payment_receipt, ensure it's accessible
    if (project.payment_receipt) {
      console.log('✅ Admin: Project has payment_receipt:', project.payment_receipt);
      paymentData.receipt_screenshot = project.payment_receipt;
      paymentData.payment_receipt = project.payment_receipt;
    }
    
    // Try to find the Payment record linked to this project using the new endpoint
    console.log('🔍 Admin: Looking for payment record linked to project:', project._id);
    try {
      const response = await fetch(getApiEndpoint(`/payments/by-project/${project._id}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      console.log('📡 Admin: Payment API response for project:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        const linkedPayment = result.data[0]; // Get the first payment for this project
        console.log('✅ Admin: Found linked payment record:', linkedPayment);
        console.log('✅ Admin: Payment receipt fields:', {
          receipt_screenshot: linkedPayment.receipt_screenshot,
          payment_receipt: linkedPayment.payment_receipt,
          receipt_path: linkedPayment.receipt_path
        });
        
        // Merge payment data, giving priority to payment record for receipt fields
        paymentData = {
          ...paymentData,
          payment_id: linkedPayment._id,
          // Use payment record receipt if available, otherwise keep project receipt
          receipt_screenshot: linkedPayment.receipt_screenshot || paymentData.receipt_screenshot,
          receipt_path: linkedPayment.receipt_path || paymentData.receipt_path,
          // Also ensure payment_receipt field is set for compatibility
          payment_receipt: linkedPayment.receipt_screenshot || paymentData.payment_receipt,
          // Merge other payment-specific fields INCLUDING payment status
          payment_status: linkedPayment.status, // This is the actual payment status (due, pending, completed, etc.)
          verification_status: linkedPayment.verification_status || paymentData.verification_status,
          submitted_at: linkedPayment.submitted_at,
          verified_at: linkedPayment.verified_at || paymentData.verified_at,
          verified_by: linkedPayment.verified_by || paymentData.verified_by
        };
        console.log('✅ Admin: Merged payment data with receipt info:', {
          receipt_screenshot: paymentData.receipt_screenshot,
          payment_receipt: paymentData.payment_receipt,
          receipt_path: paymentData.receipt_path,
          payment_status: paymentData.payment_status
        });
      } else {
        console.log('⚠️ Admin: No payment record found linked to this project');
      }
    } catch (error) {
      console.error('❌ Admin: Error loading linked payment:', error);
    }
    
    console.log('✅ Admin: Final payment data for modal:', paymentData);
    console.log('✅ Admin: Final receipt fields:', {
      receipt_screenshot: paymentData.receipt_screenshot,
      payment_receipt: paymentData.payment_receipt,
      receipt_path: paymentData.receipt_path,
      payment_status: paymentData.payment_status,
      hasReceipt: !!(paymentData.receipt_screenshot || paymentData.payment_receipt)
    });
    
    setSelectedPayment(paymentData);
    setModalType(type);
    if (type === 'approve') {
      setApprovalData({ verification_status: 'verified', admin_notes: '' });
    } else if (type === 'reject') {
      setApprovalData({ verification_status: 'rejected', admin_notes: '' });
    }
    setShowPaymentModal(true);
  };

  const getFilteredProjects = () => {
    let filtered = projects;
    
    // Filter by tab using payment_status if available
    if (activeTab === 'pending') {
      filtered = filtered.filter(p => {
        const status = p.payment_status || p.status;
        const statusLower = status?.toLowerCase().trim();
        // Include: pending, pending_verification, due
        const isPending = statusLower === 'pending' || 
                         statusLower === 'pending_verification' || 
                         statusLower === 'due' ||
                         statusLower.includes('pending');
        
        console.log(`🔍 Pending filter check for ${p._id}:`, {
          service: p.service_name,
          status: status,
          statusLower: statusLower,
          isPending: isPending
        });
        
        return isPending;
      });
    } else if (activeTab === 'verified') {
      filtered = filtered.filter(p => {
        const status = p.payment_status || p.status;
        const statusLower = status?.toLowerCase().trim();
        return statusLower === 'verified' || statusLower === 'completed';
      });
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(p => {
        const status = p.payment_status || p.status;
        const statusLower = status?.toLowerCase().trim();
        return statusLower === 'rejected' || statusLower === 'cancelled';
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusBadgeStyle = (project) => {
    // Check if there's a payment status to use instead of project status
    const status = project.payment_status || project.status;
    
    const statusStyles = {
      // Payment statuses
      'due': { background: '#f59e0b', color: 'white' },
      'pending': { background: '#f59e0b', color: 'white' },
      'pending_verification': { background: '#f59e0b', color: 'white' },
      'verified': { background: '#10b981', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'rejected': { background: '#ef4444', color: 'white' },
      // Project statuses (fallback)
      'active': { background: '#3b82f6', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'cancelled': { background: '#ef4444', color: 'white' },
      'on_hold': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  const getStatusDisplayText = (project) => {
    // Check if there's a linked payment record with actual payment status
    // If payment exists, use payment status; otherwise use project status
    const paymentStatus = project.payment_status || project.verification_status;
    
    // If we have a payment status, use it
    if (paymentStatus) {
      const paymentStatusText = {
        'due': 'Payment Due',
        'pending': 'Payment Pending',
        'pending_verification': 'Pending Verification',
        'verified': 'Payment Confirmed',
        'completed': 'Payment Confirmed',
        'rejected': 'Payment Rejected'
      };
      return paymentStatusText[paymentStatus] || paymentStatus;
    }
    
    // Otherwise, map project status to payment status
    const projectStatusText = {
      'pending': 'Payment Pending',
      'active': 'Payment Due', // Active project doesn't mean payment is confirmed
      'in_progress': 'Payment Due',
      'completed': 'Completed',
      'cancelled': 'Payment Rejected',
      'on_hold': 'On Hold'
    };
    return projectStatusText[project.status] || project.status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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
        {typeof number === 'string' ? number : number.toLocaleString()}
      </h4>
      <small style={{ color: designSystem.colors.gray[500] }}>
        {label}
      </small>
    </div>
  );

  return (
    <div style={componentStyles.managementCard}>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-credit-card fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Client Payments Management</h4>
            <p style={componentStyles.headerSubtitle}>Review and verify client service payments with receipt screenshots</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: designSystem.colors.success
            }}
            onClick={() => {
              loadPaymentsData();
              loadProjectsData();
            }}
            {...hoverEffects.button}
          >
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div style={componentStyles.statsContainer}>
        <StatCard
          icon="fas fa-clock"
          number={stats.pending}
          label="Pending Verification"
          borderColor="#f59e0b"
          iconColor="#f59e0b"
        />
        <StatCard
          icon="fas fa-check-circle"
          number={stats.verified}
          label="Verified Payments"
          borderColor="#10b981"
          iconColor="#10b981"
        />
        <StatCard
          icon="fas fa-times-circle"
          number={stats.rejected}
          label="Rejected Payments"
          borderColor="#ef4444"
          iconColor="#ef4444"
        />
        <StatCard
          icon="fas fa-dollar-sign"
          number={formatCurrency(stats.totalAmount)}
          label="Total Revenue"
          borderColor="#8b5cf6"
          iconColor="#8b5cf6"
        />
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: designSystem.spacing.lg,
        gap: designSystem.spacing.md,
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search by client name, email, service, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...componentStyles.formInput,
              width: '100%',
              padding: designSystem.spacing.md,
              fontSize: designSystem.typography.fontSize.sm
            }}
          />
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: designSystem.spacing.xs }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('all')}
            {...hoverEffects.button}
          >
            All ({stats.total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? designSystem.colors.warning : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({stats.pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'verified' ? designSystem.colors.success : designSystem.colors.gray[100],
              color: activeTab === 'verified' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('verified')}
            {...hoverEffects.button}
          >
            Verified ({stats.verified})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'rejected' ? designSystem.colors.danger : designSystem.colors.gray[100],
              color: activeTab === 'rejected' ? 'white' : designSystem.colors.gray[600],
              fontSize: designSystem.typography.fontSize.sm
            }}
            onClick={() => setActiveTab('rejected')}
            {...hoverEffects.button}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={componentStyles.loading}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
          <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>Loading payments...</p>
        </div>
      )}

      {/* Payments Table */}
      {!loading && (
        <div style={{ borderRadius: designSystem.borderRadius.button, overflow: 'hidden', boxShadow: designSystem.shadows.card }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={componentStyles.tableHeader}>
              <tr>
                <th style={componentStyles.tableHeaderCell}>Payment ID</th>
                <th style={componentStyles.tableHeaderCell}>Client</th>
                <th style={componentStyles.tableHeaderCell}>Service</th>
                <th style={componentStyles.tableHeaderCell}>Amount</th>
                <th style={componentStyles.tableHeaderCell}>Method</th>
                <th style={componentStyles.tableHeaderCell}>Status</th>
                <th style={componentStyles.tableHeaderCell}>Date</th>
                <th style={componentStyles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredProjects().length === 0 ? (
                <tr>
                  <td colSpan="8" style={componentStyles.emptyState}>
                    <i className="fas fa-credit-card fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                    <p style={{ color: designSystem.colors.gray[500] }}>
                      {searchTerm ? 'No payments found matching your search' : 
                       activeTab === 'all' ? 'No service payments found in the system' : 
                       `No ${activeTab} payments found`}
                    </p>
                  </td>
                </tr>
              ) : (
                getFilteredProjects().map((project) => {
                  const statusStyle = getStatusBadgeStyle(project);
                  
                  return (
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
                          #{project._id.slice(-8).toUpperCase()}
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
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.bold,
                          fontSize: '16px',
                          color: designSystem.colors.success
                        }}>
                          {formatCurrency(project.amount)}
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          background: designSystem.colors.gray[200],
                          color: designSystem.colors.gray[700],
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {(() => {
                            const paymentStatus = project.payment_status || project.status;
                            const statusLower = paymentStatus?.toLowerCase().trim();
                            const isDue = statusLower === 'due';
                            
                            // If payment is due (not yet paid), show "Pending" instead of payment method
                            if (isDue) {
                              return 'Pending';
                            }
                            
                            // Otherwise show the payment method
                            return project.payment_method || 'N/A';
                          })()}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <span style={{
                          ...componentStyles.badge,
                          background: statusStyle.background,
                          color: statusStyle.color,
                          textTransform: 'uppercase',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {getStatusDisplayText(project)}
                        </span>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div>
                          <div style={{ fontWeight: designSystem.typography.fontWeight.medium }}>
                            {new Date(project.purchase_date || project.createdAt).toLocaleDateString()}
                          </div>
                          <small style={{ color: designSystem.colors.gray[500] }}>
                            {new Date(project.purchase_date || project.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td style={componentStyles.tableCell}>
                        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
                          {/* Always show view button */}
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => viewPaymentDetails(project, 'view')}
                            title="View Payment Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          {/* Debug logging and button rendering */}
                          {(() => {
                            const paymentStatus = project.payment_status || project.status;
                            const statusLower = paymentStatus?.toLowerCase().trim();
                            const isDue = statusLower === 'due';
                            const isPending = statusLower === 'pending' || 
                                            statusLower === 'pending_verification' || 
                                            statusLower?.includes('pending');
                            const isVerified = statusLower === 'verified' || statusLower === 'completed';
                            
                            console.log(`🔘 Button Logic for ${project._id}:`, {
                              serviceName: project.service_name,
                              projectStatus: project.status,
                              paymentStatus: project.payment_status,
                              finalStatus: paymentStatus,
                              statusLower: statusLower,
                              isDue: isDue,
                              isPending: isPending,
                              isVerified: isVerified,
                              hasReceipt: !!(project.receipt_screenshot || project.payment_receipt)
                            });
                            
                            // Show approve/reject for pending payments (with receipt)
                            if (isPending && !isDue) {
                              return (
                                <>
                                  <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => viewPaymentDetails(project, 'approve')}
                                    title="Approve Payment"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button 
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => viewPaymentDetails(project, 'reject')}
                                    title="Reject Payment"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              );
                            }
                            
                            // Show invoice buttons for verified payments
                            if (isVerified) {
                              const hasInvoice = existingInvoices[project._id];
                              console.log(`🧾 Invoice check for ${project._id}:`, { hasInvoice: !!hasInvoice });
                              
                              if (hasInvoice) {
                                // Show download invoice button
                                return (
                                  <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => {
                                      console.log(`📥 Downloading invoice:`, hasInvoice);
                                      downloadInvoice(hasInvoice._id);
                                    }}
                                    title={`Download Invoice #${hasInvoice.invoice_number}`}
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                      <i className="fas fa-download"></i>
                                    )}
                                  </button>
                                );
                              } else {
                                // Show generate invoice button
                                return (
                                  <button 
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => generateInvoice(project._id)}
                                    title="Generate Invoice"
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                      <i className="fas fa-file-invoice"></i>
                                    )}
                                  </button>
                                );
                              }
                            }
                            
                            return null;
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Details/Action Modal */}
      {showPaymentModal && selectedPayment && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div 
            className="modal-dialog modal-xl"
            style={{ 
              position: 'relative',
              width: 'auto',
              margin: '1.75rem auto',
              maxWidth: '1200px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-credit-card me-2"></i>
                  {modalType === 'view' ? 'Service Payment Details' : 
                   modalType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.lg }}>
                  {/* Left Column - Payment Details */}
                  <div>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-info-circle me-2"></i>Payment Information
                    </h6>
                    <div style={{ display: 'grid', gap: designSystem.spacing.md }}>
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Payment ID</label>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.semibold,
                          fontFamily: 'monospace',
                          fontSize: designSystem.typography.fontSize.lg,
                          color: designSystem.colors.primary
                        }}>
                          #{selectedPayment._id.slice(-8).toUpperCase()}
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Amount</label>
                        <div style={{ 
                          fontWeight: designSystem.typography.fontWeight.bold,
                          fontSize: designSystem.typography.fontSize.xl,
                          color: designSystem.colors.success
                        }}>
                          {formatCurrency(selectedPayment.amount)}
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Client Information</label>
                        <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                          <div>{selectedPayment.client?.name || 'Unknown Client'}</div>
                          <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                            {selectedPayment.client?.email || 'No email'}
                          </small>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Service & Method</label>
                        <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{
                            background: '#8b5cf6',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {selectedPayment.service_name || 'Unknown Service'}
                          </span>
                          <span style={{
                            background: designSystem.colors.gray[200],
                            color: designSystem.colors.gray[700],
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {selectedPayment.payment_method || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Status</label>
                        <span style={{
                          background: getStatusBadgeStyle(selectedPayment).background,
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          fontWeight: '600'
                        }}>
                          {getStatusDisplayText(selectedPayment)}
                        </span>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Purchase Date</label>
                        <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                          <div>{new Date(selectedPayment.purchase_date || selectedPayment.createdAt).toLocaleDateString()}</div>
                          <small style={{ color: designSystem.colors.gray[500], fontWeight: 'normal' }}>
                            {new Date(selectedPayment.purchase_date || selectedPayment.createdAt).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>

                      {/* Invoice Status */}
                      <div>
                        <label style={{ 
                          display: 'block',
                          fontSize: designSystem.typography.fontSize.sm,
                          color: designSystem.colors.gray[500],
                          marginBottom: designSystem.spacing.xs
                        }}>Invoice Status</label>
                        <div style={{ display: 'flex', gap: designSystem.spacing.sm, alignItems: 'center' }}>
                          {existingInvoices[selectedPayment._id] ? (
                            <>
                              <span style={{
                                background: designSystem.colors.success,
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}>
                                <i className="fas fa-check-circle me-1"></i>
                                Invoice Generated
                              </span>
                              <small style={{ color: designSystem.colors.gray[600] }}>
                                #{existingInvoices[selectedPayment._id].invoice_number}
                              </small>
                            </>
                          ) : (
                            <span style={{
                              background: designSystem.colors.gray[400],
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600'
                            }}>
                              <i className="fas fa-clock me-1"></i>
                              No Invoice
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Service Description */}
                      {selectedPayment.description && (
                        <div>
                          <label style={{ 
                            display: 'block',
                            fontSize: designSystem.typography.fontSize.sm,
                            color: designSystem.colors.gray[500],
                            marginBottom: designSystem.spacing.xs
                          }}>Service Description</label>
                          <div style={{ 
                            background: designSystem.colors.gray[50],
                            padding: designSystem.spacing.md,
                            borderRadius: '8px',
                            border: `1px solid ${designSystem.colors.gray[200]}`,
                            fontStyle: 'italic'
                          }}>
                            {selectedPayment.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Payment Receipt Screenshot */}
                  <div>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-receipt me-2"></i>Payment Receipt
                    </h6>
                    
                    {(() => {
                      const receiptFile = selectedPayment.receipt_screenshot || selectedPayment.payment_receipt;
                      const baseUrl = getStaticFileBaseUrl();
                      const fullUrl = `${baseUrl}/uploads/payment-receipts/${receiptFile}`;
                      
                      console.log('🖼️ Modal receipt display check:', {
                        receipt_screenshot: selectedPayment.receipt_screenshot,
                        payment_receipt: selectedPayment.payment_receipt,
                        finalFile: receiptFile,
                        baseUrl: baseUrl,
                        fullUrl: fullUrl,
                        hasReceiptFile: !!receiptFile
                      });
                      
                      return receiptFile;
                    })() ? (
                      <div style={{ 
                        textAlign: 'center',
                        border: `2px solid ${designSystem.colors.gray[200]}`,
                        borderRadius: '8px',
                        padding: designSystem.spacing.lg,
                        background: designSystem.colors.gray[50]
                      }}>
                        <i className="fas fa-receipt fa-4x" style={{ 
                          color: designSystem.colors.success,
                          marginBottom: designSystem.spacing.md
                        }}></i>
                        
                        <h6 style={{ 
                          color: designSystem.colors.gray[700], 
                          marginBottom: designSystem.spacing.md,
                          fontWeight: designSystem.typography.fontWeight.semibold
                        }}>
                          Payment Receipt Available
                        </h6>
                        
                        <p style={{ 
                          color: designSystem.colors.gray[600],
                          marginBottom: designSystem.spacing.lg,
                          fontSize: designSystem.typography.fontSize.sm
                        }}>
                          Client has uploaded a payment receipt. Use the buttons below to preview or download the receipt.
                        </p>

                        <div style={{ 
                          display: 'flex', 
                          gap: designSystem.spacing.md, 
                          justifyContent: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <button 
                            style={{
                              padding: '12px 24px',
                              background: designSystem.colors.primary,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: designSystem.shadows.button
                            }}
                            onClick={() => {
                              const filename = selectedPayment.receipt_screenshot || selectedPayment.payment_receipt;
                              const previewUrl = getApiEndpoint(`/debug/serve-image/payment-receipts/${filename}`);
                              window.open(previewUrl, '_blank');
                            }}
                          >
                            <i className="fas fa-eye"></i>
                            Preview Receipt
                          </button>
                          
                          <button 
                            style={{
                              padding: '12px 24px',
                              background: designSystem.colors.success,
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: designSystem.shadows.button
                            }}
                            onClick={() => {
                              const filename = selectedPayment.receipt_screenshot || selectedPayment.payment_receipt;
                              const downloadUrl = getApiEndpoint(`/debug/download-image/payment-receipts/${filename}`);
                              window.open(downloadUrl, '_blank');
                            }}
                          >
                            <i className="fas fa-download"></i>
                            Download Receipt
                          </button>
                        </div>

                        <div style={{
                          marginTop: designSystem.spacing.md,
                          padding: designSystem.spacing.sm,
                          background: designSystem.colors.success + '20',
                          borderRadius: '6px',
                          border: `1px solid ${designSystem.colors.success}`,
                          color: designSystem.colors.success,
                          fontSize: designSystem.typography.fontSize.sm
                        }}>
                          <i className="fas fa-check-circle me-2"></i>
                          Receipt uploaded by client
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: designSystem.spacing.xl,
                        border: `2px dashed ${designSystem.colors.gray[300]}`,
                        borderRadius: '8px',
                        background: designSystem.colors.gray[50]
                      }}>
                        <i className="fas fa-image fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
                        <p style={{ color: designSystem.colors.gray[500], marginBottom: designSystem.spacing.sm }}>
                          No payment receipt uploaded
                        </p>
                        <small style={{ color: designSystem.colors.gray[400] }}>
                          Client did not provide payment screenshot
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Notes Section for Approval/Rejection */}
                {(modalType === 'approve' || modalType === 'reject') && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-sticky-note me-2"></i>Admin Notes
                    </h6>
                    <textarea
                      style={{
                        ...componentStyles.formInput,
                        width: '100%',
                        minHeight: '100px',
                        resize: 'vertical'
                      }}
                      value={approvalData.admin_notes}
                      onChange={(e) => setApprovalData({ ...approvalData, admin_notes: e.target.value })}
                      placeholder={`Add notes for ${modalType === 'approve' ? 'approving' : 'rejecting'} this payment...`}
                    />
                  </div>
                )}

                {/* Previous Admin Notes */}
                {selectedPayment.admin_notes && (
                  <div style={{ marginTop: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md, color: designSystem.colors.primary }}>
                      <i className="fas fa-history me-2"></i>Previous Admin Notes
                    </h6>
                    <div style={{ 
                      background: designSystem.colors.gray[50],
                      padding: designSystem.spacing.md,
                      borderRadius: '8px',
                      border: `1px solid ${designSystem.colors.gray[200]}`,
                      fontStyle: 'italic'
                    }}>
                      {selectedPayment.admin_notes}
                    </div>
                  </div>
                )}

                {/* Action Guidelines */}
                {(modalType === 'approve' || modalType === 'reject') && (
                  <div style={{
                    marginTop: designSystem.spacing.lg,
                    padding: designSystem.spacing.md,
                    background: modalType === 'approve' ? designSystem.colors.success + '10' : designSystem.colors.danger + '10',
                    border: `1px solid ${modalType === 'approve' ? designSystem.colors.success : designSystem.colors.danger}`,
                    borderRadius: '8px'
                  }}>
                    <h6 style={{ 
                      color: modalType === 'approve' ? designSystem.colors.success : designSystem.colors.danger,
                      marginBottom: designSystem.spacing.sm
                    }}>
                      <i className={`fas fa-${modalType === 'approve' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                      {modalType === 'approve' ? 'Approval Guidelines' : 'Rejection Guidelines'}
                    </h6>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: designSystem.spacing.lg,
                      color: designSystem.colors.gray[600],
                      fontSize: designSystem.typography.fontSize.sm
                    }}>
                      {modalType === 'approve' ? (
                        <>
                          <li>Verify the payment receipt matches the service amount</li>
                          <li>Confirm payment method and transaction details</li>
                          <li>Check client information for accuracy</li>
                          <li>Approving will activate the service for the client</li>
                        </>
                      ) : (
                        <>
                          <li>Provide clear reason for rejection in admin notes</li>
                          <li>Check for insufficient payment amount or invalid receipt</li>
                          <li>Verify if payment method is acceptable</li>
                          <li>Rejecting will cancel the service request</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                
                {modalType === 'approve' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handlePaymentAction(selectedPayment._id, 'verified', approvalData.admin_notes)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Approving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Approve Payment
                      </>
                    )}
                  </button>
                )}
                {modalType === 'reject' && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handlePaymentAction(selectedPayment._id, 'rejected', approvalData.admin_notes)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times me-2"></i>
                        Reject Payment
                      </>
                    )}
                  </button>
                )}
                {modalType === 'view' && (() => {
                  // Check payment status, not project status
                  const paymentStatus = selectedPayment.payment_status || selectedPayment.verification_status;
                  const statusLower = paymentStatus?.toLowerCase().trim();
                  const isVerified = statusLower === 'verified' || statusLower === 'completed';
                  
                  console.log('🧾 Invoice button check:', {
                    paymentStatus: paymentStatus,
                    statusLower: statusLower,
                    isVerified: isVerified,
                    projectStatus: selectedPayment.status
                  });
                  
                  // Only show invoice buttons if payment is verified/completed
                  return isVerified;
                })() && (
                  <>
                    {/* Show Generate Invoice button if no invoice exists */}
                    {!existingInvoices[selectedPayment._id] && (
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => generateInvoice(selectedPayment._id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-invoice me-2"></i>
                            Generate Invoice
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Show Download Invoice button if invoice exists */}
                    {existingInvoices[selectedPayment._id] && (
                      <button 
                        type="button" 
                        className="btn btn-success me-2"
                        onClick={() => downloadInvoice(existingInvoices[selectedPayment._id]._id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download me-2"></i>
                            Download Invoice
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Show Generate New Invoice button if invoice exists (for regeneration) */}
                    {existingInvoices[selectedPayment._id] && (
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={() => generateInvoice(selectedPayment._id)}
                        disabled={loading}
                        title="Generate a new invoice (will replace existing one)"
                      >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-invoice me-2"></i>
                            Generate New
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;