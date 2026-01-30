import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../../services/api';

const HomePage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    'visa-type': '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      // Transform field names for API
      const apiData = {
        ...contactForm,
        visa_type: contactForm['visa-type']
      };
      delete apiData['visa-type'];

      const response = await contactAPI.submit(apiData);
      
      if (response.success) {
        setSubmitMessage('Thank you for contacting us! We will respond to your inquiry within 24-48 hours.');
        setContactForm({
          name: '',
          email: '',
          phone: '',
          'visa-type': '',
          message: ''
        });
      } else {
        setSubmitError(response.error?.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="relative pt-28 pb-20 md:pt-32 md:pb-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-60 h-60 bg-blue-300 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-purple-300 opacity-10 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in text-white">
              {/* Badge */}
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-semibold">Trusted by 500+ Professionals</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Build Your <span className="text-yellow-300">Winning Profile</span> for U.S. Immigration
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6 leading-relaxed">
                Expert profile building and application assistance for <strong className="text-white">EB-1A, EB-2 NIW, and O-1</strong> visa petitions. We help you strengthen your credentials and prepare compelling applications.
              </p>
              
              {/* Disclaimer Badge */}
              <div className="bg-yellow-400/20 border-l-4 border-yellow-300 p-4 mb-8 rounded-r-lg backdrop-blur-sm">
                <p className="text-sm text-yellow-100">
                  <i className="fas fa-info-circle text-yellow-300 mr-2"></i>
                  <strong>Note:</strong> We provide profile building & application prep services. Not attorneys. 
                  <Link to="/attorneys" className="underline hover:text-yellow-300">Find legal counsel →</Link>
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/assessment" className="group bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition-all transform hover:scale-105 hover:shadow-2xl text-center flex items-center justify-center">
                  <i className="fas fa-chart-line mr-2 group-hover:animate-bounce"></i>
                  Free Profile Assessment
                </Link>
                <Link to="/schedule" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-all text-center flex items-center justify-center">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Schedule Consultation
                </Link>
              </div>
              
              {/* Stats with Icons */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-4xl font-bold text-yellow-300 mb-1">500+</div>
                  <div className="text-sm text-blue-200">Clients Assisted</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-4xl font-bold text-yellow-300 mb-1">95%</div>
                  <div className="text-sm text-blue-200">Satisfaction Rate</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-4xl font-bold text-yellow-300 mb-1">15+</div>
                  <div className="text-sm text-blue-200">Years Experience</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image with Floating Cards */}
            <div className="hidden md:block fade-in-delay relative">
              {/* Main Image Container */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                  {/* Success Illustration */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                      <i className="fas fa-passport text-4xl text-white"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Success Journey</h3>
                    <p className="text-gray-600">From Profile Building to Approval</p>
                  </div>
                  
                  {/* Progress Steps */}
                  <div className="space-y-4">
                    <div className="flex items-center bg-green-50 p-4 rounded-xl">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <i className="fas fa-check text-white"></i>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Profile Assessment</div>
                        <div className="text-sm text-gray-600">Evaluate your credentials</div>
                      </div>
                    </div>
                    <div className="flex items-center bg-blue-50 p-4 rounded-xl">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                        <i className="fas fa-tasks text-white"></i>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Evidence Building</div>
                        <div className="text-sm text-gray-600">Strengthen your profile</div>
                      </div>
                    </div>
                    <div className="flex items-center bg-purple-50 p-4 rounded-xl">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                        <i className="fas fa-file-alt text-white"></i>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Application Prep</div>
                        <div className="text-sm text-gray-600">Complete documentation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-yellow-400 text-gray-900 p-4 rounded-2xl shadow-lg transform rotate-12 animate-bounce">
                <div className="text-2xl font-bold">EB-1A</div>
                <div className="text-xs">Extraordinary</div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-indigo-500 text-white p-4 rounded-2xl shadow-lg transform -rotate-6 animate-pulse">
                <div className="text-2xl font-bold">NIW</div>
                <div className="text-xs">No Job Offer</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Profile Building Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive profile development and application preparation services tailored to your unique credentials and career goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* EB-1A */}
            <div className="service-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-trophy text-3xl text-primary"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">EB-1A</h3>
              <h4 className="text-lg font-semibold text-primary mb-3">Extraordinary Ability</h4>
              <p className="text-gray-600 mb-4">
                For individuals with extraordinary ability in sciences, arts, education, business, or athletics. No job offer required.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Profile assessment & gap analysis</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Evidence documentation & portfolio</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Application preparation assistance</span>
                </li>
              </ul>
              <Link to="/eb1a" className="text-primary font-semibold hover:text-secondary transition-colors">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
            
            {/* EB-2 NIW */}
            <div className="service-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-star text-3xl text-indigo-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">EB-2 NIW</h3>
              <h4 className="text-lg font-semibold text-indigo-600 mb-3">National Interest Waiver</h4>
              <p className="text-gray-600 mb-4">
                For professionals whose work benefits the United States. No labor certification or job offer required.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">National interest argument</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Proposed endeavor strategy</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Impact documentation</span>
                </li>
              </ul>
              <Link to="/eb2-niw" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
            
            {/* O-1 */}
            <div className="service-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-medal text-3xl text-red-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">O-1 Visa</h3>
              <h4 className="text-lg font-semibold text-red-600 mb-3">Extraordinary Ability</h4>
              <p className="text-gray-600 mb-4">
                Non-immigrant visa for individuals with extraordinary ability in their field. Fast-track option available.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Fast-track processing option</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Achievement documentation</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Sponsor relationship setup</span>
                </li>
              </ul>
              <Link to="/o1-visa" className="text-red-600 font-semibold hover:text-red-800 transition-colors">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
            
            {/* Profile Building */}
            <div className="service-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 lg:col-span-3 md:col-span-2">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-user-plus text-3xl text-yellow-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Profile Building</h3>
              <h4 className="text-lg font-semibold text-yellow-600 mb-3">Strategic Enhancement</h4>
              <p className="text-gray-600 mb-4">
                Comprehensive profile development to strengthen your immigration case and qualify for premium categories.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Publication strategy</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Awards & recognition guidance</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Media coverage assistance</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Speaking engagement opportunities</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Professional network building</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                    <span className="text-gray-700">Impact measurement & documentation</span>
                  </li>
                </ul>
              </div>
              <Link to="/profile-building" className="text-yellow-600 font-semibold hover:text-yellow-800 transition-colors">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Your Journey Today</h2>
              <p className="text-xl opacity-90">
                Schedule a consultation to discuss your immigration goals and explore your options
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required 
                      maxLength="100"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      maxLength="20"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="visa-type">Visa Category of Interest *</label>
                    <select 
                      id="visa-type" 
                      name="visa-type" 
                      required
                      value={contactForm['visa-type']}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    >
                      <option value="">Select a category</option>
                      <option value="eb1a">EB-1A (Extraordinary Ability)</option>
                      <option value="eb2-niw">EB-2 NIW (National Interest Waiver)</option>
                      <option value="o1">O-1 Visa</option>
                      <option value="profile">Profile Building</option>
                      <option value="other">Other / Not Sure</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">Tell Us About Your Background *</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows="4" 
                      required 
                      maxLength="2000"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Maximum 2000 characters</p>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-secondary transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Sending...
                      </>
                    ) : (
                      'Schedule Consultation'
                    )}
                  </button>
                  
                  {submitMessage && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                      <i className="fas fa-check-circle mr-2"></i>
                      {submitMessage}
                    </div>
                  )}
                  
                  {submitError && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      {submitError}
                    </div>
                  )}
                </form>
              </div>
              
              {/* Contact Info */}
              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-map-marker-alt text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Office Address</h4>
                      <p className="opacity-90">123 Immigration Plaza, Suite 500<br />New York, NY 10001</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-phone text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Phone</h4>
                      <p className="opacity-90">(555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-envelope text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Email</h4>
                      <p className="opacity-90">info@immigrationpro.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-clock text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Business Hours</h4>
                      <p className="opacity-90">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <button type="button" className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                      <i className="fab fa-linkedin text-xl"></i>
                    </button>
                    <button type="button" className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                      <i className="fab fa-twitter text-xl"></i>
                    </button>
                    <button type="button" className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                      <i className="fab fa-facebook text-xl"></i>
                    </button>
                    <button type="button" className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                      <i className="fab fa-instagram text-xl"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;