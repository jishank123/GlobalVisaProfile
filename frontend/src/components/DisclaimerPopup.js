import React, { useState, useEffect } from 'react';

const DisclaimerPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the disclaimer
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted');
    
    if (!disclaimerAccepted) {
      // Show disclaimer popup after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setIsVisible(false);
    document.body.style.overflow = ''; // Restore scrolling
  };

  const handleDecline = () => {
    alert('You must agree to the disclaimer to use this website. You will be redirected to USCIS.gov');
    window.location.href = 'https://www.uscis.gov/';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-2">
            <i className="fas fa-exclamation-triangle text-4xl mr-3"></i>
            <h2 className="text-2xl md:text-3xl font-bold">Important Legal Disclaimer</h2>
          </div>
          <p className="text-center text-red-100 text-sm">Please read carefully before proceeding</p>
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="space-y-4 text-gray-700">
            <p className="text-lg leading-relaxed">
              <strong className="text-gray-900">ImmigrationPro's mentorship and guidance are solely intended for educational and informational purposes.</strong> We do not represent clients before any agency, including U.S. immigration officials, and <strong className="text-red-600">we are not lawyers</strong>.
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="font-semibold text-gray-900 mb-2">
                <i className="fas fa-info-circle text-yellow-600 mr-2"></i>Not Legal Advice
              </p>
              <p className="text-sm">
                The information provided is not meant to be legal advice and should not be interpreted as such. We specifically disclaim any liability for reliance on such content and offer no promises regarding the accuracy, completeness, or reliability of the information given.
              </p>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="font-semibold text-gray-900 mb-2">
                <i className="fas fa-balance-scale text-blue-600 mr-2"></i>Seek Legal Counsel
              </p>
              <p className="text-sm">
                We strongly advise speaking with a qualified U.S. immigration attorney for tailored guidance on your particular legal issues. <a href="/attorneys" className="text-primary underline font-semibold">Find an attorney here</a>.
              </p>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="font-semibold text-gray-900 mb-2">
                <i className="fas fa-hand-paper text-red-600 mr-2"></i>USCIS Has Final Authority
              </p>
              <p className="text-sm">
                USCIS has complete authority over all immigration decisions. While we provide comprehensive profile building and application preparation support, <strong>USCIS can still deny applications for reasons beyond our control or prediction</strong>. We provide no guarantees of approval.
              </p>
            </div>
            
            <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded">
              By selecting "I Agree," you acknowledge and accept this disclaimer. You understand that our services are limited to profile building, documentation assistance, and application preparation guidance—not legal representation or advice.
            </p>
          </div>
        </div>
        
        {/* Footer Buttons */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleDecline}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
          >
            <i className="fas fa-times mr-2"></i>Decline
          </button>
          <button 
            onClick={handleAgree}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105"
          >
            <i className="fas fa-check mr-2"></i>I Agree & Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPopup;