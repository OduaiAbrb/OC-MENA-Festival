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
    '3day': 1,
    '2day': 0,
    '1day': 0
  });

  const [realTickets, setRealTickets] = useState([]);

  // Static ticket options - fallback if backend doesn't have tickets
  const ticketOptions = [
    {
      id: '3day',
      name: '3-Day Pass',
      slug: '3day',
      description: 'Come enjoy the festival for three days',
      savings: 'Save $10 on entry',
      price: 35
    },
    {
      id: '2day',
      name: '2-Day Pass',
      slug: '2day',
      description: 'Come enjoy the festival for two days',
      savings: 'Save $5 on entry',
      price: 25
    },
    {
      id: '1day',
      name: '1-Day Pass',
      slug: '1day',
      description: 'Come enjoy the festival for a single day',
      savings: 'Save $0 on entry',
      price: 15
    }
  ];

  // Use real tickets if available, otherwise use fallback
  const displayTickets = realTickets.length > 0 ? realTickets : ticketOptions;

  useEffect(() => {
    // Fetch real tickets from backend
    const fetchTickets = async () => {
      try {
        const response = await api.getTicketTypes();
        if (response?.success && response.data?.length > 0) {
          // Filter out vendor booth tickets - only show customer tickets
          const customerTickets = response.data.filter(ticket => {
            const name = ticket.name.toLowerCase();
            return !name.includes('vendor') && 
                   !name.includes('booth') && 
                   !name.includes('bazaar') && 
                   !name.includes('food truck') &&
                   !name.includes('food booth');
          });
          
          // Map backend tickets to our format
          const mappedTickets = customerTickets.map(ticket => ({
            id: ticket.id, // This is the UUID
            name: ticket.name,
            slug: ticket.slug,
            description: ticket.description || `${ticket.name} access`,
            savings: ticket.name.includes('3') ? 'Save $10 on entry' : ticket.name.includes('2') ? 'Save $5 on entry' : 'Save $0 on entry',
            price: ticket.price_cents / 100 // Convert cents to dollars
          }));
          setRealTickets(mappedTickets);
          
          // Initialize quantities for real tickets
          const initialQuantities = {};
          mappedTickets.forEach((ticket, index) => {
            initialQuantities[ticket.id] = index === 0 ? 1 : 0;
          });
          setQuantities(initialQuantities);
        } else {
          setSalesMessage(response?.message || '');
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        // Keep using fallback tickets
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Simple increment/decrement handlers
  const increment = (id) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  const getTotalPrice = () => {
    return displayTickets.reduce((total, ticket) => {
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
          <h1 className="page-heading">OC MENA Festival Tickets</h1>
          
          <div className="page-intro">
            <p>Discover the excitement of the OC MENA Festival, a vibrant summer celebration in Orange County inspired by the rich cultures of the Middle East and North Africa. Enjoy three unforgettable days of music, food, carnival rides, cultural showcases, shopping, and family-friendly entertainment.</p>
            <p>Choose from single-day or full-weekend passes to experience everything the festival has to offer.</p>
          </div>

          <h2 className="card-title">Tickets</h2>
          
          <div className="tickets-container">
            {displayTickets.map(ticket => (
              <div key={ticket.id} className={`ticket-card ${quantities[ticket.id] > 0 ? 'selected' : ''}`}>
                {quantities[ticket.id] > 0 && (
                  <div className="ticket-checkmark">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
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
                  const cartItems = displayTickets
                    .filter(t => quantities[t.id] > 0)
                    .map(t => ({ 
                      id: t.id,
                      ticket_type_id: t.id, // This is now a UUID from backend
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
