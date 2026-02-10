import { useState, useEffect } from 'react';
import { designSystem, componentStyles, hoverEffects, getStatusBadgeStyle } from '../../../../styles/designSystem';
import { getApiEndpoint } from '../../../../utils/apiConfig';

const ClientPayments = ({ clientData, apiCall, onRefresh }) => {
  const [purchasedServices, setPurchasedServices] = useState([]);
  const [payments, setPayments] = useState([]); // NEW: Separate payments state
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // NEW: Payment submission modal
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null); // NEW: Selected payment for submission
  const [paymentFormData, setPaymentFormData] = useState({ // NEW: Payment form data
    payment_method: 'bank_transfer',
    payment_screenshot: null,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false); // NEW: Submission state
  const [existingInvoices, setExistingInvoices] = useState({});
  const [error, setError] = useState(null); // Add error state
  const [stats, setStats] = useState({
    total: 0,
    due:0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    totalAmount: 0,
    paidAmount: 0
  });

  useEffect(() => {
    if (clientData?.email) {
      console.log('🔄 ClientPayments mounted, loading data for:', clientData.email);
      loadData().catch(err => {
        console.error('❌ Error in loadData:', err);
        setError(err.message);
        setLoading(false);
      });
    } else {
      console.warn('⚠️ No client email found in clientData:', clientData);
      setLoading(false);
    }
  }, [clientData]);

  const loadData = async () => {
    // Load payments first, then projects
    const loadedPayments = await loadPayments();
    await loadPurchasedServices(loadedPayments);
  };

  const loadPayments = async () => {
    try {
      console.log('💳 Loading payment records for client:', clientData?.email);
      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      const response = await apiCall(`/payments?_t=${timestamp}`);
      console.log('💳 Payment API response:', response);
      if (response.success) {
        const paymentRecords = response.data || [];
        console.log('✅ Payment records loaded:', paymentRecords.length);
        
        // Debug: Log each payment's status
        paymentRecords.forEach((payment, index) => {
          console.log(`💳 Payment ${index + 1}:`, {
            id: payment._id,
            service: payment.service_name,
            status: payment.status,
            statusType: typeof payment.status,
            amount: payment.amount,
            verification_status: payment.verification_status
          });
        });
        
        setPayments(paymentRecords);
        return paymentRecords; // Return for immediate use
      } else {
        console.error('❌ Failed to load payment records:', response.message);
        setPayments([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading payment records:', error);
      setPayments([]);
      return [];
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentFormData.payment_method) {
      alert('Please select a payment method');
      return;
    }
    
    if (!paymentFormData.payment_screenshot) {
      alert('Please upload payment receipt/screenshot');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('payment_method', paymentFormData.payment_method);
      formData.append('payment_screenshot', paymentFormData.payment_screenshot);
      formData.append('payment_date', new Date().toISOString());
      if (paymentFormData.notes) {
        formData.append('notes', paymentFormData.notes);
      }
      
      // Use payment_id if available, otherwise use project _id
      const paymentId = selectedPayment.payment_id || selectedPayment._id;
      console.log('💳 Submitting payment for:', {
        projectId: selectedPayment._id,
        paymentId: paymentId,
        hasPaymentId: !!selectedPayment.payment_id
      });
      
      const response = await apiCall(`/payments/${paymentId}/submit-payment`, {
        method: 'PATCH',
        body: formData
      });
      
      if (response.success) {
        alert('Payment submitted successfully! Your payment is now pending verification by our team.');
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setPaymentFormData({
          payment_method: 'bank_transfer',
          payment_screenshot: null,
          notes: ''
        });
        // Reload data
        loadPayments();
        loadPurchasedServices();
      } else {
        throw new Error(response.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('❌ Error submitting payment:', error);
      alert(`Failed to submit payment: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image (JPEG, PNG, GIF) or PDF file');
        return;
      }
      setPaymentFormData(prev => ({ ...prev, payment_screenshot: file }));
    }
  };

  const loadPurchasedServices = async (loadedPayments = payments) => {
    setLoading(true);
    try {
      // Load projects (purchased services) for this client with cache busting
      console.log('🔄 Loading purchased services for client:', clientData?.email);
      const timestamp = new Date().getTime();
      const response = await apiCall(`/projects?client=${clientData?.email}&_t=${timestamp}`);
      console.log('🔄 Projects API response:', response);
      
      if (response.success) {
        const services = response.data || [];
        console.log('✅ Purchased services loaded for client:', services.length, 'services');
        
        // Fetch payment status for each project
        const servicesWithPaymentStatus = await Promise.all(
          services.map(async (service) => {
            try {
              const paymentResponse = await apiCall(`/payments/by-project/${service._id}`);
              
              if (paymentResponse.success && paymentResponse.data && paymentResponse.data.length > 0) {
                const payment = paymentResponse.data[0];
                console.log(`💳 Client: Found payment for project ${service._id}:`, payment.status);
                return {
                  ...service,
                  payment_status: payment.status, // Add actual payment status
                  payment_id: payment._id,
                  payment_receipt: payment.receipt_screenshot || service.payment_receipt,
                  receipt_screenshot: payment.receipt_screenshot || service.receipt_screenshot
                };
              }
              
              // No payment record found, return service as-is
              console.log(`⚠️ Client: No payment record for project ${service._id}`);
              return service;
            } catch (error) {
              console.error(`❌ Client: Error fetching payment for project ${service._id}:`, error);
              return service;
            }
          })
        );
        
        // DETAILED DEBUG: Log each service status for debugging
        console.log('\n========== DETAILED SERVICE STATUS DEBUG ==========');
        servicesWithPaymentStatus.forEach((service, index) => {
          console.log(`\n📦 Service ${index + 1}/${servicesWithPaymentStatus.length}:`);
          console.log(`   ID: ${service._id}`);
          console.log(`   Name: ${service.service_name}`);
          console.log(`   Project Status: "${service.status}"`);
          console.log(`   Payment Status: "${service.payment_status}"`);
          console.log(`   Amount: ${service.amount}`);
          console.log(`   Payment Method: ${service.payment_method}`);
          console.log(`   Payment Receipt: ${service.payment_receipt}`);
          
          // Check what the status should be categorized as
          const paymentStatus = service.payment_status || service.status;
          const statusLower = paymentStatus?.toLowerCase().trim();
          const isDue = statusLower === 'due';
          const isPending = statusLower === 'pending' || statusLower === 'pending_verification';
          const isConfirmed = statusLower === 'verified' || statusLower === 'completed' || statusLower === 'active' || statusLower === 'in_progress';
          console.log(`   → Should be in DUE tab: ${isDue}`);
          console.log(`   → Should be in PENDING tab: ${isPending}`);
          console.log(`   → Should be in CONFIRMED tab: ${isConfirmed}`);
        });
        console.log('\n========== END DEBUG ==========\n');
        
        setPurchasedServices(servicesWithPaymentStatus);
        
        // Load existing invoices for confirmed services
        await loadExistingInvoices(servicesWithPaymentStatus);
        
        // Calculate stats including payment records - use loadedPayments parameter
        console.log('📊 Calculating stats with payments:', loadedPayments.length);
        
        // Get list of project IDs that have payment records to avoid double counting
        const projectIdsWithPayments = new Set(
          loadedPayments
            .filter(p => p.project?._id || p.project)
            .map(p => (p.project?._id || p.project).toString())
        );
        
        // Filter out projects that have payment records
        const projectsWithoutPayments = servicesWithPaymentStatus.filter(s => !projectIdsWithPayments.has(s._id.toString()));
        
        console.log('📊 Projects with payments:', projectIdsWithPayments.size);
        console.log('📊 Projects without payments:', projectsWithoutPayments.length);
        
        // NEW STATS CALCULATION: Use payment_status when available
        const allProjects = servicesWithPaymentStatus;
        
        // Count projects by their payment status (or project status as fallback)
        const projectsByStatus = {
          due: allProjects.filter(s => {
            const status = s.payment_status || s.status;
            return status?.toLowerCase().trim() === 'due';
          }).length,
          pending: allProjects.filter(s => {
            const status = s.payment_status || s.status;
            const statusLower = status?.toLowerCase().trim();
            return statusLower === 'pending' || statusLower === 'pending_verification';
          }).length,
          confirmed: allProjects.filter(s => {
            const status = s.payment_status || s.status;
            const statusLower = status?.toLowerCase().trim();
            return statusLower === 'verified' || statusLower === 'completed' || statusLower === 'active' || statusLower === 'in_progress';
          }).length,
          rejected: allProjects.filter(s => {
            const status = s.payment_status || s.status;
            const statusLower = status?.toLowerCase().trim();
            return statusLower === 'cancelled' || statusLower === 'rejected';
          }).length
        };
        
        // Count standalone payments (those without corresponding projects)
        const projectIds = new Set(allProjects.map(s => s._id.toString()));
        const standalonePayments = loadedPayments.filter(p => {
          const projectId = p.project?._id || p.project;
          const hasProject = projectId && projectIds.has(projectId.toString());
          return !hasProject;
        });
        
        const paymentsByStatus = {
          due: standalonePayments.filter(p => p.status === 'due').length,
          pending: standalonePayments.filter(p => p.status === 'pending_verification').length,
          confirmed: standalonePayments.filter(p => p.status === 'completed').length,
          rejected: standalonePayments.filter(p => p.status === 'failed').length
        };
        
        console.log('📊 All projects count:', allProjects.length);
        console.log('📊 Projects by status:', projectsByStatus);
        console.log('📊 Standalone payments count:', standalonePayments.length);
        console.log('📊 Standalone payments by status:', paymentsByStatus);
        
        const calculatedStats = {
          total: allProjects.length + standalonePayments.length,
          due: projectsByStatus.due + paymentsByStatus.due,
          pending: projectsByStatus.pending + paymentsByStatus.pending,
          confirmed: projectsByStatus.confirmed + paymentsByStatus.confirmed,
          rejected: projectsByStatus.rejected + paymentsByStatus.rejected,
          totalAmount: allProjects.reduce((sum, s) => sum + (s.amount || 0), 0) + standalonePayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          paidAmount: (projectsByStatus.confirmed + paymentsByStatus.confirmed) * 1000 // Approximate
        };
        console.log('📊 Final calculated stats:', calculatedStats);
        setStats(calculatedStats);
      } else {
        console.error('❌ Failed to load purchased services:', response.message);
        setPurchasedServices([]);
      }
    } catch (error) {
      console.error('❌ Error loading purchased services:', error);
      setPurchasedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingInvoices = async (servicesData) => {
    try {
      console.log('\n========== INVOICE LOADING DEBUG ==========');
      console.log('🧾 Loading existing invoices for services:', servicesData.map(s => ({ 
        id: s._id, 
        name: s.service_name,
        status: s.status 
      })));
      const invoicesMap = {};
      
      // Check for existing invoices for confirmed services only
      // Match admin dashboard logic - check all confirmed services without time buffer for client view
      const confirmedServices = servicesData.filter(s => {
        const statusLower = s.status?.toLowerCase().trim();
        const isConfirmed = statusLower === 'active' || statusLower === 'in_progress' || statusLower === 'completed';
        console.log(`🧾 Service ${s._id} (${s.service_name}): status="${s.status}", statusLower="${statusLower}", isConfirmed=${isConfirmed}`);
        return isConfirmed;
      });
      
      console.log('🧾 Confirmed services to check for invoices:', confirmedServices.map(s => ({ 
        id: s._id, 
        name: s.service_name, 
        status: s.status 
      })));
      
      // Check for invoices for all confirmed services
      for (const service of confirmedServices) {
        console.log(`\n🧾 Checking invoice for service ${service._id} (${service.service_name})`);
        const invoice = await checkForExistingInvoice(service._id);
        if (invoice) {
          console.log(`✅ Found invoice for service ${service._id}:`, { 
            invoiceId: invoice._id, 
            invoiceNumber: invoice.invoice_number,
            projectId: invoice.project?._id || invoice.project
          });
          invoicesMap[service._id] = invoice;
        } else {
          console.log(`❌ No invoice found for service ${service._id}`);
        }
      }
      
      console.log('\n🧾 Final invoices map:', Object.keys(invoicesMap).map(key => ({
        serviceId: key,
        invoiceId: invoicesMap[key]._id,
        invoiceNumber: invoicesMap[key].invoice_number
      })));
      console.log('========== END INVOICE DEBUG ==========\n');
      
      setExistingInvoices(invoicesMap);
    } catch (error) {
      console.error('Error loading existing invoices:', error);
    }
  };

  const checkForExistingInvoice = async (projectId) => {
    try {
      // Add cache-busting timestamp to force fresh data
      const timestamp = new Date().getTime();
      console.log(`\n🧾 ========== CHECKING INVOICE FOR PROJECT ${projectId} ==========`);
      console.log(`🧾 API call: /invoices?project=${projectId}&_t=${timestamp}`);
      const response = await apiCall(`/invoices?project=${projectId}&_t=${timestamp}`);
      console.log(`🧾 Raw API response:`, response);
      console.log(`🧾 Response type:`, typeof response);
      console.log(`🧾 Response.success:`, response.success);
      console.log(`🧾 Response.data:`, response.data);
      console.log(`🧾 Response.data type:`, typeof response.data);
      console.log(`🧾 Response.data length:`, response.data?.length);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log(`✅ Found ${response.data.length} invoices for project ${projectId}`);
        response.data.forEach((inv, idx) => {
          console.log(`   Invoice ${idx + 1}:`, {
            id: inv._id,
            number: inv.invoice_number,
            projectId: inv.project?._id || inv.project,
            projectIdType: typeof (inv.project?._id || inv.project)
          });
        });
        
        // Find the invoice that matches this specific project (service purchase)
        const matchingInvoice = response.data.find(invoice => {
          const invoiceProjectId = invoice.project?._id || invoice.project;
          const invoiceProjectIdStr = invoiceProjectId?.toString();
          const projectIdStr = projectId?.toString();
          const matches = invoiceProjectIdStr === projectIdStr;
          console.log(`   🔍 Checking invoice ${invoice._id}:`, {
            invoiceProjectId: invoiceProjectIdStr,
            targetProjectId: projectIdStr,
            matches: matches
          });
          return matches;
        });
        
        if (matchingInvoice) {
          console.log(`✅ Found matching invoice for project ${projectId}:`, {
            invoiceId: matchingInvoice._id,
            invoiceNumber: matchingInvoice.invoice_number
          });
          console.log(`🧾 ========== END INVOICE CHECK (FOUND) ==========\n`);
          return matchingInvoice;
        } else {
          // If no exact match found, return the first invoice (fallback)
          console.log(`⚠️ No exact match found, using first invoice for project ${projectId}:`, {
            invoiceId: response.data[0]._id,
            invoiceNumber: response.data[0].invoice_number
          });
          console.log(`🧾 ========== END INVOICE CHECK (FALLBACK) ==========\n`);
          return response.data[0];
        }
      }
      console.log(`❌ No invoices found for project ${projectId}`);
      console.log(`   Reason: success=${response.success}, hasData=${!!response.data}, dataLength=${response.data?.length || 0}`);
      console.log(`🧾 ========== END INVOICE CHECK (NOT FOUND) ==========\n`);
      return null;
    } catch (error) {
      console.error(`❌ Error checking for existing invoice for project ${projectId}:`, error);
      console.log(`🧾 ========== END INVOICE CHECK (ERROR) ==========\n`);
      return null;
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      console.log('🧾 Starting download for invoice ID:', invoiceId);
      
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

      console.log('🧾 Downloading file:', filename);

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
      
      console.log('🧾 Download completed successfully for invoice:', invoiceId);
      
    } catch (error) {
      console.error('🧾 Error downloading invoice:', error);
      alert('Failed to download invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredServices = () => {
    // Combine payment records and project records, but prioritize projects
    let allItems = [];
    
    // Create a map of project IDs from payment records
    const paymentProjectIds = new Set(
      payments
        .filter(p => p.project?._id || p.project)
        .map(p => (p.project?._id || p.project).toString())
    );
    
    console.log('🔍 Payment records with project IDs:', Array.from(paymentProjectIds));
    
    // Add ALL projects (these have the correct status after admin approval)
    const projectItems = purchasedServices.map(s => ({
      ...s,
      _id: s._id,
      service_name: s.service_name,
      amount: s.amount,
      // Use payment_status if available, otherwise fall back to project status
      status: s.payment_status || s.status,
      payment_method: s.payment_method,
      payment_receipt: s.payment_receipt || s.receipt_screenshot,
      purchase_date: s.createdAt,
      isDuePayment: (s.payment_status || s.status) === 'due',
      isPaymentRecord: false,
      isProject: true
    }));
    
    // Add payment records ONLY if they don't have a corresponding project
    // This prevents duplicate entries
    const paymentItems = payments
      .filter(p => {
        const projectId = p.project?._id || p.project;
        const hasProject = projectId && purchasedServices.some(s => s._id.toString() === projectId.toString());
        console.log(`💳 Payment ${p._id}: has project=${hasProject}, projectId=${projectId}`);
        return !hasProject; // Only include if no corresponding project exists
      })
      .map(p => ({
        ...p,
        _id: p._id,
        service_name: p.service_name,
        amount: p.amount,
        status: p.status,
        payment_method: p.paymentMethod,
        payment_receipt: p.receipt_screenshot,
        purchase_date: p.createdAt,
        isDuePayment: p.status === 'due',
        isPaymentRecord: true,
        isProject: false
      }));
    
    console.log('🔍 Project items:', projectItems.length);
    console.log('🔍 Payment items (without projects):', paymentItems.length);
    
    // Combine: Projects first (they have correct status), then standalone payments
    allItems = [...projectItems, ...paymentItems];
    
    console.log('🔍 All items before filtering:', allItems.map(item => ({
      id: item._id,
      service: item.service_name,
      status: item.status,
      statusType: typeof item.status,
      isProject: item.isProject,
      isPaymentRecord: item.isPaymentRecord
    })));
    
    if (activeTab === 'all') return allItems;
    
    const filtered = allItems.filter(item => {
      const itemStatus = item.status?.toLowerCase().trim();
      console.log(`🔍 Filtering item ${item._id}: status="${itemStatus}", tab="${activeTab}", isProject=${item.isProject}`);
      
      switch (activeTab) {
        case 'due':
          return itemStatus === 'due';
        case 'pending':
          // ONLY show items that are truly pending - NOT confirmed ones
          // Pending means: waiting for admin verification
          const isPending = itemStatus === 'pending' || itemStatus === 'pending_verification';
          console.log(`  → isPending: ${isPending}`);
          return isPending;
        case 'confirmed':
          // Show confirmed payments - verified, completed, active, in_progress
          const isConfirmed = itemStatus === 'verified' || itemStatus === 'completed' || itemStatus === 'active' || itemStatus === 'in_progress';
          console.log(`  → isConfirmed: ${isConfirmed}`);
          return isConfirmed;
        case 'rejected':
          return itemStatus === 'cancelled' || itemStatus === 'failed' || itemStatus === 'rejected';
        default:
          return true;
      }
    });
    
    console.log(`🔍 Filtered items for tab "${activeTab}":`, filtered.map(item => ({
      id: item._id,
      service: item.service_name,
      status: item.status,
      isProject: item.isProject
    })));
    
    return filtered;
  };

  const getPaymentStatusStyle = (status) => {
    // Normalize status for comparison
    const statusLower = status?.toLowerCase().trim();
    
    const statusStyles = {
      'due': { background: '#dc2626', color: 'white' }, // Red for due
      'pending': { background: '#f59e0b', color: 'white' },
      'pending_verification': { background: '#f59e0b', color: 'white' },
      'verified': { background: '#10b981', color: 'white' },
      'completed': { background: '#10b981', color: 'white' },
      'active': { background: '#10b981', color: 'white' },
      'in_progress': { background: '#3b82f6', color: 'white' },
      'cancelled': { background: '#ef4444', color: 'white' },
      'rejected': { background: '#ef4444', color: 'white' },
      'failed': { background: '#ef4444', color: 'white' },
      'on_hold': { background: '#6b7280', color: 'white' }
    };
    return statusStyles[statusLower] || { background: '#6b7280', color: 'white' };
  };

  const getStatusDisplayText = (status) => {
    // Normalize status for comparison
    const statusLower = status?.toLowerCase().trim();
    
    const statusText = {
      'due': 'Payment Due',
      'pending': 'Pending Verification',
      'pending_verification': 'Pending Verification',
      'verified': 'Payment Confirmed',
      'completed': 'Payment Confirmed',
      'active': 'Payment Confirmed',
      'in_progress': 'In Progress',
      'cancelled': 'Payment Rejected',
      'rejected': 'Payment Rejected',
      'failed': 'Payment Rejected',
      'on_hold': 'On Hold'
    };
    return statusText[statusLower] || status;
  };

  // Overview Stats Cards Component
  const StatsCard = ({ icon, number, label, color, bgColor }) => (
    <div style={{
      ...componentStyles.managementCard,
      margin: 0,
      padding: designSystem.spacing.lg,
      background: bgColor,
      border: `2px solid ${color}`,
      textAlign: 'center',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <i className={`${icon} fa-2x`} style={{ color: color, marginBottom: designSystem.spacing.sm }}></i>
      <h3 style={{ 
        color: color, 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: '4px',
        fontSize: designSystem.typography.fontSize.xl
      }}>
        {typeof number === 'number' && number > 999 ? `$${(number/1000).toFixed(1)}k` : number}
      </h3>
      <small style={{ color: designSystem.colors.gray[600], fontWeight: designSystem.typography.fontWeight.medium }}>
        {label}
      </small>
    </div>
  );

  const ServicePaymentCard = ({ service }) => {
    // Use payment_status if available, otherwise fall back to project status
    const actualStatus = service.payment_status || service.status;
    
    // Check if this is a due payment
    const isDuePayment = actualStatus === 'due';
    
    // Check if payment receipt has already been uploaded
    const hasReceipt = service.payment_receipt || service.receipt_screenshot;
    
    console.log(`🎴 ServicePaymentCard for ${service._id}:`, {
      serviceName: service.service_name,
      projectStatus: service.status,
      paymentStatus: service.payment_status,
      actualStatus: actualStatus,
      isDuePayment: isDuePayment,
      hasReceipt: hasReceipt
    });
    
    return (
      <div
        style={{
          ...componentStyles.managementCard,
          margin: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        {...hoverEffects.card}
        onClick={() => {
          // Don't allow opening payment modal if receipt already uploaded
          if (isDuePayment && !hasReceipt) {
            // For due payments without receipt, open payment submission modal
            setSelectedPayment(service);
            setShowPaymentModal(true);
          } else {
            // For other statuses or already submitted, open details modal
            setSelectedService(service);
            setShowModal(true);
          }
        }}
      >
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: designSystem.spacing.md
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: designSystem.spacing.sm
          }}>
            <span style={{
              ...componentStyles.badge,
              background: designSystem.colors.primary,
              color: 'white',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: '600',
              marginRight: designSystem.spacing.sm
            }}>
              #{service._id.slice(-8).toUpperCase()}
            </span>
            <span style={{
              ...componentStyles.badge,
              ...getPaymentStatusStyle(actualStatus),
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {getStatusDisplayText(actualStatus)}
            </span>
          </div>
          
          <h6 style={{
            color: designSystem.colors.dark,
            fontWeight: designSystem.typography.fontWeight.semibold,
            marginBottom: designSystem.spacing.sm
          }}>
            {service.service_name || 'Service Purchase'}
          </h6>
          
          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600],
            marginBottom: designSystem.spacing.sm
          }}>
            Payment Method: {service.payment_method?.replace('_', ' ').toUpperCase() || 'Not Specified'}
          </div>
          
          {service.payment_receipt && (
            <div style={{
              fontSize: designSystem.typography.fontSize.sm,
              color: designSystem.colors.success.split('(')[0],
              marginBottom: designSystem.spacing.sm,
              fontWeight: designSystem.typography.fontWeight.semibold
            }}>
              <i className="fas fa-check-circle me-2"></i>
              Receipt Uploaded - Awaiting Verification
            </div>
          )}

          <div style={{
            fontSize: designSystem.typography.fontSize.sm,
            color: designSystem.colors.gray[600]
          }}>
            Purchased: {new Date(service.purchase_date || service.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div style={{
          textAlign: 'right',
          marginLeft: designSystem.spacing.md
        }}>
          <div style={{
            fontSize: designSystem.typography.fontSize.xl,
            fontWeight: designSystem.typography.fontWeight.bold,
            color: designSystem.colors.success.split('(')[0],
            marginBottom: '4px'
          }}>
            ${service.amount?.toLocaleString() || '0'}
          </div>
          {actualStatus === 'pending' && (
            <div style={{
              fontSize: designSystem.typography.fontSize.xs,
              color: designSystem.colors.warning.split('(')[0],
              fontWeight: designSystem.typography.fontWeight.medium
            }}>
              Awaiting Confirmation
            </div>
          )}
          
          {/* Invoice Download Icon for Confirmed Payments */}
          {(() => {
            const statusLower = actualStatus?.toLowerCase().trim();
            const isConfirmed = statusLower === 'verified' || statusLower === 'completed' || statusLower === 'active' || statusLower === 'in_progress';
            const hasInvoice = existingInvoices[service._id];
            
            console.log(`🧾 Invoice Icon Check for ${service._id}:`, {
              serviceName: service.service_name,
              actualStatus: actualStatus,
              statusLower: statusLower,
              isConfirmed: isConfirmed,
              hasInvoice: !!hasInvoice,
              invoiceDetails: hasInvoice ? { id: hasInvoice._id, number: hasInvoice.invoice_number } : null
            });
            
            return isConfirmed && hasInvoice;
          })() && (
            <button
              style={{
                background: designSystem.colors.success,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal from opening
                const invoiceToDownload = existingInvoices[service._id];
                console.log(`🧾 Downloading invoice for service ${service._id}:`, invoiceToDownload);
                console.log(`🧾 Invoice ID: ${invoiceToDownload._id}, Invoice Number: ${invoiceToDownload.invoice_number}`);
                downloadInvoice(invoiceToDownload._id);
              }}
              title={`Download Invoice #${existingInvoices[service._id].invoice_number}`}
            >
              <i className="fas fa-download"></i>
              Download Invoice
            </button>
          )}
        </div>
      </div>

      {service.description && (
        <p style={{
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.gray[600],
          margin: 0,
          fontStyle: 'italic'
        }}>
          {service.description}
        </p>
      )}
      </div>
    );
  };

  const ServiceDetailModal = () => (
    <div className="modal d-block" style={componentStyles.modal}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={componentStyles.modalContent}>
          <div className="modal-header" style={componentStyles.modalHeader}>
            <h5 className="modal-title">
              <i className="fas fa-receipt me-2"></i>
              Service Payment Details
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          
          <div className="modal-body" style={componentStyles.modalBody}>
            {selectedService && (
              <>
                <div style={{ marginBottom: designSystem.spacing.lg }}>
                  <h6 style={{ marginBottom: designSystem.spacing.md }}>Service Information</h6>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: designSystem.spacing.md,
                    padding: designSystem.spacing.md,
                    background: designSystem.colors.light,
                    borderRadius: designSystem.borderRadius.button
                  }}>
                    <div>
                      <strong>Service:</strong><br />
                      {selectedService.service_name}
                    </div>
                    <div>
                      <strong>Amount:</strong><br />
                      ${selectedService.amount?.toLocaleString()}
                    </div>
                    <div>
                      <strong>Payment Method:</strong><br />
                      {selectedService.payment_method?.replace('_', ' ').toUpperCase()}
                    </div>
                    <div>
                      <strong>Status:</strong><br />
                      <span style={{
                        ...componentStyles.badge,
                        ...getPaymentStatusStyle(selectedService.status)
                      }}>
                        {getStatusDisplayText(selectedService.status)}
                      </span>
                    </div>
                    <div>
                      <strong>Purchase Date:</strong><br />
                      {new Date(selectedService.purchase_date || selectedService.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Receipt:</strong><br />
                      {selectedService.payment_receipt ? (
                        <span style={{ color: designSystem.colors.success.split('(')[0] }}>
                          <i className="fas fa-check me-2"></i>Uploaded
                        </span>
                      ) : (
                        <span style={{ color: designSystem.colors.gray[500] }}>
                          <i className="fas fa-times me-2"></i>Not uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedService.description && (
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md }}>Description</h6>
                    <p style={{
                      padding: designSystem.spacing.md,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button,
                      margin: 0
                    }}>
                      {selectedService.description}
                    </p>
                  </div>
                )}

                  <div style={{
                    background: designSystem.colors.light,
                    padding: designSystem.spacing.md,
                    borderRadius: designSystem.borderRadius.button
                  }}>
                    <p style={{ 
                      margin: 0,
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.gray[600]
                    }}>
                      <i className="fas fa-info-circle me-2"></i>
                      {selectedService.status === 'due'
                        ? 'This payment is due. Please submit your payment using the payment submission option.'
                        : selectedService.status === 'pending' || selectedService.status === 'pending_verification'
                        ? 'Your payment is being reviewed by our team. You will be notified once it is confirmed.'
                        : selectedService.status === 'active' || selectedService.status === 'in_progress'
                        ? 'Your payment has been confirmed and the service is being processed.'
                        : selectedService.status === 'completed'
                        ? 'Service completed successfully.'
                        : 'Please contact support for more information about this service.'
                      }
                    </p>
                  </div>
              </>
            )}
          </div>
          
          <div className="modal-footer" style={componentStyles.modalFooter}>
            {/* Submit Payment Button for Due Payments */}
            {selectedService && selectedService.status === 'due' && !selectedService.payment_receipt && !selectedService.receipt_screenshot && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(selectedService);
                  setShowPaymentModal(true);
                }}
                style={{ 
                  marginRight: 'auto',
                  background: '#dc2626',
                  border: 'none'
                }}
              >
                <i className="fas fa-credit-card me-2"></i>
                Submit Payment
              </button>
            )}
            
            {/* Show message if receipt already uploaded */}
            {selectedService && selectedService.status === 'due' && (selectedService.payment_receipt || selectedService.receipt_screenshot) && (
              <div style={{
                marginRight: 'auto',
                padding: '8px 16px',
                background: designSystem.colors.warning + '20',
                border: `1px solid ${designSystem.colors.warning}`,
                borderRadius: '6px',
                color: designSystem.colors.warning.split('(')[0],
                fontSize: '14px'
              }}>
                <i className="fas fa-info-circle me-2"></i>
                Payment receipt already submitted. Awaiting verification.
              </div>
            )}
            
            {/* Invoice Download Button for Confirmed Payments */}
            {selectedService && (() => {
              const statusLower = selectedService.status?.toLowerCase().trim();
              const isConfirmed = statusLower === 'active' || statusLower === 'in_progress' || statusLower === 'completed';
              const hasInvoice = existingInvoices[selectedService._id];
              return isConfirmed && hasInvoice;
            })() && (
              <button 
                type="button" 
                className="btn btn-success"
                onClick={() => {
                  const invoiceToDownload = existingInvoices[selectedService._id];
                  console.log(`🧾 Modal: Downloading invoice for service ${selectedService._id}:`, invoiceToDownload);
                  console.log(`🧾 Modal: Invoice ID: ${invoiceToDownload._id}, Invoice Number: ${invoiceToDownload.invoice_number}`);
                  downloadInvoice(invoiceToDownload._id);
                }}
                style={{ 
                  marginRight: 'auto',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-file-invoice"></i>
                Download Invoice #{existingInvoices[selectedService._id].invoice_number}
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  console.log('🎨 ClientPayments rendering, state:', {
    loading,
    error,
    paymentsCount: payments.length,
    servicesCount: purchasedServices.length,
    activeTab,
    stats
  });

  if (loading) {
    return (
      <div style={componentStyles.loading}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: designSystem.colors.primary }}></i>
        <p style={{ marginTop: designSystem.spacing.md, color: designSystem.colors.gray[500] }}>
          Loading payment status...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={componentStyles.emptyState}>
        <i className="fas fa-exclamation-triangle fa-3x" style={{ color: designSystem.colors.danger, marginBottom: designSystem.spacing.md }}></i>
        <p style={{ color: designSystem.colors.gray[600], marginBottom: designSystem.spacing.md }}>
          Error loading payments: {error}
        </p>
        <button 
          style={componentStyles.primaryButton}
          onClick={() => {
            setError(null);
            setLoading(true);
            loadData();
          }}
        >
          <i className="fas fa-sync-alt me-2"></i>Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Refresh Button */}
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-credit-card fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Payment Status</h4>
            <p style={componentStyles.headerSubtitle}>Track your service purchases and payment confirmations</p>
          </div>
        </div>
        <button 
          style={{
            ...componentStyles.primaryButton,
            background: designSystem.colors.primary
          }}
          onClick={async () => {
            await loadData();
            onRefresh?.();
          }}
          {...hoverEffects.button}
        >
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      {/* Overview Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: designSystem.spacing.lg,
        marginBottom: designSystem.spacing.xl
      }}>
        <StatsCard
          icon="fas fa-shopping-bag"
          number={stats.total}
          label="Total Purchases"
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatsCard
          icon="fas fa-clock"
          number={stats.pending}
          label="Pending Confirmation"
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatsCard
          icon="fas fa-check-circle"
          number={stats.confirmed}
          label="Confirmed Payments"
          color="#10b981"
          bgColor="#ecfdf5"
        />
        <StatsCard
          icon="fas fa-dollar-sign"
          number={`$${stats.totalAmount.toLocaleString()}`}
          label="Total Amount"
          color="#8b5cf6"
          bgColor="#faf5ff"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: designSystem.spacing.lg }}>
        <div style={{ display: 'flex', gap: designSystem.spacing.xs, flexWrap: 'wrap' }}>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'all' ? designSystem.colors.primary : designSystem.colors.gray[100],
              color: activeTab === 'all' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('all')}
            {...hoverEffects.button}
          >
            All Purchases ({stats.total})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'due' ? '#dc2626' : designSystem.colors.gray[100],
              color: activeTab === 'due' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('due')}
            {...hoverEffects.button}
          >
            <i className="fas fa-exclamation-circle me-2"></i>
            Due ({stats.due || 0})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'pending' ? designSystem.colors.warning : designSystem.colors.gray[100],
              color: activeTab === 'pending' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('pending')}
            {...hoverEffects.button}
          >
            Pending ({stats.pending})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'confirmed' ? designSystem.colors.success : designSystem.colors.gray[100],
              color: activeTab === 'confirmed' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('confirmed')}
            {...hoverEffects.button}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button 
            style={{
              ...componentStyles.primaryButton,
              background: activeTab === 'rejected' ? designSystem.colors.danger : designSystem.colors.gray[100],
              color: activeTab === 'rejected' ? 'white' : designSystem.colors.gray[600]
            }}
            onClick={() => setActiveTab('rejected')}
            {...hoverEffects.button}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: designSystem.spacing.lg
      }}>
        {getFilteredServices().map(service => (
          <ServicePaymentCard
            key={service._id}
            service={service}
          />
        ))}
      </div>

      {getFilteredServices().length === 0 && (
        <div style={componentStyles.emptyState}>
          <i className="fas fa-credit-card fa-3x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.md }}></i>
          <p style={{ color: designSystem.colors.gray[500] }}>
            {activeTab === 'all' ? 'No service purchases yet' : `No ${activeTab} payments found`}
          </p>
          {activeTab === 'all' && (
            <p style={{ color: designSystem.colors.gray[500], fontSize: designSystem.typography.fontSize.sm }}>
              Purchase services from the Services section to see them here
            </p>
          )}
        </div>
      )}

      {/* Service Detail Modal */}
      {showModal && <ServiceDetailModal />}
      
      {/* Payment Submission Modal for Due Payments */}
      {showPaymentModal && selectedPayment && (
        <div className="modal d-block" style={componentStyles.modal}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={componentStyles.modalContent}>
              <div className="modal-header" style={componentStyles.modalHeader}>
                <h5 className="modal-title">
                  <i className="fas fa-credit-card me-2"></i>
                  Submit Payment
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                    setPaymentFormData({
                      payment_method: 'bank_transfer',
                      payment_screenshot: null,
                      notes: ''
                    });
                  }}
                ></button>
              </div>
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="modal-body" style={componentStyles.modalBody}>
                  {/* Payment Details */}
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <h6 style={{ marginBottom: designSystem.spacing.md }}>Payment Information</h6>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: designSystem.spacing.md,
                      padding: designSystem.spacing.md,
                      background: designSystem.colors.light,
                      borderRadius: designSystem.borderRadius.button
                    }}>
                      <div>
                        <strong>Service:</strong><br />
                        {selectedPayment.service_name}
                      </div>
                      <div>
                        <strong>Amount:</strong><br />
                        <span style={{ 
                          fontSize: designSystem.typography.fontSize.xl,
                          fontWeight: designSystem.typography.fontWeight.bold,
                          color: designSystem.colors.success.split('(')[0]
                        }}>
                          ${selectedPayment.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <strong>Due Date:</strong><br />
                        {new Date(selectedPayment.dueDate).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Status:</strong><br />
                        <span style={{
                          ...componentStyles.badge,
                          ...getPaymentStatusStyle(selectedPayment.status)
                        }}>
                          {getStatusDisplayText(selectedPayment.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <label style={{
                      display: 'block',
                      marginBottom: designSystem.spacing.sm,
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      color: designSystem.colors.dark
                    }}>
                      Payment Method <span style={{ color: designSystem.colors.danger }}>*</span>
                    </label>
                    <select
                      value={paymentFormData.payment_method}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: designSystem.spacing.sm,
                        borderRadius: designSystem.borderRadius.button,
                        border: `1px solid ${designSystem.colors.gray[300]}`,
                        fontSize: designSystem.typography.fontSize.base
                      }}
                      required
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                      <option value="online">Online Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Receipt Upload */}
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <label style={{
                      display: 'block',
                      marginBottom: designSystem.spacing.sm,
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      color: designSystem.colors.dark
                    }}>
                      Payment Receipt/Screenshot <span style={{ color: designSystem.colors.danger }}>*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      style={{
                        width: '100%',
                        padding: designSystem.spacing.sm,
                        borderRadius: designSystem.borderRadius.button,
                        border: `1px solid ${designSystem.colors.gray[300]}`,
                        fontSize: designSystem.typography.fontSize.base
                      }}
                      required
                    />
                    {paymentFormData.payment_screenshot && (
                      <div style={{
                        marginTop: designSystem.spacing.sm,
                        padding: designSystem.spacing.sm,
                        background: designSystem.colors.success + '20',
                        borderRadius: designSystem.borderRadius.button,
                        color: designSystem.colors.success.split('(')[0]
                      }}>
                        <i className="fas fa-check-circle me-2"></i>
                        File selected: {paymentFormData.payment_screenshot.name}
                      </div>
                    )}
                    <small style={{ color: designSystem.colors.gray[600], display: 'block', marginTop: designSystem.spacing.xs }}>
                      Accepted formats: JPEG, PNG, GIF, PDF (Max 10MB)
                    </small>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: designSystem.spacing.lg }}>
                    <label style={{
                      display: 'block',
                      marginBottom: designSystem.spacing.sm,
                      fontWeight: designSystem.typography.fontWeight.semibold,
                      color: designSystem.colors.dark
                    }}>
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={paymentFormData.notes}
                      onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      placeholder="Add any additional information about your payment..."
                      style={{
                        width: '100%',
                        padding: designSystem.spacing.sm,
                        borderRadius: designSystem.borderRadius.button,
                        border: `1px solid ${designSystem.colors.gray[300]}`,
                        fontSize: designSystem.typography.fontSize.base,
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* Info Box */}
                  <div style={{
                    background: designSystem.colors.primary + '10',
                    padding: designSystem.spacing.md,
                    borderRadius: designSystem.borderRadius.button,
                    border: `1px solid ${designSystem.colors.primary.split('(')[0]}`
                  }}>
                    <p style={{ 
                      margin: 0,
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.dark
                    }}>
                      <i className="fas fa-info-circle me-2" style={{ color: designSystem.colors.primary.split('(')[0] }}></i>
                      After submitting, your payment will be reviewed by our team. You will be notified once it is verified.
                    </p>
                  </div>
                </div>
                
                <div className="modal-footer" style={componentStyles.modalFooter}>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting || !paymentFormData.payment_screenshot}
                    style={{
                      background: designSystem.colors.primary,
                      border: 'none'
                    }}
                  >
                    {submitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPayments;