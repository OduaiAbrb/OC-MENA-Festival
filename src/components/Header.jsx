import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartModal from './CartModal';
import './Header.css';

const Header = ({ onGetTicketsClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems] = useState([]);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Close menu when window is resized above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1300 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path, e) => {
    // If we're clicking Home and already on the home page, scroll to top smoothly
    if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      cinematicScrollToTop();
    }
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const cinematicScrollToTop = () => {
    const startPosition = window.pageYOffset;
    const startTime = performance.now();
    const duration = 1200; // 1.2 seconds for cinematic effect
    
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition * (1 - easeProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  };

  const navItems = [
    { name: 'EXPERIENCE', path: '/' },
    { name: 'EVENT SCHEDULE', path: '/event-schedule' },
    { name: 'VENDORS', path: '/vendors' },
    { name: 'SPONSORS', path: '/sponsors' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path.startsWith('/#')) return location.pathname === '/';
    return location.pathname === path;
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-center">
          <div className="header-left">
            <Link to="/" className="logo" onClick={(e) => handleNavClick('/', e)}>
              <img src="/logo.png" alt="OC Fair" className="header-logo-img" />
            </Link>
          </div>
          
          <div className="nav-wrapper">
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li key={item.name} className="nav-item">
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(item.path, e)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li className="nav-item mobile-menu-item">
                  <button className="nav-link mobile-cart-btn" onClick={handleCartClick}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 3.75V6.25H12.5V3.75C12.5 2.37109 11.3789 1.25 10 1.25C8.62109 1.25 7.5 2.37109 7.5 3.75ZM6.25 7.5H3.125C2.78125 7.5 2.5 7.78125 2.5 8.125V16.25C2.5 17.6289 3.62109 18.75 5 18.75H15C16.3789 18.75 17.5 17.6289 17.5 16.25V8.125C17.5 7.78125 17.2188 7.5 16.875 7.5H13.75V10.625C13.75 10.9688 13.4688 11.25 13.125 11.25C12.7812 11.25 12.5 10.9688 12.5 10.625V7.5H7.5V10.625C7.5 10.9688 7.21875 11.25 6.875 11.25C6.53125 11.25 6.25 10.9688 6.25 10.625V7.5ZM6.25 6.25V3.75C6.25 1.67969 7.92969 0 10 0C12.0703 0 13.75 1.67969 13.75 3.75V6.25H16.875C17.9102 6.25 18.75 7.08984 18.75 8.125V16.25C18.75 18.3203 17.0703 20 15 20H5C2.92969 20 1.25 18.3203 1.25 16.25V8.125C1.25 7.08984 2.08984 6.25 3.125 6.25H6.25Z" fill="currentColor"></path>
                    </svg>
                    Cart
                    <span className="mobile-cart-badge">{getTotalCartItems()}</span>
                  </button>
                </li>
                <li className="nav-item mobile-menu-item">
                  <Link to={isAuthenticated ? "/dashboard" : "/login"} className="nav-link mobile-user-btn" onClick={(e) => handleNavClick(isAuthenticated ? '/dashboard' : '/login', e)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {isAuthenticated ? 'Dashboard' : 'Account'}
                  </Link>
                </li>
                <li className="nav-item mobile-menu-item mobile-get-tickets-item">
                  <Link 
                    to="/tickets"
                    className="mobile-get-tickets-btn" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Tickets
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="header-actions">
          <Link 
            to="/tickets"
            className="get-tickets-btn"
          >
            Get Tickets
          </Link>

          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="icon-btn user-btn desktop-only" aria-label="User Account" onClick={(e) => handleNavClick(isAuthenticated ? '/dashboard' : '/login', e)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>

          <button className="icon-btn cart-btn desktop-only" onClick={handleCartClick} aria-label="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 3.75V6.25H12.5V3.75C12.5 2.37109 11.3789 1.25 10 1.25C8.62109 1.25 7.5 2.37109 7.5 3.75ZM6.25 7.5H3.125C2.78125 7.5 2.5 7.78125 2.5 8.125V16.25C2.5 17.6289 3.62109 18.75 5 18.75H15C16.3789 18.75 17.5 17.6289 17.5 16.25V8.125C17.5 7.78125 17.2188 7.5 16.875 7.5H13.75V10.625C13.75 10.9688 13.4688 11.25 13.125 11.25C12.7812 11.25 12.5 10.9688 12.5 10.625V7.5H7.5V10.625C7.5 10.9688 7.21875 11.25 6.875 11.25C6.53125 11.25 6.25 10.9688 6.25 10.625V7.5ZM6.25 6.25V3.75C6.25 1.67969 7.92969 0 10 0C12.0703 0 13.75 1.67969 13.75 3.75V6.25H16.875C17.9102 6.25 18.75 7.08984 18.75 8.125V16.25C18.75 18.3203 17.0703 20 15 20H5C2.92969 20 1.25 18.3203 1.25 16.25V8.125C1.25 7.08984 2.08984 6.25 3.125 6.25H6.25Z" fill="currentColor"></path>
            </svg>
            <span className="cart-badge">{getTotalCartItems()}</span>
          </button>

          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems}
      />
    </header>
  );
};

export default Header;
