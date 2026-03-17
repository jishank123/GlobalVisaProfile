import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CareerCoachingPage = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div>
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-green-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Career Coaching for Immigration Success
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Strategic career development that positions you as an extraordinary professional while advancing your immigration goals
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Career Coaching for Immigration?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                Your career trajectory and immigration goals are deeply interconnected. Our career coaching service is uniquely designed to help you <strong>advance professionally while simultaneously building the extraordinary ability credentials</strong> required for premium U.S. immigration categories.
              </p>
              <p className="text-gray-700 mb-6">
                Unlike traditional career coaches, we understand the specific achievements and positioning needed for EB-1A, EB-2 NIW, and O-1 visas. We help you strategically develop your career in ways that naturally create the evidence USCIS looks for.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-teal-50 p-6 rounded-xl border-2 border-teal-400">
                  <h3 className="text-xl font-bold text-teal-700 mb-3">
                    <i className="fas fa-rocket mr-2"></i>Career Advancement
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Strategic career positioning</li>
                    <li>• Leadership development</li>
                    <li>• Industry recognition building</li>
                    <li>• Professional network expansion</li>
                    <li>• Salary negotiation strategies</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-400">
                  <h3 className="text-xl font-bold text-blue-700 mb-3">
                    <i className="fas fa-passport mr-2"></i>Immigration Credentials
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• EB-1A criteria fulfillment</li>
                    <li>• Evidence documentation</li>
                    <li>• Achievement positioning</li>
                    <li>• Impact measurement</li>
                    <li>• Extraordinary ability proof</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Career Coaching Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive coaching that aligns your career growth with immigration success
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            
            {/* Service 1: Career Strategy */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-chess text-3xl text-teal-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Career Strategy & Positioning</h3>
                  <p className="text-sm text-teal-600 font-semibold">Build Your Professional Brand</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Develop a strategic career roadmap that positions you as a leader in your field.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Personal brand development</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Industry positioning strategy</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Thought leadership planning</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Career trajectory optimization</span>
                </li>
              </ul>
            </div>

            {/* Service 2: Leadership Development */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-crown text-3xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Leadership Development</h3>
                  <p className="text-sm text-blue-600 font-semibold">Demonstrate Critical Role</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Build leadership credentials that satisfy EB-1A "leading or critical role" criterion.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Executive presence coaching</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Team leadership strategies</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Project management excellence</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Impact documentation</span>
                </li>
              </ul>
            </div>

            {/* Service 3: Industry Recognition */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-award text-3xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Industry Recognition Building</h3>
                  <p className="text-sm text-purple-600 font-semibold">Awards & Media Coverage</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Strategic guidance to gain industry recognition and media visibility.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Award nomination strategies</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Media outreach & PR guidance</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Speaking engagement opportunities</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Industry conference participation</span>
                </li>
              </ul>
            </div>

            {/* Service 4: Professional Network */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-users text-3xl text-orange-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Network Expansion</h3>
                  <p className="text-sm text-orange-600 font-semibold">Memberships & Connections</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Build strategic relationships and join prestigious professional associations.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Elite association memberships</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Strategic networking guidance</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Mentor relationship building</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Peer review opportunities</span>
                </li>
              </ul>
            </div>

            {/* Service 5: Compensation Strategy */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-dollar-sign text-3xl text-green-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Compensation Strategy</h3>
                  <p className="text-sm text-green-600 font-semibold">High Salary Criterion</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Negotiate compensation that demonstrates high remuneration for EB-1A criteria.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Salary benchmarking analysis</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Negotiation strategies</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Compensation documentation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Total rewards positioning</span>
                </li>
              </ul>
            </div>

            {/* Service 6: Publication & Research */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-file-alt text-3xl text-indigo-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Publication & Research Guidance</h3>
                  <p className="text-sm text-indigo-600 font-semibold">Scholarly Contributions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Develop your research profile and publication strategy for academic credibility.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Research topic identification</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Publication strategy planning</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Journal selection guidance</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Citation impact building</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">How Career Coaching Works</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              A structured approach to career advancement and immigration credential building
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Initial Assessment</h3>
                <p className="text-gray-700">
                  Evaluate your current career position and immigration goals
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Strategy Development</h3>
                <p className="text-gray-700">
                  Create personalized roadmap aligning career and immigration objectives
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Active Coaching</h3>
                <p className="text-gray-700">
                  Regular sessions with actionable guidance and accountability
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
                <p className="text-gray-700">
                  Monitor achievements and adjust strategy for optimal results
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Why Choose Our Career Coaching?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-passport text-2xl text-teal-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Immigration-Focused</h3>
                <p className="text-gray-700">
                  Unlike generic career coaches, we understand EB-1A, EB-2 NIW, and O-1 requirements and build your career accordingly.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-handshake text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Partnership Approach</h3>
                <p className="text-gray-700">
                  We don't just advise—we actively work with you to implement strategies and achieve measurable results.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Dual Outcomes</h3>
                <p className="text-gray-700">
                  Advance your career while simultaneously building extraordinary ability credentials for immigration success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Accelerate Your Career & Immigration Journey?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Get expert career coaching that positions you for both professional success and immigration approval
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/schedule" className="bg-white text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                Schedule Coaching Session
              </Link>
              <Link to="/assessment" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-teal-600 transition-all">
                Free Profile Assessment
              </Link>
              <Link to="/contact" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-all">
                <i className="fas fa-envelope mr-2"></i>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CareerCoachingPage;
