import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GCEB1Page = () => {
  const [selectedPlan, setSelectedPlan] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pricingPlans = [
    {
      id: 1,
      title: 'EB-1A Core Consultation',
      price: '$7,365',
      description: 'Comprehensive mentorship for extraordinary ability',
      icon: 'fa-rocket',
      color: 'blue',
      features: [
        'Tailored EB-1 progress tracking with actionable roadmap',
        'Interactive dashboard for monitoring milestones',
        'Exclusive access to a professional network community',
        'One-on-one mentorship sessions with senior advisors',
        'Support in building a professional portfolio website',
        'Guidance for publishing papers and research work',
        'Mentorship for drafting and filing original patents',
        'Evaluation of remuneration and professional impact',
        'Advice on securing judging or evaluative roles',
        'Support in awards selection and application',
        'Strategic roadmap for organic media coverage',
        'Critical role readiness planning',
        'Strategies for commercial and entrepreneurial success',
        'Selecting impactful evidence for FMD readiness',
        'Organizing and documenting sustained recognition'
      ]
    },
    {
      id: 2,
      title: 'O-1 Core Consultation',
      price: '$6,155',
      description: 'Extraordinary ability visa mentorship',
      icon: 'fa-star',
      color: 'purple',
      features: [
        'Personalized O-1 progress tracking and roadmap',
        'Interactive dashboard to track career progress',
        'Exclusive membership in a high-achieving professional community',
        'Dedicated one-on-one mentorship sessions',
        'Guidance for academic and professional publications',
        'Mentorship for patent drafting and filing original contributions',
        'Remuneration evaluation and career value assessment',
        'Advice for obtaining judging and speaking opportunities',
        'Support in award selection and applications',
        'Strategic roadmap for media coverage',
        'Critical role preparation and readiness',
        'Planning strategies for commercial success'
      ]
    },
    {
      id: 3,
      title: 'EB-2 (NIW) Core Consultation',
      price: '$5,605',
      description: 'National interest waiver mentorship',
      icon: 'fa-target',
      color: 'green',
      features: [
        'Customized EB-2 tracking and actionable roadmap',
        'Interactive dashboard to monitor professional milestones',
        'Specialized guidance for the three-prong eligibility test',
        'Support in highlighting the national significance of your work',
        'Strategic positioning for career advancement',
        'Guidance for fulfilling U.S. waiver requirements',
        'Exclusive membership in a professional community',
        'Dedicated one-on-one mentorship sessions',
        'Portfolio website development',
        'Advice on selecting impactful contributions',
        'Guidance on showcasing relevant licenses or certifications'
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: 'text-blue-600', hover: 'hover:border-blue-400' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', icon: 'text-purple-600', hover: 'hover:border-purple-400' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', icon: 'text-green-600', hover: 'hover:border-green-400' }
    };
    return colors[color];
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Mentorship Programs & Pricing for EB-1A, O-1, and EB-2 NIW Visas
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              GCEB1 empowers highly skilled professionals, innovators, and artists to achieve their American dream. Our tailored mentorship programs cater to the EB-1A, O-1, and EB-2 NIW visa categories.
            </p>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Crafted for those demonstrating exceptional ability, national impact, or groundbreaking innovation. Have unique needs or questions? Contact us for personalized advice and custom mentorship options.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards - Grid Layout */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => {
              const colors = getColorClasses(plan.color);
              const isSelected = selectedPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${colors.border} ${colors.hover} ${
                    isSelected ? `ring-2 ring-offset-2 ring-${plan.color}-500 shadow-2xl` : ''
                  }`}
                  onClick={() => setSelectedPlan(isSelected ? null : plan.id)}
                >
                  {/* Header */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-100">
                    <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mb-4`}>
                      <i className={`fas ${plan.icon} text-2xl ${colors.icon}`}></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h2>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className={`text-4xl font-bold ${colors.text}`}>{plan.price}</div>
                  </div>

                  {/* Features - Show all when selected */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">What's Included:</h3>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className={`${colors.text} font-bold mr-3 flex-shrink-0`}>✓</span>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/schedule"
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all text-center block`}
                  >
                    Get Started
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Details Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Our Mentorship Programs</h2>
          
          <div className="space-y-12">
            {/* EB-1A Section */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-rocket text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Tailored EB-1A Mentorship Service</h3>
              </div>
              <p className="text-gray-700 leading-relaxed ml-16">
                Our bespoke EB-1A plan highlights your extraordinary abilities to USCIS. It covers media strategy, academic publications, patent mentorship, awards guidance, judging opportunities, and every EB-1A eligibility criterion in a strategic roadmap.
              </p>
            </div>

            {/* O-1 Section */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-star text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">O-1 Extraordinary Visa Mentorship for Global Talent</h3>
              </div>
              <p className="text-gray-700 leading-relaxed ml-16">
                The O-1 visa supports professionals with extraordinary ability who aim to work temporarily in the U.S. Our mentorship addresses all O-1 criteria, including artist visa requirements, visa duration, and extension strategies, preparing you fully for temporary U.S. residency.
              </p>
            </div>

            {/* EB-2 NIW Section */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-target text-2xl text-green-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">EB-2 NIW Mentorship for Visionaries with National Impact</h3>
              </div>
              <p className="text-gray-700 leading-relaxed ml-16">
                Designed for professionals advancing the U.S. economy, our EB-2 NIW plan helps you demonstrate your work's national importance. Detailed guidance on the three-prong test ensures your profile meets EB-2 NIW requirements and national interest standards.
              </p>
            </div>

            {/* Closing Statement */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border-l-4 border-blue-600">
              <p className="text-gray-800 leading-relaxed">
                Our pricing plans ensure no critical profile requirement is overlooked. Reach out directly for any questions or personalized guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Start your professional development journey with our expert mentorship programs
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

export default GCEB1Page;
