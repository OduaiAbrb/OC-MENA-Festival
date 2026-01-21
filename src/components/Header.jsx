import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CartModal from './CartModal';
import './Header.css';

const Header = ({ onGetTicketsClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems] = useState([]);
  const location = useLocation();

  // Close menu when window is resized above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1170 && isMenuOpen) {
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Cart
                    <span className="mobile-cart-badge">{getTotalCartItems()}</span>
                  </button>
                </li>
                <li className="nav-item mobile-menu-item">
                  <Link to="/login" className="nav-link mobile-user-btn" onClick={(e) => handleNavClick('/login', e)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Account
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-btn cart-btn desktop-only" onClick={handleCartClick} aria-label="Shopping Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="cart-badge">{getTotalCartItems()}</span>
          </button>

          <Link to="/login" className="icon-btn user-btn desktop-only" aria-label="User Account" onClick={(e) => handleNavClick('/login', e)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>

          <Link 
            to="/tickets"
            className="get-tickets-btn"
          >
            Get Tickets
          </Link>

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
