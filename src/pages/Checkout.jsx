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
  const [paymentStep, setPaymentStep] = useState('review'); // review, processing, success, error

  useEffect(() => {
    // Check if user is authenticated
    if (!api.isAuthenticated()) {
      navigate('/login?redirect=/checkout');
      return;
    }

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

  const generateIdempotencyKey = () => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setError('');
    setPaymentStep('processing');

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
        // In a real implementation, you would use Stripe.js here
        // For now, we'll show a success message
        setPaymentStep('success');
        
        // Clear any pending cart
        localStorage.removeItem('pendingCart');
      } else {
        throw new Error(response?.error?.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setPaymentStep('error');
    } finally {
      setLoading(false);
    }
  };

  const renderReview = () => (
    <div className="checkout-review">
      <h2>Order Review</h2>
      
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
          onClick={handleCheckout}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </div>

      <div className="payment-info">
        <p>🔒 Secure payment powered by Stripe</p>
        <p>You will receive your tickets via email after purchase.</p>
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
