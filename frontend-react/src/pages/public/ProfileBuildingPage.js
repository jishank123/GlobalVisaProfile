import React from 'react';
import { Link } from 'react-router-dom';

const ProfileBuildingPage = () => {
  return (
    <div>
      
      {/* Hero Section */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-blue-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              STRATEGIC PROFILE DEVELOPMENT
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Profile Building Services
            </h1>
            <p className="text-xl text-gray-700 mb-4">
              We help you strengthen your credentials and build a compelling profile that meets EB-1A criteria through strategic planning and active development guidance
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-3xl mx-auto">
              <p className="text-sm text-gray-700">
                <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                <strong>Note:</strong> We provide profile development consultation and application preparation services. We are not attorneys. For legal advice, please consult a licensed immigration attorney.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#services" className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105">
                View Our Services
              </a>
              <Link to="/schedule" className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all">
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What is Profile Building?</h2>
            <div className="prose prose-lg max-w-none">
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
                We help document and showcase your original scientific, scholarly, artistic, athletic, or business-related contributions.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Document innovation impact</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Gather expert testimonials</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Quantify contributions</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Create compelling narratives</span>
                </li>
              </ul>
            </div>

            {/* Service 6: Scholarly Articles */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
              <div className="flex items-start mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-file-alt text-3xl text-blue-600"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Scholarly Articles</h3>
                  <p className="text-sm text-primary font-semibold">Criterion #6</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                We guide your publication strategy to build a strong portfolio of scholarly articles in professional journals.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Target high-impact journals</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Improve manuscript quality</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Track citation metrics</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Build publication portfolio</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Our Profile Building Process</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              A systematic approach to strengthening your immigration profile
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Assessment</h3>
                <p className="text-gray-700">
                  Comprehensive evaluation of your current qualifications against EB-1A criteria
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Strategy</h3>
                <p className="text-gray-700">
                  Develop personalized roadmap with specific actions and timelines
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Execution</h3>
                <p className="text-gray-700">
                  Active support in implementing profile-building activities
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Documentation</h3>
                <p className="text-gray-700">
                  Organize evidence and prepare compelling petition materials
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Success Stories</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              How we've helped professionals strengthen their profiles
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-code text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Software Engineer</h3>
                <p className="text-gray-700 mb-4">
                  "Started with 1 EB-1A criterion. Through strategic profile building, we helped them achieve 5 criteria in 18 months."
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Added:</strong> Awards, media coverage, judging roles, original contributions
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-microscope text-2xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Research Scientist</h3>
                <p className="text-gray-700 mb-4">
                  "Transformed from having only publications to meeting 6 EB-1A criteria through targeted profile development."
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Added:</strong> Professional memberships, peer review, media features, leadership roles
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Business Executive</h3>
                <p className="text-gray-700 mb-4">
                  "Built from 2 criteria to 7 criteria by strategically positioning achievements and gaining recognition."
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Added:</strong> Industry awards, media coverage, high salary documentation, original contributions
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
              Ready to Build Your Extraordinary Profile?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get expert guidance on strengthening your qualifications and achieving EB-1A eligibility
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment" className="bg-white text-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                Free Profile Assessment
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

export default ProfileBuildingPage;