import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Tickets.css';

const Tickets = () => {
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [error, setError] = useState(''); // eslint-disable-line no-unused-vars
  const [salesMessage, setSalesMessage] = useState('');
  
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
      description: 'Come enjoy the festival for three days',
      savings: 'BEST VALUE',
      price: 35
    },
    {
      id: '2day',
      name: '2-Day Pass',
      slug: '2day',
      description: 'Come enjoy the festival for two days',
      savings: 'POPULAR',
      price: 25
    },
    {
      id: '1day',
      name: '1-Day Pass',
      slug: '1day',
      description: 'Come enjoy the festival for a single day',
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
          // Backend tickets available
        } else {
          setSalesMessage(response?.message || '');
        }
      } catch (err) {
        console.log('Using fallback tickets');
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
          
          <div className="tickets-container">
            {ticketOptions.map(ticket => (
              <div key={ticket.id} className={`ticket-card ${quantities[ticket.id] > 0 ? 'selected' : ''}`}>
                <div className="ticket-header">
                  <h3 className="ticket-name">{ticket.name}</h3>
                  <span className="ticket-savings">{ticket.savings}</span>
                </div>
                
                <p className="ticket-description">{ticket.description}</p>

                <div className="ticket-quantity-section">
                  <label className="quantity-label">How many tickets?</label>
                  <div className="ticket-quantity">
                    <button 
                      type="button"
                      className="quantity-btn"
                      onClick={() => decrement(ticket.id)}
                      disabled={quantities[ticket.id] === 0}
                    >
                      −
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
                </div>

                <div className="ticket-pricing">
                  <span className="ticket-price">${getTotalTickets() > 0 && quantities[ticket.id] > 0 ? (ticket.price * quantities[ticket.id]) : ticket.price}</span>
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

          <div className="parking-notice">
            <p>*Parking is $12, paid directly to the OC Fairgrounds on site. Carpooling is encouraged.</p>
          </div>

          {getTotalTickets() > 0 && (
            <div className="ticket-summary">
              <div className="summary-row total">
                <span>Subtotal:</span>
                <span>${getTotalPrice()}</span>
              </div>
              <button 
                type="button"
                className="add-to-cart-btn"
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
                  localStorage.setItem('cart', JSON.stringify({
                    items: cartItems,
                    total: getTotalPrice()
                  }));
                  
                  // Dispatch custom event to update cart and open sidebar
                  window.dispatchEvent(new CustomEvent('cartUpdated', { 
                    detail: { items: cartItems, total: getTotalPrice() } 
                  }));
                  
                  // Dispatch event to open cart sidebar
                  window.dispatchEvent(new CustomEvent('openCart'));
                }}
              >
                Add to cart
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
