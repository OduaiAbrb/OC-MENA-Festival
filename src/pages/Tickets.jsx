import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [amphitheaterVisible, setAmphitheaterVisible] = useState(true);
  
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
    // Fetch config to check amphitheater visibility
    const fetchConfig = async () => {
      try {
        const response = await api.getPublicConfig();
        if (response?.success && response.data) {
          setAmphitheaterVisible(response.data.amphitheater_visible !== false);
        }
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    // Fetch real tickets from backend
    const fetchTickets = async () => {
      try {
        const response = await api.getTicketTypes();
        if (response?.success && response.data?.length > 0) {
          // Filter out vendor booth and amphitheater tickets - only show customer festival tickets
          const customerTickets = response.data.filter(ticket => {
            const name = ticket.name.toLowerCase();
            return !name.includes('vendor') && 
                   !name.includes('booth') && 
                   !name.includes('bazaar') && 
                   !name.includes('food truck') &&
                   !name.includes('food booth') &&
                   !name.includes('amphitheater') &&
                   !name.includes('pacific') &&
                   !name.includes('concert');
          });
          
          // Map backend tickets to our format
          const mappedTickets = customerTickets.map(ticket => ({
            id: ticket.id, // This is the UUID
            name: ticket.name,
            slug: ticket.slug,
            description: ticket.name.includes('3') ? 'Come enjoy the festival for three days' : ticket.name.includes('2') ? 'Come enjoy the festival for two days' : 'Come enjoy the festival for a single day',
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

  // Handle card click to select ticket
  const handleCardClick = (ticketId) => {
    // Reset all quantities to 0
    const newQuantities = {};
    displayTickets.forEach(ticket => {
      newQuantities[ticket.id] = 0;
    });
    // Set clicked ticket to 1
    newQuantities[ticketId] = 1;
    setQuantities(newQuantities);
  };

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

          <div className="tickets-header-section">
            <div className="option-1-badge">Option 1</div>
            <h2 className="card-title" style={{ textAlign: 'left' }}>Festival tickets</h2>
          </div>
          
          <div className="tickets-container">
            {displayTickets.map(ticket => (
              <div key={ticket.id} className={`ticket-card ${quantities[ticket.id] > 0 ? 'selected' : ''}`} onClick={() => handleCardClick(ticket.id)} style={{ cursor: 'pointer' }}>
                {quantities[ticket.id] > 0 && (
                  <div className="ticket-checkmark">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
                <div className="ticket-header">
                  <div className="ticket-pass-label">{ticket.name}</div>
                  <span className="ticket-savings">{ticket.savings}</span>
                </div>
                
                <p className="ticket-description">{ticket.description}</p>

                <div className="ticket-quantity-section" onClick={(e) => e.stopPropagation()}>
                  <div className="ticket-quantity">
                    <div className="quantity-label">How many tickets?</div>
                    <div className="quantity-controls">
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
                </div>

                <div className="ticket-pricing">
                  <span className="ticket-price">${getTotalTickets() > 0 && quantities[ticket.id] > 0 ? (ticket.price * quantities[ticket.id]) : ticket.price}</span>
                </div>
              </div>
            ))}
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
                Add tickets to cart
              </button>
            </div>
          )}

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
            <p>*Rides at the festival range from $2-10/person. *No access to Amphitheater</p>
          </div>

          {/* Amphitheater Tickets Section - Controlled by CMS toggle */}
          {amphitheaterVisible && (
            <div className="amphitheater-ticket-section">
              <div className="amphitheater-header-section">
                <div className="option-2-badge">Option 2</div>
                <h2 className="amphitheater-title">Amphitheater Ticket 🎤</h2>
              </div>
              
              <div className="amphitheater-card">
                <div className="amphitheater-image">
                  <img src="/stadium.png" alt="Amphitheater Venue" />
                </div>
                <div className="amphitheater-content">
                  <h3 className="amphitheater-card-title">Unique Music Venue Experience</h3>
                  <p className="amphitheater-description">
                    Amphitheater tickets are a premium, separately ticketed concert experience at the Pacific Amphitheatre with reserved seating. To view seating options, click on Explore Amphitheater Tickets below.
                  </p>
                  <div className="amphitheater-notice">
                    <span className="notice-icon">i</span>
                    <span className="notice-text">
                      Each Amphitheater ticket includes admission to the OC MENA Festival for the same day as the performance. Guests do not need to purchase a separate festival ticket for that day.
                    </span>
                  </div>
                  <Link to="/amphitheater-tickets" className="amphitheater-btn">
                    Explore Amphitheater Tickets
                  </Link>
                </div>
              </div>
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
