import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const EB2NIWPage = () => {
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
              EB-2 NIW Eligibility & Profile Building
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Master the 3-Prong Test and build a compelling National Interest Waiver petition
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What is EB-2 NIW?</h2>
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
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We help you articulate your proposed endeavor, identify its national importance, gather supporting documentation (publications, patents, media coverage), and craft a compelling narrative with concrete evidence of impact. We also help you obtain expert letters from recognized authorities validating your work's significance.
                      </p>
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
                    
                    <div className="bg-purple-50 p-5 rounded-lg mb-4">
                      <h4 className="font-semibold text-primary mb-3 text-lg">
                        <i className="fas fa-trophy mr-2"></i>Key Evidence Types:
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg">
                          <p className="font-semibold text-gray-800 mb-1">Academic Credentials</p>
                          <p className="text-sm text-gray-600">PhD, Master's degrees, specialized training</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="font-semibold text-gray-800 mb-1">Publication Record</p>
                          <p className="text-sm text-gray-600">Peer-reviewed papers, high citations</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="font-semibold text-gray-800 mb-1">Past Success</p>
                          <p className="text-sm text-gray-600">Completed projects, proven results</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="font-semibold text-gray-800 mb-1">Expert Letters</p>
                          <p className="text-sm text-gray-600">Endorsements from field leaders</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We conduct a comprehensive profile analysis, identify your strongest qualifications, help you document your track record with quantifiable achievements, and strategize on obtaining powerful recommendation letters. We also help fill gaps in your profile through targeted activities like publishing, speaking engagements, and professional recognitions.
                      </p>
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
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        <i className="fas fa-exclamation-triangle mr-2"></i>Common Pitfall to Avoid:
                      </h4>
                      <p className="text-gray-700">
                        Simply showing you're qualified is <strong>not enough</strong>. You must explain why the U.S. specifically benefits from waiving the job offer requirement for YOUR case. Generic statements about field importance won't suffice—you need personalized, specific arguments.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We develop a tailored "balancing test" strategy specific to your situation, craft persuasive arguments for why waiving requirements benefits the U.S., gather supporting evidence (government policy documents, industry reports, expert opinions), and create a compelling petition narrative that clearly articulates the national interest served by your work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our EB-2 NIW Profile Building Services</h2>
              <p className="text-xl text-gray-600">
                Comprehensive support to strengthen your profile and prepare winning documentation
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Eligibility Assessment</h3>
                <p className="text-gray-700">
                  Comprehensive evaluation of your qualifications against EB-2 and NIW requirements. We identify your strengths and gaps, and assess your chances of success.
                </p>
              </div>
              
              {/* Service 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-route"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Strategic Roadmap</h3>
                <p className="text-gray-700">
                  Personalized action plan to strengthen your profile. We prioritize activities that will have the most impact on your 3-prong test arguments.
                </p>
              </div>
              
              {/* Service 3 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-edit"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Proposed Endeavor Statement</h3>
                <p className="text-gray-700">
                  Help crafting a compelling description of your future work that clearly demonstrates substantial merit and national importance.
                </p>
              </div>
              
              {/* Service 4 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-folder-open"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Evidence Portfolio</h3>
                <p className="text-gray-700">
                  Organize and document your qualifications: publications, patents, awards, media coverage, recommendation letters, and proof of impact.
                </p>
              </div>
              
              {/* Service 5 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Recommendation Letter Strategy</h3>
                <p className="text-gray-700">
                  Identify ideal recommenders, provide letter templates, and coach on what strong letters should emphasize for each prong of the test.
                </p>
              </div>
              
              {/* Service 6 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Impact Documentation</h3>
                <p className="text-gray-700">
                  Help quantifying and documenting the impact of your work: citations, downloads, adoption metrics, economic benefits, social impact.
                </p>
              </div>
              
              {/* Service 7 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-book-open"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Publication Support</h3>
                <p className="text-gray-700">
                  Guidance on targeting high-impact journals, conference strategy, and increasing visibility of your research work.
                </p>
              </div>
              
              {/* Service 8 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-newspaper"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Media & Recognition</h3>
                <p className="text-gray-700">
                  Strategies to gain media coverage, awards, and professional recognition that strengthen your national importance argument.
                </p>
              </div>
              
              {/* Service 9 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Application Preparation</h3>
                <p className="text-gray-700">
                  Assistance with I-140 form completion, supporting documents organization, and ensuring your petition package is complete and compelling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: EB-1A vs EB-2 NIW */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">EB-1A vs EB-2 NIW: Which is Right for You?</h2>
            <p className="text-xl text-gray-600 mb-10 text-center">
              Both are self-petitioned green cards, but have different requirements and standards
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-lg rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="p-4 text-left">Factor</th>
                    <th className="p-4 text-left">EB-1A</th>
                    <th className="p-4 text-left">EB-2 NIW</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-4 font-semibold">Standard</td>
                    <td className="p-4">Extraordinary ability (top of field)</td>
                    <td className="p-4">Advanced degree or exceptional ability</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Education Requirement</td>
                    <td className="p-4">None (achievement-based)</td>
                    <td className="p-4">Master's or higher (or Bachelor's + 5 years)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Criteria to Meet</td>
                    <td className="p-4">3 out of 10 EB-1A criteria</td>
                    <td className="p-4">All 3 prongs of Dhanasar test</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Focus</td>
                    <td className="p-4">Past achievements and recognition</td>
                    <td className="p-4">Future work and national benefit</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Processing Time</td>
                    <td className="p-4">~12-16 months (premium: 45 days)</td>
                    <td className="p-4">~12-18 months (no premium)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Ideal For</td>
                    <td className="p-4">Established experts, award winners, cited researchers</td>
                    <td className="p-4">Emerging professionals, entrepreneurs, researchers with important work</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Difficulty</td>
                    <td className="p-4"><span className="text-red-600 font-bold">Higher</span> - requires extraordinary evidence</td>
                    <td className="p-4"><span className="text-green-600 font-bold">Moderate</span> - more accessible</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 bg-blue-50 border-l-4 border-primary p-6 rounded-lg">
              <p className="text-gray-700">
                <i className="fas fa-info-circle text-primary mr-2"></i>
                <strong>Which should you choose?</strong> If you're early in your career or don't have extensive awards/recognition yet, EB-2 NIW is often more attainable. If you have strong evidence of extraordinary ability (major awards, high citations, media coverage), EB-1A may be worth pursuing for faster processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Strategies */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Keys to a Strong EB-2 NIW Petition</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              Based on our experience with successful NIW cases
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Clear Proposed Endeavor</h3>
                    <p className="text-gray-700 text-sm">Define specific, concrete work you'll do in the U.S., not vague job descriptions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Quantifiable Impact</h3>
                    <p className="text-gray-700 text-sm">Use numbers: citations, users, revenue, jobs created, patients helped, etc.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Strong Expert Letters</h3>
                    <p className="text-gray-700 text-sm">5-6 letters from independent experts who can speak to your work's significance</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">National Scope Evidence</h3>
                    <p className="text-gray-700 text-sm">Show work impacts beyond local area: multiple states, nationwide, or U.S. interests abroad</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Track Record</h3>
                    <p className="text-gray-700 text-sm">Demonstrate past success executing similar projects, not just theoretical capability</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Urgency & Relevance</h3>
                    <p className="text-gray-700 text-sm">Align with current U.S. priorities: AI, healthcare, climate, economy, security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your EB-2 NIW Journey?</h2>
            <p className="text-xl mb-4 opacity-90">
              Let's evaluate your eligibility and create a winning strategy for your National Interest Waiver petition
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left max-w-3xl mx-auto">
              <p className="text-sm text-gray-700">
                <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                <strong>Important Reminder:</strong> We provide profile building and application preparation services. We are NOT attorneys. For legal representation, please consult a licensed immigration attorney.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/schedule" className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
                Schedule Free Consultation
              </Link>
              <Link to="/profile-building" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all">
                View Profile Building Services
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EB2NIWPage;
