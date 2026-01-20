import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import EventSchedule from './pages/EventSchedule';
import Vendors from './pages/Vendors';
import Sponsors from './pages/Sponsors';
import Contact from './pages/Contact';
import GlobalTicketModal from './components/GlobalTicketModal';
import './App.css';

// Component to handle scroll to top on route changes
const RouteChangeHandler = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

// Wrapper component to manage modal state
const AppWithModal = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [ticketQuantities, setTicketQuantities] = useState({
    '3day': 0,
    '2day': 0,
    '1day': 0
  });

  const handleTicketQuantityChange = (type, value) => {
    console.log('handleTicketQuantityChange called with:', type, value);
    const newValue = Math.max(0, parseInt(value) || 0);
    console.log('Setting new value:', newValue);
    setTicketQuantities(prev => ({
      ...prev,
      [type]: newValue
    }));
  };

  const getTotalPrice = () => {
    const prices = {
      '3day': 35,
      '2day': 25,
      '1day': 15
    };
    return Object.keys(ticketQuantities).reduce((total, type) => {
      return total + (ticketQuantities[type] * prices[type]);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(ticketQuantities).reduce((total, qty) => total + qty, 0);
  };

  return (
    <Router>
      <RouteChangeHandler />
      <Routes>
        <Route path="/" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <HomePage 
                showTicketModal={showTicketModal}
                setShowTicketModal={setShowTicketModal}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                ticketQuantities={ticketQuantities}
                handleTicketQuantityChange={handleTicketQuantityChange}
                getTotalPrice={getTotalPrice}
                getTotalTickets={getTotalTickets}
              />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/login" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <LoginPage />
              {/* Premium Ticket Modal */}
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
                            const current = ticketQuantities['3day'];
                            if (current < 10) handleTicketQuantityChange('3day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                            const current = ticketQuantities['2day'];
                            if (current < 10) handleTicketQuantityChange('2day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                            const current = ticketQuantities['1day'];
                            if (current < 10) handleTicketQuantityChange('1day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
            </main>
            <Footer />
          </div>
        } />
        <Route path="/signup" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <SignupPage />
              {/* Premium Ticket Modal */}
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
                    
                    {/* Step Content - Simplified for other pages */}
                    {currentStep === 1 && (
                      <div className="premium-ticket-selection">
                        <div className="premium-ticket-grid">
                          {/* 3-Day Pass - Premium */}
                          <div className="premium-ticket-card featured" data-ticket-type="3day" onClick={(e) => {
                            const current = ticketQuantities['3day'];
                            if (current < 10) handleTicketQuantityChange('3day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                            const current = ticketQuantities['2day'];
                            if (current < 10) handleTicketQuantityChange('2day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                            const current = ticketQuantities['1day'];
                            if (current < 10) handleTicketQuantityChange('1day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                        <button 
                          className="premium-btn-secondary"
                          onClick={() => setShowTicketModal(false)}
                        >
                          <span>Maybe Later</span>
                        </button>
                        <button 
                          className={`premium-btn-primary ${getTotalTickets() === 0 ? 'disabled' : ''}`}
                          disabled={getTotalTickets() === 0}
                          onClick={() => {
                            if (getTotalTickets() > 0) {
                              alert(`Payment successful! ${getTotalTickets()} tickets for $${getTotalPrice()}`);
                              setShowTicketModal(false);
                              setCurrentStep(1);
                              // Reset quantities
                              Object.keys(ticketQuantities).forEach(type => handleTicketQuantityChange(type, 0));
                            }
                          }}
                        >
                          <span>
                            {getTotalTickets() === 0 ? 'Select Tickets' : 'Complete Purchase'}
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
            </main>
            <Footer />
          </div>
        } />
        <Route path="/dashboard" element={
          <div className="app">
            <Dashboard />
            <Footer />
          </div>
        } />
        <Route path="/event-schedule" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <EventSchedule />
              {/* Premium Ticket Modal */}
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
                    
                    {/* Step Content - Simplified for other pages */}
                    {currentStep === 1 && (
                      <div className="premium-ticket-selection">
                        <div className="premium-ticket-grid">
                          {/* 3-Day Pass - Premium */}
                          <div className="premium-ticket-card featured" data-ticket-type="3day" onClick={(e) => {
                            const current = ticketQuantities['3day'];
                            if (current < 10) handleTicketQuantityChange('3day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                            const current = ticketQuantities['2day'];
                            if (current < 10) handleTicketQuantityChange('2day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                            const current = ticketQuantities['1day'];
                            if (current < 10) handleTicketQuantityChange('1day', current + 1);
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                        <button 
                          className="premium-btn-secondary"
                          onClick={() => setShowTicketModal(false)}
                        >
                          <span>Maybe Later</span>
                        </button>
                        <button 
                          className={`premium-btn-primary ${getTotalTickets() === 0 ? 'disabled' : ''}`}
                          disabled={getTotalTickets() === 0}
                          onClick={() => {
                            if (getTotalTickets() > 0) {
                              alert(`Payment successful! ${getTotalTickets()} tickets for $${getTotalPrice()}`);
                              setShowTicketModal(false);
                              setCurrentStep(1);
                              // Reset quantities
                              Object.keys(ticketQuantities).forEach(type => handleTicketQuantityChange(type, 0));
                            }
                          }}
                        >
                          <span>
                            {getTotalTickets() === 0 ? 'Select Tickets' : 'Complete Purchase'}
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
            </main>
            <Footer />
          </div>
        } />
        <Route path="/vendors" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <Vendors />
              <GlobalTicketModal 
                showTicketModal={showTicketModal}
                setShowTicketModal={setShowTicketModal}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                ticketQuantities={ticketQuantities}
                handleTicketQuantityChange={handleTicketQuantityChange}
                getTotalPrice={getTotalPrice}
                getTotalTickets={getTotalTickets}
              />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/sponsors" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <Sponsors />
              <GlobalTicketModal 
                showTicketModal={showTicketModal}
                setShowTicketModal={setShowTicketModal}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                ticketQuantities={ticketQuantities}
                handleTicketQuantityChange={handleTicketQuantityChange}
                getTotalPrice={getTotalPrice}
                getTotalTickets={getTotalTickets}
              />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/contact" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <Contact />
              <GlobalTicketModal 
                showTicketModal={showTicketModal}
                setShowTicketModal={setShowTicketModal}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                ticketQuantities={ticketQuantities}
                handleTicketQuantityChange={handleTicketQuantityChange}
                getTotalPrice={getTotalPrice}
                getTotalTickets={getTotalTickets}
              />
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return <AppWithModal />;
}

export default App;
