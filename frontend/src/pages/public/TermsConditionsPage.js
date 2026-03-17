import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsConditionsPage = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl opacity-90">Our terms of service and user agreement</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using ImmigrationPro's services, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
                <p>ImmigrationPro provides profile building and application preparation services for employment-based immigration petitions. We are not attorneys and do not provide legal advice or representation.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain confidentiality of account credentials</li>
                  <li>Use services only for lawful purposes</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Limitations</h2>
                <p className="mb-4">Our services are limited to profile building and application preparation. We do not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide legal advice or representation</li>
                  <li>Guarantee approval of any immigration petition</li>
                  <li>Act as attorneys or legal representatives</li>
                  <li>File applications directly with USCIS</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
                <p>Payment is required before services are rendered. All fees are non-refundable unless otherwise specified in writing.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                <p>ImmigrationPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
                <p>All content, materials, and intellectual property on this website are owned by ImmigrationPro and protected by applicable laws.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
                <p>We reserve the right to terminate or suspend access to our services at any time, without prior notice, for conduct that we believe violates these Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
                <p>These Terms shall be interpreted and governed in accordance with the laws of the United States and the state in which our business is incorporated.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
                <p className="mb-4">For questions about these Terms & Conditions, please contact us at:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> info@immigrationpro.com</p>
                  <p><strong>Phone:</strong> (555) 123-4567</p>
                </div>
              </section>

              <div className="bg-gray-50 p-4 rounded-lg mt-8">
                <p className="text-sm text-gray-600">
                  <strong>Last Updated:</strong> January 30, 2026
                </p>
              </div>
            </div>

            {/* Back to Home */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;