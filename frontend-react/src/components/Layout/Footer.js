import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-globe-americas text-2xl text-blue-600"></i>
              <span className="text-xl font-bold text-white">ImmigrationPro</span>
            </div>
            <p className="text-gray-400">
              Your trusted partner for employment-based immigration solutions.
            </p>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/eb1a-eligibility" className="hover:text-white transition-colors">
                  EB-1A Visa
                </Link>
              </li>
              <li>
                <Link to="/eb2-niw" className="hover:text-white transition-colors">
                  EB-2 NIW
                </Link>
              </li>
              <li>
                <Link to="/o1-visa" className="hover:text-white transition-colors">
                  O-1 Visa
                </Link>
              </li>
              <li>
                <Link to="/profile-building" className="hover:text-white transition-colors">
                  Profile Building
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Our Process
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/attorney-referrals" className="hover:text-white transition-colors">
                  Attorney Referrals
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Disclaimer */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 text-center">
              <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
              <strong className="text-white">Legal Disclaimer:</strong> We are not attorneys or legal representatives. We provide profile building and application preparation services only. This website does not provide legal advice. For legal representation and advice, please consult a licensed immigration attorney. {' '}
              <Link to="/attorney-referrals" className="text-blue-600 hover:text-blue-400 underline">
                Find an attorney
              </Link>
            </p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2026 ImmigrationPro. All rights reserved. | Attorney Advertising</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;