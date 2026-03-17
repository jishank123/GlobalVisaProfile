import { Link } from 'react-router-dom';
import { useState } from 'react';
import { newsletterAPI } from '../../services/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [subscribeError, setSubscribeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribedEmails, setSubscribedEmails] = useState(new Set());

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setSubscribeError('');
    setSubscribeMessage('');

    if (!email) {
      setSubscribeError('Please enter your email address');
      return;
    }

    // Check if email is already in local cache of subscribed emails
    if (subscribedEmails.has(email.toLowerCase())) {
      setSubscribeError('This email is already subscribed to our newsletter');
      return;
    }

    try {
      setIsLoading(true);
      const response = await newsletterAPI.subscribe(email);
      
      if (response.success) {
        // Add email to subscribed set
        setSubscribedEmails(prev => new Set(prev).add(email.toLowerCase()));
        setSubscribeMessage('Thank you for subscribing!');
        setEmail('');
        setTimeout(() => setSubscribeMessage(''), 3000);
      }
    } catch (error) {
      // Check if it's an already subscribed error from response
      if (error.response?.data?.error?.code === 'ALREADY_SUBSCRIBED') {
        setSubscribeError('This email is already subscribed to our newsletter');
        // Add to local cache
        setSubscribedEmails(prev => new Set(prev).add(email.toLowerCase()));
      } else if (error.code === 'ALREADY_SUBSCRIBED') {
        setSubscribeError('This email is already subscribed to our newsletter');
        // Add to local cache
        setSubscribedEmails(prev => new Set(prev).add(email.toLowerCase()));
      } else {
        const errorMsg = error.response?.data?.error?.message || error.message || 'Failed to subscribe. Please try again.';
        setSubscribeError(errorMsg);
      }
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Newsletter Subscription */}
            <div className="lg:col-span-4">
              <h4 className="text-white font-bold mb-4 text-lg">Subscribe to our Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="mb-6">
                <div className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Subscribing...' : 'Submit'}
                  </button>
                </div>
                {subscribeMessage && (
                  <p className="text-green-400 text-sm mt-2">{subscribeMessage}</p>
                )}
                {subscribeError && (
                  <p className="text-red-400 text-sm mt-2">{subscribeError}</p>
                )}
              </form>
              
              <h4 className="text-white font-bold mb-3 text-lg">Let's Get Social!</h4>
              <div className="flex flex-wrap gap-3 items-center content-center">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-center" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in text-white text-base"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-center" aria-label="Facebook">
                  <i className="fab fa-facebook-f text-white text-base"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-center" aria-label="Instagram">
                  <i className="fab fa-instagram text-white text-base"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-900 w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-center" aria-label="Twitter/X">
                  <i className="fab fa-twitter text-white text-base"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-center" aria-label="YouTube">
                  <i className="fab fa-youtube text-white text-base"></i>
                </a>
                <a href="https://medium.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-900 w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-center" aria-label="Medium">
                  <i className="fab fa-medium text-white text-base"></i>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-bold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/eb1a" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    EB1A Visa
                  </Link>
                </li>
                <li>
                  <Link to="/o1-visa" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    O-1A Visa
                  </Link>
                </li>
                <li>
                  <Link to="/eb2-niw" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    EB2-NIW
                  </Link>
                </li>
                <li>
                  <Link to="/career-coaching" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    Career Coaching
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    Our Services
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Resources */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-bold mb-4 text-lg">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/assessment" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    Profile Assessment
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center">
                    <i className="fas fa-chevron-right text-xs mr-2"></i>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact Us */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-4 text-lg">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <i className="fas fa-envelope text-teal-400 mt-1 mr-3"></i>
                  <a href="mailto:connect@eb1aexperts.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                    connect@eb1aexperts.com
                  </a>
                </li>
                <li className="flex items-start">
                  <i className="fab fa-whatsapp text-teal-400 mt-1 mr-3"></i>
                  <a href="https://wa.me/15134504166" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-teal-400 transition-colors">
                    +1 (513) 450-4166
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-white">Disclaimer:</strong> The information provided by EB1A Experts is for educational and informational purposes only. While we strive to offer valuable insights, we do not provide legal advice or representation before U.S. immigration authorities. Decisions related to immigration should be based on individual circumstances, and seeking professional legal advice may be beneficial where needed.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p>ImmigrationPro ©2026. All Rights Reserved</p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-conditions" className="hover:text-teal-400 transition-colors">
                Terms of Use
              </Link>
              {/* <Link to="/pricing" className="hover:text-teal-400 transition-colors">
                Refund Policy
              </Link> */}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <i className="fas fa-arrow-up"></i>
      </button>
    </footer>
  );
};

export default Footer;
