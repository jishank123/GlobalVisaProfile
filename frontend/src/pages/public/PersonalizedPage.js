import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const EB1TrackingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: 'fa-user-check',
      title: 'Comprehensive Profile Review',
      description: 'We assess your qualifications against EB1A or EB1C criteria, highlighting achievements, awards, publications, memberships, and managerial experience where applicable.'
    },
    {
      icon: 'fa-calendar-alt',
      title: 'Priority Date Monitoring',
      description: 'We track visa bulletin updates to ensure your EB1 priority date is current for optimal filing and adjudication timing.'
    },
    {
      icon: 'fa-map-signs',
      title: 'Application Timeline & Milestones',
      description: 'Receive a roadmap covering petition preparation, filing, follow-ups, and interviews to keep your EB1 process organized.'
    },
    {
      icon: 'fa-file-alt',
      title: 'Documentation Review',
      description: 'Our team audits all supporting evidence such as media coverage, publications, citations, awards, and managerial credentials to strengthen your petition.'
    },
    {
      icon: 'fa-clipboard-check',
      title: 'Adjustment of Status Guidance',
      description: 'Step-by-step advice on navigating the EB1 adjustment of status process while remaining fully compliant with U.S. immigration rules.'
    },
    {
      icon: 'fa-phone-alt',
      title: 'Direct Expert Support',
      description: 'Access your dedicated EB1 specialists for real-time consultation and strategic guidance tailored to your case.'
    }
  ];

  const whyMatters = [
    'Continuous monitoring of your application status',
    'Priority date tracking using the EB1 India visa bulletin',
    'Proactive planning aligned with USCIS policy updates',
    'Timely support for Requests for Evidence (RFE) or Notices of Intent to Deny (NOID)',
    'Expert guidance on EB1 adjustment of status and public charge considerations'
  ];

  const whyUnique = [
    { label: 'Personalized action plans', text: 'tailored to your EB1 category criteria' },
    { label: 'Comprehensive support', text: 'from initial assessment to green card approval' },
    { label: 'Integration of latest USCIS updates', text: 'on rules, eligibility, and compliance' },
    { label: 'Transparent progress tracking', text: 'for real-time clarity on your EB1 status' }
  ];

  const eligibility = [
    'Extraordinary ability in your field (EB1A)',
    'Managerial/executive experience for EB1C applicants',
    'Evidence of international recognition including awards, memberships, and media coverage'
  ];

  const journey = [
    'File petitions and adjustments according to USCIS guidelines',
    'Submit compelling supporting evidence for EB1A or EB1C criteria',
    'Stay updated on visa bulletin priority dates',
    'Navigate public charge rules and other compliance requirements',
    'Receive expert advice for communication with USCIS officers and legal counsel'
  ];

  const success = [
    'In-depth knowledge of EB1 requirements and USCIS regulations',
    'Strategic filing and compliance support',
    'Tailored guidance reflecting your professional accomplishments',
    'Support from initial planning to final green card approval'
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Customized EB1 Guidance for Your U.S. Permanent Residency Success
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Step-by-step guidance to maximize your EB1A or EB1C green card success
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            Navigating the EB1 green card process requires careful planning and attention to detail. Our customized EB1 tracking and action plan is designed to guide you through each stage, ensuring compliance with U.S. immigration rules while maximizing your chances of approval.
          </p>
        </div>
      </div>

      {/* Why Personalized Tracking */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Personalized EB1 Tracking Matters
            </h2>
            <p className="text-lg text-gray-600">
              EB1 green card criteria are strict and each applicant's case is unique. Personalized tracking ensures:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyMatters.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-blue-600 text-xl flex-shrink-0 mt-1"></i>
                  <p className="text-gray-700">{item}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8 border-2 border-blue-200 text-center">
            <p className="text-lg text-gray-800 italic font-semibold">
              Our tailored action plans keep you ahead in your EB1 green card journey.
            </p>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our EB1 Tracking Includes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                  <i className={`fas ${feature.icon} text-3xl text-blue-600`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Different */}
      <div className="py-10 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Our EB1 Tracking is Unique
            </h2>
            <p className="text-lg text-gray-600">
              Many applicants struggle with USCIS updates and complex EB1 requirements. Our approach offers:
            </p>
          </div>

          <div className="space-y-4">
            {whyUnique.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border-l-4 border-indigo-500 shadow-md hover:shadow-lg transition-all">
                <p className="text-gray-800">
                  <strong className="text-indigo-600">{item.label}</strong> {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EB1 Eligibility */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              EB1 Eligibility Made Clear
            </h2>
            <p className="text-lg text-gray-600">
              Understanding your EB1 eligibility is the first step. This includes:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {eligibility.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-200 text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check text-green-600 text-xl"></i>
                </div>
                <p className="text-gray-800 font-semibold">{item}</p>
              </div>
            ))}
          </div>

          <div className="bg-green-50 rounded-xl p-8 border-2 border-green-200 text-center">
            <p className="text-lg text-gray-800">
              We turn these requirements into actionable steps in your personalized action plan.
            </p>
          </div>
        </div>
      </div>

      {/* How Tracking Supports */}
      <div className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Our Tracking Supports Your EB1 Journey
            </h2>
            <p className="text-lg text-gray-600">
              Our service ensures you:
            </p>
          </div>

          <div className="space-y-4">
            {journey.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-start gap-3">
                  <i className="fas fa-arrow-right text-purple-600 text-lg flex-shrink-0 mt-1"></i>
                  <p className="text-gray-700">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Starts Here */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Your EB1 Success Starts Here
              </h2>
              <p className="text-lg text-blue-100">
                With our personalized EB1 tracking, you gain:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {success.map((item, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-star text-yellow-300 text-lg flex-shrink-0 mt-1"></i>
                    <p className="text-white">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Begin Your EB1 Journey?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Get your personalized EB1 tracking and action plan today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/schedule"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all"
            >
              Schedule Consultation
            </Link>
            <Link
              to="/contact"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-800 transition-all border-2 border-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EB1TrackingPage;
