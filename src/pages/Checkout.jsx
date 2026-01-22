import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState('review'); // review, payment, processing, success, error
  const [demoMode, setDemoMode] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Demo card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!api.isAuthenticated()) {
      navigate('/login?redirect=/checkout');
      return;
    }

    // Check if system is in demo mode
    checkDemoMode();

    // Get cart from location state or localStorage
    if (location.state?.items) {
      setCartItems(location.state.items);
      setTotal(location.state.total);
    } else {
      // Try to get from localStorage (for redirect after login)
      const pendingCart = localStorage.getItem('pendingCart');
      if (pendingCart) {
        const cart = JSON.parse(pendingCart);
        setCartItems(cart.items);
        setTotal(cart.total);
        localStorage.removeItem('pendingCart');
      } else {
        // No cart, redirect to tickets
        navigate('/tickets');
      }
    }
  }, [location, navigate]);

  const checkDemoMode = async () => {
    try {
      const response = await api.checkDemoMode();
      if (response?.success) {
        setDemoMode(response.data.demo_mode);
      }
    } catch (err) {
      // Default to demo mode if check fails
      setDemoMode(true);
    }
  };

  const generateIdempotencyKey = () => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    // Format expiry as MM/YY
    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    // Limit CVC to 4 digits
    if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardForm(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleProceedToPayment = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const idempotencyKey = generateIdempotencyKey();
      
      // Format items for API
      const items = cartItems.map(item => ({
        ticket_type_id: item.ticket_type_id,
        quantity: item.quantity
      }));

      // Create payment intent
      const response = await api.createPaymentIntent(items, idempotencyKey);

      if (response?.success) {
        setOrderId(response.data.order_id);
        setOrderNumber(response.data.order_number);
        setPaymentStep('payment');
      } else {
        throw new Error(response?.error?.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // Validate card form
    if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.cvc || !cardForm.name) {
      setError('Please fill in all card details');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStep('processing');

    try {
      // Simulate payment processing delay for realistic demo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm the payment (works for both demo and real mode)
      const response = await api.confirmPayment(orderId);

      if (response?.success) {
        setOrderNumber(response.data.order_number);
        setPaymentStep('success');
        localStorage.removeItem('pendingCart');
      } else {
        throw new Error(response?.error?.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setPaymentStep('error');
    } finally {
      setLoading(false);
    }
  };

  const renderReview = () => (
    <div className="checkout-review">
      <h2>Order Review</h2>
      
      {demoMode && (
        <div className="demo-banner">
          <span className="demo-icon">🎭</span>
          <span>DEMO MODE - No real charges will be made</span>
        </div>
      )}
      
      <div className="cart-items">
        {cartItems.map((item, index) => (
          <div key={index} className="cart-item">
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
            </div>
            <div className="item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="order-total">
        <span>Total:</span>
        <span className="total-amount">${total.toFixed(2)}</span>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="checkout-actions">
        <button 
          className="btn-secondary"
          onClick={() => navigate('/tickets')}
        >
          Back to Tickets
        </button>
        <button 
          className="btn-primary"
          onClick={handleProceedToPayment}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? 'Creating Order...' : 'Continue to Payment'}
        </button>
      </div>

      <div className="payment-info">
        <p>🔒 Secure payment powered by Stripe</p>
        <p>You will receive your tickets via email after purchase.</p>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="checkout-payment">
      <h2>Payment Details</h2>
      
      {demoMode && (
        <div className="demo-banner">
          <span className="demo-icon">🎭</span>
          <div>
            <strong>DEMO MODE</strong>
            <p>Use any test card details. Try: 4242 4242 4242 4242</p>
          </div>
        </div>
      )}

      <div className="order-summary-mini">
        <span>Order #{orderNumber}</span>
        <span className="mini-total">${total.toFixed(2)}</span>
      </div>

      <div className="card-form">
        <div className="form-group">
          <label htmlFor="name">Cardholder Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            value={cardForm.name}
            onChange={handleCardInputChange}
            className="card-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="4242 4242 4242 4242"
            value={cardForm.cardNumber}
            onChange={handleCardInputChange}
            className="card-input"
            maxLength="19"
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="expiry">Expiry Date</label>
            <input
              type="text"
              id="expiry"
              name="expiry"
              placeholder="MM/YY"
              value={cardForm.expiry}
              onChange={handleCardInputChange}
              className="card-input"
              maxLength="5"
            />
          </div>
          <div className="form-group half">
            <label htmlFor="cvc">CVC</label>
            <input
              type="text"
              id="cvc"
              name="cvc"
              placeholder="123"
              value={cardForm.cvc}
              onChange={handleCardInputChange}
              className="card-input"
              maxLength="4"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="checkout-actions">
        <button 
          className="btn-secondary"
          onClick={() => setPaymentStep('review')}
        >
          Back
        </button>
        <button 
          className="btn-primary"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </div>

      <div className="payment-info">
        <p>🔒 Your payment is secure and encrypted</p>
        {demoMode && <p className="demo-note">This is a demonstration - no real payment will be processed</p>}
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="checkout-processing">
      <div className="spinner"></div>
      <h2>Processing your payment...</h2>
      <p>Please don't close this page.</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="checkout-success">
      <div className="success-icon">✓</div>
      <h2>Payment Successful!</h2>
      <p>Thank you for your purchase. Your tickets have been sent to your email.</p>
      <div className="success-actions">
        <button 
          className="btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          View My Tickets
        </button>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="checkout-error">
      <div className="error-icon">✕</div>
      <h2>Payment Failed</h2>
      <p>{error || 'Something went wrong. Please try again.'}</p>
      <div className="error-actions">
        <button 
          className="btn-primary"
          onClick={() => setPaymentStep('review')}
        >
          Try Again
        </button>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/tickets')}
        >
          Back to Tickets
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="checkout-section">
        <div className="checkout-container">
          <h1 className="checkout-title">Checkout</h1>
          
          {paymentStep === 'review' && renderReview()}
          {paymentStep === 'payment' && renderPaymentForm()}
          {paymentStep === 'processing' && renderProcessing()}
          {paymentStep === 'success' && renderSuccess()}
          {paymentStep === 'error' && renderError()}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
