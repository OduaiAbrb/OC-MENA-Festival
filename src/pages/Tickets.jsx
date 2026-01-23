import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Tickets.css';

const Tickets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [error, setError] = useState(''); // eslint-disable-line no-unused-vars
  const [salesMessage, setSalesMessage] = useState('');
  const [hasRealTickets, setHasRealTickets] = useState(false);
  
  // Simple cart state with initial values
  const [quantities, setQuantities] = useState({
    '3day': 0,
    '2day': 0,
    '1day': 0
  });

  // Static ticket options - always available
  const ticketOptions = [
    {
      id: '3day',
      name: '3-Day Pass',
      slug: '3day',
      savings: 'BEST VALUE',
      price: 35
    },
    {
      id: '2day',
      name: '2-Day Pass',
      slug: '2day',
      savings: 'POPULAR',
      price: 25
    },
    {
      id: '1day',
      name: '1-Day Pass',
      slug: '1day',
      savings: 'STANDARD',
      price: 15
    }
  ];

  useEffect(() => {
    // Check if backend has real tickets
    const checkTickets = async () => {
      try {
        const response = await api.getTicketTypes();
        if (response?.success && response.data?.length > 0) {
          setHasRealTickets(true);
        } else {
          setSalesMessage(response?.message || '');
          setHasRealTickets(true); // Still allow checkout with fallback
        }
      } catch (err) {
        console.log('Using fallback tickets');
        setHasRealTickets(true); // Allow checkout with fallback
      } finally {
        setLoading(false);
      }
    };
    checkTickets();
  }, []);

  // Simple increment/decrement handlers
  const increment = (id) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  const getTotalPrice = () => {
    return ticketOptions.reduce((total, ticket) => {
      return total + ((quantities[ticket.id] || 0) * ticket.price);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
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
          <h1 className="card-title">Tickets</h1>
          <p className="card-description">Choose your festival experience</p>
          
          <div className="tickets-container">
            {ticketOptions.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <span className={`ticket-savings ${ticket.savings === 'No saving' ? 'no-saving' : ''}`}>{ticket.savings}</span>
                </div>
                
                <div className="ticket-pricing">
                  <span className="ticket-price">${ticket.price}</span>
                </div>

                <div className="ticket-quantity">
                  <button 
                    type="button"
                    className="quantity-btn"
                    onClick={() => decrement(ticket.id)}
                    disabled={quantities[ticket.id] === 0}
                  >
                    -
                  </button>
                  <div className="quantity-value">{quantities[ticket.id]}</div>
                  <button 
                    type="button"
                    className="quantity-btn"
                    onClick={() => increment(ticket.id)}
                  >
                    +
                  </button>
                </div>

                <div className="ticket-note">
                  <p>*Rides at event range from $2-$10/person</p>
                </div>
              </div>
            ))}
          </div>

          {salesMessage && (
            <div className="sales-message" style={{textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(255,193,7,0.1)', borderRadius: '8px', marginBottom: '1rem'}}>
              <p style={{color: '#856404', margin: 0}}>{salesMessage}</p>
            </div>
          )}

          {error && (
            <div className="error-message" style={{textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(220,53,69,0.1)', borderRadius: '8px', marginBottom: '1rem'}}>
              <p style={{color: '#721c24', margin: 0}}>{error}</p>
            </div>
          )}

          {getTotalTickets() > 0 && (
            <div className="ticket-summary">
              <div className="summary-row">
                <span>Total Tickets:</span>
                <span>{getTotalTickets()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Price:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <button 
                type="button"
                className="checkout-btn"
                onClick={() => {
                  const cartItems = ticketOptions
                    .filter(t => quantities[t.id] > 0)
                    .map(t => ({ 
                      id: t.id,
                      ticket_type_id: t.id, 
                      name: t.name,
                      quantity: quantities[t.id],
                      price: t.price
                    }));
                  
                  // Save to localStorage
                  localStorage.setItem('pendingCart', JSON.stringify({
                    items: cartItems,
                    total: getTotalPrice()
                  }));
                  
                  if (!api.isAuthenticated()) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    navigate('/checkout', { 
                      state: { items: cartItems, total: getTotalPrice() }
                    });
                  }
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </TornPaperWrapper>

        <div className="lanterns-container">
          <img src="/lanterns.png" alt="Festival Lanterns" className="lanterns-image" />
        </div>
      </section>

      <SponsorsSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Tickets;
