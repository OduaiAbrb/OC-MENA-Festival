import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ 
  showTicketModal, 
  setShowTicketModal,
  currentStep,
  setCurrentStep,
  ticketQuantities, 
  handleTicketQuantityChange, 
  getTotalPrice, 
  getTotalTickets 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const buttonClickedRef = React.useRef(false);

  useEffect(() => {
    console.log('showTicketModal changed to:', showTicketModal);
  }, [showTicketModal]);

  useEffect(() => {
    const targetDate = new Date('June 19, 2026 00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-video-container">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="hero-video"
          >
            <source src="/video_design.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          {/* Large Logo */}
          <div className="hero-logo">
            <img src="/logo.png" alt="OC MENA Festival" className="hero-logo-image" />
          </div>
          
          <div className="hero-badge">SUMMER 2026</div>
          <h1 className="hero-title">OC MENA Festival</h1>
          <div className="hero-date">
            <span className="date-icon">📅</span>
            June 19-21, 2026 • Orange County, CA
          </div>
          <p className="hero-description">
            Experience three days of Middle Eastern and North African (MENA) culture, 
            food, music, rides, shopping, and family-friendly fun—all in one lively 
            summer festival.
          </p>

          {/* Countdown Timer */}
          <div className="countdown">
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.days).padStart(3, '0')}</div>
              <div className="countdown-label">days</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="countdown-label">hrs</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="countdown-label">mins</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="countdown-label">sec</div>
            </div>
          </div>

          <div className="hero-buttons">
            <Link to="/vendors" className="btn-secondary">Vendor Sign Up</Link>
            <button 
              onClick={() => {
                console.log('Get Tickets clicked!');
                setShowTicketModal(true);
              }}
              className="btn-primary"
            >
              Get Tickets
            </button>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="experience-section">
        <div className="container">
          <h2 className="section-title">Experience the Magic</h2>
          <p className="section-subtitle">
            Immerse yourself in the vibrant traditions, flavors, and artistry of the MENA region
          </p>

          <div className="experience-grid">
            <div className="experience-card">
              <div className="experience-icon">🎵</div>
              <h3>Live Music</h3>
              <p>World-class performances from renowned MENA artists and musicians</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🍽️</div>
              <h3>Authentic Cuisine</h3>
              <p>Savor traditional dishes and modern fusion from across the region</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🎨</div>
              <h3>Art & Culture</h3>
              <p>Explore stunning exhibitions, crafts, and cultural demonstrations</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🎢</div>
              <h3>Rides & Games</h3>
              <p>Family-friendly attractions and entertainment for all ages</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🛍️</div>
              <h3>Vibrant Bazaar</h3>
              <p>Shop unique finds from local artisans and international vendors</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">💃</div>
              <h3>Dance & Performance</h3>
              <p>Traditional and contemporary dance showcasing MENA heritage</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title" style={{ textAlign: 'left' }}>About the Festival</h2>
              <p>
                The OC MENA Festival is a large-scale cultural celebration honoring the rich 
                traditions, creativity, and diversity of the Middle East and North Africa. 
                Held in the heart of Orange County, the festival brings communities together 
                through music, art, food, fashion, and immersive experiences that reflect both 
                heritage and modern culture.
              </p>
              <p>
                More than just a festival, OC MENA Festival is a gathering rooted in connection, 
                storytelling, and shared experiences. Over three summer days, guests can explore 
                vendor booths, enjoy authentic cuisine, experience live music and performances, 
                and discover the cultural threads that unite generations across the MENA region.
              </p>
              <Link to="/contact" className="btn-primary">Learn More</Link>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">3</div>
                <div className="stat-label">Days of Celebration</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Vendors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Performances</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">∞</div>
                <div className="stat-label">Memories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="tickets" className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience OC MENA Festival?</h2>
            <p>Secure your tickets now and be part of Orange County's premier cultural celebration</p>
            <div className="cta-buttons">
              <button 
                onClick={() => {
                  console.log('CTA Get Tickets clicked!');
                  setShowTicketModal(true);
                }}
                className="btn-primary btn-large"
              >
                Get Tickets Now
              </button>
              <Link to="/event-schedule" className="btn-secondary btn-large">View Schedule</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      )}

      {/* World-Class Ticket Purchase Modal */}
      {showTicketModal && (
        <div className="premium-ticket-modal-overlay" onClick={(e) => {
          setShowTicketModal(false);
        }}>
          <div className="premium-ticket-modal" onClick={(e) => {
            e.stopPropagation();
          }}>
            {/* Modal Header with Progress */}
            <div className="premium-modal-header">
              <div className="premium-header-content">
                <div className="premium-header-left">
                  <div className="premium-logo-section">
                    <div className="premium-logo-icon">
                      <span className="logo-oc">OC</span>
                    </div>
                    <div className="premium-logo-text">
                      <span className="logo-mena">MENA</span>
                      <span className="logo-festival">FESTIVAL</span>
                    </div>
                  </div>
                  <h2 className="premium-modal-title">Select Your Experience</h2>
                  <p className="premium-modal-subtitle">Choose your perfect festival adventure</p>
                </div>
                <button 
                  className="premium-modal-close"
                  onClick={() => {
                    setShowTicketModal(false);
                  }}
                  aria-label="Close modal"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="premium-progress-bar">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Select Tickets</div>
                </div>
                <div className="progress-connector"></div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Review Order</div>
                </div>
                <div className="progress-connector"></div>
                <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Payment</div>
                </div>
              </div>
            </div>
            
            {/* Step Content */}
            {currentStep === 1 && (
              <div className="premium-ticket-selection">
                <div className="premium-ticket-grid">
                {/* 3-Day Pass - Premium */}
                <div className="premium-ticket-card featured" data-ticket-type="3day" onClick={(e) => {
                  console.log('CARD CLICK FIRED for 3day, buttonClickedRef:', buttonClickedRef.current);
                  if (!buttonClickedRef.current) {
                    const current = ticketQuantities['3day'];
                    if (current < 10) handleTicketQuantityChange('3day', current + 1);
                  }
                  buttonClickedRef.current = false;
                }}>
                  <div className="premium-card-header">
                    <div className="premium-badge featured-badge">BEST VALUE</div>
                    <div className="premium-duration">3 DAYS</div>
                  </div>
                  <div className="premium-card-body">
                    <h3 className="premium-ticket-title">Ultimate Experience</h3>
                    <p className="premium-ticket-description">
                      Complete immersion in the festival. All three days of unlimited cultural experiences, premium performances, and exclusive access to special events.
                    </p>
                    <div className="premium-features">
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>All Day Access</span>
                      </div>
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Premium Seating Areas</span>
                      </div>
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Exclusive Workshops</span>
                      </div>
                    </div>
                    <div className="premium-price-section">
                      <div className="price-wrapper">
                        <span className="currency">$</span>
                        <span className="amount">35</span>
                      </div>
                      <div className="price-note">Save $10 vs daily passes</div>
                    </div>
                    <div className="premium-quantity-selector">
                      <label className="quantity-label">Quantity</label>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn minus"
                          onMouseDown={(e) => {
                            console.log('MINUS BUTTON MOUSE DOWN for 3day');
                            buttonClickedRef.current = true;
                            e.stopPropagation();
                            e.preventDefault();
                            const current = ticketQuantities['3day'];
                            if (current > 0) handleTicketQuantityChange('3day', current - 1);
                          }}
                          disabled={ticketQuantities['3day'] === 0}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          min="0" 
                          max="10"
                          value={ticketQuantities['3day']}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                            handleTicketQuantityChange('3day', val);
                          }}
                          className="premium-quantity-input"
                        />
                        <button 
                          className="quantity-btn plus"
                          onMouseDown={(e) => {
                            console.log('PLUS BUTTON MOUSE DOWN for 3day');
                            buttonClickedRef.current = true;
                            e.stopPropagation();
                            e.preventDefault();
                            const current = ticketQuantities['3day'];
                            if (current < 10) handleTicketQuantityChange('3day', current + 1);
                          }}
                          disabled={ticketQuantities['3day'] >= 10}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-Day Pass */}
                <div className="premium-ticket-card" data-ticket-type="2day" onClick={(e) => {
                  console.log('CARD CLICK FIRED for 2day, buttonClickedRef:', buttonClickedRef.current);
                  if (!buttonClickedRef.current) {
                    const current = ticketQuantities['2day'];
                    if (current < 10) handleTicketQuantityChange('2day', current + 1);
                  }
                  buttonClickedRef.current = false;
                }}>
                  <div className="premium-card-header">
                    <div className="premium-badge popular-badge">POPULAR</div>
                    <div className="premium-duration">2 DAYS</div>
                  </div>
                  <div className="premium-card-body">
                    <h3 className="premium-ticket-title">Weekend Explorer</h3>
                    <p className="premium-ticket-description">
                      Perfect for weekend warriors. Two full days of festival magic with access to all main performances and cultural activities.
                    </p>
                    <div className="premium-features">
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>All Day Access</span>
                      </div>
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Main Stage Access</span>
                      </div>
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Cultural Workshops</span>
                      </div>
                    </div>
                    <div className="premium-price-section">
                      <div className="price-wrapper">
                        <span className="currency">$</span>
                        <span className="amount">25</span>
                      </div>
                      <div className="price-note">Save $5 vs daily passes</div>
                    </div>
                    <div className="premium-quantity-selector">
                      <label className="quantity-label">Quantity</label>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn minus"
                          onMouseDown={(e) => {
                            console.log('MINUS BUTTON MOUSE DOWN for 2day');
                            buttonClickedRef.current = true;
                            e.stopPropagation();
                            e.preventDefault();
                            const current = ticketQuantities['2day'];
                            if (current > 0) handleTicketQuantityChange('2day', current - 1);
                          }}
                          disabled={ticketQuantities['2day'] === 0}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          min="0" 
                          max="10"
                          value={ticketQuantities['2day']}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                            handleTicketQuantityChange('2day', val);
                          }}
                          className="premium-quantity-input"
                        />
                        <button 
                          className="quantity-btn plus"
                          onMouseDown={(e) => {
                            console.log('PLUS BUTTON MOUSE DOWN for 2day');
                            buttonClickedRef.current = true;
                            e.stopPropagation();
                            e.preventDefault();
                            const current = ticketQuantities['2day'];
                            if (current < 10) handleTicketQuantityChange('2day', current + 1);
                          }}
                          disabled={ticketQuantities['2day'] >= 10}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Day Pass */}
                <div className="premium-ticket-card" data-ticket-type="1day" onClick={(e) => {
                  console.log('CARD CLICK FIRED for 1day, buttonClickedRef:', buttonClickedRef.current);
                  if (!buttonClickedRef.current) {
                    const current = ticketQuantities['1day'];
                    if (current < 10) handleTicketQuantityChange('1day', current + 1);
                  }
                  buttonClickedRef.current = false;
                }}>
                  <div className="premium-card-header">
                    <div className="premium-duration">1 DAY</div>
                  </div>
                  <div className="premium-card-body">
                    <h3 className="premium-ticket-title">Day Pass</h3>
                    <p className="premium-ticket-description">
                      Sample the festival experience. One full day of cultural immersion, music, food, and family-friendly entertainment.
                    </p>
                    <div className="premium-features">
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>All Day Access</span>
                      </div>
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Main Performances</span>
                      </div>
                      <div className="feature-item">
                        <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Food & Market Access</span>
                      </div>
                    </div>
                    <div className="premium-price-section">
                      <div className="price-wrapper">
                        <span className="currency">$</span>
                        <span className="amount">15</span>
                      </div>
                      <div className="price-note">Single day admission</div>
                    </div>
                    <div className="premium-quantity-selector">
                      <label className="quantity-label">Quantity</label>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn minus"
                          onMouseDown={(e) => {
                            console.log('MINUS BUTTON MOUSE DOWN for 1day');
                            buttonClickedRef.current = true;
                            e.stopPropagation();
                            e.preventDefault();
                            const current = ticketQuantities['1day'];
                            if (current > 0) handleTicketQuantityChange('1day', current - 1);
                          }}
                          disabled={ticketQuantities['1day'] === 0}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          min="0" 
                          max="10"
                          value={ticketQuantities['1day']}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
                            handleTicketQuantityChange('1day', val);
                          }}
                          className="premium-quantity-input"
                        />
                        <button 
                          className="quantity-btn plus"
                          onMouseDown={(e) => {
                            console.log('PLUS BUTTON MOUSE DOWN for 1day');
                            buttonClickedRef.current = true;
                            e.stopPropagation();
                            e.preventDefault();
                            const current = ticketQuantities['1day'];
                            if (current < 10) handleTicketQuantityChange('1day', current + 1);
                          }}
                          disabled={ticketQuantities['1day'] >= 10}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="premium-review-order">
                <div className="review-order-content">
                  <h3 className="review-title">Review Your Order</h3>
                  <div className="review-tickets">
                    {Object.entries(ticketQuantities).filter(([_, qty]) => qty > 0).map(([type, qty]) => {
                      const prices = { '1day': 15, '2day': 25, '3day': 35 };
                      const names = { '1day': 'Day Pass', '2day': 'Weekend Explorer', '3day': 'Ultimate Experience' };
                      return (
                        <div key={type} className="review-ticket-item">
                          <div className="ticket-info">
                            <h4>{names[type]}</h4>
                            <p>Quantity: {qty}</p>
                          </div>
                          <div className="ticket-price">${prices[type] * qty}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="review-total">
                    <div className="total-row">
                      <span>Total Amount:</span>
                      <span className="total-amount">${getTotalPrice()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="premium-payment">
                <div className="payment-content">
                  <h3 className="payment-title">Payment Information</h3>
                  <div className="payment-form">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="payment-input" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="payment-input" />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="123" className="payment-input" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Name on Card</label>
                      <input type="text" placeholder="John Doe" className="payment-input" />
                    </div>
                    <div className="payment-summary">
                      <div className="summary-row">
                        <span>Total to Pay:</span>
                        <span className="payment-total">${getTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Footer with Summary */}
            <div className="premium-modal-footer">
              <div className="premium-order-summary">
                <div className="summary-header">
                  <h4>Order Summary</h4>
                  <div className="summary-items">
                    {Object.entries(ticketQuantities).filter(([_, qty]) => qty > 0).map(([type, qty]) => {
                      const prices = { '1day': 15, '2day': 25, '3day': 35 };
                      const names = { '1day': 'Day Pass', '2day': 'Weekend Explorer', '3day': 'Ultimate Experience' };
                      return (
                        <div key={type} className="summary-item">
                          <span className="item-name">{qty} × {names[type]}</span>
                          <span className="item-price">${prices[type] * qty}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="summary-total">
                  <div className="total-row">
                    <span className="total-label">Total Tickets</span>
                    <span className="total-value">{getTotalTickets()}</span>
                  </div>
                  <div className="total-row main-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-amount">${getTotalPrice()}</span>
                  </div>
                </div>
              </div>
              
              <div className="premium-modal-actions">
                {currentStep > 1 && (
                  <button 
                    className="premium-btn-secondary"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    <span>Back</span>
                  </button>
                )}
                {currentStep === 1 && (
                  <button 
                    className="premium-btn-secondary"
                    onClick={() => setShowTicketModal(false)}
                  >
                    <span>Maybe Later</span>
                  </button>
                )}
                <button 
                  className={`premium-btn-primary ${getTotalTickets() === 0 && currentStep === 1 ? 'disabled' : ''}`}
                  disabled={getTotalTickets() === 0 && currentStep === 1}
                  onClick={() => {
                    if (currentStep === 1 && getTotalTickets() > 0) {
                      setCurrentStep(2);
                    } else if (currentStep === 2) {
                      setCurrentStep(3);
                    } else if (currentStep === 3) {
                      alert(`Payment successful! ${getTotalTickets()} tickets for $${getTotalPrice()}`);
                      setShowTicketModal(false);
                      setCurrentStep(1);
                      // Reset quantities
                      Object.keys(ticketQuantities).forEach(type => handleTicketQuantityChange(type, 0));
                    }
                  }}
                >
                  <span>
                    {currentStep === 1 && getTotalTickets() === 0 ? 'Select Tickets' : 
                     currentStep === 1 ? 'Continue to Review' : 
                     currentStep === 2 ? 'Continue to Payment' : 
                     'Complete Purchase'}
                  </span>
                  {getTotalTickets() > 0 && (
                    <svg className="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
