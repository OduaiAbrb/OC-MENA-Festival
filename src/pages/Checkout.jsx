import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import TornPaperWrapper from '../components/TornPaperWrapper';
import api from '../services/api';
import './Checkout.css';

const stripePromise = loadStripe('pk_test_51StHLMFbFWcxHNhaMkmL0iboXG9x1VxpgQOFQkDyjUdiIo0nEuxYHqOwLx907GnuOgBXQLxDIljrlZQI5wXQx3PJ00Pc5pI3Tn');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
      // Try localStorage - check both 'cart' and 'pendingCart' keys
      const cartData = localStorage.getItem('cart') || localStorage.getItem('pendingCart');
      console.log('Cart from localStorage:', cartData);
      if (cartData) {
        try {
          const cart = JSON.parse(cartData);
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

    // Validate Stripe card element if paying by card
    if (selectedPaymentMethod === 'card') {
      if (!stripe || !elements) {
        setError('Stripe is not loaded yet. Please wait.');
        return;
      }
      
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card information is required');
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
      // Process all items (tickets and vendor booths) through the same flow
      // Map cart items to ticket purchase format
      const ticketItems = [];
      
      for (const item of cartItems) {
        if (item.type === 'amphitheater') {
          // Amphitheater tickets - add directly with amphitheater-specific data
          ticketItems.push({
            type: 'amphitheater',
            section: item.section,
            quantity: item.quantity,
            price: item.price,
            metadata: {
              section_name: item.section,
              includes_festival_access: item.includesFestival || true,
              ticket_name: item.name
            }
          });
        } else if (item.type === 'vendor-booth') {
          // Convert vendor booth to ticket type ID based on booth type and days
          const boothDetails = item.boothDetails || {};
          const days = boothDetails.days || '3days';
          const boothType = item.ticket_type_id || '';
          
          // Determine if this is a food vendor
          const isFood = boothType.includes('food-truck') || boothType.includes('food-booth') || boothType.includes('food');
          
          // Map to vendor booth ticket type slug
          let slug;
          if (boothType.includes('food-truck')) {
            slug = days === '3days' ? 'food-truck-3day' : 'food-truck-2day';
          } else if (boothType.includes('food-booth') || boothType.includes('food')) {
            slug = days === '3days' ? 'food-booth-3day' : 'food-booth-2day';
          } else {
            slug = days === '3days' ? 'bazaar-3day' : 'bazaar-2day';
          }
          
          // Fetch the actual ticket type UUID from backend
          try {
            const ticketTypesResponse = await api.getTicketTypes();
            if (ticketTypesResponse.success) {
              const vendorTicketType = ticketTypesResponse.data.find(t => t.slug === slug);
              if (vendorTicketType) {
                ticketItems.push({
                  ticket_type_id: vendorTicketType.id,
                  quantity: item.quantity || 1,
                  metadata: {
                    booth_name: boothDetails.formData?.boothName || '',
                    legal_business_name: boothDetails.formData?.legalName || '',
                    contact_email: boothDetails.formData?.email || formData.email,
                    phone_number: boothDetails.formData?.phone || formData.phone,
                    business_type: isFood ? 'food' : 'bazaar',
                    upgrade_selected: boothDetails.upgrade || false,
                    halal_certified: boothDetails.halal || false
                  }
                });
              }
            }
          } catch (err) {
            console.error('Error fetching vendor ticket types:', err);
          }
        } else if (item.ticket_type_id && item.ticket_type_id.length > 10) {
          // Regular ticket with valid UUID
          ticketItems.push({
            ticket_type_id: item.ticket_type_id || item.id,
            quantity: item.quantity
          });
        }
      }

      if (ticketItems.length === 0) {
        setError('No valid tickets in cart. Please add tickets before checking out.');
        setLoading(false);
        return;
      }

      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const intentResponse = await api.createPaymentIntent(ticketItems, idempotencyKey, selectedPaymentMethod);

      if (!intentResponse?.success) {
        throw new Error(intentResponse?.error?.message || 'Failed to create payment intent');
      }

      const orderId = intentResponse.data.order_id;
      const paymentIntentId = intentResponse.data.payment_intent_id;
      const clientSecret = intentResponse.data.client_secret;

      // If paying by card, confirm with Stripe
      if (selectedPaymentMethod === 'card' && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.streetAddress,
                line2: formData.apartment,
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                country: 'US'
              }
            }
          }
        });

        if (stripeError) {
          throw new Error(stripeError.message || 'Payment failed');
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error('Payment was not successful');
        }
      }

      const confirmResponse = await api.confirmPayment(orderId, paymentIntentId);

      if (!confirmResponse?.success) {
        throw new Error(confirmResponse?.error?.message || 'Payment failed');
      }

      // Clear all cart data from localStorage
      localStorage.removeItem('pendingCart');
      localStorage.removeItem('cart');
      
      // Dispatch cart update event to update cart count in header
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: [] }));
      
      // Show success message
      setSuccessMessage(`Payment successful! Order #${confirmResponse.data.order_number || orderId} confirmed.`);
      setCartItems([]);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
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
                    <div className="card-accordion">
                      <div className="card-accordion-item">
                        <div className="card-accordion-content">
                          <div style={{ padding: '10px', background: '#fff', borderRadius: '4px' }}>
                            <CardElement options={{
                              style: {
                                base: {
                                  fontSize: '16px',
                                  color: '#424770',
                                  '::placeholder': {
                                    color: '#aab7c4',
                                  },
                                },
                                invalid: {
                                  color: '#9e2146',
                                },
                              },
                            }} />
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

                {successMessage && (
                  <div style={{ 
                    color: '#155724', 
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    background: '#d4edda', 
                    borderRadius: '4px',
                    border: '1px solid #c3e6cb',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    ✓ {successMessage}
                  </div>
                )}

                <button 
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading || successMessage}
                >
                  {loading ? 'Processing...' : successMessage ? 'Redirecting...' : 'Place order'}
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

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
