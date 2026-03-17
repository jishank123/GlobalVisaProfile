import { useState } from 'react';
import { Link } from 'react-router-dom';

const PricingPageFAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const pricingFAQs = [
    {
      question: "How much do your services cost?",
      answer: "We offer transparent pricing: Free profile assessment, $299 for expert consultation, $4,999 for full-service application preparation. Additional services like profile building ($1,999), career coaching ($1,499), document review ($499), and RFE response ($1,499) are also available."
    },
    {
      question: "Do you offer payment plans?",
      answer: "Yes, we offer flexible payment plans for our full-service packages. Contact us to discuss payment options that work for your situation."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, bank transfers, and offer various payment arrangements. All payments are secure and processed through encrypted systems."
    },
    {
      question: "Is the profile assessment really free?",
      answer: "Yes, our profile assessment is completely free with no hidden charges. You'll receive a comprehensive evaluation of your credentials against all 10 EB-1A criteria, profile strength analysis, gap identification, and personalized recommendations."
    },
    {
      question: "What's included in the Expert Consultation?",
      answer: "The $299 Expert Consultation includes a 60-minute 1-on-1 session with our experts, detailed profile review, strategic action plan, timeline and milestones, and a follow-up email summary of recommendations."
    },
    {
      question: "What's included in the Full Service Package?",
      answer: "The $4,999 Full Service Package includes complete petition preparation, evidence documentation, recommendation letters, USCIS filing support, and RFE response assistance. This is our most comprehensive offering."
    },
    {
      question: "Can I upgrade or downgrade my service package?",
      answer: "Yes, we offer flexibility in our service packages. You can start with a consultation and upgrade to full service, or adjust your package based on your needs. Contact us to discuss the best option for your situation."
    },
    {
      question: "Do you offer refunds?",
      answer: "We stand behind our services. Please contact us to discuss our refund policy and any concerns you may have about our services."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No, we believe in transparent pricing. All costs are clearly outlined upfront. There are no hidden fees or surprise charges. What you see is what you pay."
    },
    {
      question: "How do I know which service package is right for me?",
      answer: "Start with our free profile assessment to understand your profile strength. Then, schedule a consultation to discuss which service package best fits your needs and goals. Our experts can recommend the right path for you."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Pricing FAQs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Common questions about our pricing, payment options, and service packages
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {pricingFAQs.map((faq, index) => {
              const isOpen = openFAQ === index;
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-green-600 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-900 pr-4 text-lg">
                      {faq.question}
                    </span>
                    <i
                      className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-green-600 flex-shrink-0 text-xl transition-transform duration-300`}
                    ></i>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 bg-green-50 border-t border-green-100">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Still Have Questions About Pricing?</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Our team is ready to help you find the right service package for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all inline-flex items-center justify-center"
              >
                <i className="fas fa-envelope mr-2"></i>
                Contact Us
              </Link>
              <Link
                to="/schedule-appointment"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition-all inline-flex items-center justify-center"
              >
                <i className="fas fa-calendar-alt mr-2"></i>
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPageFAQ;
