import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { profileAssessmentsAPI } from '../../services/api';
import { generateAssessmentPDF } from '../../utils/pdfGenerator';

const FormSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  const type = searchParams.get('type') || 'form';
  const email = searchParams.get('email');
  const accountCreated = searchParams.get('accountCreated') === 'true';

  // Fetch assessment data if it's a profile assessment
  useEffect(() => {
    const fetchAssessment = async () => {
      if (type === 'profile_assessment' && email) {
        setLoadingAssessment(true);
        try {
          const token = localStorage.getItem('token');
          if (token) {
            // Add a small delay to ensure the assessment is fully saved and linked
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const response = await profileAssessmentsAPI.getClientAssessments();
            console.log('Assessment fetch response:', response);
            
            if (response.success && response.data && response.data.length > 0) {
              // Get the most recent assessment
              setAssessment(response.data[0]);
              console.log('Assessment loaded:', response.data[0]);
            } else {
              console.log('No assessments found');
            }
          } else {
            console.log('No token found');
          }
        } catch (error) {
          console.error('Failed to fetch assessment:', error);
        } finally {
          setLoadingAssessment(false);
        }
      }
    };

    fetchAssessment();
  }, [type, email]);

  const handleDownloadPDF = () => {
    if (!assessment) return;
    
    setDownloadingPDF(true);
    try {
      generateAssessmentPDF(assessment);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

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
                Your account has been created automatically. You can now login with your email to access your dashboard now.
              </p>
            </div>
          )}

          {/* Download Assessment Button */}
          {type === 'profile_assessment' && assessment && (
            <div className="mt-4">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {downloadingPDF ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    Download Assessment Report Card
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Download your detailed EB-1A profile assessment report
              </p>
            </div>
          )}

          {type === 'profile_assessment' && loadingAssessment && (
            <div className="mt-4 text-center text-gray-500">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading your assessment...
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
        </div>
      </div>
    </div>
  );
};

export default FormSuccessPage;