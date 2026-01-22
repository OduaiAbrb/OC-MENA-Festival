import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Get order details from navigation state
    if (location.state?.order) {
      setOrderDetails(location.state.order);
    }
  }, [location]);

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="success-section">
        <div className="success-container">
          <div className="success-icon">✓</div>
          
          <h1 className="success-title">Payment Successful!</h1>
          
          <p className="success-message">
            Thank you for your purchase! Your tickets have been confirmed.
          </p>

          {orderDetails && (
            <div className="order-details">
              <h2>Order Details</h2>
              <p><strong>Order Number:</strong> {orderDetails.order_number}</p>
              <p><strong>Total:</strong> ${orderDetails.total}</p>
              <p><strong>Payment Method:</strong> {orderDetails.payment_method}</p>
            </div>
          )}

          <div className="success-info">
            <div className="info-item">
              <span className="info-icon">🎫</span>
              <div>
                <h3>Your Tickets</h3>
                <p>View and download your tickets with QR codes in your dashboard</p>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <h3>Confirmation Email</h3>
                <p>A confirmation email has been sent to your registered email address</p>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <h3>Scan at Entry</h3>
                <p>Show your QR code at the festival entrance for quick check-in</p>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button 
              className="primary-btn"
              onClick={() => navigate('/dashboard')}
            >
              View My Tickets
            </button>
            <button 
              className="secondary-btn"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
