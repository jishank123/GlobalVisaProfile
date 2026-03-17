import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProfileBuildingPage = () => {
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
              Profile Building Services
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              We help you strengthen your credentials and build a compelling profile that meets EB-1A criteria through strategic planning and active development guidance
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What is Profile Building?</h2>
            <p className="text-gray-700 mb-4">
              Profile building is our comprehensive service that goes beyond traditional immigration consulting. While most firms only help you document existing achievements, we <strong>actively work with you to develop new qualifications</strong> that strengthen your EB-1A case.
            </p>
            <p className="text-gray-700 mb-6">
              Many talented professionals have the potential to meet EB-1A criteria but lack specific evidence or documentation. Our profile building services bridge this gap by:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-primary mb-3">
                  <i className="fas fa-search-plus mr-2"></i>Gap Analysis
                </h3>
                <p className="text-gray-700">
                  Identifying which of the 10 EB-1A criteria you currently meet and which ones you can realistically achieve with our guidance.
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-green-700 mb-3">
                  <i className="fas fa-route mr-2"></i>Strategic Roadmap
                </h3>
                <p className="text-gray-700">
                  Creating a personalized action plan with specific steps, timelines, and milestones to develop missing evidence.
                </p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-purple-700 mb-3">
                  <i className="fas fa-hands-helping mr-2"></i>Active Assistance
                </h3>
                <p className="text-gray-700">
                  Connecting you with opportunities, guiding applications, drafting materials, and facilitating introductions to build your profile.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-yellow-700 mb-3">
                  <i className="fas fa-file-invoice mr-2"></i>Documentation
                </h3>
                <p className="text-gray-700">
                  Properly documenting all achievements with supporting evidence that meets USCIS requirements and standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How We Help You Meet Each Criterion</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive services tailored to help you qualify under each of the 10 EB-1A criteria
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            
            {/* Service 1: Awards */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-award text-3xl text-yellow-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Awards & Recognition</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #1</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We identify award opportunities in your field and guide you through the application process.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Research relevant awards and honors</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Prepare nomination materials</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Coordinate nominator support</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Document award significance</span>
                </li>
              </ul>
            </div>

            {/* Service 2: Memberships */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-users text-3xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Memberships</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #2</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We guide you to exclusive professional associations that require outstanding achievements.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Identify qualifying associations</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Prepare membership applications</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Secure nomination letters</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Document membership criteria</span>
                </li>
              </ul>
            </div>

            {/* Service 3: Media Coverage */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-newspaper text-3xl text-red-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Media Coverage</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #3</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We develop and execute media strategies to get your work featured in major publications.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Create press-worthy story angles</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Connect with journalists</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Pitch to relevant publications</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Arrange interviews & features</span>
                </li>
              </ul>
            </div>

            {/* Service 4: Judging */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-gavel text-3xl text-indigo-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Judging & Peer Review</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #4</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We connect you with peer review and judging opportunities in your field.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Journal peer review opportunities</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Conference program committees</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Grant review panels</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Competition judging roles</span>
                </li>
              </ul>
            </div>

            {/* Service 5: Original Contributions */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-lightbulb text-3xl text-green-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Original Contributions</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #5</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We help articulate and document the major significance of your contributions.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Identify key contributions</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Document impact and adoption</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Obtain expert testimonials</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Quantify influence metrics</span>
                </li>
              </ul>
            </div>

            {/* Service 6: Publications */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-file-alt text-3xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Scholarly Publications</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #6</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We guide your publication strategy to maximize impact and citations.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Target high-impact journals</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Writing and editing support</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Citation analysis & metrics</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Publication impact documentation</span>
                </li>
              </ul>
            </div>

            {/* Service 7: Leadership Roles */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-user-tie text-3xl text-teal-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Leadership Roles</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #8</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We document your critical role and help position you for leadership opportunities.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Document role criticality</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Establish org reputation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Quantify leadership impact</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Obtain verification letters</span>
                </li>
              </ul>
            </div>

            {/* Service 8: High Compensation */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-dollar-sign text-3xl text-green-700"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">High Compensation</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #9</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We compile comprehensive compensation analysis with industry comparisons.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Gather salary statistics</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Document total compensation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Statistical analysis & charts</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Employer verification letters</span>
                </li>
              </ul>
            </div>

            {/* Service 9: Commercial Success */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-chart-line text-3xl text-orange-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Commercial Success</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #10</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We document market success and commercial impact of your work.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Sales & revenue documentation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">User adoption metrics</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Market impact analysis</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Company verification</span>
                </li>
              </ul>
            </div>

            {/* Service 10: Comprehensive Package */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all text-white">
              <div className="flex items-start mb-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-star text-3xl text-white"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Complete Profile Package</h3>
                  <p className="text-sm font-semibold opacity-90">All Criteria Covered</p>
                </div>
              </div>
              <p className="mb-4 opacity-90">
                Our comprehensive package includes assessment, strategy, active development, and petition preparation.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-yellow-300 mt-1 mr-2"></i>
                  <span>Full eligibility assessment</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-yellow-300 mt-1 mr-2"></i>
                  <span>12-month development plan</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-yellow-300 mt-1 mr-2"></i>
                  <span>Active guidance & support</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-yellow-300 mt-1 mr-2"></i>
                  <span>Complete petition preparation</span>
                </li>
              </ul>
              <Link to="/" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all inline-block">
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Profile Building Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A systematic approach to developing your EB-1A profile over 12-18 months
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary"></div>
              
              {/* Phase 1 */}
              <div className="mb-12 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Phase 1: Assessment</h3>
                    <p className="text-primary font-semibold mb-3">Months 1-2</p>
                    <p className="text-gray-700">
                      Comprehensive evaluation of your current profile, identification of qualifying criteria, gap analysis, and development of strategic roadmap.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg z-10">
                  1
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
              
              {/* Phase 2 */}
              <div className="mb-12 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg z-10">
                  2
                </div>
                <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0">
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Phase 2: Quick Wins</h3>
                    <p className="text-green-700 font-semibold mb-3">Months 3-6</p>
                    <p className="text-gray-700">
                      Focus on criteria that can be achieved quickly: memberships, peer review, media coverage, documentation of existing achievements.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Phase 3 */}
              <div className="mb-12 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 mb-4 md:mb-0">
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Phase 3: Long-term Development</h3>
                    <p className="text-purple-700 font-semibold mb-3">Months 7-12</p>
                    <p className="text-gray-700">
                      Work on criteria requiring more time: publications, awards, leadership recognition, building evidence of original contributions.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg z-10">
                  3
                </div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
              
              {/* Phase 4 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg z-10">
                  4
                </div>
                <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0">
                  <div className="bg-yellow-50 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Phase 4: Petition Preparation</h3>
                    <p className="text-yellow-700 font-semibold mb-3">Months 13-15</p>
                    <p className="text-gray-700">
                      Compile all evidence, draft petition, obtain recommendation letters, prepare final documentation package, and file with USCIS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">
              Hear from clients who built their profiles with us
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "When I started, I only met 1 criterion. Over 14 months, the team helped me get published, join exclusive associations, and secure media coverage. My EB-1A was approved without RFE!"
              </p>
              <div className="flex items-center">
                <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mr-3">
                  SK
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Dr. Sarah K.</div>
                  <div className="text-sm text-gray-600">Research Scientist</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The profile building service was a game-changer. They connected me with award opportunities I didn't know existed and helped me become a peer reviewer for top journals."
              </p>
              <div className="flex items-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mr-3">
                  AP
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alex P.</div>
                  <div className="text-sm text-gray-600">Software Engineer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Their strategic approach made all the difference. They didn't just document my work—they helped me build a profile that clearly demonstrated extraordinary ability."
              </p>
              <div className="flex items-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold mr-3">
                  ML
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maria L.</div>
                  <div className="text-sm text-gray-600">Business Executive</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Start Building Your Profile Today</h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Don't wait until you have everything perfect. We'll work with you to strategically develop the profile you need for EB-1A success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/schedule" className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
              Schedule Free Assessment
            </Link>
            <Link to="/eb1a-eligibility" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all">
              Review EB-1A Criteria
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProfileBuildingPage;
