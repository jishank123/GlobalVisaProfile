import React, { useState, useRef, useEffect } from 'react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
        addBotMessage("Hi! I'm the ImmigrationPro assistant. How can I help you today?");
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
      case 'contact':
        userMessage = 'I need contact information';
        response = 'You can reach us at:\n📧 Email: info@immigrationpro.com\n📞 Phone: (555) 123-4567\n🕒 Hours: Mon-Fri 9AM-6PM EST';
        break;
      case 'assessment':
        userMessage = 'Tell me about profile assessment';
        response = 'Our free profile assessment evaluates your eligibility for EB-1A, EB-2 NIW, and O-1 visas. It takes about 10 minutes and provides personalized recommendations. Would you like to start your assessment?';
        break;
      case 'services':
        userMessage = 'What services do you offer?';
        response = 'We offer:\n• EB-1A Extraordinary Ability petitions\n• EB-2 NIW (National Interest Waiver)\n• O-1 Visa applications\n• Profile building and strategy\n• Document preparation\n• Case management';
        break;
      case 'pricing':
        userMessage = 'What are your prices?';
        response = 'Our pricing varies by service:\n• Profile Assessment: FREE\n• EB-1A Package: Starting at $3,500\n• EB-2 NIW Package: Starting at $2,500\n• O-1 Visa Package: Starting at $2,000\n\nWould you like to schedule a consultation for detailed pricing?';
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

    // Simple bot responses
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let response = '';

        if (userMsg.includes('hello') || userMsg.includes('hi')) {
          response = 'Hello! How can I assist you with your immigration needs today?';
        } else if (userMsg.includes('price') || userMsg.includes('cost')) {
          response = 'Our services start at $2,000 for O-1 visas and go up to $3,500 for EB-1A petitions. Would you like to schedule a free consultation to discuss your specific needs?';
        } else if (userMsg.includes('eb-1') || userMsg.includes('eb1')) {
          response = 'EB-1A is for individuals with extraordinary ability. You need to demonstrate sustained national or international acclaim. Would you like to take our free assessment to see if you qualify?';
        } else if (userMsg.includes('eb-2') || userMsg.includes('niw')) {
          response = 'EB-2 NIW is great for professionals whose work benefits the U.S. national interest. It doesn\'t require a job offer. Would you like to learn more about the requirements?';
        } else if (userMsg.includes('o-1') || userMsg.includes('o1')) {
          response = 'O-1 visa is for individuals with extraordinary ability or achievement. It\'s a temporary visa that can lead to permanent residency. Interested in learning if you qualify?';
        } else if (userMsg.includes('schedule') || userMsg.includes('appointment')) {
          response = 'I\'d be happy to help you schedule a consultation! You can book directly through our website or I can connect you with our scheduling team. What works better for you?';
        } else {
          response = 'Thank you for your question! For detailed information about your specific situation, I recommend scheduling a free consultation with our immigration experts. They can provide personalized guidance based on your background.';
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
      <div className={`chat-window transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
      }`}>
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
                    <p className="text-gray-600 text-sm mb-4">I'm here to help you with your immigration questions. Choose a topic below or type your question.</p>
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
                  <div className="text-xs text-gray-600 mb-3 font-medium">Quick Help Topics</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleQuickAction('contact')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-phone text-blue-600 mr-2"></i>
                      Contact Info
                    </button>
                    <button 
                      onClick={() => handleQuickAction('assessment')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-clipboard-check text-blue-600 mr-2"></i>
                      Assessment
                    </button>
                    <button 
                      onClick={() => handleQuickAction('services')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-briefcase text-blue-600 mr-2"></i>
                      Services
                    </button>
                    <button 
                      onClick={() => handleQuickAction('pricing')}
                      className="quick-action-btn text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 text-left"
                    >
                      <i className="fas fa-dollar-sign text-blue-600 mr-2"></i>
                      Pricing
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