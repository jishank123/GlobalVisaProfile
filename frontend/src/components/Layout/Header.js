import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'admin':
      case 'manager':
        return '/dashboard/admin';
      case 'client':
        return '/dashboard/client';
      default:
        return '/dashboard';
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isServiceActive = () => {
    const servicePaths = ['/eb1a-eligibility', '/profile-building', '/eb2-niw', '/o1-visa', '/career-coaching'];
    return servicePaths.includes(location.pathname);
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <i className="fas fa-globe-americas text-4xl text-blue-600"></i>
            <span className="text-3xl font-extrabold text-gray-800">ImmigrationPro</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden xl:flex space-x-1 2xl:space-x-2 items-center text-sm 2xl:text-base">
            <Link 
              to="/" 
              className={`nav-link-enhanced px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${
                isActive('/') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Home
            </Link>
            
            <Link 
              to="/about" 
              className={`nav-link-enhanced px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${
                isActive('/about') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              About
            </Link>
            
            {/* Services Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsServicesDropdownOpen(true)}
              onMouseLeave={() => setIsServicesDropdownOpen(false)}
            >
              <button className={`nav-link-enhanced px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap font-semibold ${
                isServiceActive()
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 group-hover:text-blue-600 group-hover:bg-blue-50'
              }`}>
                Services <i className={`fas fa-chevron-down text-xs ml-1 transition-transform duration-300 ${isServicesDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              <div className={`absolute left-0 top-full bg-white shadow-xl rounded-xl w-56 z-50 mt-1 border border-gray-100 transition-all duration-200 origin-top ${
                isServicesDropdownOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
              }`}>
                <div className="py-2">
                  <Link 
                    to="/eb1a-eligibility" 
                    className={`block px-4 py-3 transition-all duration-150 font-medium hover:pl-5 ${
                      isActive('/eb1a-eligibility')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <i className="fas fa-star text-blue-500 mr-2"></i>EB-1A Eligibility
                  </Link>
                  <Link 
                    to="/profile-building" 
                    className={`block px-4 py-3 transition-all duration-150 font-medium hover:pl-5 ${
                      isActive('/profile-building')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <i className="fas fa-user-check text-green-500 mr-2"></i>Profile Building
                  </Link>
                  <Link 
                    to="/eb2-niw" 
                    className={`block px-4 py-3 transition-all duration-150 font-medium hover:pl-5 ${
                      isActive('/eb2-niw')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <i className="fas fa-briefcase text-purple-500 mr-2"></i>EB-2 NIW
                  </Link>
                  <Link 
                    to="/o1-visa" 
                    className={`block px-4 py-3 transition-all duration-150 font-medium hover:pl-5 ${
                      isActive('/o1-visa')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <i className="fas fa-medal text-orange-500 mr-2"></i>O-1 Visa
                  </Link>
                  <Link 
                    to="/career-coaching" 
                    className={`block px-4 py-3 transition-all duration-150 font-medium hover:pl-5 ${
                      isActive('/career-coaching')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <i className="fas fa-chart-line text-red-500 mr-2"></i>Career Coaching
                  </Link>
                </div>
              </div>
            </div>
            
            <Link 
              to="/profile-assessment" 
              className={`nav-link-enhanced px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${
                isActive('/profile-assessment') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Assessment
            </Link>
            <Link 
              to="/pricing" 
              className={`nav-link-enhanced px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${
                isActive('/pricing') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/attorney-referrals" 
              className={`nav-link-enhanced px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${
                isActive('/attorney-referrals') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Attorneys
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link-enhanced px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap font-semibold ${
                isActive('/contact') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              Contact
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden xl:flex items-center space-x-2 2xl:space-x-3">
            {isAuthenticated() ? (
              <>
                <Link 
                  to={getDashboardRoute()}
                  className="border-2 border-blue-600 text-blue-600 px-4 2xl:px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold whitespace-nowrap text-sm 2xl:text-base shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-tachometer-alt mr-1 2xl:mr-2"></i>DASHBOARD
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 2xl:px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold whitespace-nowrap text-sm 2xl:text-base shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-sign-out-alt mr-1 2xl:mr-2"></i>LOGOUT
                </button>
              </>
            ) : (
              <>
                <div className="relative group">
                  <Link 
                    to="/login" 
                    className="border-2 border-blue-600 text-blue-600 px-4 2xl:px-6 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold whitespace-nowrap text-sm 2xl:text-base shadow-sm hover:shadow-md"
                  >
                    <i className="fas fa-sign-in-alt mr-1 2xl:mr-2"></i>LOGIN
                  </Link>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link to="/login" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg transition-colors duration-150 font-medium">
                      <i className="fas fa-user mr-2 text-blue-600"></i>Client Login
                    </Link>
                    <Link to="/manager" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-b-lg border-t border-gray-100 transition-colors duration-150 font-medium">
                      <i className="fas fa-user-tie mr-2 text-purple-600"></i>Manager Login
                    </Link>
                  </div>
                </div>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 2xl:px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold whitespace-nowrap text-sm 2xl:text-base shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-user-plus mr-1 2xl:mr-2"></i>SIGN UP
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="xl:hidden text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-lg p-3 transition-all duration-200 ease-in-out transform active:scale-95" 
            aria-label="Toggle mobile menu" 
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl transition-transform duration-300 ease-in-out`}></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`xl:hidden bg-white border-t border-gray-100 shadow-lg transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-[calc(100vh-80px)] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="container mx-auto px-6 py-6 pb-32">
          <div className="flex flex-col space-y-1">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg font-semibold"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-home w-6 mr-3 text-blue-600"></i>Home
            </Link>
            
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg font-semibold"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-info-circle w-6 mr-3 text-blue-600"></i>About
            </Link>
            
            {/* Services Section */}
            <div className="py-2">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider px-4 py-2 mb-1">Services</div>
              <div className="flex flex-col space-y-1">
                <Link 
                  to="/eb1a-eligibility" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg pl-8 font-semibold"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-star text-blue-500 mr-2"></i>EB-1A Eligibility
                </Link>
                <Link 
                  to="/profile-building" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg pl-8 font-semibold"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-user-check text-green-500 mr-2"></i>Profile Building
                </Link>
                <Link 
                  to="/eb2-niw" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg pl-8 font-semibold"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-briefcase text-purple-500 mr-2"></i>EB-2 NIW
                </Link>
                <Link 
                  to="/o1-visa" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg pl-8 font-semibold"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-medal text-orange-500 mr-2"></i>O-1 Visa
                </Link>
              </div>
            </div>
            
            <Link 
              to="/profile-assessment" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg font-semibold"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-clipboard-check w-6 mr-3 text-blue-600"></i>Assessment
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg font-semibold"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-dollar-sign w-6 mr-3 text-blue-600"></i>Pricing
            </Link>
            <Link 
              to="/attorney-referrals" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg font-semibold"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-gavel w-6 mr-3 text-blue-600"></i>Attorneys
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 px-4 py-3 rounded-lg font-semibold"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-envelope w-6 mr-3 text-blue-600"></i>Contact
            </Link>
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col space-y-3 pt-6 mt-4 border-t border-gray-200">
              {isAuthenticated() ? (
                <>
                  <Link 
                    to={getDashboardRoute()}
                    className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 font-semibold text-center shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-tachometer-alt mr-2"></i>DASHBOARD
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold text-center shadow-sm"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold text-center shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-user mr-2"></i>Client Login
                  </Link>
                  <Link 
                    to="/manager" 
                    className="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-all duration-200 font-semibold text-center shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-user-tie mr-2"></i>Manager Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-center shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-user-plus mr-2"></i>SIGN UP
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;