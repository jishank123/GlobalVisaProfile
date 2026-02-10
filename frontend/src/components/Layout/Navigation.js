import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // Handle scroll for active navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });
      
      setActiveSection(current);
    };

    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    closeMobileMenu();
  };

  const NavLink = ({ to, children, onClick, className = "" }) => {
    const isActive = location.pathname === to || (to.startsWith('#') && activeSection === to.substring(1));
    
    if (to.startsWith('#')) {
      return (
        <button
          onClick={() => {
            scrollToSection(to.substring(1));
            if (onClick) onClick();
          }}
          className={`nav-link text-gray-700 hover:text-primary transition-colors inline-block py-2 ${isActive ? 'active' : ''} ${className}`}
        >
          {children}
        </button>
      );
    }
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`nav-link text-gray-700 hover:text-primary transition-colors inline-block py-2 ${isActive ? 'active' : ''} ${className}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fas fa-globe-americas text-3xl text-primary"></i>
            <span className="text-2xl font-bold text-gray-800">ImmigrationPro</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <NavLink to="/">Home</NavLink>
            
            {/* Services Dropdown */}
            <div className="relative group">
              <button className="nav-link text-gray-700 hover:text-primary transition-colors cursor-pointer inline-block py-2">
                Services <i className="fas fa-chevron-down text-xs ml-1"></i>
              </button>
              <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-lg w-56 z-50 -mt-1">
                <div className="py-2">
                  <Link to="/eb1a-eligibility" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors">
                    EB-1A Eligibility
                  </Link>
                  <Link to="/profile-building" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors">
                    Profile Building
                  </Link>
                  <Link to="/eb2-niw" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors">
                    EB-2 NIW
                  </Link>
                  <Link to="/o1-visa" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors">
                    O-1 Visa
                  </Link>
                </div>
              </div>
            </div>
            
            <NavLink to="/profile-assessment">Profile Assessment</NavLink>
            <NavLink to="/pricing">Pricing</NavLink>
            <NavLink to="/schedule-appointment">Schedule</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
            <NavLink to="/attorney-referrals">Attorneys</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to={user?.role === 'admin' ? '/dashboard/admin' : 
                      user?.role === 'lead_manager' ? '/dashboard/lead-manager' :
                      user?.role === 'crm_manager' ? '/dashboard/crm-manager' : '/dashboard/client'}
                  className="text-primary hover:text-secondary transition-colors font-semibold"
                >
                  <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="border-2 border-red-500 text-red-500 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
              </div>
            ) : (
              <>
                <div className="relative group">
                  <Link to="/login" className="border-2 border-primary text-primary px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
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
                <Link to="/signup" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors font-semibold">
                  <i className="fas fa-user-plus mr-2"></i>SIGN UP
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-btn"
            className="md:hidden text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-3 transition-all duration-200 ease-in-out transform active:scale-95"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl transition-transform duration-300 ease-in-out`}></i>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out">
          <div className="container mx-auto px-0">
            <div className="max-h-[70vh] overflow-y-auto">
              <NavLink to="/" onClick={closeMobileMenu} className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base font-medium border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-home w-5 inline-block mr-3 text-primary"></i>Home
              </NavLink>
              
              <div className="border-b border-gray-200"></div>
              <div className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">Services</div>
              
              <Link to="/eb1a-eligibility" onClick={closeMobileMenu} className="block px-6 py-4 pl-12 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-trophy w-4 inline-block mr-2 text-blue-500"></i>EB-1A Eligibility
              </Link>
              <Link to="/profile-building" onClick={closeMobileMenu} className="block px-6 py-4 pl-12 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-user-plus w-4 inline-block mr-2 text-yellow-500"></i>Profile Building
              </Link>
              <Link to="/eb2-niw" onClick={closeMobileMenu} className="block px-6 py-4 pl-12 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-star w-4 inline-block mr-2 text-indigo-500"></i>EB-2 NIW
              </Link>
              <Link to="/o1-visa" onClick={closeMobileMenu} className="block px-6 py-4 pl-12 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-medal w-4 inline-block mr-2 text-red-500"></i>O-1 Visa
              </Link>
              
              <div className="border-b border-gray-200"></div>
              
              <NavLink to="/profile-assessment" onClick={closeMobileMenu} className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base font-medium border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-chart-line w-5 inline-block mr-3 text-primary"></i>Profile Assessment
              </NavLink>
              <NavLink to="/pricing" onClick={closeMobileMenu} className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base font-medium border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-dollar-sign w-5 inline-block mr-3 text-primary"></i>Pricing
              </NavLink>
              <NavLink to="/schedule-appointment" onClick={closeMobileMenu} className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base font-medium border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-calendar w-5 inline-block mr-3 text-primary"></i>Schedule
              </NavLink>
              <NavLink to="/faq" onClick={closeMobileMenu} className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base font-medium border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-question-circle w-5 inline-block mr-3 text-primary"></i>FAQ
              </NavLink>
              <NavLink to="/attorney-referrals" onClick={closeMobileMenu} className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base font-medium border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-balance-scale w-5 inline-block mr-3 text-primary"></i>Attorneys
              </NavLink>
              <NavLink to="/contact" onClick={closeMobileMenu} className="block px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-primary transition-all duration-200 text-base font-medium border-b border-gray-100 active:bg-gray-50">
                <i className="fas fa-envelope w-5 inline-block mr-3 text-primary"></i>Contact
              </NavLink>
              
              <div className="border-b border-gray-200"></div>
              <div className="p-4 space-y-3 bg-gray-50">
                {isAuthenticated() ? (
                  <>
                    <Link 
                      to={user?.role === 'admin' ? '/dashboard/admin' : 
                          user?.role === 'lead_manager' ? '/dashboard/lead-manager' :
                          user?.role === 'crm_manager' ? '/dashboard/crm-manager' : '/dashboard/client'}
                      onClick={closeMobileMenu}
                      className="block bg-primary text-white px-6 py-3 rounded-lg text-center hover:bg-secondary transition-all duration-200 font-semibold shadow-sm active:scale-98"
                    >
                      <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full border-2 border-red-500 text-red-500 px-6 py-3 rounded-lg text-center hover:bg-red-50 transition-all duration-200 font-semibold shadow-sm active:scale-98"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMobileMenu} className="block border-2 border-primary text-primary px-6 py-3 rounded-lg text-center hover:bg-blue-50 transition-all duration-200 font-semibold shadow-sm active:scale-98">
                      <i className="fas fa-user mr-2"></i>Client Login
                    </Link>
                    <Link to="/manager" onClick={closeMobileMenu} className="block border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg text-center hover:bg-purple-50 transition-all duration-200 font-semibold shadow-sm active:scale-98">
                      <i className="fas fa-user-tie mr-2"></i>Manager Login
                    </Link>
                    <Link to="/signup" onClick={closeMobileMenu} className="block bg-primary text-white px-6 py-3 rounded-lg text-center hover:bg-secondary transition-all duration-200 font-semibold shadow-sm active:scale-98">
                      <i className="fas fa-user-plus mr-2"></i>SIGN UP
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;