import React from 'react';
import { Link } from 'react-router-dom';

const EB2NIWPage = () => {
  return (
    <div>
      
      {/* Hero Section */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              EB-2 NATIONAL INTEREST WAIVER
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              EB-2 NIW Eligibility & Profile Building
            </h1>
            <p className="text-xl text-gray-700 mb-4">
              Master the 3-Prong Test and build a compelling National Interest Waiver petition
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-3xl mx-auto">
              <p className="text-sm text-gray-700 text-left">
                <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                <strong>Disclaimer:</strong> We provide profile building and application preparation services. We are not attorneys and do not provide legal advice. Please <a href="/attorney-referrals" className="text-primary underline">consult an immigration attorney</a> for legal guidance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#three-prong-test" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                Learn the 3-Prong Test
              </a>
              <Link to="/profile-building" className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What is EB-2 NIW?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-4">
                The EB-2 National Interest Waiver (NIW) is a <strong>self-petitioned green card</strong> for professionals with advanced degrees or exceptional ability whose work benefits the United States. Unlike traditional employment-based green cards, NIW allows you to:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-400">
                  <div className="text-center">
                    <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-user-check text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Self-Petition</h3>
                    <p className="text-gray-700">
                      No employer sponsorship required
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-400">
                  <div className="text-center">
                    <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-briefcase-medical text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Labor Cert</h3>
                    <p className="text-gray-700">
                      Skip the lengthy PERM process
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-400">
                  <div className="text-center">
                    <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-flag-usa text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">National Benefit</h3>
                    <p className="text-gray-700">
                      Work benefits the United States
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-primary p-6 mb-8">
                <div className="flex">
                  <i className="fas fa-graduation-cap text-primary text-2xl mr-4"></i>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Who Qualifies for EB-2 NIW?</h4>
                    <p className="text-gray-700 mb-3">
                      EB-2 NIW is ideal for professionals, researchers, entrepreneurs, and specialists in fields like:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Technology:</strong> AI/ML researchers, software engineers, data scientists</li>
                      <li><strong>Healthcare:</strong> Physicians, medical researchers, public health experts</li>
                      <li><strong>Academia:</strong> Professors, postdocs, research scientists</li>
                      <li><strong>Business:</strong> Entrepreneurs with innovative ventures, business analysts</li>
                      <li><strong>Engineering:</strong> Civil, mechanical, electrical, environmental engineers</li>
                      <li><strong>STEM Fields:</strong> Scientists, mathematicians, statisticians</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Requirements Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">Basic EB-2 Requirements</h2>
            <p className="text-xl text-gray-600 mb-10 text-center">
              Before applying for NIW, you must first qualify for EB-2 classification through either:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Advanced Degree */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Advanced Degree</h3>
                <p className="text-gray-700 mb-3">
                  A U.S. master's degree or higher (or foreign equivalent), OR a U.S. bachelor's degree plus 5 years of progressive post-degree work experience
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Qualifying Degrees:</strong> Master's, PhD, MD, JD, MBA, or bachelor's + 5 years experience
                  </p>
                </div>
              </div>
              
              {/* Exceptional Ability */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Exceptional Ability</h3>
                <p className="text-gray-700 mb-3">
                  A degree of expertise significantly above the ordinary in sciences, arts, or business (meet 3 of 6 criteria)
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Academic records (degrees, diplomas)</li>
                    <li>✓ 10+ years experience letters</li>
                    <li>✓ Professional licenses/certifications</li>
                    <li>✓ High salary/remuneration</li>
                    <li>✓ Professional association membership</li>
                    <li>✓ Recognition for achievements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Prong Test Section */}
      <section id="three-prong-test" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">The NIW 3-Prong Test</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To qualify for National Interest Waiver, you must satisfy all three prongs of the <strong>Matter of Dhanasar</strong> framework
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Prong 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-blue-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    1
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                      Substantial Merit & National Importance
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Your proposed endeavor has substantial merit and national importance to the United States
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">What This Means:</h4>
                      <p className="text-gray-700 mb-3">
                        You must demonstrate that your work has real value and broad implications for the U.S. This can be established through:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Economic Impact:</strong> Job creation, business development, innovation</li>
                        <li><strong>Technological Advancement:</strong> New methods, tools, or breakthroughs</li>
                        <li><strong>Healthcare Benefits:</strong> Improved treatments, public health outcomes</li>
                        <li><strong>Education & Research:</strong> Training future professionals, advancing knowledge</li>
                        <li><strong>Environmental Impact:</strong> Sustainability, conservation, climate solutions</li>
                        <li><strong>National Security:</strong> Defense, cybersecurity, critical infrastructure</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-5 rounded-lg mb-4">
                      <h4 className="font-semibold text-primary mb-3 text-lg">
                        <i className="fas fa-check-circle mr-2"></i>Strong Examples:
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>✓ <strong>AI Researcher:</strong> Developing AI models for early cancer detection</li>
                        <li>✓ <strong>Software Engineer:</strong> Building cybersecurity tools to protect critical infrastructure</li>
                        <li>✓ <strong>Entrepreneur:</strong> Creating a startup that addresses renewable energy challenges</li>
                        <li>✓ <strong>Medical Researcher:</strong> Conducting clinical trials for rare disease treatments</li>
                        <li>✓ <strong>Data Scientist:</strong> Using ML to optimize supply chains and reduce waste</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prong 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-purple-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    2
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-user-graduate text-purple-500 mr-2"></i>
                      Well-Positioned to Advance the Endeavor
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      You are well-positioned to advance your proposed endeavor based on your education, skills, knowledge, and track record
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">What This Means:</h4>
                      <p className="text-gray-700 mb-3">
                        You need to prove that <strong>YOU specifically</strong> have the qualifications, resources, and ability to successfully execute your proposed work. Evidence includes:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Educational Background:</strong> Advanced degrees relevant to your field</li>
                        <li><strong>Professional Experience:</strong> Years of specialized experience and accomplishments</li>
                        <li><strong>Publications & Research:</strong> Peer-reviewed papers, citations, impact factor</li>
                        <li><strong>Patents & Innovation:</strong> Intellectual property, technical innovations</li>
                        <li><strong>Awards & Recognition:</strong> Honors demonstrating excellence</li>
                        <li><strong>Leadership Roles:</strong> Management of projects, teams, or organizations</li>
                        <li><strong>Funding & Resources:</strong> Grants, investments, institutional support</li>
                        <li><strong>Industry Partnerships:</strong> Collaborations with leading companies/institutions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prong 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-green-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    3
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-balance-scale text-green-500 mr-2"></i>
                      Benefit to the U.S. to Waive Job Offer Requirement
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      On balance, it would be beneficial to the United States to waive the job offer and labor certification requirements
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">What This Means:</h4>
                      <p className="text-gray-700 mb-3">
                        You must convince USCIS that the U.S. benefits <strong>more</strong> by allowing you to proceed without employer sponsorship. This is the "balancing test" where you demonstrate:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Urgency:</strong> Your work addresses pressing national challenges</li>
                        <li><strong>Impracticality of Job Offer:</strong> Your work nature (entrepreneurship, research flexibility)</li>
                        <li><strong>Broad Impact:</strong> Benefits extend beyond a single employer or location</li>
                        <li><strong>Unique Position:</strong> Few others can do what you do</li>
                        <li><strong>National vs. Local:</strong> Your work serves national, not just local, interests</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-5 rounded-lg mb-4">
                      <h4 className="font-semibold text-primary mb-3 text-lg">
                        <i className="fas fa-shield-alt mr-2"></i>Strong Arguments for Waiver:
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>✓ <strong>Entrepreneurial Work:</strong> Starting a company creates jobs (vs. taking one)</li>
                        <li>✓ <strong>Research Flexibility:</strong> Independent research benefits multiple institutions</li>
                        <li>✓ <strong>Emerging Field:</strong> Your expertise is rare and urgently needed</li>
                        <li>✓ <strong>National Scope:</strong> Work impacts healthcare, security, economy nationwide</li>
                        <li>✓ <strong>Innovation Speed:</strong> Labor certification delays would harm national interests</li>
                        <li>✓ <strong>Public Health/Safety:</strong> Addressing urgent crises (pandemic, security threats)</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
              Ready to Build Your EB-2 NIW Profile?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get expert guidance on strengthening your qualifications and preparing a winning petition
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment" className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                Free Profile Assessment
              </Link>
              <Link to="/schedule" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary transition-all">
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

export default EB2NIWPage;