import React from 'react';
import { Link } from 'react-router-dom';

const O1VisaPage = () => {
  return (
    <div>
      
      {/* Hero Section */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              O-1 VISA - NON-IMMIGRANT EXTRAORDINARY ABILITY
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              O-1 Visa Eligibility & Profile Building
            </h1>
            <p className="text-xl text-gray-700 mb-4">
              Fast-track work authorization for extraordinary individuals - Meet 3 of 8 criteria
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-3xl mx-auto">
              <p className="text-sm text-gray-700 text-left">
                <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                <strong>Disclaimer:</strong> We provide profile building and application preparation services. We are not attorneys and do not provide legal advice. Please <a href="/attorney-referrals" className="text-primary underline">consult an immigration attorney</a> for legal guidance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#o1-criteria" className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                View O-1 Criteria
              </a>
              <Link to="/profile-building" className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-all">
                Profile Building Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What is the O-1 Visa?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                The O-1 visa is a <strong>non-immigrant work visa</strong> for individuals with extraordinary ability or achievement in their field. Unlike EB-1A (green card), O-1 provides temporary work authorization, making it an excellent option for:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-400">
                  <div className="text-center">
                    <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-bolt text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Processing</h3>
                    <p className="text-gray-700">
                      Premium processing: 15 days
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-400">
                  <div className="text-center">
                    <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-sync-alt text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Renewable</h3>
                    <p className="text-gray-700">
                      Extend indefinitely in 1-3 year increments
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-400">
                  <div className="text-center">
                    <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-users text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Family Benefits</h3>
                    <p className="text-gray-700">
                      Spouse & children on O-3 visa
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-primary p-6 mb-8">
                <div className="flex">
                  <i className="fas fa-lightbulb text-primary text-2xl mr-4"></i>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">O-1 as a Stepping Stone to Green Card</h4>
                    <p className="text-gray-700 mb-3">
                      Many professionals use O-1 visa as a bridge to EB-1A permanent residency. The criteria are similar (O-1 requires 3 of 8 criteria; EB-1A requires 3 of 10), making it easier to:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Start working in the U.S. immediately while building your EB-1A profile</li>
                      <li>Gain additional achievements, publications, and recognition in the U.S.</li>
                      <li>Build relationships with U.S. institutions and experts for recommendation letters</li>
                      <li>Develop a dual strategy: O-1 renewal while preparing EB-1A petition</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O-1A vs O-1B Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">Two Types of O-1 Visas</h2>
            <p className="text-xl text-gray-600 mb-10 text-center">
              Choose the category that matches your field of expertise
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* O-1A */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-400">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  O-1A
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Sciences, Education, Business, Athletics</h3>
                <p className="text-gray-700 mb-4">
                  For extraordinary ability in sciences, education, business, or athletics
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Scientists & Researchers</li>
                    <li>✓ Software Engineers & Tech Professionals</li>
                    <li>✓ Business Executives & Entrepreneurs</li>
                    <li>✓ Professors & Educators</li>
                    <li>✓ Professional Athletes</li>
                    <li>✓ Data Scientists & AI Specialists</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    <i className="fas fa-check-circle mr-2"></i>Meet 3 of 8 criteria (similar to EB-1A)
                  </p>
                </div>
              </div>
              
              {/* O-1B */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-400">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  O-1B
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Arts, Motion Pictures, TV</h3>
                <p className="text-gray-700 mb-4">
                  For extraordinary achievement in arts, motion pictures, or television
                </p>
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-gray-900 mb-2">Examples:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Actors & Performers</li>
                    <li>✓ Directors & Producers</li>
                    <li>✓ Musicians & Composers</li>
                    <li>✓ Artists & Designers</li>
                    <li>✓ Fashion Designers</li>
                    <li>✓ Film & TV Production Staff</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    <i className="fas fa-check-circle mr-2"></i>Different criteria for arts vs. motion pictures/TV
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <p className="text-gray-700">
                <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                <strong>This page focuses on O-1A</strong> (sciences, business, education, athletics). O-1B criteria are different and evaluated based on prominence in the arts field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 8 O-1A Criteria Section */}
      <section id="o1-criteria" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">The 8 O-1A Criteria</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You need to meet <strong>at least 3 of these 8 criteria</strong>. We help you identify your qualifications and build strong evidence.
            </p>
            <div className="mt-6 bg-blue-50 border-l-4 border-primary p-4 max-w-3xl mx-auto">
              <p className="text-gray-700 text-left">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                <strong>Note:</strong> These criteria are similar but not identical to EB-1A. O-1 requires 3 of 8 criteria; EB-1A requires 3 of 10.
              </p>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Criterion 1: Awards */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-yellow-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    1
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-award text-yellow-500 mr-2"></i>
                      Awards & Prizes
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Receipt of nationally or internationally recognized prizes or awards for excellence in your field
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Examples of Qualifying Awards:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Tech/Science:</strong> Best Paper Awards, Hackathon wins, Innovation prizes, NSF fellowships</li>
                        <li><strong>Business:</strong> Entrepreneur of the Year, Industry awards, Forbes 30 Under 30</li>
                        <li><strong>Academia:</strong> Fulbright scholarship, Academic fellowships, Research grants based on merit</li>
                        <li><strong>Athletics:</strong> Olympic medals, National championships, Professional awards</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 2: Membership */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-purple-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    2
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-users text-purple-500 mr-2"></i>
                      Professional Memberships
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Membership in associations that require outstanding achievements as judged by recognized experts
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Examples of Qualifying Memberships:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Academia:</strong> Phi Beta Kappa, Sigma Xi, National Academy of Sciences</li>
                        <li><strong>Engineering:</strong> National Academy of Engineering, IEEE Fellow</li>
                        <li><strong>Medicine:</strong> Alpha Omega Alpha, American College of Physicians</li>
                        <li><strong>Business:</strong> Young Presidents' Organization (YPO), exclusive industry councils</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 3: Media */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-blue-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    3
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-newspaper text-blue-500 mr-2"></i>
                      Published Material About You
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Published material about you and your work in professional or major trade publications or other major media
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Examples of Qualifying Media:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Major Publications:</strong> New York Times, Wall Street Journal, Forbes, Nature, Science</li>
                        <li><strong>Industry Media:</strong> TechCrunch, Harvard Business Review, IEEE Spectrum</li>
                        <li><strong>Academic Coverage:</strong> University press releases, research spotlights</li>
                        <li><strong>Professional Journals:</strong> Feature articles, interviews, profiles</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional criteria would continue here... */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                There are 5 more O-1A criteria covering judging, original contributions, scholarly articles, leadership roles, and high salary.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/assessment" className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary transition-all">
                  Get Full Criteria Assessment
                </Link>
                <Link to="/schedule" className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all">
                  Schedule Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">O-1 vs EB-1A: Key Differences</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-lg rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                    <th className="p-4 text-left">Factor</th>
                    <th className="p-4 text-left">O-1 Visa</th>
                    <th className="p-4 text-left">EB-1A Green Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-4 font-semibold">Status</td>
                    <td className="p-4">Temporary work visa</td>
                    <td className="p-4">Permanent residence (green card)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Duration</td>
                    <td className="p-4">1-3 years, renewable indefinitely</td>
                    <td className="p-4">Permanent (path to citizenship)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Criteria</td>
                    <td className="p-4">3 of 8 criteria</td>
                    <td className="p-4">3 of 10 criteria</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Standard</td>
                    <td className="p-4">Extraordinary ability</td>
                    <td className="p-4">Extraordinary ability (higher bar)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Processing</td>
                    <td className="p-4">15 days (premium) / 2-4 months</td>
                    <td className="p-4">45 days (premium) / 12-16 months</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Employer Required</td>
                    <td className="p-4">Yes (petitioner needed)</td>
                    <td className="p-4">No (self-petition)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Apply for Your O-1 Visa?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Get expert guidance on building your extraordinary ability profile and preparing your petition
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment" className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                Free Profile Assessment
              </Link>
              <Link to="/schedule" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-600 transition-all">
                Schedule Consultation
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

export default O1VisaPage;