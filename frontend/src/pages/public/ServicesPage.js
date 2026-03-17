import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const ServicesPage = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div>
      
      {/* Hero Section */}
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Immigration Services
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Comprehensive profile building and application preparation services for employment-based immigration
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* EB-1A Service */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-trophy text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">EB-1A Extraordinary Ability</h3>
              <p className="text-gray-600 mb-6">
                For individuals with extraordinary ability in sciences, arts, education, business, or athletics. No job offer required.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Profile assessment & gap analysis</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Evidence documentation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Application preparation</span>
                </li>
              </ul>
              <Link to="/eb1a" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                Learn More
              </Link>
            </div>

            {/* EB-2 NIW Service */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-star text-3xl text-indigo-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">EB-2 NIW</h3>
              <p className="text-gray-600 mb-6">
                National Interest Waiver for professionals whose work benefits the United States. No labor certification required.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">National interest argument</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Proposed endeavor strategy</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Impact documentation</span>
                </li>
              </ul>
              <Link to="/eb2-niw" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block">
                Learn More
              </Link>
            </div>

            {/* O-1 Visa Service */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-medal text-3xl text-red-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">O-1 Visa</h3>
              <p className="text-gray-600 mb-6">
                Non-immigrant visa for individuals with extraordinary ability. Fast-track processing available.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Fast-track processing</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Achievement documentation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Sponsor relationship setup</span>
                </li>
              </ul>
              <Link to="/o1-visa" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block">
                Learn More
              </Link>
            </div>

            {/* Career Coaching Service - NEW */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-briefcase text-3xl text-teal-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Coaching</h3>
              <p className="text-gray-600 mb-6">
                Strategic career development to advance your professional trajectory and build extraordinary ability credentials.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Career strategy & positioning</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Leadership development</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Industry positioning</span>
                </li>
              </ul>
              <Link to="/career-coaching" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors inline-block">
                Learn More
              </Link>
            </div>
          </div>

          {/* Profile Building Service - Full Width */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-user-plus text-3xl text-yellow-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Profile Building Services</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive profile development to strengthen your immigration case and qualify for premium categories.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Publication strategy</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Awards & recognition guidance</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Media coverage assistance</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Speaking opportunities</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Network building</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Impact documentation</span>
                  </li>
                </ul>
              </div>
              <Link to="/profile-building" className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors inline-block">
                Learn More
              </Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Take our free assessment or schedule a consultation to discuss your immigration goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment" className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary transition-all">
                <i className="fas fa-chart-line mr-2"></i>
                Free Profile Assessment
              </Link>
              <Link to="/schedule" className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all">
                <i className="fas fa-calendar mr-2"></i>
                Schedule Consultation
              </Link>
              <Link to="/contact" className="bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-all">
                <i className="fas fa-envelope mr-2"></i>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ServicesPage;