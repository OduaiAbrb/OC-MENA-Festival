import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import TornPaperWrapper from '../components/TornPaperWrapper';
import api from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
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

  useEffect(() => {
    console.log('Checkout loaded, location state:', location.state);
    
    if (!api.isAuthenticated()) {
      localStorage.setItem('pendingCart', JSON.stringify(location.state || {}));
      navigate('/login?redirect=/checkout');
      return;
    }

    // Try to get cart from location state first
    if (location.state?.items && location.state.items.length > 0) {
      console.log('Setting cart from location state:', location.state.items);
      setCartItems(location.state.items);
    } else {
      // Try localStorage
      const pendingCart = localStorage.getItem('pendingCart');
      console.log('Pending cart from localStorage:', pendingCart);
      if (pendingCart) {
        try {
          const cart = JSON.parse(pendingCart);
          if (cart.items && cart.items.length > 0) {
            console.log('Setting cart from localStorage:', cart.items);
            setCartItems(cart.items);
          } else {
            console.log('No items in localStorage cart, redirecting to tickets');
            navigate('/tickets');
            return;
          }
        } catch (e) {
          console.error('Error parsing cart:', e);
          navigate('/tickets');
          return;
        }
      } else {
        console.log('No cart data found, redirecting to tickets');
        navigate('/tickets');
        return;
      }
    }

    const user = api.getUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.full_name?.split(' ')[0] || '',
        lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || ''
      }));
    }
  }, [location, navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handlePlaceOrder = async () => {
    if (loading) return;

    // Validate required fields
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all required fields (marked with *)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate card details if paying by card
    if (selectedPaymentMethod === 'card') {
      if (!cardData.cardNumber || !cardData.expiry || !cardData.cvc) {
        setError('Please enter complete card details');
        return;
      }
      if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
        setError('Please enter a valid card number');
        return;
      }
      if (cardData.cvc.length < 3) {
        setError('Please enter a valid CVC');
        return;
      }
    }

    // Validate cart has items
    if (!cartItems || cartItems.length === 0) {
      setError('Your cart is empty. Please add tickets before checking out.');
      navigate('/tickets');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = cartItems.map(item => ({
        ticket_type_id: item.id,
        quantity: item.quantity
      }));

      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const intentResponse = await api.createPaymentIntent(items, idempotencyKey);

      if (!intentResponse?.success) {
        throw new Error(intentResponse?.error?.message || 'Failed to create payment intent');
      }

      const orderId = intentResponse.data.order_id;
      const paymentIntentId = intentResponse.data.payment_intent_id;

      const confirmResponse = await api.confirmPayment(orderId, paymentIntentId);

      if (!confirmResponse?.success) {
        throw new Error(confirmResponse?.error?.message || 'Payment failed');
      }

      localStorage.removeItem('pendingCart');
      
      // Navigate to success page with order details
      navigate('/order-success', { 
        state: { 
          order: {
            order_number: confirmResponse.data?.order_number || orderId,
            total: calculateTotal().toFixed(2),
            payment_method: selectedPaymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery',
            items: cartItems
          }
        } 
      });
    } catch (err) {
      console.error('Order error:', err);
      setError(err.message || 'Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
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
                  {cartItems.map((item, index) => (
                    <div key={index} className="order-row">
                      <span>{item.name} <strong>× {item.quantity}</strong></span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="order-row">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="order-row">
                    <span>Shipping</span>
                    <span>Free shipping</span>
                  </div>
                  <div className="order-row order-total">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
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
                                name="cardNumber"
                                value={cardData.cardNumber}
                                onChange={handleCardInputChange}
                                placeholder="4242 4242 4242 4242"
                                className="card-input"
                              />
                            </div>
                            <div className="card-field">
                              <label>Expiration date</label>
                              <input
                                type="text"
                                name="expiry"
                                value={cardData.expiry}
                                onChange={handleCardInputChange}
                                placeholder="MM / YY"
                                className="card-input"
                              />
                            </div>
                            <div className="card-field">
                              <label>Security code</label>
                              <input
                                type="text"
                                name="cvc"
                                value={cardData.cvc}
                                onChange={handleCardInputChange}
                                placeholder="123"
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

                {error && (
                  <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#fee', borderRadius: '4px' }}>
                    {error}
                  </div>
                )}

                <button 
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place order'}
                </button>
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
