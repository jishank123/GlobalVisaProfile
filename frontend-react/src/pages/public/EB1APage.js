import React from 'react';
import { Link } from 'react-router-dom';

const EB1APage = () => {
  return (
    <div>
      
      {/* Hero Section */}
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              EB-1A Extraordinary Ability
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              The premier immigration category for individuals with extraordinary ability in their field. No job offer or labor certification required.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Overview */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is EB-1A?</h2>
              <p className="text-lg text-gray-600 mb-6">
                The EB-1A (Extraordinary Ability) is a first-preference employment-based immigrant visa category for individuals who demonstrate extraordinary ability in the sciences, arts, education, business, or athletics through sustained national or international acclaim.
              </p>
              <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                <h3 className="font-bold text-green-900 mb-2">Key Benefits:</h3>
                <ul className="text-green-800 space-y-1">
                  <li>• No job offer required</li>
                  <li>• No labor certification needed</li>
                  <li>• Self-petitioning allowed</li>
                  <li>• Faster processing times</li>
                  <li>• Path to permanent residency</li>
                </ul>
              </div>
            </div>

            {/* Criteria */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">EB-1A Criteria</h2>
              <p className="text-lg text-gray-600 mb-8">
                You must demonstrate extraordinary ability by meeting at least 3 of the following 10 criteria:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">
                    <i className="fas fa-trophy text-yellow-500 mr-2"></i>
                    Awards & Recognition
                  </h4>
                  <p className="text-gray-600">
                    Nationally or internationally recognized prizes or awards for excellence in your field.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">
                    <i className="fas fa-users text-blue-500 mr-2"></i>
                    Membership in Associations
                  </h4>
                  <p className="text-gray-600">
                    Membership in associations that require outstanding achievements for membership.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">
                    <i className="fas fa-newspaper text-green-500 mr-2"></i>
                    Published Material
                  </h4>
                  <p className="text-gray-600">
                    Published material about you in professional publications or major media.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">
                    <i className="fas fa-gavel text-purple-500 mr-2"></i>
                    Judging Others' Work
                  </h4>
                  <p className="text-gray-600">
                    Participation as a judge of the work of others in your field.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">
                    <i className="fas fa-lightbulb text-orange-500 mr-2"></i>
                    Original Contributions
                  </h4>
                  <p className="text-gray-600">
                    Original contributions of major significance to your field.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-3">
                    <i className="fas fa-file-alt text-indigo-500 mr-2"></i>
                    Scholarly Articles
                  </h4>
                  <p className="text-gray-600">
                    Authorship of scholarly articles in professional journals or major media.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Services */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Help</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-search text-2xl text-blue-600"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Profile Assessment</h3>
                  <p className="text-gray-600">
                    Comprehensive evaluation of your current profile against EB-1A criteria.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chart-line text-2xl text-green-600"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Profile Building</h3>
                  <p className="text-gray-600">
                    Strategic guidance to strengthen weak areas and build qualifying evidence.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-file-signature text-2xl text-purple-600"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Application Prep</h3>
                  <p className="text-gray-600">
                    Complete petition preparation with compelling evidence documentation.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Assess Your EB-1A Eligibility?</h2>
              <p className="text-xl opacity-90 mb-8">
                Take our free assessment to understand your current profile strength and get personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/assessment" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                  <i className="fas fa-chart-line mr-2"></i>
                  Free Assessment
                </Link>
                <Link to="/schedule" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-all">
                  <i className="fas fa-calendar mr-2"></i>
                  Schedule Consultation
                </Link>
                <Link to="/contact" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
                  <i className="fas fa-envelope mr-2"></i>
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EB1APage;