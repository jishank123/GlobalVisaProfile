import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const O1VisaPage = () => {
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
              O-1 Visa Eligibility & Profile Building
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Fast-track work authorization for extraordinary individuals - Meet 3 of 8 criteria
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What is the O-1 Visa?</h2>
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
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We identify all qualifying awards in your background, research their recognition level and selection criteria, document their significance with evidence, and guide you toward new award opportunities to strengthen your profile.
                      </p>
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
                      Membership in Associations
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Membership in associations that require outstanding achievements as judged by recognized experts
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Qualifying Memberships:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Fellow Designations:</strong> IEEE Fellow, ACM Fellow, AAAS Fellow</li>
                        <li><strong>Selective Organizations:</strong> Invitation-only professional societies</li>
                        <li><strong>Honorary Societies:</strong> Phi Beta Kappa, Sigma Xi, Tau Beta Pi</li>
                        <li><strong>Expert-Reviewed Membership:</strong> Organizations with peer-nomination requirements</li>
                      </ul>
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          <strong>Not Qualifying:</strong> Memberships requiring only payment of fees (e.g., standard IEEE membership)
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We identify prestigious associations in your field, verify their membership requirements, help you apply for Fellow status or selective memberships, and document the selectivity with membership criteria and acceptance rates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 3: Published Material */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-red-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    3
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-newspaper text-red-500 mr-2"></i>
                      Published Material About You
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Published material in professional or major trade publications or major media about you and your work
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Types of Qualifying Coverage:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>News Articles:</strong> Features in newspapers, magazines, online news sites</li>
                        <li><strong>Industry Publications:</strong> Trade journals, professional magazines</li>
                        <li><strong>Interviews:</strong> Podcast interviews, radio/TV appearances, video features</li>
                        <li><strong>Profile Features:</strong> "Person of Interest" articles, expert profiles</li>
                        <li><strong>Press Releases:</strong> About your achievements, innovations, or projects</li>
                        <li><strong>Blog Posts:</strong> By recognized experts or publications discussing your work</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We develop PR strategies to secure media coverage, connect you with journalists and publications, craft compelling pitches about your work, coordinate interviews and features, and document all media mentions with circulation/reach evidence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 4: Judging */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-blue-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    4
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-gavel text-blue-500 mr-2"></i>
                      Judging the Work of Others
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Participation as a judge of the work of others in your field, either individually or on a panel
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Qualifying Judging Activities:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Peer Review:</strong> Reviewing manuscripts for academic journals or conferences</li>
                        <li><strong>Grant Panels:</strong> Serving on NSF, NIH, or other grant review panels</li>
                        <li><strong>Competition Judging:</strong> Evaluating hackathons, business plan competitions, award submissions</li>
                        <li><strong>Thesis Committees:</strong> Serving on PhD dissertation or defense committees</li>
                        <li><strong>Editorial Boards:</strong> Academic journals, conference program committees</li>
                        <li><strong>Industry Judging:</strong> Startup pitch competitions, innovation challenges</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We identify peer review opportunities, connect you with journal editors and conference organizers, guide you to join editorial boards and program committees, help you document all reviewing activities with evidence letters, and track your review contributions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 5: Original Contributions */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-green-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    5
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-lightbulb text-green-500 mr-2"></i>
                      Original Scientific, Scholarly, or Business Contributions
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Evidence of original contributions of major significance in your field
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Types of Original Contributions:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Research Breakthroughs:</strong> New methodologies, theories, or discoveries</li>
                        <li><strong>Patents:</strong> Issued patents or patent applications for innovations</li>
                        <li><strong>Industry Innovation:</strong> New products, platforms, or technologies widely adopted</li>
                        <li><strong>Business Models:</strong> Revolutionary approaches that changed industry practices</li>
                        <li><strong>Standards & Protocols:</strong> Development of industry standards or best practices</li>
                        <li><strong>Open Source:</strong> Widely-used software libraries, frameworks, or tools</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-5 rounded-lg mb-4">
                      <h4 className="font-semibold text-primary mb-3 text-lg">
                        <i className="fas fa-chart-line mr-2"></i>How to Prove "Major Significance":
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>✓ Citations of your work by other researchers</li>
                        <li>✓ Adoption by companies or institutions</li>
                        <li>✓ Economic impact (revenue, cost savings, efficiency gains)</li>
                        <li>✓ Expert letters attesting to the impact</li>
                        <li>✓ Media coverage of your innovation</li>
                        <li>✓ Awards or recognition for the contribution</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We identify your most impactful contributions, quantify their significance with metrics and data, gather evidence of adoption and impact, obtain expert letters validating importance, and craft compelling narratives explaining how your work advanced the field.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 6: Scholarly Articles */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-indigo-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    6
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-book-open text-indigo-500 mr-2"></i>
                      Scholarly Articles Authored
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Authorship of scholarly articles in professional journals or other major media in your field
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Qualifying Publications:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Peer-Reviewed Journals:</strong> Research papers in academic journals</li>
                        <li><strong>Conference Proceedings:</strong> Papers at major conferences (IEEE, ACM, etc.)</li>
                        <li><strong>Book Chapters:</strong> Contributions to edited academic volumes</li>
                        <li><strong>Technical Reports:</strong> White papers, industry reports with wide circulation</li>
                        <li><strong>Trade Publications:</strong> Expert articles in professional magazines</li>
                      </ul>
                      <div className="mt-3 grid md:grid-cols-3 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="font-bold text-2xl text-primary">10+</p>
                          <p className="text-sm text-gray-700">Strong publication count</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="font-bold text-2xl text-green-600">100+</p>
                          <p className="text-sm text-gray-700">Strong citation count</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <p className="font-bold text-2xl text-purple-600">H-index</p>
                          <p className="text-sm text-gray-700">Impact measurement</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We guide publication strategy for high-impact journals, help identify collaboration opportunities, provide writing and submission guidance, track citations using Google Scholar and Web of Science, and create citation reports highlighting your research impact.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 7: Critical Role */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-cyan-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    7
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-user-tie text-cyan-500 mr-2"></i>
                      Leading or Critical Role
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Employment in a leading or critical role for organizations with a distinguished reputation
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">Qualifying Positions:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Leadership Roles:</strong> CTO, VP Engineering, Head of Research, Department Chair</li>
                        <li><strong>Critical Technical Roles:</strong> Lead architect, Principal scientist, Key contributor to major projects</li>
                        <li><strong>Distinguished Organizations:</strong> Fortune 500 companies, top universities, leading research labs</li>
                        <li><strong>Startup Founders:</strong> CEO/CTO of funded startups with notable traction</li>
                        <li><strong>Essential Contributors:</strong> Roles where your absence would significantly impact operations</li>
                      </ul>
                    </div>
                    
                    <div className="bg-cyan-50 p-5 rounded-lg mb-4">
                      <h4 className="font-semibold text-primary mb-3 text-lg">
                        <i className="fas fa-building mr-2"></i>How to Prove "Distinguished Reputation":
                      </h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>✓ Organization rankings (Fortune 500, university rankings)</li>
                        <li>✓ Media coverage about the organization</li>
                        <li>✓ Industry reputation and awards</li>
                        <li>✓ Funding or revenue figures</li>
                        <li>✓ Letters from leadership describing your critical role</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We document your role's importance with organizational charts and job descriptions, gather evidence of the organization's distinguished reputation, obtain letters from supervisors/colleagues describing your critical contributions, and quantify your impact with metrics and achievements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criterion 8: High Salary */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-emerald-400">
              <div className="p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mr-6 flex-shrink-0 shadow-lg">
                    8
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      <i className="fas fa-dollar-sign text-emerald-500 mr-2"></i>
                      High Salary or Remuneration
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg">
                      Command of high salary or other remuneration for services compared to others in the field
                    </p>
                    
                    <div className="bg-white p-5 rounded-lg mb-4 shadow-sm">
                      <h4 className="font-semibold text-primary mb-3 text-lg">What Qualifies as "High Salary":</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Comparative Analysis:</strong> Salary must be high relative to field averages</li>
                        <li><strong>Industry Data:</strong> Use Bureau of Labor Statistics, Glassdoor, Payscale data</li>
                        <li><strong>Total Compensation:</strong> Base salary + bonuses + equity + benefits</li>
                        <li><strong>Consultation Fees:</strong> High hourly or project rates for consulting work</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-3 text-lg">
                        <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                      </h4>
                      <p className="text-gray-700">
                        We compile comprehensive salary analysis with industry comparisons, document total compensation including bonuses and equity, gather salary surveys and market data, obtain employer verification letters, and create compelling salary documentation packages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our O-1 Services Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our O-1 Visa Profile Building Services</h2>
              <p className="text-xl text-gray-600">
                Comprehensive support to meet O-1 criteria and prepare a winning petition
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">O-1 Eligibility Assessment</h3>
                <p className="text-gray-700">
                  Comprehensive evaluation of your qualifications against all 8 O-1A criteria. We identify which criteria you meet and which need strengthening.
                </p>
              </div>
              
              {/* Service 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-route"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Strategic Profile Roadmap</h3>
                <p className="text-gray-700">
                  Personalized action plan to meet at least 3 criteria. We prioritize quick wins and high-impact activities to accelerate your timeline.
                </p>
              </div>
              
              {/* Service 3 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-building"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">U.S. Sponsor Guidance</h3>
                <p className="text-gray-700">
                  Help identifying potential U.S. employers or agents to sponsor your O-1 petition, including guidance on petitioner requirements and relationships.
                </p>
              </div>
              
              {/* Service 4 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-folder-open"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Evidence Portfolio Development</h3>
                <p className="text-gray-700">
                  Organize awards, publications, media coverage, judging experience, and other evidence. We ensure all documents meet USCIS standards.
                </p>
              </div>
              
              {/* Service 5 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Recommendation Letters</h3>
                <p className="text-gray-700">
                  Strategy for obtaining 5-8 strong letters from recognized experts in your field. We provide templates and guidance on ideal recommenders.
                </p>
              </div>
              
              {/* Service 6 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Advisory Opinion Consultation</h3>
                <p className="text-gray-700">
                  Guidance on obtaining peer group advisory opinions when required, including identifying appropriate professional organizations.
                </p>
              </div>
              
              {/* Service 7 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-newspaper"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Media & PR Strategy</h3>
                <p className="text-gray-700">
                  Help securing press coverage, interviews, and media features that strengthen your "published material about you" criterion.
                </p>
              </div>
              
              {/* Service 8 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Petition Preparation Support</h3>
                <p className="text-gray-700">
                  Assistance with Form I-129 completion, supporting documentation organization, and ensuring your petition package is comprehensive and compelling.
                </p>
              </div>
              
              {/* Service 9 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Processing Guidance</h3>
                <p className="text-gray-700">
                  Assistance with premium processing applications for urgent cases, ensuring your petition is ready for the 15-day expedited review timeline.
                </p>
              </div>
              
              {/* Service 10 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-exchange-alt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">O-1 to EB-1A Strategy</h3>
                <p className="text-gray-700">
                  Dual-track planning to leverage O-1 as a bridge to green card. We help you build achievements in the U.S. to strengthen future EB-1A petition.
                </p>
              </div>
              
              {/* Service 11 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-sync"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">O-1 Extension Support</h3>
                <p className="text-gray-700">
                  Assistance with O-1 renewals and extensions, including updating your evidence portfolio with new achievements and ongoing impact documentation.
                </p>
              </div>
              
              {/* Service 12 */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4">
                  <i className="fas fa-child"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">O-3 Dependent Visa Support</h3>
                <p className="text-gray-700">
                  Guidance on O-3 dependent visa applications for your spouse and children under 21, including documentation requirements and filing procedures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O-1 vs EB-1A Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">O-1 Visa vs EB-1A Green Card</h2>
            <p className="text-xl text-gray-600 mb-10 text-center">
              Understanding the differences helps you plan your immigration strategy
            </p>
            
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
                    <td className="p-4 font-semibold">Status Type</td>
                    <td className="p-4">Non-immigrant (temporary)</td>
                    <td className="p-4">Immigrant (permanent residency)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Sponsor Required</td>
                    <td className="p-4">Yes - U.S. employer or agent</td>
                    <td className="p-4">No - self-petition</td>
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
                    <td className="p-4 font-semibold">Duration</td>
                    <td className="p-4">Initial: 3 years, renewable indefinitely</td>
                    <td className="p-4">Permanent (conditional on renewal)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Processing Time</td>
                    <td className="p-4">~3-4 months (15 days with premium)</td>
                    <td className="p-4">~12-16 months (45 days with premium)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Work Flexibility</td>
                    <td className="p-4">Limited to sponsoring employer/field</td>
                    <td className="p-4">Complete flexibility</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-semibold">Family Status</td>
                    <td className="p-4">O-3 dependents (no work authorization)</td>
                    <td className="p-4">Permanent residents (can work)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Best For</td>
                    <td className="p-4">Professionals wanting fast U.S. work authorization</td>
                    <td className="p-4">Those seeking permanent residency and full mobility</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">
                  <i className="fas fa-rocket text-orange-600 mr-2"></i>Choose O-1 When:
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>✓ You need to work in the U.S. quickly (within 3-4 months)</li>
                  <li>✓ You have a job offer from a U.S. employer</li>
                  <li>✓ Your profile isn't quite strong enough for EB-1A yet</li>
                  <li>✓ You want to build more achievements in the U.S. before applying for green card</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-primary p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">
                  <i className="fas fa-home text-primary mr-2"></i>Choose EB-1A When:
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>✓ You want permanent residency and path to citizenship</li>
                  <li>✓ You meet the higher evidence standard for extraordinary ability</li>
                  <li>✓ You want complete job flexibility without sponsor requirements</li>
                  <li>✓ Your family members need work authorization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Tips Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Keys to a Strong O-1 Petition</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              Based on our experience with successful O-1 cases
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Clear Itinerary</h3>
                    <p className="text-gray-700 text-sm">Define specific work you'll do in the U.S., with timeline and locations</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Strong Sponsor</h3>
                    <p className="text-gray-700 text-sm">U.S. employer or agent with clear business need for your services</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Meet 3+ Criteria Clearly</h3>
                    <p className="text-gray-700 text-sm">Strong evidence for at least 3 criteria (aim for 4-5 for safety)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">5-8 Expert Letters</h3>
                    <p className="text-gray-700 text-sm">Detailed letters from recognized authorities attesting to your extraordinary ability</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Comprehensive Evidence</h3>
                    <p className="text-gray-700 text-sm">Organized documentation with cover letters explaining significance of each piece</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Continued Excellence</h3>
                    <p className="text-gray-700 text-sm">Demonstrate ongoing achievements, not just past accomplishments</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Advisory Opinion (if required)</h3>
                    <p className="text-gray-700 text-sm">Peer group consultation letter from relevant professional association</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-3">
                  <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Premium Processing Ready</h3>
                    <p className="text-gray-700 text-sm">Complete, well-organized petition enabling quick USCIS review if expedited</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your O-1 Visa Journey?</h2>
            <p className="text-xl mb-4 opacity-90">
              Get fast-track work authorization in the U.S. with premium processing in just 15 days
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left max-w-3xl mx-auto">
              <p className="text-sm text-gray-700">
                <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                <strong>Important Reminder:</strong> We provide profile building and application preparation services. We are NOT attorneys. For legal representation, please consult a licensed immigration attorney.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/schedule" className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
                Schedule Free Consultation
              </Link>
              <Link to="/eb1a-eligibility" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all">
                Compare with EB-1A
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default O1VisaPage;
