import React from 'react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <div>
      
      {/* Hero Section */}
      <div className="pt-28 pb-20 bg-gradient-to-br from-green-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Transparent Pricing
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Professional immigration services with clear, upfront pricing. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Profile Assessment */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Assessment</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">FREE</div>
                <p className="text-gray-600">Comprehensive EB-1A evaluation</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">10-criteria assessment</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Profile strength analysis</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Personalized recommendations</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Gap analysis report</span>
                </li>
              </ul>
              
              <Link to="/assessment" className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block">
                Start Free Assessment
              </Link>
            </div>

            {/* Consultation */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500 relative hover:shadow-2xl transition-all">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Expert Consultation</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">$299</div>
                <p className="text-gray-600">60-minute strategy session</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">1-on-1 expert consultation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Detailed profile review</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Strategic action plan</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Timeline & milestones</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Follow-up email summary</span>
                </li>
              </ul>
              
              <Link to="/schedule" className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block">
                Schedule Consultation
              </Link>
            </div>

            {/* Full Service */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 hover:border-purple-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Full Service Package</h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">$4,999</div>
                <p className="text-gray-600">Complete application preparation</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Complete petition preparation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Evidence documentation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">Recommendation letters</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">USCIS filing support</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-700">RFE response assistance</span>
                </li>
              </ul>
              
              <Link to="/schedule" className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center block">
                Get Started
              </Link>
            </div>
          </div>

          {/* Additional Services */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Additional Services</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <i className="fas fa-user-plus text-3xl text-yellow-600 mb-4"></i>
                <h4 className="font-bold text-gray-900 mb-2">Profile Building</h4>
                <p className="text-gray-600 mb-3">Strategic profile enhancement</p>
                <div className="text-2xl font-bold text-yellow-600">$1,999</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <i className="fas fa-file-alt text-3xl text-green-600 mb-4"></i>
                <h4 className="font-bold text-gray-900 mb-2">Document Review</h4>
                <p className="text-gray-600 mb-3">Professional document analysis</p>
                <div className="text-2xl font-bold text-green-600">$499</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <i className="fas fa-reply text-3xl text-red-600 mb-4"></i>
                <h4 className="font-bold text-gray-900 mb-2">RFE Response</h4>
                <p className="text-gray-600 mb-3">Request for Evidence assistance</p>
                <div className="text-2xl font-bold text-red-600">$1,499</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <i className="fas fa-balance-scale text-3xl text-blue-600 mb-4"></i>
                <h4 className="font-bold text-gray-900 mb-2">Legal Referral</h4>
                <p className="text-gray-600 mb-3">Attorney network access</p>
                <div className="text-2xl font-bold text-blue-600">FREE</div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">Do you guarantee approval?</h4>
                <p className="text-gray-600">
                  We cannot guarantee USCIS approval as the final decision rests with immigration officials. However, we provide comprehensive preparation to maximize your chances of success.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-600">
                  We accept credit cards, bank transfers, and offer payment plans for full-service packages. Contact us to discuss payment options.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">How long does the process take?</h4>
                <p className="text-gray-600">
                  Timeline varies based on your profile strength and service level. Consultations are scheduled within 48 hours, while full applications typically take 4-8 weeks to prepare.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Begin with our free assessment or schedule a consultation to discuss your case.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all">
                <i className="fas fa-chart-line mr-2"></i>
                Start Free Assessment
              </Link>
              <Link to="/schedule" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all">
                <i className="fas fa-calendar mr-2"></i>
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PricingPage;