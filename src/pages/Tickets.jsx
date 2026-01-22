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
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [error, setError] = useState(''); // eslint-disable-line no-unused-vars
  const [salesMessage, setSalesMessage] = useState('');
  const [hasRealTickets, setHasRealTickets] = useState(false);

  // Fallback ticket options if API fails or sales not open
  const fallbackTicketOptions = [
    {
      id: '3day',
      name: '3-Day Pass',
      slug: '3day',
      savings: 'Save $10 on entry',
      price_cents: 3500,
      badge_text: 'BEST VALUE'
    },
    {
      id: '2day',
      name: '2-Day Pass',
      slug: '2day',
      savings: 'Save $5 on entry',
      price_cents: 2500,
      badge_text: 'POPULAR'
    },
    {
      id: '1day',
      name: '1-Day Pass',
      slug: '1day',
      savings: 'STANDARD',
      price_cents: 1500,
      badge_text: 'STANDARD'
    }
  ];

  useEffect(() => {
    fetchTicketTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTicketTypes = async () => {
    try {
      // Try to fetch from API first
      const response = await api.getTicketTypes();
      
      if (response?.success && response.data?.length > 0) {
        setTicketTypes(response.data);
        // Initialize quantities for each ticket type with STRING IDs
        const apiQuantities = {};
        response.data.forEach(ticket => {
          apiQuantities[String(ticket.id)] = 0;
        });
        setTicketQuantities(apiQuantities);
        setHasRealTickets(true);
        console.log('Loaded real tickets from API:', response.data.length, apiQuantities);
      } else {
        // Use fallback if no tickets or sales not open
        console.log('Using fallback tickets, API response:', response);
        setTicketTypes(fallbackTicketOptions);
        const initialQuantities = {};
        fallbackTicketOptions.forEach(ticket => {
          initialQuantities[String(ticket.id)] = 0;
        });
        setTicketQuantities(initialQuantities);
        setSalesMessage(response?.message || 'Ticket sales are currently unavailable.');
        setHasRealTickets(false);
      }
    } catch (err) {
      console.error('Failed to fetch ticket types:', err);
      // Use fallback on error
      setTicketTypes(fallbackTicketOptions);
      const initialQuantities = {};
      fallbackTicketOptions.forEach(ticket => {
        initialQuantities[String(ticket.id)] = 0;
      });
      setTicketQuantities(initialQuantities);
      setError('Unable to connect to ticket system. Showing preview tickets.');
      setHasRealTickets(false);
    } finally {
      setLoading(false);
    }
  };

  // Memoize ticket options to prevent re-renders
  const ticketOptions = React.useMemo(() => {
    return ticketTypes.map(ticket => ({
      id: String(ticket.id), // Ensure ID is string for consistent key matching
      name: ticket.name,
      savings: ticket.badge_text || ticket.savings || (ticket.price_cents >= 3500 ? 'Save $10 on entry' : ticket.price_cents >= 2500 ? 'Save $5 on entry' : 'STANDARD'),
      price: ticket.price_cents / 100,
      originalPrice: ticket.price_cents / 100,
      slug: ticket.slug
    }));
  }, [ticketTypes]);

  const handleQuantityChange = (ticketId, change) => {
    const id = String(ticketId); // Ensure consistent string ID
    setTicketQuantities(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + change);
      const updated = {
        ...prev,
        [id]: newQty
      };
      console.log('Cart updated:', id, 'from', currentQty, 'to', newQty, updated);
      return updated;
    });
  };

  const getTotalPrice = () => {
    let total = 0;
    ticketOptions.forEach(ticket => {
      const qty = ticketQuantities[ticket.id] || 0;
      total += qty * ticket.price;
    });
    return total;
  };

  const getTotalTickets = () => {
    let total = 0;
    Object.values(ticketQuantities).forEach(qty => {
      total += (qty || 0);
    });
    return total;
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
                  <span className={`ticket-original-price ${ticket.originalPrice > ticket.price ? '' : 'no-saving-price'}`}>
                    {ticket.originalPrice > ticket.price ? `$${ticket.originalPrice}` : 'No saving'}
                  </span>
                </div>

                <div className="ticket-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(ticket.id, -1)}
                    disabled={!ticketQuantities[ticket.id] || ticketQuantities[ticket.id] === 0}
                  >
                    -
                  </button>
                  <span className="quantity-display">{ticketQuantities[ticket.id] || 0}</span>
                 
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(ticket.id, 1)}
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
                className="checkout-btn"
                onClick={() => {
                  if (!hasRealTickets) {
                    setError('Unable to process checkout. Please refresh the page and try again.');
                    return;
                  }
                  if (!api.isAuthenticated()) {
                    // Save cart to localStorage and redirect to login
                    localStorage.setItem('pendingCart', JSON.stringify({
                      items: ticketOptions
                        .filter(t => ticketQuantities[t.id] > 0)
                        .map(t => ({ 
                          id: t.id,
                          ticket_type_id: t.id, 
                          name: t.name,
                          quantity: ticketQuantities[t.id],
                          price: t.price
                        })),
                      total: getTotalPrice()
                    }));
                    navigate('/login?redirect=/checkout');
                  } else {
                    // Navigate to checkout with cart data
                    const cartItems = ticketOptions
                      .filter(t => ticketQuantities[t.id] > 0)
                      .map(t => ({ 
                        id: t.id,
                        ticket_type_id: t.id, 
                        name: t.name,
                        quantity: ticketQuantities[t.id],
                        price: t.price
                      }));
                    
                    console.log('Navigating to checkout with items:', cartItems);
                    
                    // Save to localStorage as backup
                    localStorage.setItem('pendingCart', JSON.stringify({
                      items: cartItems,
                      total: getTotalPrice()
                    }));
                    
                    navigate('/checkout', { 
                      state: { 
                        items: cartItems,
                        total: getTotalPrice()
                      }
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
