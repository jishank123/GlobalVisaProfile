import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactAPI } from '../../services/api';

const ContactPage = () => {
  const navigate = useNavigate();
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
        // Redirect to success page with account creation info
        const queryParams = new URLSearchParams({
          type: 'contact',
          email: contactForm.email
        });
        navigate(`/form-success?${queryParams.toString()}`);
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
      <div className="pt-28 pb-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Get in touch with our immigration experts. We're here to help you with your U.S. immigration journey.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
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
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Send Message
                      </>
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
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">Get in Touch</h3>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-map-marker-alt text-xl text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Office Address</h4>
                      <p className="text-gray-600">123 Immigration Plaza, Suite 500<br />New York, NY 10001</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-phone text-xl text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Phone</h4>
                      <p className="text-gray-600">(555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-envelope text-xl text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Email</h4>
                      <p className="text-gray-600">info@immigrationpro.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-clock text-xl text-primary"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1 text-gray-900">Business Hours</h4>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Follow Us</h3>
                  <div className="flex space-x-4">
                    <button type="button" className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary/30 transition-all text-primary">
                      <i className="fab fa-linkedin text-xl"></i>
                    </button>
                    <button type="button" className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary/30 transition-all text-primary">
                      <i className="fab fa-twitter text-xl"></i>
                    </button>
                    <button type="button" className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary/30 transition-all text-primary">
                      <i className="fab fa-facebook text-xl"></i>
                    </button>
                    <button type="button" className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary/30 transition-all text-primary">
                      <i className="fab fa-instagram text-xl"></i>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <a href="/assessment" className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all">
                      <i className="fas fa-chart-line mr-2"></i>
                      Free Profile Assessment
                    </a>
                    <a href="/schedule" className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all">
                      <i className="fas fa-calendar mr-2"></i>
                      Schedule Consultation
                    </a>
                    <a href="/services" className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 transition-all">
                      <i className="fas fa-briefcase mr-2"></i>
                      View Our Services
                    </a>
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

export default ContactPage;