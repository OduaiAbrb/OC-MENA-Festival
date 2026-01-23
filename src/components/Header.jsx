import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartSidebar from './CartSidebar';
import './Header.css';

const Header = ({ onGetTicketsClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
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

  // Load cart items from localStorage and listen for updates
  useEffect(() => {
    const loadCart = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const parsedCart = JSON.parse(cart);
          setCartItems(parsedCart.items || []);
        } catch (e) {
          console.error('Error parsing cart:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    };

    loadCart();

    const handleCartUpdate = (event) => {
      if (event.detail) {
        setCartItems(event.detail.items || []);
      }
    };

    const handleOpenCart = () => {
      setIsCartSidebarOpen(true);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('openCart', handleOpenCart);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('openCart', handleOpenCart);
    };
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
    setIsCartSidebarOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseCart = () => {
    setIsCartSidebarOpen(false);
    document.body.style.overflow = '';
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                      <path d="M5 5C5 4.50754 5.097 4.01991 5.28545 3.56494C5.47391 3.10997 5.75013 2.69657 6.09835 2.34835C6.44657 2.00013 6.85997 1.72391 7.31494 1.53545C7.76991 1.347 8.25754 1.25 8.75 1.25C9.24246 1.25 9.73009 1.347 10.1851 1.53545C10.64 1.72391 11.0534 2.00013 11.4017 2.34835C11.7499 2.69657 12.0261 3.10997 12.2145 3.56494C12.403 4.01991 12.5 4.50754 12.5 5C12.5 5.49246 12.403 5.98009 12.2145 6.43506C12.0261 6.89003 11.7499 7.30343 11.4017 7.65165C11.0534 7.99987 10.64 8.27609 10.1851 8.46455C9.73009 8.653 9.24246 8.75 8.75 8.75C8.25754 8.75 7.76991 8.653 7.31494 8.46455C6.85997 8.27609 6.44657 7.99987 6.09835 7.65165C5.75013 7.30343 5.47391 6.89003 5.28545 6.43506C5.097 5.98009 5 5.49246 5 5ZM13.75 5C13.75 3.67392 13.2232 2.40215 12.2855 1.46447C11.3479 0.526784 10.0761 0 8.75 0C7.42392 0 6.15215 0.526784 5.21447 1.46447C4.27678 2.40215 3.75 3.67392 3.75 5C3.75 6.32608 4.27678 7.59785 5.21447 8.53553C6.15215 9.47322 7.42392 10 8.75 10C10.0761 10 11.3479 9.47322 12.2855 8.53553C13.2232 7.59785 13.75 6.32608 13.75 5ZM1.25 18.75C1.25 15.6445 3.76953 13.125 6.875 13.125H10.625C13.7305 13.125 16.25 15.6445 16.25 18.75V19.375C16.25 19.7188 16.5312 20 16.875 20C17.2188 20 17.5 19.7188 17.5 19.375V18.75C17.5 14.9531 14.4219 11.875 10.625 11.875H6.875C3.07812 11.875 0 14.9531 0 18.75V19.375C0 19.7188 0.28125 20 0.625 20C0.96875 20 1.25 19.7188 1.25 19.375V18.75Z" fill="currentColor"></path>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path d="M5 5C5 4.50754 5.097 4.01991 5.28545 3.56494C5.47391 3.10997 5.75013 2.69657 6.09835 2.34835C6.44657 2.00013 6.85997 1.72391 7.31494 1.53545C7.76991 1.347 8.25754 1.25 8.75 1.25C9.24246 1.25 9.73009 1.347 10.1851 1.53545C10.64 1.72391 11.0534 2.00013 11.4017 2.34835C11.7499 2.69657 12.0261 3.10997 12.2145 3.56494C12.403 4.01991 12.5 4.50754 12.5 5C12.5 5.49246 12.403 5.98009 12.2145 6.43506C12.0261 6.89003 11.7499 7.30343 11.4017 7.65165C11.0534 7.99987 10.64 8.27609 10.1851 8.46455C9.73009 8.653 9.24246 8.75 8.75 8.75C8.25754 8.75 7.76991 8.653 7.31494 8.46455C6.85997 8.27609 6.44657 7.99987 6.09835 7.65165C5.75013 7.30343 5.47391 6.89003 5.28545 6.43506C5.097 5.98009 5 5.49246 5 5ZM13.75 5C13.75 3.67392 13.2232 2.40215 12.2855 1.46447C11.3479 0.526784 10.0761 0 8.75 0C7.42392 0 6.15215 0.526784 5.21447 1.46447C4.27678 2.40215 3.75 3.67392 3.75 5C3.75 6.32608 4.27678 7.59785 5.21447 8.53553C6.15215 9.47322 7.42392 10 8.75 10C10.0761 10 11.3479 9.47322 12.2855 8.53553C13.2232 7.59785 13.75 6.32608 13.75 5ZM1.25 18.75C1.25 15.6445 3.76953 13.125 6.875 13.125H10.625C13.7305 13.125 16.25 15.6445 16.25 18.75V19.375C16.25 19.7188 16.5312 20 16.875 20C17.2188 20 17.5 19.7188 17.5 19.375V18.75C17.5 14.9531 14.4219 11.875 10.625 11.875H6.875C3.07812 11.875 0 14.9531 0 18.75V19.375C0 19.7188 0.28125 20 0.625 20C0.96875 20 1.25 19.7188 1.25 19.375V18.75Z" fill="currentColor"></path>
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
      <CartSidebar 
        isOpen={isCartSidebarOpen}
        onClose={handleCloseCart}
      />
    </header>
  );
};

export default Header;
