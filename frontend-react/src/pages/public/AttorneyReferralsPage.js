import React from 'react';
import { Link } from 'react-router-dom';

const AttorneyReferralsPage = () => {
  return (
    <div>
      
      {/* Hero Section */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-blue-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <i className="fas fa-balance-scale mr-2"></i>LEGAL REPRESENTATION
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Attorney Referrals & Legal Partners
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Connect with experienced immigration attorneys for legal representation and advice
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 max-w-3xl mx-auto">
              <p className="text-gray-700 text-left">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                <strong>Important:</strong> While we provide profile building and application preparation services, we strongly recommend working with a licensed immigration attorney for legal representation, advice, and petition filing. Below are resources to help you find qualified legal counsel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why You Need an Attorney */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Why Work with an Immigration Attorney?</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-primary">
                <div className="flex items-start mb-4">
                  <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="fas fa-gavel text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Representation</h3>
                    <p className="text-gray-700">
                      Attorneys can officially represent you before USCIS, handle legal complexities, and provide attorney-client privilege protection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-600">
                <div className="flex items-start mb-4">
                  <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="fas fa-file-contract text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Strategy & Advice</h3>
                    <p className="text-gray-700">
                      Receive expert legal opinions on your case, petition strategy, and how to handle complex legal issues or RFEs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-600">
                <div className="flex items-start mb-4">
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="fas fa-shield-alt text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Risk Mitigation</h3>
                    <p className="text-gray-700">
                      Attorneys identify potential legal issues, ensure compliance with immigration law, and protect your interests throughout the process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-600">
                <div className="flex items-start mb-4">
                  <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i className="fas fa-hand-holding-heart text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Peace of Mind</h3>
                    <p className="text-gray-700">
                      Having qualified legal counsel ensures your petition is properly filed and gives you confidence throughout the immigration process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work with Attorneys */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">How Our Services Complement Legal Representation</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    <i className="fas fa-users mr-2"></i>Our Role (Profile Building)
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                      <span className="text-gray-700">Profile assessment and gap analysis</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                      <span className="text-gray-700">Evidence collection and documentation</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                      <span className="text-gray-700">Portfolio organization and preparation</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                      <span className="text-gray-700">Credential strengthening strategies</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                      <span className="text-gray-700">Recommendation letter coordination</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                      <span className="text-gray-700">Form completion guidance (non-legal)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-secondary mb-4">
                    <i className="fas fa-balance-scale mr-2"></i>Attorney's Role (Legal Services)
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-gavel text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Legal representation before USCIS</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-gavel text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Legal strategy and case analysis</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-gavel text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Petition drafting and legal arguments</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-gavel text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Legal advice on immigration matters</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-gavel text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">RFE responses and legal arguments</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-gavel text-blue-600 mt-1 mr-3"></i>
                      <span className="text-gray-700">Official filing and case management</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-500">
                <h4 className="text-xl font-bold text-green-800 mb-3">
                  <i className="fas fa-handshake mr-2"></i>The Perfect Partnership
                </h4>
                <p className="text-gray-700 mb-3">
                  Many of our clients work with us for profile building while simultaneously engaging an immigration attorney for legal representation. This collaborative approach provides:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Comprehensive support covering both profile development and legal expertise</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Well-organized evidence packages that attorneys can easily review and use</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Cost-effective approach by handling preparation work separately from legal work</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-star text-yellow-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Higher success rates through strategic profile building combined with expert legal representation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Finding an Attorney Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">How to Find a Qualified Immigration Attorney</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-bold text-primary mb-4">
                  <i className="fas fa-search mr-2"></i>Where to Look
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-globe text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">American Immigration Lawyers Association (AILA)</h4>
                      <p className="text-gray-700 text-sm">Use AILA's lawyer referral service to find attorneys specializing in employment-based immigration</p>
                      <a href="https://www.aila.org/lawyer-referral" target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">Visit AILA Referral Service</a>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-balance-scale text-green-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">State Bar Associations</h4>
                      <p className="text-gray-700 text-sm">Contact your state bar association for attorney referrals and verify licensing status</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-users text-purple-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Professional Networks</h4>
                      <p className="text-gray-700 text-sm">Ask colleagues, employers, or other professionals who have gone through the immigration process</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <div className="bg-orange-100 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-star text-orange-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Online Reviews & Ratings</h4>
                      <p className="text-gray-700 text-sm">Check Avvo, Martindale-Hubbell, and Google reviews, but verify credentials independently</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-secondary mb-4">
                  <i className="fas fa-clipboard-check mr-2"></i>What to Look For
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <div>
                      <h4 className="font-semibold text-gray-900">EB-1A/NIW Specialization</h4>
                      <p className="text-gray-700 text-sm">Look for attorneys who specifically handle extraordinary ability and national interest waiver cases</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <div>
                      <h4 className="font-semibold text-gray-900">Track Record</h4>
                      <p className="text-gray-700 text-sm">Ask about their success rates and experience with cases similar to yours</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <div>
                      <h4 className="font-semibold text-gray-900">Clear Communication</h4>
                      <p className="text-gray-700 text-sm">Choose someone who explains complex legal concepts clearly and responds promptly</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <div>
                      <h4 className="font-semibold text-gray-900">Transparent Fees</h4>
                      <p className="text-gray-700 text-sm">Ensure they provide clear fee structures and written agreements</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                    <div>
                      <h4 className="font-semibold text-gray-900">Good Standing</h4>
                      <p className="text-gray-700 text-sm">Verify they are licensed and in good standing with their state bar</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions to Ask Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Questions to Ask Potential Attorneys</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-4">Experience & Expertise</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-primary mt-1 mr-2"></i>
                      <span className="text-gray-700">How many EB-1A/NIW cases have you handled?</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-primary mt-1 mr-2"></i>
                      <span className="text-gray-700">What is your success rate for these case types?</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-primary mt-1 mr-2"></i>
                      <span className="text-gray-700">Have you handled cases in my field before?</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-primary mt-1 mr-2"></i>
                      <span className="text-gray-700">How do you stay current with immigration law changes?</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-secondary mb-4">Process & Communication</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-secondary mt-1 mr-2"></i>
                      <span className="text-gray-700">What is your typical timeline for case preparation?</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-secondary mt-1 mr-2"></i>
                      <span className="text-gray-700">How often will you update me on case progress?</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-secondary mt-1 mr-2"></i>
                      <span className="text-gray-700">Who will be working on my case day-to-day?</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-question-circle text-secondary mt-1 mr-2"></i>
                      <span className="text-gray-700">What is your fee structure and payment schedule?</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-bold text-yellow-800 mb-2">
                  <i className="fas fa-exclamation-triangle mr-2"></i>Red Flags to Avoid
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Guarantees of approval (no attorney can guarantee USCIS decisions)</li>
                  <li>• Requests for payment before providing a written agreement</li>
                  <li>• Lack of specific experience with your case type</li>
                  <li>• Poor communication or delayed responses</li>
                  <li>• Unwillingness to provide references or case examples</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Additional Resources</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-400">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-globe text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AILA Lawyer Referral</h3>
                <p className="text-gray-700 mb-4">
                  Find immigration attorneys through the American Immigration Lawyers Association's official referral service.
                </p>
                <a href="https://www.aila.org/lawyer-referral" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                  Visit AILA Referral →
                </a>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-400">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-search text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">State Bar Directories</h3>
                <p className="text-gray-700 mb-4">
                  Search state bar association directories to verify attorney licensing and find local immigration lawyers.
                </p>
                <a href="https://www.americanbar.org/groups/legal_services/flh-home/flh-bar-directories-and-lawyer-finders/" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
                  Find State Bars →
                </a>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-400">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-balance-scale text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Legal Aid Organizations</h3>
                <p className="text-gray-700 mb-4">
                  Find pro bono and low-cost legal services through nonprofit immigration legal aid organizations.
                </p>
                <a href="https://www.immigrationadvocates.org/nonprofit/legaldirectory/" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-semibold hover:underline">
                  Find Legal Aid →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Work with Both Profile Building and Legal Experts?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the best of both worlds: strategic profile development and expert legal representation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment" className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                Start Profile Assessment
              </Link>
              <Link to="/schedule" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary transition-all">
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AttorneyReferralsPage;