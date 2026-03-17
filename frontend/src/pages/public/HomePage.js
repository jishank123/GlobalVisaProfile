import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../../services/api';
import { useEffect } from 'react';
import HomePageFAQ from '../../components/HomePageFAQ';

const HomePage = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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
              
              {/* Key Differentiator */}
              <div className="bg-white/10 backdrop-blur-sm border-2 border-yellow-300 rounded-xl p-5 mb-6">
                <div className="flex items-start">
                  <div className="bg-yellow-300 rounded-full p-2 mr-4 flex-shrink-0">
                    <i className="fas fa-handshake text-blue-900 text-xl"></i>
                  </div>
                  <div className="text-left">
                    <h3 className="text-yellow-300 font-bold text-lg mb-2">We Don't Just Guide — We Build With You</h3>
                    <p className="text-blue-100 text-base leading-relaxed">
                      Unlike consultants who only charge for advice, we <strong className="text-white">partner with you throughout your entire journey</strong> — from initial assessment to meeting your attorney, and even through petition filing. We actively work alongside you to build your profile, not just tell you what to do.
                    </p>
                  </div>
                </div>
              </div>
              
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

      {/* Why RFEs Happen Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left side - Image */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-12 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="bg-teal-600 text-white px-8 py-4 rounded-xl inline-block mb-6 shadow-lg">
                        <p className="text-xl font-bold">When Brilliant Work Isn't Enough</p>
                      </div>
                      <div className="w-48 h-48 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                        <i className="fas fa-user text-6xl text-gray-500"></i>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-teal-400 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
              </div>

              {/* Right side - Content */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Exceptional Careers Still Receive RFEs or Denials?
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  You may have designed complex systems, driven large-scale innovation, authored research, or influenced industry standards. Yet <strong>USCIS does not approve talent alone</strong>. USCIS approves well-supported claims of sustained national or international recognition.
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Most denials are <em>not</em> about lack of achievement. They stem from <strong>unclear evidence strategy and weak narrative development</strong>.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Great accomplishments must be translated into a legal story that shows:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <i className="fas fa-check text-xs"></i>
                      </div>
                      <span className="text-gray-700">Why your work matters</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <i className="fas fa-check text-xs"></i>
                      </div>
                      <span className="text-gray-700">Who is influenced by it</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <i className="fas fa-check text-xs"></i>
                      </div>
                      <span className="text-gray-700">How it advances your field</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <i className="fas fa-check text-xs"></i>
                      </div>
                      <span className="text-gray-700">Why you stand among the small percentage at the top</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 mb-6 italic">
                  That translation is where most petitions fail.
                </p>

                <Link to="/assessment" className="bg-teal-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-all inline-flex items-center">
                  Transform Your EB-1A Profile
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by <span className="text-teal-600">Top Tech</span> Professionals
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Professionals from leading companies trust us with their immigration journey
            </p>
            
            {/* Company Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center opacity-70">
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-gray-600">Microsoft</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-gray-600">Amazon</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-600">LinkedIn</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-red-600">ORACLE</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-600">DELL</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-gray-600">accenture</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-600">PayPal</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-600">intel</span>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center justify-items-center opacity-70 mt-8">
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-gray-600">Lyft</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-gray-600">Snap Inc.</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-pink-600">T-Mobile</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-gray-600">JPMorgan</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-blue-600">citibank</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-gray-600">ACTIVISION</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-yellow-600">Expedia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* H1-B vs EB-1A Comparison Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                The Right Path to Your Green Card in the United States?
              </h2>
              <p className="text-xl text-blue-100">
                Choose your way!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* H1-B / EB-2/EB-3 Column */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">H1-B / EB-2/EB-3</h3>
                  <p className="text-blue-200">Traditional Path</p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start text-white">
                    <i className="fas fa-times-circle text-red-400 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Visa stamping headache</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-times-circle text-red-400 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Emergency travel restriction</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-times-circle text-red-400 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Employer restriction</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-times-circle text-red-400 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Layoff tension</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-times-circle text-red-400 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Backlog wait</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-times-circle text-red-400 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Business restrictions</span>
                  </li>
                </ul>
              </div>

              {/* EB-1A Green Card Column */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 border-2 border-green-400 shadow-2xl transform md:scale-105">
                <div className="text-center mb-6">
                  <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold mb-3">
                    RECOMMENDED
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">EB-1A Green Card</h3>
                  <p className="text-green-100">Merit-Based Path</p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start text-white">
                    <i className="fas fa-check-circle text-yellow-300 mt-1 mr-3 flex-shrink-0"></i>
                    <span><strong>Become US citizen in 5 years</strong></span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-check-circle text-yellow-300 mt-1 mr-3 flex-shrink-0"></i>
                    <span><strong>Get green card in one year</strong></span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-check-circle text-yellow-300 mt-1 mr-3 flex-shrink-0"></i>
                    <span>No visa stamping</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-check-circle text-yellow-300 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Employer/business freedom</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-check-circle text-yellow-300 mt-1 mr-3 flex-shrink-0"></i>
                    <span>Travel freedom</span>
                  </li>
                  <li className="flex items-start text-white">
                    <i className="fas fa-check-circle text-yellow-300 mt-1 mr-3 flex-shrink-0"></i>
                    <span>High professional confidence</span>
                  </li>
                </ul>
                <div className="mt-8 text-center">
                  <Link to="/assessment" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition-all inline-flex items-center">
                    Start Your EB-1A Journey
                    <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
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
            <div className="service-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-user-plus text-3xl text-yellow-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Profile Building</h3>
              <h4 className="text-lg font-semibold text-yellow-600 mb-3">Strategic Enhancement</h4>
              <p className="text-gray-600 mb-4">
                Comprehensive profile development to strengthen your immigration case and qualify for premium categories.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Publication strategy</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Awards & recognition guidance</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Media coverage assistance</span>
                </li>
              </ul>
              <Link to="/profile-building" className="text-yellow-600 font-semibold hover:text-yellow-800 transition-colors">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>

            {/* Career Coaching - NEW SERVICE */}
            <div className="service-card bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-briefcase text-3xl text-teal-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Coaching</h3>
              <h4 className="text-lg font-semibold text-teal-600 mb-3">Professional Development</h4>
              <p className="text-gray-600 mb-4">
                Strategic career guidance to advance your professional trajectory and maximize your extraordinary ability credentials.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Career strategy & positioning</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Leadership development</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                  <span className="text-gray-700">Industry positioning & branding</span>
                </li>
              </ul>
              <Link to="/career-coaching" className="text-teal-600 font-semibold hover:text-teal-800 transition-colors">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Top Tech Professionals Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Trusted by <span className="text-primary">Top Tech Professionals</span>
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Professionals from leading companies trust us to build their extraordinary ability profiles
          </p>
          
          {/* Company Logos Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center opacity-70">
              {/* Row 1 */}
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-gray-400">Microsoft</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-gray-700">amazon</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-600">LinkedIn</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-red-600">ORACLE</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-500">DELL</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-semibold text-gray-700">accenture</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-600">PayPal</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-2xl font-bold text-blue-500">intel</span>
              </div>
              
              {/* Row 2 */}
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-semibold text-gray-400">Lyft</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-gray-700">Snap Inc.</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-semibold text-pink-500">T-Mobile</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-lg font-semibold text-gray-600">JP Morgan Chase</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-blue-600">citibank</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-lg font-semibold text-gray-500">Deloitte</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-bold text-gray-700">ACTIVISION</span>
              </div>
              <div className="flex items-center justify-center h-16">
                <span className="text-xl font-semibold text-yellow-600">Expedia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <HomePageFAQ />
    </div>
  );
};

export default HomePage;