import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* Company Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                <i className="fas fa-globe-americas text-2xl text-blue-600"></i>
                <span className="text-xl font-bold text-white">ImmigrationPro</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Your trusted partner for employment-based immigration solutions.
              </p>
              <div className="flex space-x-4 justify-center md:justify-start">
                <button type="button" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <i className="fab fa-linkedin text-lg"></i>
                </button>
                <button type="button" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <i className="fab fa-twitter text-lg"></i>
                </button>
                <button type="button" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <i className="fab fa-facebook text-lg"></i>
                </button>
              </div>
            </div>
            
            {/* Services */}
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold mb-3 text-base">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/eb1a-eligibility" className="text-gray-400 hover:text-white transition-colors block">
                    EB-1A Visa
                  </Link>
                </li>
                <li>
                  <Link to="/eb2-niw" className="text-gray-400 hover:text-white transition-colors block">
                    EB-2 NIW
                  </Link>
                </li>
                <li>
                  <Link to="/o1-visa" className="text-gray-400 hover:text-white transition-colors block">
                    O-1 Visa
                  </Link>
                </li>
                <li>
                  <Link to="/profile-building" className="text-gray-400 hover:text-white transition-colors block">
                    Profile Building
                  </Link>
                </li>
                <li>
                  <Link to="/profile-assessment" className="text-gray-400 hover:text-white transition-colors block">
                    Free Assessment
                  </Link>
                </li>
                <li>
                  <Link to="/schedule-appointment" className="text-gray-400 hover:text-white transition-colors block">
                    Schedule Consultation
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Legal & Support */}
            <div className="text-center md:text-left">
              <h4 className="text-white font-semibold mb-3 text-base">Support & Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/attorney-referrals" className="text-gray-400 hover:text-white transition-colors block">
                    Attorney Referrals
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white transition-colors block">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors block">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-conditions" className="text-gray-400 hover:text-white transition-colors block">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer Disclaimer */}
          <div className="border-t border-gray-700 pt-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 text-center">
                <i className="fas fa-exclamation-triangle text-yellow-500 mr-1"></i>
                <strong className="text-white">Legal Disclaimer:</strong> We are not attorneys or legal representatives. We provide profile building and application preparation services only. This website does not provide legal advice. For legal representation and advice, please consult a licensed immigration attorney. {' '}
                <Link to="/attorney-referrals" className="text-blue-600 hover:text-blue-400 underline">
                  Find an attorney
                </Link>
              </p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-800 pt-4 text-center">
            <p className="text-xs text-gray-400">&copy; 2026 ImmigrationPro. All rights reserved. | Attorney Advertising</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;