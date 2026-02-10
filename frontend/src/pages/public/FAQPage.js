import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What services do you provide?",
          answer: "We provide comprehensive immigration profile building and application preparation services for EB-1A, EB-2 NIW, and O-1 visa categories. Our services include profile assessments, strategic guidance, evidence documentation, and application preparation assistance."
        },
        {
          question: "Are you immigration attorneys?",
          answer: "No, we are not attorneys. We provide profile building and application preparation services. We strongly recommend consulting with a licensed immigration attorney for legal advice and representation. We can provide attorney referrals if needed."
        },
        {
          question: "Do you guarantee visa approval?",
          answer: "No, we cannot guarantee USCIS approval as the final decision rests with immigration officials. However, we provide comprehensive preparation and strategic guidance to maximize your chances of success based on our extensive experience."
        }
      ]
    },
    {
      category: "EB-1A",
      questions: [
        {
          question: "What is EB-1A extraordinary ability?",
          answer: "EB-1A is a first-preference employment-based immigrant visa for individuals with extraordinary ability in sciences, arts, education, business, or athletics. It requires no job offer or labor certification and allows self-petitioning."
        },
        {
          question: "How many criteria do I need to meet for EB-1A?",
          answer: "You need to demonstrate extraordinary ability by meeting at least 3 out of 10 regulatory criteria, or provide evidence of a one-time achievement (like a major international award)."
        },
        {
          question: "Can I apply for EB-1A without a job offer?",
          answer: "Yes, EB-1A does not require a job offer. You can self-petition and demonstrate that your continued work in the United States will substantially benefit the country."
        }
      ]
    },
    {
      category: "Process",
      questions: [
        {
          question: "How long does the application process take?",
          answer: "The timeline varies based on your profile strength and chosen service level. Profile assessments are completed within 24-48 hours, consultations can be scheduled within 48 hours, and full application preparation typically takes 4-8 weeks."
        },
        {
          question: "What is included in the profile assessment?",
          answer: "Our free profile assessment evaluates your credentials against all 10 EB-1A criteria, provides a profile strength analysis, identifies gaps, and offers personalized recommendations for improvement."
        },
        {
          question: "How do you help strengthen my profile?",
          answer: "We provide strategic guidance on building evidence, obtaining publications, securing awards, gaining media coverage, building professional networks, and documenting your impact and contributions."
        }
      ]
    },
    {
      category: "Pricing",
      questions: [
        {
          question: "How much do your services cost?",
          answer: "We offer transparent pricing: Free profile assessment, $299 for expert consultation, $4,999 for full-service application preparation. Additional services like profile building ($1,999) and RFE response ($1,499) are also available."
        },
        {
          question: "Do you offer payment plans?",
          answer: "Yes, we offer flexible payment plans for our full-service packages. Contact us to discuss payment options that work for your situation."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, bank transfers, and offer various payment arrangements. All payments are secure and processed through encrypted systems."
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const faqKey = `${categoryIndex}-${questionIndex}`;
    setOpenFAQ(openFAQ === faqKey ? null : faqKey);
  };

  return (
    <div>
      
      {/* Hero Section */}
      <div className="pt-28 pb-20 bg-gradient-to-br from-purple-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Find answers to common questions about our immigration services and the application process.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const faqKey = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openFAQ === faqKey;
                    
                    return (
                      <div key={questionIndex} className="bg-gray-50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </span>
                          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-blue-600 flex-shrink-0`}></i>
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Contact Section */}
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-xl opacity-90 mb-8">
                Can't find the answer you're looking for? Our team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                  <i className="fas fa-envelope mr-2"></i>
                  Contact Us
                </Link>
                <Link to="/schedule" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-all">
                  <i className="fas fa-calendar mr-2"></i>
                  Schedule Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FAQPage;