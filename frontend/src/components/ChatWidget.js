import React, { useState, useRef, useEffect } from 'react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationPhase, setConversationPhase] = useState('initial'); // Track conversation state
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Load welcome message when chat opens for the first time
      setTimeout(() => {
        addBotMessage("👋 Welcome to ImmigrationPro! I'm your immigration assistant. I'm here to help you understand your visa options and guide you through the process.\n\nAre you looking to explore visa options, or do you have specific questions?");
      }, 500);
    }
  }, [isOpen, messages.length]);

  const addBotMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: message,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const handleQuickAction = (action) => {
    let response = '';
    let userMessage = '';

    switch (action) {
      case 'assessment':
        userMessage = 'I want to take the free profile assessment';
        response = '✅ Great choice! Our free profile assessment is the perfect starting point.\n\n📋 What it includes:\n• Evaluation against all 10 EB-1A criteria\n• EB-2 NIW eligibility analysis\n• O-1 visa suitability assessment\n• Personalized recommendations\n• Identified gaps and next steps\n\n⏱️ Takes about 10 minutes\n\nReady to get started? Click the button below to begin your assessment.';
        setConversationPhase('assessment_offered');
        break;
      case 'visa_comparison':
        userMessage = 'Help me understand which visa is right for me';
        response = '🎯 Let me help you find the right visa path!\n\n📊 Quick Comparison:\n\n🏆 EB-1A (Extraordinary Ability)\n• For individuals with sustained national/international acclaim\n• No job offer required\n• Self-petition option\n• Green card in ~1 year\n\n⭐ EB-2 NIW (National Interest Waiver)\n• For professionals whose work benefits the U.S.\n• No labor certification needed\n• No job offer required\n• Great for researchers, entrepreneurs, specialists\n\n🎬 O-1 Visa (Temporary)\n• For extraordinary ability in arts, sciences, business\n• Faster processing\n• Can lead to permanent residency\n• Requires sponsorship\n\n💡 Which category resonates most with your background?';
        setConversationPhase('visa_comparison');
        break;
      case 'services':
        userMessage = 'Tell me about your services';
        response = '🚀 Here\'s what we offer:\n\n1️⃣ FREE Profile Assessment\n• Comprehensive eligibility evaluation\n• Personalized recommendations\n\n2️⃣ Expert Consultation ($299)\n• 1-on-1 guidance from immigration specialists\n• Customized strategy for your situation\n\n3️⃣ Profile Building ($1,999)\n• Strategic guidance to strengthen credentials\n• Evidence documentation support\n• Career positioning advice\n\n4️⃣ Full Application Preparation ($4,999)\n• Complete application package preparation\n• Document compilation and organization\n• Attorney coordination support\n\n5️⃣ RFE Response Service ($1,499)\n• Expert response to USCIS requests\n• Additional evidence compilation\n\n💼 We also offer Career Coaching to help you build extraordinary ability credentials.\n\n❓ Which service interests you most?';
        setConversationPhase('services_explained');
        break;
      case 'why_choose':
        userMessage = 'Why should I choose ImmigrationPro?';
        response = '✨ Here\'s what sets us apart:\n\n🤝 We Don\'t Just Advise — We Build With You\nUnlike typical consultants, we actively partner with you throughout your entire journey. We don\'t just tell you what to do; we work alongside you to strengthen your profile.\n\n📊 15+ Years of Experience\n• 500+ professionals assisted\n• 95% satisfaction rate\n• Trusted by professionals from Microsoft, Amazon, Google, and more\n\n🎯 Specialized Expertise\n• Deep knowledge of EB-1A, EB-2 NIW, and O-1 visas\n• Understanding of what USCIS looks for\n• Strategic evidence building approach\n\n⚖️ Not Attorneys (But We Connect You)\n• We provide profile building and application prep\n• We refer you to qualified immigration attorneys\n• Transparent about our role and limitations\n\n💡 Proven Results\n• Strategic guidance that strengthens applications\n• High approval rates for well-prepared cases\n• Comprehensive support from start to finish\n\n🎁 Start Free\n• Free profile assessment\n• No commitment required\n• See if we\'re a good fit for you\n\nReady to get started?';
        setConversationPhase('why_choose_explained');
        break;
      default:
        return;
    }

    addUserMessage(userMessage);
    
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(response);
      }, 1500);
    }, 500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    addUserMessage(inputMessage);
    const userMsg = inputMessage.toLowerCase();
    setInputMessage('');

    // Enhanced bot responses with better guidance
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let response = '';

        if (userMsg.includes('hello') || userMsg.includes('hi') || userMsg.includes('hey')) {
          response = '👋 Hello! Welcome to ImmigrationPro. I\'m here to help you navigate your immigration journey.\n\nI can help you with:\n• Understanding visa options (EB-1A, EB-2 NIW, O-1)\n• Learning about our services\n• Answering common questions\n• Scheduling a consultation\n\nWhat would you like to know?';
        } else if (userMsg.includes('eb-1a') || userMsg.includes('eb1a') || userMsg.includes('extraordinary')) {
          response = '🏆 EB-1A Extraordinary Ability Visa\n\n📌 What it is:\nA first-preference employment-based immigrant visa for individuals with extraordinary ability in sciences, arts, education, business, or athletics.\n\n✅ Key Benefits:\n• No job offer required\n• Self-petition option\n• Green card in approximately 1 year\n• No visa stamping complications\n• Full employment freedom\n\n📋 Requirements:\nYou need to demonstrate extraordinary ability by meeting at least 3 out of 10 regulatory criteria, OR provide evidence of a one-time major achievement (like a prestigious international award).\n\n💡 The Challenge:\nMost denials aren\'t about lack of achievement—they\'re about unclear evidence strategy and weak narrative development. That\'s where we help.\n\n🎯 Next Steps:\n1. Take our free profile assessment\n2. Get personalized recommendations\n3. Schedule a consultation\n\nInterested in exploring EB-1A further?';
        } else if (userMsg.includes('eb-2') || userMsg.includes('niw') || userMsg.includes('national interest')) {
          response = '⭐ EB-2 NIW (National Interest Waiver)\n\n📌 What it is:\nAn employment-based visa for professionals whose work benefits the United States national interest.\n\n✅ Key Benefits:\n• No labor certification required\n• No job offer needed\n• Faster processing than traditional EB-2\n• Green card path available\n• Ideal for researchers, entrepreneurs, and specialists\n\n👥 Who qualifies:\n• Researchers and scientists\n• Entrepreneurs with innovative ventures\n• Healthcare professionals\n• Educators and academics\n• Tech specialists\n• Anyone whose work advances U.S. interests\n\n💡 The Key:\nYou must demonstrate that your work benefits the U.S. and that a waiver of the job offer requirement is in the national interest.\n\n🎯 Next Steps:\n1. Free profile assessment\n2. Evaluate your national interest argument\n3. Develop your strategy\n\nWould you like to explore if EB-2 NIW is right for you?';
        } else if (userMsg.includes('o-1') || userMsg.includes('o1 visa')) {
          response = '🎬 O-1 Visa (Extraordinary Ability)\n\n📌 What it is:\nA non-immigrant visa for individuals with extraordinary ability in sciences, arts, education, business, or athletics.\n\n✅ Key Benefits:\n• Faster processing than EB-1A\n• Can be renewed multiple times\n• Pathway to permanent residency\n• Flexible work arrangements\n• Spouse and dependents can accompany\n\n⏱️ Timeline:\n• Processing: 2-4 weeks (with premium processing)\n• Can be extended in 1-year increments\n\n📋 Requirements:\nDemonstrate extraordinary ability through:\n• Major awards or recognition\n• Significant media coverage\n• Professional achievements\n• Industry leadership\n\n💡 O-1 vs EB-1A:\nO-1 is temporary but faster. EB-1A leads to permanent residency but takes longer. Many use O-1 as a stepping stone to EB-1A.\n\n🎯 Next Steps:\n1. Assess your eligibility\n2. Determine if O-1 or EB-1A is better\n3. Plan your strategy\n\nCurious about O-1 for your situation?';
        } else if (userMsg.includes('price') || userMsg.includes('cost') || userMsg.includes('pricing')) {
          response = '💰 Our Transparent Pricing:\n\n🎁 FREE Profile Assessment\n• Comprehensive eligibility evaluation\n• Personalized recommendations\n• No commitment required\n\n💬 Expert Consultation - $299\n• 1-on-1 guidance session\n• Customized strategy\n• Answer all your questions\n\n📈 Profile Building - $1,999\n• Strategic guidance to strengthen credentials\n• Evidence documentation support\n• Career positioning advice\n\n📋 Full Application Preparation - $4,999\n• Complete application package\n• Document compilation\n• Attorney coordination\n\n📞 RFE Response Service - $1,499\n• Expert response to USCIS requests\n• Additional evidence compilation\n\n💡 Flexible Payment Plans Available\n\n🎯 Most clients start with:\n1. Free assessment\n2. Expert consultation ($299)\n3. Then decide on full service\n\nReady to start with the free assessment?';
        } else if (userMsg.includes('schedule') || userMsg.includes('appointment') || userMsg.includes('consultation')) {
          response = '📅 Schedule Your Consultation\n\n✅ We offer flexible scheduling:\n• Expert consultations available within 48 hours\n• 1-on-1 sessions with immigration specialists\n• Personalized guidance for your situation\n\n🎯 What to expect:\n• Review of your background\n• Visa option analysis\n• Customized strategy recommendations\n• Next steps planning\n\n⏱️ Duration: 30-45 minutes\n💰 Cost: $299 (or free with full service package)\n\n🔗 Ready to book? Click the button below to schedule your consultation, or let me know if you have any other questions first!';
          setConversationPhase('consultation_offered');
        } else if (userMsg.includes('attorney') || userMsg.includes('lawyer') || userMsg.includes('legal')) {
          response = '⚖️ About Legal Representation\n\n📌 Important to Know:\nWe are NOT immigration attorneys. We provide profile building and application preparation services.\n\n✅ What we do:\n• Profile assessment and strategy\n• Evidence documentation guidance\n• Application preparation support\n• Career coaching and positioning\n\n❌ What we don\'t do:\n• Provide legal advice\n• Represent you before USCIS\n• File legal documents\n• Serve as your attorney\n\n🤝 Our Approach:\n• We work alongside qualified immigration attorneys\n• We can provide referrals to trusted legal counsel\n• We coordinate with your attorney throughout the process\n• We handle the profile/evidence side; attorneys handle the legal side\n\n💡 Why This Matters:\nYou need both strong evidence AND strong legal representation. We excel at one; attorneys excel at the other. Together, you get the best outcome.\n\n🎯 Next Steps:\n1. Start with our free assessment\n2. Get our recommendations\n3. We\'ll connect you with qualified attorneys\n4. Work together as a team\n\nReady to get started?';
        } else if (userMsg.includes('guarantee') || userMsg.includes('approval') || userMsg.includes('success rate')) {
          response = '🎯 About Approval Guarantees\n\n📌 Honest Answer:\nWe cannot guarantee USCIS approval. The final decision rests with immigration officials.\n\n✅ What we CAN do:\n• Maximize your chances through strategic preparation\n• Identify and strengthen weak areas\n• Build compelling evidence narratives\n• Ensure complete, professional applications\n• Provide expert guidance based on 15+ years experience\n\n📊 Our Track Record:\n• 500+ professionals assisted\n• 95% satisfaction rate\n• High approval rates for well-prepared cases\n• Trusted by professionals from top companies\n\n💡 The Reality:\nApproval depends on:\n• Your actual qualifications and achievements\n• Quality of evidence presentation\n• Strength of your narrative\n• USCIS interpretation of criteria\n• Current policy environment\n\n🎯 Our Commitment:\nWe commit to giving you the BEST possible preparation and strategy. We\'ll work hard to strengthen your case, but we\'re honest about what we can and cannot control.\n\n🚀 Ready to maximize your chances? Start with our free assessment!';
        } else if (userMsg.includes('how long') || userMsg.includes('timeline') || userMsg.includes('how many months')) {
          response = '⏱️ Timeline Expectations\n\n📋 Profile Assessment\n• Completion: 24-48 hours\n• Turnaround: Quick and comprehensive\n\n💬 Expert Consultation\n• Scheduling: Within 48 hours\n• Duration: 30-45 minutes\n\n📈 Profile Building Service\n• Duration: 4-8 weeks\n• Depends on your starting point\n• Includes strategic guidance and evidence compilation\n\n📋 Full Application Preparation\n• Duration: 4-8 weeks\n• Includes all documentation and organization\n• Ready for attorney review\n\n🏛️ USCIS Processing (After Filing)\n• EB-1A: 6-12 months typically\n• EB-2 NIW: 8-14 months typically\n• O-1: 2-4 weeks (with premium processing)\n\n💡 Key Factors:\n• Complexity of your case\n• Completeness of your evidence\n• Current USCIS workload\n• Any RFEs (Requests for Evidence)\n\n🎯 Next Steps:\n1. Start with free assessment (24-48 hours)\n2. Schedule consultation (within 48 hours)\n3. Plan your timeline\n\nReady to begin?';
        } else if (userMsg.includes('rfe') || userMsg.includes('request for evidence') || userMsg.includes('denial')) {
          response = '📞 RFE (Request for Evidence) & Denials\n\n📌 What is an RFE?\nUSCIS is asking for additional evidence to support your application. It\'s not a denial—it\'s an opportunity to strengthen your case.\n\n✅ Good News:\n• RFEs are common and often recoverable\n• You have time to respond (typically 84 days)\n• Additional evidence can turn things around\n• Many cases approved after RFE response\n\n❌ Why RFEs Happen:\n• Unclear evidence strategy\n• Weak narrative development\n• Missing documentation\n• Insufficient explanation of achievements\n• Poor presentation of evidence\n\n🎯 Our RFE Response Service ($1,499):\n• Expert analysis of USCIS concerns\n• Strategic response development\n• Additional evidence compilation\n• Compelling narrative reframing\n• Professional presentation\n\n💡 Prevention is Key:\nMost RFEs are preventable with proper preparation. That\'s why our full application service is so comprehensive.\n\n🚀 If You\'ve Received an RFE:\n1. Don\'t panic—it\'s recoverable\n2. Contact us immediately\n3. We\'ll analyze the concerns\n4. Develop a strong response\n5. Maximize your chances\n\nNeed help with an RFE?';
        } else {
          response = '💭 Great question! Let me help you with that.\n\nI can provide information about:\n• ✅ Visa options (EB-1A, EB-2 NIW, O-1)\n• ✅ Our services and pricing\n• ✅ The application process and timeline\n• ✅ Eligibility and requirements\n• ✅ How we can help you\n\n🎯 For detailed, personalized guidance about your specific situation, I recommend:\n1. Taking our free profile assessment\n2. Scheduling an expert consultation\n3. Speaking directly with our specialists\n\n📞 What would be most helpful for you right now?';
        }

        addBotMessage(response);
      }, 1500);
    }, 500);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  return (
    <div className="chat-widget">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window transition-all duration-300 ease-in-out opacity-100 scale-100 translate-y-0">
          <div className={`chat-container bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-16' : ''
          }`}>
          {/* Chat Header */}
          <div className="chat-header bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-robot text-lg"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">ImmigrationPro Assistant</h3>
                  <div className="flex items-center text-xs opacity-90">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Chat Content - Hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="welcome-screen p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-comments text-blue-600 text-2xl"></i>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Welcome to ImmigrationPro!</h4>
                    <p className="text-gray-600 text-sm mb-4">I'm here to guide you through your immigration journey. Choose a topic below or ask me anything!</p>
                  </div>
                ) : (
                  <div className="messages-list p-4 space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className={`message-item flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`message-bubble max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl text-sm ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-md' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                          <div className={`text-xs mt-1 opacity-70 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="message-item flex justify-start">
                        <div className="message-bubble bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                          <div className="typing-indicator flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="quick-actions p-4 border-t bg-gray-50">
                  <div className="text-xs text-gray-600 mb-3 font-medium">Popular Topics</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleQuickAction('assessment')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-clipboard-check text-blue-600 mr-2"></i>
                      Free Assessment
                    </button>
                    <button 
                      onClick={() => handleQuickAction('visa_comparison')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-exchange-alt text-blue-600 mr-2"></i>
                      Visa Options
                    </button>
                    <button 
                      onClick={() => handleQuickAction('services')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-briefcase text-blue-600 mr-2"></i>
                      Our Services
                    </button>
                    <button 
                      onClick={() => handleQuickAction('why_choose')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-star text-blue-600 mr-2"></i>
                      Why Us?
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="chat-input p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isTyping}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="send-btn w-12 h-12 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                  >
                    <i className="fas fa-paper-plane text-sm"></i>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`chat-toggle-btn w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'rotate-0' : 'hover:-translate-y-1'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'} text-xl transition-transform duration-300 group-hover:scale-110`}></i>
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            !
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;