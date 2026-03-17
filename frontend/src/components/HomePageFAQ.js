import { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePageFAQ = () => {
  const [selectedCategory, setSelectedCategory] = useState('General Information');
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      category: "General Information",
      icon: "fa-circle-info",
      color: "from-blue-500 to-blue-600",
      questions: [
        {
          question: "What services do you provide?",
          answer: "We provide comprehensive immigration profile building and application preparation services for EB-1A, EB-2 NIW, and O-1 visa categories. Our services include free profile assessments, expert consultations, full-service application preparation, profile building, career coaching, and RFE response assistance."
        },
        {
          question: "Are you immigration attorneys?",
          answer: "No, we are not attorneys. We provide profile building and application preparation services. We strongly recommend consulting with a licensed immigration attorney for legal advice and representation. We maintain a network of qualified immigration attorneys and can provide referrals based on your needs."
        },
        {
          question: "Do you guarantee visa approval?",
          answer: "No, we cannot guarantee USCIS approval as the final decision rests with immigration officials. However, we provide comprehensive preparation and strategic guidance to maximize your chances of success based on our extensive experience with hundreds of successful cases."
        },
        {
          question: "What makes your services different?",
          answer: "Unlike traditional consultants who only advise, we actively partner with you throughout your journey. We don't just tell you what to do—we help you build your profile, connect you with opportunities, guide applications, and support you through the entire process until petition filing."
        },
        {
          question: "How long have you been in business?",
          answer: "We have 15+ years of experience helping professionals build extraordinary ability profiles and successfully navigate the immigration process. We've assisted 500+ clients with a 95% satisfaction rate."
        }
      ]
    },
    {
      category: "Awards",
      icon: "fa-trophy",
      color: "from-amber-500 to-amber-600",
      questions: [
        {
          question: "What types of awards qualify for EB-1A?",
          answer: "Awards that demonstrate national or international recognition in your field qualify. This includes industry awards, professional recognitions, academic honors, prestigious fellowships, and competitive honors. The award should be significant and demonstrate your extraordinary ability in your field."
        },
        {
          question: "Do I need major international awards?",
          answer: "While major international awards like Nobel Prize or Olympic medals are strong evidence, they are not required. You can meet EB-1A criteria through a combination of other evidence such as publications, citations, judging experience, and professional memberships."
        },
        {
          question: "How do awards strengthen my EB-1A case?",
          answer: "Awards provide concrete evidence of recognition and validation of your extraordinary ability. They demonstrate that your work has been acknowledged and valued by your professional community, which is crucial for EB-1A approval."
        },
        {
          question: "How can you help me get awards?",
          answer: "Our profile building service identifies relevant award opportunities in your field, guides you through nomination processes, helps prepare compelling nomination materials, coordinates nominator support, and documents award significance for your USCIS petition."
        },
        {
          question: "Can smaller or local awards help?",
          answer: "Yes, smaller or local awards can contribute to your overall profile, especially when combined with other criteria. However, national or international awards carry more weight. We help you strategically position all awards to strengthen your case."
        }
      ]
    },
    {
      category: "Judging",
      icon: "fa-gavel",
      color: "from-indigo-500 to-indigo-600",
      questions: [
        {
          question: "Does judging experience help with EB-1A?",
          answer: "Yes, judging experience is one of the 10 EB-1A criteria. Serving as a judge for competitions, conferences, or professional organizations demonstrates that you are recognized as an expert in your field and trusted to evaluate others' work."
        },
        {
          question: "What types of judging count?",
          answer: "Judging for academic competitions, professional conferences, grant review panels, award committees, journal peer review, and industry competitions all count. The key is that the judging role should be for a prestigious or competitive event in your field."
        },
        {
          question: "How do I document my judging experience?",
          answer: "Collect letters from the organizations confirming your judging role, dates of service, and the significance of the competition or event. Include any certificates or official documentation of your participation."
        },
        {
          question: "How can you help me get judging opportunities?",
          answer: "Our profile building service connects you with peer review and judging opportunities including journal peer review, conference program committees, grant review panels, and competition judging roles. We help you secure these positions to strengthen your EB-1A case."
        },
        {
          question: "Is judging experience from smaller events useful?",
          answer: "Yes, judging experience from smaller or local events can contribute to your profile. However, judging for prestigious, competitive, or well-known events carries more weight. We help you strategically position all judging experience."
        }
      ]
    },
    {
      category: "Memberships",
      icon: "fa-users",
      color: "from-rose-500 to-rose-600",
      questions: [
        {
          question: "What memberships qualify for EB-1A?",
          answer: "Memberships in associations that require outstanding achievement for admission qualify for EB-1A. These must be selective organizations that have a reputation for admitting only individuals with extraordinary ability in their field."
        },
        {
          question: "Do all professional memberships count?",
          answer: "No, not all memberships count. The membership must be selective and require demonstrated extraordinary ability for admission. Regular memberships that anyone can join do not qualify, but elite or fellowship memberships do."
        },
        {
          question: "How do I prove membership requirements?",
          answer: "Provide membership certificates, letters from the organization confirming the selectivity and admission requirements, and documentation showing that membership requires outstanding achievement in your field."
        },
        {
          question: "How can you help me get selective memberships?",
          answer: "Our profile building service identifies qualifying professional associations, guides you through membership applications, helps secure nomination letters from current members, and documents membership criteria for your USCIS petition."
        },
        {
          question: "Can international memberships help?",
          answer: "Yes, international memberships in prestigious organizations can strengthen your case. We help you identify and pursue selective international professional associations that recognize your extraordinary ability."
        }
      ]
    },
    {
      category: "Scholarly Articles",
      icon: "fa-book",
      color: "from-cyan-500 to-cyan-600",
      questions: [
        {
          question: "How do scholarly articles help with EB-1A?",
          answer: "Published scholarly articles demonstrate your contributions to your field and your recognition as an expert. They are evidence of your original research and intellectual contributions, which are key criteria for EB-1A."
        },
        {
          question: "What counts as a scholarly article?",
          answer: "Peer-reviewed journal articles, conference papers, book chapters, and publications in reputable academic or professional publications count. Self-published or non-peer-reviewed articles generally do not qualify for EB-1A."
        },
        {
          question: "How many articles do I need?",
          answer: "There is no specific number required. Quality matters more than quantity. A few highly-cited articles in prestigious journals are more valuable than many articles in lesser-known publications."
        },
        {
          question: "How can you help with my publication strategy?",
          answer: "Our career coaching service guides your publication strategy by helping you target high-impact journals, improve manuscript quality, track citation metrics, and build a strong publication portfolio that demonstrates your expertise."
        },
        {
          question: "What about articles in non-English languages?",
          answer: "Articles published in reputable journals in any language can count, but you should provide English translations or summaries for USCIS. We help you document and present all publications effectively."
        }
      ]
    },
    {
      category: "Media",
      icon: "fa-newspaper",
      color: "from-red-500 to-red-600",
      questions: [
        {
          question: "Does media coverage help with EB-1A?",
          answer: "Yes, media coverage in major publications demonstrates that your work has attracted significant attention and recognition. Coverage in reputable news outlets, industry publications, or major media outlets can support your EB-1A case."
        },
        {
          question: "What type of media coverage counts?",
          answer: "Coverage in major newspapers, magazines, online publications, industry journals, and broadcast media counts. The publication should have significant circulation or influence in your field or the general public."
        },
        {
          question: "How do I document media coverage?",
          answer: "Collect copies of articles, screenshots of online publications with dates, links to media coverage, and any press releases. Include the publication name, date, and circulation information to demonstrate the significance of the coverage."
        },
        {
          question: "How can you help me get media coverage?",
          answer: "Our profile building service develops and executes media strategies by creating press-worthy story angles, connecting you with journalists, pitching to relevant publications, and arranging interviews and features in major media outlets."
        },
        {
          question: "Can personal blogs or social media be included?",
          answer: "Personal blogs or social media posts generally do not count as qualifying media coverage. We focus on getting you featured in reputable, established publications with significant circulation and credibility."
        }
      ]
    },
    {
      category: "Support Letters",
      icon: "fa-envelope",
      color: "from-teal-500 to-teal-600",
      questions: [
        {
          question: "How important are support letters for EB-1A?",
          answer: "Support letters are crucial for EB-1A. They provide independent validation of your extraordinary ability from recognized experts in your field. Strong letters from prominent professionals significantly strengthen your case."
        },
        {
          question: "Who should write support letters?",
          answer: "Letters should come from recognized experts, leaders, or prominent figures in your field who can speak to your extraordinary ability and contributions. They should be from people who are not related to you and have professional credibility."
        },
        {
          question: "What should support letters include?",
          answer: "Letters should describe your specific contributions, explain why your work is extraordinary, provide examples of your impact, compare you to others in your field, and clearly state that you possess extraordinary ability. They should be detailed and specific, not generic."
        },
        {
          question: "How many support letters do I need?",
          answer: "While there is no specific number required, typically 5-10 strong support letters from recognized experts significantly strengthen your case. Quality matters more than quantity—one letter from a Nobel laureate is more valuable than many from lesser-known figures."
        },
        {
          question: "Can international experts provide letters?",
          answer: "Yes, support letters from international experts can be very valuable, especially if they are recognized leaders in your field. We help you identify and secure letters from prominent experts worldwide."
        }
      ]
    },
    {
      category: "Attorney & Petition",
      icon: "fa-briefcase",
      color: "from-violet-500 to-violet-600",
      questions: [
        {
          question: "Do I need an immigration attorney?",
          answer: "While not required, we strongly recommend consulting with a licensed immigration attorney for legal advice and petition filing. We provide profile building and application preparation services and can refer you to qualified attorneys."
        },
        {
          question: "What's the difference between your services and an attorney?",
          answer: "We provide profile building, evidence documentation, and application preparation services. Attorneys provide legal advice, represent you before USCIS, and handle the official petition filing. Both services are valuable and often work together."
        },
        {
          question: "Can you help me find an attorney?",
          answer: "Yes, we maintain a network of qualified immigration attorneys and can provide referrals based on your specific needs and location. Contact us to discuss attorney referral options."
        },
        {
          question: "When does the attorney get involved?",
          answer: "Typically, you work with us on profile building and application preparation first. Once your profile is strong and evidence is documented, you engage an attorney to handle the legal petition filing and USCIS representation."
        },
        {
          question: "How long does it take to finalize the petition?",
          answer: "After your attorney files the petition, USCIS processing typically takes 6-12 months. Our preparation work (4-8 weeks) happens before filing to ensure your petition is as strong as possible."
        }
      ]
    },
    {
      category: "Sales & Costs",
      icon: "fa-chart-line",
      color: "from-orange-500 to-orange-600",
      questions: [
        {
          question: "How do I get started with your services?",
          answer: "Start with our free profile assessment to evaluate your credentials. Then, schedule a consultation to discuss your goals and determine which service package is right for you. We'll guide you through the entire process."
        },
        {
          question: "What's included in the free assessment?",
          answer: "Our free assessment includes evaluation against all 10 EB-1A criteria, profile strength analysis, gap identification, and personalized recommendations for improvement. You'll receive a detailed report with actionable insights."
        },
        {
          question: "How do I schedule a consultation?",
          answer: "Visit our Schedule Consultation page or contact us directly. We'll work with you to find a time that fits your schedule. Consultations are typically available within 48 hours of your request."
        },
        {
          question: "What are the additional costs involved?",
          answer: "Beyond our service fees, you may have costs for attorney fees (varies by attorney), USCIS filing fees (currently $640 for EB-1A), and optional costs for support letter writers or documentation services. We provide transparent pricing upfront."
        }
      ]
    },
    {
      category: "Are discounts available?",
      icon: "fa-percent",
      color: "from-teal-600 to-teal-700",
      questions: [
        {
          question: "Are discounts available?",
          answer: "We offer various promotions and package deals throughout the year. Contact us to ask about current discounts or special offers that may apply to your situation."
        },
        {
          question: "Do you offer group discounts?",
          answer: "Yes, we offer special pricing for groups or organizations. If you're referring multiple clients or working with an organization, contact us to discuss group discount options."
        },
        {
          question: "Are there discounts for referrals?",
          answer: "Yes, we appreciate referrals and offer referral bonuses. If you refer someone who uses our services, contact us to learn about our referral reward program."
        },
        {
          question: "Can I upgrade my service package?",
          answer: "Yes, we offer flexibility in our service packages. You can start with a consultation and upgrade to full service, or adjust your package based on your needs. Contact us to discuss upgrade options."
        },
        {
          question: "Do you offer payment plans?",
          answer: "Yes, we offer flexible payment plans for our full-service packages. Contact us to discuss payment options that work for your situation."
        }
      ]
    }
  ];

  const currentCategory = faqs.find(cat => cat.category === selectedCategory);

  const toggleFAQ = (questionIndex) => {
    setOpenFAQ(openFAQ === questionIndex ? null : questionIndex);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our immigration services and the application process
          </p>
        </div>

        {/* Category Tabs */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {faqs.map((category) => (
              <button
                key={category.category}
                onClick={() => {
                  setSelectedCategory(category.category);
                  setOpenFAQ(null);
                }}
                className={`p-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                  selectedCategory === category.category
                    ? `bg-gradient-to-br ${category.color} text-white shadow-lg`
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <i className={`fas ${category.icon} text-2xl mb-2`}></i>
                  <span className="text-sm md:text-base">{category.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {currentCategory?.questions.map((faq, questionIndex) => {
              const isOpen = openFAQ === questionIndex;
              
              return (
                <div
                  key={questionIndex}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-blue-600 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(questionIndex)}
                    className="w-full px-6 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-gray-900 pr-4 text-lg">
                      {faq.question}
                    </span>
                    <i
                      className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-blue-600 flex-shrink-0 text-xl transition-transform duration-300`}
                    ></i>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-3 bg-blue-50 border-t border-blue-100">
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
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our team is here to help you with personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all inline-flex items-center justify-center"
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

export default HomePageFAQ;
