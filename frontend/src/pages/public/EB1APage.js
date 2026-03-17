import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const EB1APage = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const criteria = [
    {
      number: 1,
      title: "Awards & Prizes",
      icon: "fa-award",
      color: "text-yellow-500",
      description: "Receipt of lesser nationally or internationally recognized prizes or awards for excellence in the field of endeavor.",
      examples: [
        "Industry awards and recognition",
        "Academic honors and fellowships",
        "Competition prizes (hackathons, research competitions)",
        "Professional organization awards",
        "Government grants and scholarships based on merit"
      ],
      help: "We identify all qualifying awards in your history, document their significance, and establish their national/international recognition through comprehensive evidence packages."
    },
    {
      number: 2,
      title: "Membership in Associations",
      icon: "fa-users",
      color: "text-purple-500",
      description: "Membership in associations in the field which require outstanding achievements of their members, as judged by recognized national or international experts.",
      examples: [
        "Fellow status in professional organizations (e.g., IEEE Fellow, ACM Fellow)",
        "Invitation-only associations requiring peer nomination",
        "Honorary societies (Phi Beta Kappa, Sigma Xi)",
        "Exclusive industry groups with selective membership criteria"
      ],
      help: "We research membership requirements, document the selective nature of associations, and guide you toward obtaining prestigious memberships that strengthen your case."
    },
    {
      number: 3,
      title: "Published Material About You",
      icon: "fa-newspaper",
      color: "text-red-500",
      description: "Published material about you in professional or major trade publications or other major media, relating to your work in the field.",
      examples: [
        "News articles about your work or achievements",
        "Interviews in industry publications",
        "Features in magazines or newspapers",
        "Press releases about your projects or innovations",
        "Blog posts or articles by recognized experts discussing your work",
        "Podcast interviews or media appearances"
      ],
      help: "We develop media outreach strategies, connect you with journalists, help craft press-worthy stories about your work, and compile comprehensive media coverage documentation."
    },
    {
      number: 4,
      title: "Judging the Work of Others",
      icon: "fa-gavel",
      color: "text-indigo-500",
      description: "Participation, either individually or on a panel, as a judge of the work of others in the same or an allied field.",
      examples: [
        "Peer review for academic journals",
        "Grant review panels (NSF, NIH, etc.)",
        "Conference program committee member",
        "Competition judge (hackathons, awards, contests)",
        "PhD thesis committee external examiner",
        "Industry award selection committees"
      ],
      help: "We guide you to peer review opportunities, help you join program committees, document all judging activities with proper verification, and emphasize the significance of your judging role."
    },
    {
      number: 5,
      title: "Original Contributions",
      icon: "fa-lightbulb",
      color: "text-yellow-500",
      description: "Evidence of your original scientific, scholarly, artistic, athletic, or business-related contributions of major significance in the field.",
      examples: [
        "Research that advanced the field significantly",
        "Patents with commercial or research impact",
        "Innovative methodologies or frameworks adopted by others",
        "Products or services that transformed an industry",
        "Algorithms or techniques widely cited",
        "Business models that influenced the sector"
      ],
      help: "We help articulate your contributions' significance, obtain expert testimonials confirming impact, document adoption by others, and present quantifiable evidence of influence in your field."
    },
    {
      number: 6,
      title: "Scholarly Articles",
      icon: "fa-file-alt",
      color: "text-blue-500",
      description: "Authorship of scholarly articles in the field, in professional or major trade publications or other major media.",
      examples: [
        "Peer-reviewed journal publications",
        "Conference papers in top-tier venues",
        "Book chapters in authoritative texts",
        "Technical articles in respected publications",
        "White papers or research reports",
        "Highly cited publications demonstrating impact"
      ],
      help: "We assist with publication strategy, target high-impact venues, provide writing guidance, analyze citation metrics, and document the prestige of publication outlets with evidence packages."
    },
    {
      number: 7,
      title: "Display of Work at Exhibitions",
      icon: "fa-palette",
      color: "text-pink-500",
      description: "Display of your work in the field at artistic exhibitions or showcases (more relevant for artists, designers, architects).",
      examples: [
        "Art gallery exhibitions",
        "Museum displays",
        "Architecture showcases",
        "Design exhibitions at major venues",
        "Juried art shows",
        "International biennales or festivals"
      ],
      help: "For creative professionals, we document exhibition histories, emphasize venue prestige, obtain curator statements, and compile reviews and critical reception of displayed works."
    },
    {
      number: 8,
      title: "Leading or Critical Role",
      icon: "fa-user-tie",
      color: "text-green-500",
      description: "Performance in a leading or critical role for organizations or establishments with a distinguished reputation.",
      examples: [
        "Senior leadership roles (CTO, VP, Director) at prominent companies",
        "Principal investigator on major research projects",
        "Lead architect on significant projects",
        "Key technical leader in product development",
        "Department head at prestigious institutions",
        "Critical role in startups with significant outcomes"
      ],
      help: "We document your role's criticality, establish organization reputation, obtain letters from colleagues/supervisors, and quantify impact of your leadership on organizational success."
    },
    {
      number: 9,
      title: "High Salary or Remuneration",
      icon: "fa-dollar-sign",
      color: "text-green-600",
      description: "Evidence that you have commanded a high salary or other significantly high remuneration in relation to others in the field.",
      examples: [
        "Salary significantly above industry average",
        "Stock options or equity compensation",
        "Performance bonuses reflecting exceptional value",
        "Consulting fees at premium rates",
        "Contract values for services rendered"
      ],
      help: "We compile comparative salary data, document total compensation packages, obtain employer verification letters, and present statistical analysis showing you're in the top tier of your field.",
      note: "Must be compared to industry statistics (Bureau of Labor Statistics, industry surveys, salary databases) to demonstrate you're in the top percentile."
    },
    {
      number: 10,
      title: "Commercial Success",
      icon: "fa-box-office",
      color: "text-purple-600",
      description: "Evidence of commercial successes in the performing arts, such as box office receipts or record, cassette, compact disk, or video sales.",
      examples: [
        "Box office receipts (film, theater)",
        "Record or streaming sales numbers",
        "Product sales figures (for business/entrepreneurship)",
        "Revenue generated by your work or products",
        "App downloads or user adoption metrics",
        "Licensing deals and royalty income"
      ],
      help: "We document sales figures, compile market data, obtain company verification, and present comprehensive evidence of commercial impact demonstrating your extraordinary ability to generate success.",
      note: "While traditionally for performing arts, USCIS has accepted broader interpretations for business professionals, showing commercial success through product sales, user adoption, or market impact."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-green-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              EB-1A Eligibility Criteria & Profile Building
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Understanding the 10 criteria for Extraordinary Ability and how we help you build a strong profile
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What is EB-1A?</h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-700">
                The EB-1A visa category is for individuals with <strong>extraordinary ability</strong> in the sciences, arts, education, business, or athletics. This is a self-sponsored green card option that does not require a job offer or labor certification.
              </p>
              <p className="text-gray-700">
                To qualify, you must demonstrate that you have risen to the very top of your field through sustained national or international acclaim. You can prove this by either:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-600">
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-trophy text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Option 1</h3>
                      <p className="text-gray-700">
                        Receipt of a <strong>major internationally recognized award</strong> (like Nobel Prize, Oscar, Olympic Medal)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-600">
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-check-double text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Option 2</h3>
                      <p className="text-gray-700">
                        Meeting at least <strong>3 out of 10 criteria</strong> listed by USCIS, plus evidence of sustained acclaim
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                <div className="flex">
                  <i className="fas fa-lightbulb text-yellow-600 text-2xl mr-4"></i>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Most applicants use Option 2</h4>
                    <p className="text-gray-700">
                      Since major international awards are rare, the vast majority of successful EB-1A applicants qualify by meeting at least 3 of the 10 criteria. Our expertise lies in helping you identify, document, and present your qualifications under these criteria.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Criteria Section */}
      <section id="criteria" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">The 10 EB-1A Criteria</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You need to meet at least 3 of these 10 criteria. We help you identify which ones you qualify for and build compelling evidence.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto space-y-6">
            {criteria.map((criterion) => (
              <div key={criterion.number} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
                <div className="p-6 md:p-8">
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mr-6 flex-shrink-0">
                      {criterion.number}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        <i className={`fas ${criterion.icon} ${criterion.color} mr-2`}></i>
                        {criterion.title}
                      </h3>
                      <p className="text-gray-700 mb-4">
                        {criterion.description}
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-blue-600 mb-2">Examples:</h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {criterion.examples.map((example, idx) => (
                            <li key={idx}>{example}</li>
                          ))}
                        </ul>
                      </div>
                      {criterion.note && (
                        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-4">
                          <p className="text-gray-700">
                            <strong>Note:</strong> {criterion.note}
                          </p>
                        </div>
                      )}
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-semibold text-green-800 mb-2">
                          <i className="fas fa-hands-helping mr-2"></i>How We Help You Build This:
                        </h4>
                        <p className="text-gray-700">
                          {criterion.help}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Comprehensive Profile Building Approach</h2>
            <p className="text-xl text-gray-600">
              We don't just document what you've done—we strategically build your profile to meet EB-1A standards
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-4xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Assessment & Strategy</h3>
              <p className="text-gray-600">
                We analyze your current profile, identify which criteria you can meet, and create a strategic roadmap for building missing evidence.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-tasks text-4xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Active Development</h3>
              <p className="text-gray-600">
                We guide you to acquire awards, memberships, media coverage, judging opportunities, and other qualifying evidence.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-contract text-4xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Documentation & Filing</h3>
              <p className="text-gray-600">
                We compile comprehensive evidence packages, draft compelling petitions, and handle all aspects of the USCIS filing process.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/profile-building" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all inline-block transform hover:scale-105">
              Learn About Our Profile Building Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your EB-1A Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Schedule a consultation to assess your eligibility and create your personalized strategy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assessment" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all inline-block">
              Schedule Free Consultation
            </Link>
            <Link to="/profile-building" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all inline-block">
              View Profile Building Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EB1APage;