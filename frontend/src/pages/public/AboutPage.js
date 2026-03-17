import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CTAModal from '../../components/CTAModal';

const AboutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Open modal after 3 seconds
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  const stats = [
    { number: '500+', label: 'Satisfied Clients Worldwide' },
    { number: '95%', label: 'Success Rate' },
    { number: '50+', label: 'Countries Served' },
    { number: '10+', label: 'Years of Experience' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CTA Modal */}
      <CTAModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About EB1A Experts</h1>
            <p className="text-xl text-blue-100">
              Your trusted partner in achieving the American Dream through EB-1A visa success
            </p>
          </div>
        </div>
      </div>

      {/* Core Philosophy Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  The Core Philosophy in Our EB-1A Mentorship Program
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We at EB1A Experts believe the criterion of the EB-1 visas should not be limited to high-society tycoons. If you are an accomplished person in your respective field, you fulfill all the criteria to apply for the EB1A green card.
                  </p>
                  <p>
                    As leading EB-1A consultants, we understand that extraordinary ability immigration is accessible to a much broader range of professionals than many realize. Whether you're a researcher, artist, entrepreneur, or professional in any field demonstrating extraordinary ability, the EB-1A visa category may be your pathway to U.S. permanent residency.
                  </p>
                  <p>
                    We have seen from countless experiences that most candidates lack a robust portfolio or accurate storytelling that is recognized by USCIS. This is precisely where our EB1A Experts step in.
                  </p>
                  <p>
                    Our visa consultancy services are designed around telling your story in a clear manner that is recognizable to USCIS. We help you navigate the complex EB-1A visa application process by ensuring your petition demonstrates sustained national or international acclaim in your field of extraordinary ability.
                  </p>
                </div>
                <div className="mt-8">
                  <Link 
                    to="/assessment" 
                    className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    Get Your Free Assessment
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8 shadow-xl">
                  {/* Animated SVG Illustration */}
                  <svg viewBox="0 0 500 400" className="w-full h-auto">
                    {/* Background elements */}
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    
                    {/* Globe/World */}
                    <circle cx="250" cy="200" r="120" fill="url(#grad1)" opacity="0.2">
                      <animate attributeName="r" values="120;125;120" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="250" cy="200" r="100" fill="none" stroke="url(#grad1)" strokeWidth="3" opacity="0.6">
                      <animate attributeName="stroke-dasharray" values="0,628;628,0" dur="4s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Latitude lines */}
                    <ellipse cx="250" cy="200" rx="100" ry="30" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4" />
                    <ellipse cx="250" cy="200" rx="100" ry="60" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4" />
                    
                    {/* Longitude line */}
                    <ellipse cx="250" cy="200" rx="30" ry="100" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.4" />
                    
                    {/* Person silhouette */}
                    <g transform="translate(200, 150)">
                      <circle cx="50" cy="30" r="20" fill="url(#grad2)">
                        <animate attributeName="cy" values="30;28;30" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <path d="M 50 50 L 50 100 M 50 70 L 30 90 M 50 70 L 70 90 M 50 100 L 35 130 M 50 100 L 65 130" 
                            stroke="url(#grad2)" strokeWidth="6" strokeLinecap="round" fill="none">
                        <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />
                      </path>
                    </g>
                    
                    {/* Success path arrow */}
                    <path d="M 100 300 Q 250 250 400 300" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray="5,5" opacity="0.6">
                      <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Stars/Achievement markers */}
                    <g>
                      <path d="M 380 120 L 385 130 L 395 132 L 387 140 L 389 150 L 380 145 L 371 150 L 373 140 L 365 132 L 375 130 Z" 
                            fill="#fbbf24" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
                        <animateTransform attributeName="transform" type="rotate" values="0 380 135;360 380 135" dur="20s" repeatCount="indefinite" />
                      </path>
                      <path d="M 120 100 L 125 110 L 135 112 L 127 120 L 129 130 L 120 125 L 111 130 L 113 120 L 105 112 L 115 110 Z" 
                            fill="#fbbf24" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
                        <animateTransform attributeName="transform" type="rotate" values="0 120 115;360 120 115" dur="25s" repeatCount="indefinite" />
                      </path>
                      <path d="M 400 280 L 405 290 L 415 292 L 407 300 L 409 310 L 400 305 L 391 310 L 393 300 L 385 292 L 395 290 Z" 
                            fill="#fbbf24" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" begin="1s" />
                        <animateTransform attributeName="transform" type="rotate" values="0 400 295;360 400 295" dur="22s" repeatCount="indefinite" />
                      </path>
                    </g>
                    
                    {/* Document/Certificate icon */}
                    <g transform="translate(350, 180)">
                      <rect x="0" y="0" width="60" height="80" rx="5" fill="white" stroke="#3b82f6" strokeWidth="2" opacity="0.9">
                        <animate attributeName="y" values="0;-5;0" dur="3s" repeatCount="indefinite" />
                      </rect>
                      <line x1="10" y1="15" x2="50" y2="15" stroke="#3b82f6" strokeWidth="2" />
                      <line x1="10" y1="25" x2="50" y2="25" stroke="#3b82f6" strokeWidth="2" />
                      <line x1="10" y1="35" x2="40" y2="35" stroke="#3b82f6" strokeWidth="2" />
                      <circle cx="30" cy="55" r="8" fill="#14b8a6" />
                      <path d="M 26 55 L 29 58 L 34 52" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </g>
                    
                    {/* Floating particles */}
                    <circle cx="150" cy="250" r="3" fill="#14b8a6" opacity="0.6">
                      <animate attributeName="cy" values="250;230;250" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="320" cy="320" r="3" fill="#06b6d4" opacity="0.6">
                      <animate attributeName="cy" values="320;300;320" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="180" cy="150" r="3" fill="#6366f1" opacity="0.6">
                      <animate attributeName="cy" values="150;135;150" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="3.5s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-400 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-teal-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm md:text-base text-blue-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Approach Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Our Comprehensive Approach
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-search text-white text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Evaluation</h3>
                <p className="text-gray-700">
                  We conduct a thorough EB1A evaluation to identify your strongest qualifications and build a compelling case.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-file-alt text-white text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Documentation Strategy</h3>
                <p className="text-gray-700">
                  Expert guidance on gathering and presenting evidence that meets USCIS requirements for extraordinary ability.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-chart-line text-white text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Building</h3>
                <p className="text-gray-700">
                  Transform your professional accomplishments into compelling evidence that demonstrates sustained acclaim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your EB-1A Journey?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Let us help you achieve your American Dream with our expert guidance and proven strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/assessment" 
                className="inline-block bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Get Free Assessment
              </Link>
              <Link 
                to="/contact" 
                className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-600 px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
