import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <i className="fas fa-globe-americas text-3xl text-blue-600"></i>
            <span className="text-2xl font-bold text-gray-800">ImmigrationPro</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link 
              to="/" 
              className={`nav-link transition-colors inline-block py-2 ${
                isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            
            {/* Services Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsServicesDropdownOpen(true)}
              onMouseLeave={() => setIsServicesDropdownOpen(false)}
            >
              <button className="nav-link text-gray-700 hover:text-blue-600 transition-colors cursor-pointer inline-block py-2">
                Services <i className="fas fa-chevron-down text-xs ml-1"></i>
              </button>
              <div className={`absolute left-0 top-full bg-white shadow-lg rounded-lg w-56 z-50 -mt-1 ${
                isServicesDropdownOpen ? 'block' : 'hidden'
              }`}>
                <div className="py-2">
                  <Link 
                    to="/eb1a-eligibility" 
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    EB-1A Eligibility
                  </Link>
                  <Link 
                    to="/profile-building" 
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    Profile Building
                  </Link>
                  <Link 
                    to="/eb2-niw" 
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    EB-2 NIW
                  </Link>
                  <Link 
                    to="/o1-visa" 
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    O-1 Visa
                  </Link>
                </div>
              </div>
            </div>
            
            <Link 
              to="/profile-assessment" 
              className={`nav-link transition-colors inline-block py-2 ${
                isActive('/profile-assessment') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Profile Assessment
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link transition-colors inline-block py-2 ${
                isActive('/pricing') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/schedule-appointment" 
              className={`nav-link transition-colors inline-block py-2 ${
                isActive('/schedule-appointment') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Schedule
            </Link>
            <Link 
              to="/faq" 
              className={`nav-link transition-colors inline-block py-2 ${
                isActive('/faq') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              FAQ
            </Link>
            <Link 
              to="/attorney-referrals" 
              className={`nav-link transition-colors inline-block py-2 ${
                isActive('/attorney-referrals') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Attorneys
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link transition-colors inline-block py-2 ${
                isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Contact
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="relative group">
              <Link 
                to="/login" 
                className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>LOGIN
              </Link>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link to="/login" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                  <i className="fas fa-user mr-2 text-blue-600"></i>Client Login
                </Link>
                <Link to="/manager" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100">
                  <i className="fas fa-user-tie mr-2 text-purple-600"></i>Manager Login
                </Link>
              </div>
            </div>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <i className="fas fa-user-plus mr-2"></i>SIGN UP
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-lg p-3 transition-all duration-200 ease-in-out transform active:scale-95" 
            aria-label="Toggle mobile menu" 
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl transition-transform duration-300 ease-in-out`}></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-t shadow-lg transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <div className="border-l-2 border-gray-200 pl-4">
              <div className="text-gray-500 text-sm font-semibold mb-2">Services</div>
              <Link 
                to="/eb1a-eligibility" 
                className="block text-gray-700 hover:text-blue-600 transition-colors py-1"
                onClick={closeMobileMenu}
              >
                EB-1A Eligibility
              </Link>
              <Link 
                to="/profile-building" 
                className="block text-gray-700 hover:text-blue-600 transition-colors py-1"
                onClick={closeMobileMenu}
              >
                Profile Building
              </Link>
              <Link 
                to="/eb2-niw" 
                className="block text-gray-700 hover:text-blue-600 transition-colors py-1"
                onClick={closeMobileMenu}
              >
                EB-2 NIW
              </Link>
              <Link 
                to="/o1-visa" 
                className="block text-gray-700 hover:text-blue-600 transition-colors py-1"
                onClick={closeMobileMenu}
              >
                O-1 Visa
              </Link>
            </div>
            <Link 
              to="/profile-assessment" 
              className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Profile Assessment
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Pricing
            </Link>
            <Link 
              to="/schedule-appointment" 
              className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Schedule
            </Link>
            <Link 
              to="/faq" 
              className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              FAQ
            </Link>
            <Link 
              to="/attorney-referrals" 
              className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Attorneys
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <Link 
                to="/login" 
                className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-center"
                onClick={closeMobileMenu}
              >
                <i className="fas fa-user mr-2"></i>Client Login
              </Link>
              <Link 
                to="/manager" 
                className="border-2 border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-center"
                onClick={closeMobileMenu}
              >
                <i className="fas fa-user-tie mr-2"></i>Manager Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                onClick={closeMobileMenu}
              >
                <i className="fas fa-user-plus mr-2"></i>SIGN UP
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;