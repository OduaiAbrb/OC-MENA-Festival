import React, { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import './Tickets.css';

const Tickets = () => {
  const [ticketQuantities, setTicketQuantities] = useState({
    '3day': 0,
    '2day': 0,
    '1day': 0
  });

  const ticketOptions = [
    {
      id: '3day',
      name: '3-Day Pass',
      savings: 'Save $10 on entry',
      price: 35,
      originalPrice: 45
    },
    {
      id: '2day',
      name: '2-Day Pass',
      savings: 'Save $5 on entry',
      price: 25,
      originalPrice: 30
    },
    {
      id: '1day',
      name: '1-Day Pass',
      savings: 'No saving',
      price: 15,
      originalPrice: 15
    }
  ];

  const handleQuantityChange = (ticketId, change) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, prev[ticketId] + change)
    }));
  };

  const getTotalPrice = () => {
    return ticketOptions.reduce((total, ticket) => {
      return total + (ticketQuantities[ticket.id] * ticket.price);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(ticketQuantities).reduce((total, qty) => total + qty, 0);
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <div className="torn-paper-card">
          <h1 className="card-title">Tickets</h1>
          <p className="card-description">Choose your festival experience</p>
          
          <div className="tickets-container">
            {ticketOptions.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <h3 className="ticket-name">{ticket.name}</h3>
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
                    disabled={ticketQuantities[ticket.id] === 0}
                  >
                    -
                  </button>
                  <span className="quantity-display">{ticketQuantities[ticket.id]}</span>
                 
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

          {getTotalTickets() > 0 && (
            <div className="ticket-summary">
              <div className="summary-row">
                <span>Total Tickets:</span>
                <span>{getTotalTickets()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Price:</span>
                <span>$115</span>
              </div>
              <button className="checkout-btn">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>

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
