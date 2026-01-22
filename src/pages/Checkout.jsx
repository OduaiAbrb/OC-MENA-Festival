import React, { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Checkout.css';

const Checkout = () => {
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: 'United States (US)',
    streetAddress: '',
    apartment: '',
    city: '',
    state: 'California',
    zipCode: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <div className="checkout-page">
            {/* Coupon Section */}
            <div className="coupon-section">
              <div className="coupon-row">
                <span className="coupon-text">Have a coupon?</span>
                <button 
                  className="coupon-link"
                  onClick={() => setShowCouponInput(!showCouponInput)}
                >
                  Click here to enter your code
                </button>
              </div>
              {showCouponInput && (
                <div className="coupon-input-row">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="coupon-input"
                  />
                  <button className="apply-coupon-btn">Apply coupon</button>
                </div>
              )}
            </div>

            {/* Express Payment Bar */}
            <div className="express-payment">
              <div className="express-left">
                <div className="express-card">
                  <span className="gpay-icon">G Pay</span>
                  <span className="visa-icon">VISA</span>
                  <span className="card-number">•••• 2715</span>
                </div>
              </div>
              <div className="express-right">
                <button className="pay-link-btn">
                  Pay with <span className="link-icon">⊙</span> link
                </button>
              </div>
            </div>

            {/* OR Divider */}
            <div className="or-divider">
              <span>— OR —</span>
            </div>

            {/* Main Checkout Content */}
            <div className="checkout-content">
              {/* Left Column - Billing Details */}
              <div className="checkout-left">
                <h2 className="section-title">Billing details</h2>
                
                <form className="billing-form">
                  <div className="form-group">
                    <label>Email address <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>First name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last name <span className="required">*</span></label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Country / Region <span className="required">*</span></label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      <option>United States (US)</option>
                      <option>Canada</option>
                      <option>Mexico</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Street address <span className="required">*</span></label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      placeholder="House number and street name"
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, unit, etc. (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Town / City <span className="required">*</span></label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>State <span className="required">*</span></label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    >
                      <option>California</option>
                      <option>Texas</option>
                      <option>Florida</option>
                      <option>New York</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ZIP Code <span className="required">*</span></label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>

              {/* Right Column - Your Order */}
              <div className="checkout-right">
                <h2 className="section-title">Your order</h2>
                
                <div className="order-table">
                  <div className="order-header">
                    <span>Product</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="order-row">
                    <span>10×10 Food Truck - Fri-Sun (3 days) <strong>× 1</strong></span>
                    <span>$3,000.00</span>
                  </div>
                  <div className="order-row">
                    <span>Subtotal</span>
                    <span>$3,000.00</span>
                  </div>
                  <div className="order-row">
                    <span>Shipping</span>
                    <span>Free shipping</span>
                  </div>
                  <div className="order-row order-total">
                    <span>Total</span>
                    <span>$3,000.00</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="payment-methods">
                  <div className="payment-option">
                    <input
                      type="radio"
                      id="cash-delivery"
                      name="payment-method"
                      value="cash"
                      checked={selectedPaymentMethod === 'cash'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="cash-delivery">Cash on delivery</label>
                  </div>

                  {selectedPaymentMethod === 'cash' && (
                    <div className="payment-info-box">
                      <div className="info-arrow"></div>
                      <p>Pay with cash upon delivery.</p>
                    </div>
                  )}

                  <div className="payment-option">
                    <input
                      type="radio"
                      id="stripe"
                      name="payment-method"
                      value="card"
                      checked={selectedPaymentMethod === 'card'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="stripe">Stripe</label>
                  </div>

                  {selectedPaymentMethod === 'card' && (
                    <div className="stripe-test-info">
                      <div className="info-arrow"></div>
                      <p>Test mode: use the test VISA card 4242424242424242 with any expiry date and CVC. Other payment methods may redirect to a Stripe test page to authorize payment. More test card numbers are listed here.</p>
                    </div>
                  )}

                  {selectedPaymentMethod === 'card' && (
                    <div className="card-accordion">
                      <div className="card-accordion-item">
                        <div className="card-accordion-header">
                          <div className="card-icon">💳</div>
                          <span>Card</span>
                        </div>
                        <div className="card-accordion-content">
                          <div className="card-form-grid">
                            <div className="card-field">
                              <label>Card number</label>
                              <input
                                type="text"
                                placeholder="1234 1234 1234 1234"
                                className="card-input"
                              />
                            </div>
                            <div className="card-field">
                              <label>Expiration date</label>
                              <input
                                type="text"
                                placeholder="MM / YY"
                                className="card-input"
                              />
                            </div>
                            <div className="card-field">
                              <label>Security code</label>
                              <input
                                type="text"
                                placeholder="CVC"
                                className="card-input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="privacy-notice">
                  <p>Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.</p>
                </div>

                <button className="place-order-btn">Place order</button>
              </div>
            </div>
          </div>
        </TornPaperWrapper>

        <div className="lanterns-container">
          <img src="/lanterns.png" alt="Festival Lanterns" className="lanterns-image" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
