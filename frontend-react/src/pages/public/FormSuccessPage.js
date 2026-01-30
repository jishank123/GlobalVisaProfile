import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const FormSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  const type = searchParams.get('type') || 'form';
  const email = searchParams.get('email');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const getContent = () => {
    switch (type) {
      case 'profile_assessment':
        return {
          title: 'Profile Assessment Submitted!',
          message: 'Thank you for completing your EB-1A profile assessment.',
          details: 'We have received your assessment and will review your profile strength. Our team will contact you within 24-48 hours with detailed feedback and next steps.',
          icon: '📊'
        };
      case 'contact':
        return {
          title: 'Message Sent Successfully!',
          message: 'Thank you for contacting us.',
          details: 'We have received your inquiry and will respond within 24-48 hours. Our team will review your message and provide you with the information you need.',
          icon: '📧'
        };
      case 'appointment':
        return {
          title: 'Appointment Request Submitted!',
          message: 'Thank you for scheduling a consultation.',
          details: 'We have received your appointment request and will contact you within 24 hours to confirm your consultation time and provide meeting details.',
          icon: '📅'
        };
      default:
        return {
          title: 'Form Submitted Successfully!',
          message: 'Thank you for your submission.',
          details: 'We have received your information and will get back to you soon.',
          icon: '✅'
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="text-6xl mb-6">
          {content.icon}
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {content.title}
        </h1>
        
        {/* Message */}
        <p className="text-xl text-gray-700 mb-6">
          {content.message}
        </p>
        
        {/* Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">
            {content.details}
          </p>
          
          {email && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Account Created:</strong>
              </p>
              <p className="text-blue-600 font-medium">
                {email}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Check your email for login instructions and password setup.
              </p>
            </div>
          )}
        </div>
        
        {/* What's Next */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens next?
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 font-bold">1.</span>
              <span className="text-gray-700">Our team reviews your submission</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 font-bold">2.</span>
              <span className="text-gray-700">We prepare personalized recommendations</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 font-bold">3.</span>
              <span className="text-gray-700">You receive detailed feedback via email</span>
            </div>
            {email && (
              <div className="flex items-start space-x-3">
                <span className="text-green-500 font-bold">4.</span>
                <span className="text-gray-700">Access your client dashboard to track progress</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Return to Home
          </button>
          
          {email && (
            <button
              onClick={() => navigate('/login')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Login to Dashboard
            </button>
          )}
          
          <button
            onClick={() => navigate('/contact')}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Contact Us
          </button>
        </div>
        
        {/* Auto-redirect notice */}
        <div className="mt-8 text-sm text-gray-500">
          Automatically redirecting to home page in {countdown} seconds...
        </div>
      </div>
    </div>
  );
};

export default FormSuccessPage;