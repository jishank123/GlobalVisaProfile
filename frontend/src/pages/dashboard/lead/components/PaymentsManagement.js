import { useState } from 'react';

const PaymentsManagement = ({ payments, clients, onRefresh }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({ status: 'verified', notes: '' });

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'pending_verification': 'Pending Verification',
      'verified': 'Verified',
      'completed': 'Completed',
      'failed': 'Failed',
      'rejected': 'Rejected',
      'refunded': 'Refunded'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'pending_verification': 'bg-orange-100 text-orange-800',
      'verified': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'failed': 'bg-red-100 text-red-800',
      'rejected': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const findClientById = (clientId) => {
    if (!clientId) return { name: 'Unknown Client', _id: clientId };
    
    const client = clients.find(c => c._id === clientId);
    return client || { name: 'Unknown Client', _id: clientId };
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleVerifyPayment = (payment) => {
    setSelectedPayment(payment);
    setVerificationData({ status: 'verified', notes: '' });
    setShowVerificationModal(true);
  };

  const submitPaymentVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments/${selectedPayment._id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verification_status: verificationData.status,
          admin_notes: verificationData.notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowVerificationModal(false);
        onRefresh();
        alert(`Payment ${verificationData.status} successfully!`);
      } else {
        throw new Error(data.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment: ' + error.message);
    }
  };

  const loadKnownPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/697af51126bb0273601bae20', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        onRefresh();
        alert('Known payment loaded successfully!');
      } else {
        alert('Could not load known payment');
      }
    } catch (error) {
      console.error('Error loading known payment:', error);
      alert('Failed to load known payment');
    }
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-credit-card text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Payment Status</h2>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>
        
        <div className="text-center py-12">
          <i className="fas fa-credit-card text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Payment Information</h3>
          <p className="text-gray-400 mb-4">Payment data will appear here when available.</p>
          <button
            onClick={loadKnownPayment}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="Load the known pending payment"
          >
            <i className="fas fa-magic mr-2"></i>
            Load Known Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <i className="fas fa-credit-card text-xl text-gray-600"></i>
            <h2 className="text-xl font-bold text-gray-800">Payment Status</h2>
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const client = typeof payment.client === 'object' && payment.client.name 
                  ? payment.client 
                  : findClientById(payment.client);
                
                return (
                  <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-800">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{payment.service_name || 'Unknown Service'}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800">
                        ${payment.amount?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status || payment.verification_status)}`}>
                          {formatStatus(payment.status || payment.verification_status)}
                        </span>
                        {payment.verification_status === 'pending' && (
                          <div className="text-xs text-orange-600 mt-1 font-medium">
                            <i className="fas fa-exclamation-triangle mr-1"></i>
                            Requires verification
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {payment.verification_status === 'pending' && (
                          <button
                            onClick={() => handleVerifyPayment(payment)}
                            className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors text-sm"
                            title="Verify Payment"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="mb-3">
                    <strong>Client:</strong> {
                      typeof selectedPayment.client === 'object' && selectedPayment.client.name 
                        ? selectedPayment.client.name 
                        : findClientById(selectedPayment.client).name
                    }
                  </p>
                  <p className="mb-3"><strong>Service:</strong> {selectedPayment.service_name || 'Unknown Service'}</p>
                  <p className="mb-3"><strong>Amount:</strong> ${selectedPayment.amount?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="mb-3">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status || selectedPayment.verification_status)}`}>
                      {formatStatus(selectedPayment.status || selectedPayment.verification_status)}
                    </span>
                  </p>
                  <p className="mb-3"><strong>Payment Method:</strong> {selectedPayment.paymentMethod || 'N/A'}</p>
                  <p className="mb-3"><strong>Transaction ID:</strong> {selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>

              {selectedPayment.verification_status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                    <span className="text-yellow-800 font-medium">This payment requires verification</span>
                  </div>
                </div>
              )}

              {selectedPayment.receipt_screenshot && (
                <div className="mb-6">
                  <strong>Payment Receipt:</strong>
                  <div className="mt-2">
                    <img 
                      src={`/uploads/payment-receipts/${selectedPayment.receipt_screenshot}`}
                      alt="Payment Receipt"
                      className="max-w-full h-auto max-h-80 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {selectedPayment.notes && (
                <div className="mb-6">
                  <strong>Notes:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedPayment.notes}
                  </div>
                </div>
              )}

              {selectedPayment.admin_notes && (
                <div className="mb-6">
                  <strong>Admin Notes:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {selectedPayment.admin_notes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              {selectedPayment.verification_status === 'pending' && (
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    handleVerifyPayment(selectedPayment);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Verify Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Modal */}
      {showVerificationModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Confirm Payment</h2>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="mb-2">
                  <strong>Client:</strong> {
                    typeof selectedPayment.client === 'object' && selectedPayment.client.name 
                      ? selectedPayment.client.name 
                      : findClientById(selectedPayment.client).name
                  }
                </p>
                <p className="mb-2"><strong>Service:</strong> {selectedPayment.service_name}</p>
                <p className="mb-4"><strong>Amount:</strong> ${selectedPayment.amount?.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><strong>Verification Status:</strong></label>
                <select
                  value={verificationData.status}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="verified">Verified - Payment Confirmed</option>
                  <option value="rejected">Rejected - Payment Invalid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><strong>Admin Notes:</strong></label>
                <textarea
                  value={verificationData.notes}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add verification notes..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitPaymentVerification}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentsManagement;