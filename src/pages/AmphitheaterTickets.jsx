import React, { useState, useCallback, useEffect } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import AmphitheaterSeatingMap from '../components/AmphitheaterSeatingMap';
import api from '../services/api';
import './AmphitheaterTickets.css';

const AmphitheaterTickets = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedDay, setSelectedDay] = useState('saturday'); // Default to single day
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear selected seats when day changes
  useEffect(() => {
    setSelectedSeats([]);
  }, [selectedDay]);

  // Handle seat click - toggle selection
  const handleSeatClick = useCallback((seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) {
        return prev.filter(s => s.id !== seat.id);
      }
      if (prev.length >= ticketQuantity) {
        // Replace oldest selection
        return [...prev.slice(1), seat];
      }
      return [...prev, seat];
    });
  }, [ticketQuantity]);

  // Add to cart - works like bazaar/food/tickets flow with graceful backend fallback
  const handleAddToCart = async () => {
    if (selectedSeats.length === 0) return;
    setIsAddingToCart(true);
    
    // Get event date based on selected day
    const eventDate = selectedDay === 'saturday' ? '2026-08-15' : '2026-08-16';
    const sessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const holdIds = [];
    
    // Try to create backend holds (graceful fallback if backend unavailable)
    try {
      // Group seats by section for backend hold creation
      const sectionGroups = {};
      selectedSeats.forEach(seat => {
        if (!sectionGroups[seat.sectionId]) {
          sectionGroups[seat.sectionId] = [];
        }
        sectionGroups[seat.sectionId].push(seat);
      });

      for (const [sectionId, seats] of Object.entries(sectionGroups)) {
        try {
          const holdResponse = await api.createSeatHold(
            sectionId,
            eventDate,
            seats.length,
            sessionKey
          );
          
          if (holdResponse?.success && holdResponse.data?.hold_id) {
            holdIds.push(holdResponse.data.hold_id);
          }
        } catch (err) {
          console.log('Backend hold unavailable, continuing with local cart');
        }
      }
    } catch (err) {
      console.log('Backend unavailable, using local cart only');
    }
    
    // Build cart item - works even without backend
    const seatsInfo = selectedSeats.map(s => `Row ${s.row}, Seat ${s.number}`).join('; ');
    const baseTotalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const totalPrice = selectedDay === 'both' ? baseTotalPrice * 2 : baseTotalPrice;
    const dayLabel = selectedDay === 'saturday' ? 'Saturday Aug 15' : 
                     selectedDay === 'sunday' ? 'Sunday Aug 16' : 
                     'Both Days (Sat & Sun)';
    
    // For checkout: price = total / quantity (unit price per seat)
    const unitPrice = totalPrice / selectedSeats.length;
    
    const cartItem = {
      id: `amphitheater-${Date.now()}`,
      ticket_type_id: `amphitheater-${selectedDay}`,
      type: 'amphitheater',
      name: `Pacific Amphitheatre - ${dayLabel}`,
      section: [...new Set(selectedSeats.map(s => s.sectionName))].join(', '),
      seats: seatsInfo,
      seatDetails: selectedSeats.map(s => ({
        id: s.id,
        sectionId: s.sectionId,
        section: s.sectionName,
        row: s.row,
        number: s.number,
        price: s.price
      })),
      day: selectedDay,
      eventDate: eventDate,
      quantity: selectedSeats.length,
      price: unitPrice, // Unit price per seat (backend expects this)
      total: totalPrice, // Total for display
      includesFestival: true,
      holdIds: holdIds.length > 0 ? holdIds : null,
      sessionKey: sessionKey,
      expiresAt: holdIds.length > 0 ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : null
    };

    // Add to cart - same pattern as Tickets.jsx and VendorBooths.jsx
    const existingCart = localStorage.getItem('cart');
    let cart = { items: [], total: 0 };
    
    if (existingCart) {
      try {
        cart = JSON.parse(existingCart);
        if (!cart.items) cart.items = [];
      } catch (e) {
        console.error('Error parsing cart:', e);
        cart = { items: [], total: 0 };
      }
    }

    cart.items.push(cartItem);
    cart.total = cart.items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch events - same as other flows
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { items: cart.items, total: cart.total } 
    }));
    window.dispatchEvent(new CustomEvent('openCart'));
    
    setSelectedSeats([]);
    setIsAddingToCart(false);
  };


  // Calculate total
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="page-wrapper amphitheater-page">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <div className="sg-container">
            {/* Header */}
            <div className="sg-header">
              <h1 className="sg-title">Pacific Amphitheatre</h1>
              <p className="sg-subtitle">OC MENA Festival · Costa Mesa, CA · Aug 15-17, 2026</p>
            </div>

            {/* Day Selection Toggle - Including Both Days */}
            <div className="sg-day-selector">
              <span className="sg-day-label">Select Event Day:</span>
              <div className="sg-day-buttons">
                <button 
                  className={`sg-day-btn ${selectedDay === 'saturday' ? 'active' : ''}`}
                  onClick={() => setSelectedDay('saturday')}
                  style={{
                    background: selectedDay === 'saturday' ? '#dc2626' : 'white',
                    color: selectedDay === 'saturday' ? 'white' : '#374151',
                    border: selectedDay === 'saturday' ? '2px solid #dc2626' : '2px solid #d1d5db',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Saturday Aug 15
                </button>
                <button 
                  className={`sg-day-btn ${selectedDay === 'sunday' ? 'active' : ''}`}
                  onClick={() => setSelectedDay('sunday')}
                  style={{
                    background: selectedDay === 'sunday' ? '#7c3aed' : 'white',
                    color: selectedDay === 'sunday' ? 'white' : '#374151',
                    border: selectedDay === 'sunday' ? '2px solid #7c3aed' : '2px solid #d1d5db',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Sunday Aug 16
                </button>
                <button 
                  className={`sg-day-btn ${selectedDay === 'both' ? 'active' : ''}`}
                  onClick={() => setSelectedDay('both')}
                  style={{
                    background: selectedDay === 'both' ? '#059669' : 'white',
                    color: selectedDay === 'both' ? 'white' : '#374151',
                    border: selectedDay === 'both' ? '2px solid #059669' : '2px solid #d1d5db',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Both Days
                </button>
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                {selectedDay === 'both' 
                  ? 'Both Days: Seat must be available on BOTH Saturday & Sunday (2x price)'
                  : 'Seat availability is different for each day. Select a day to see available seats.'}
              </p>
            </div>

            {/* Ticket Quantity - Mobile Left-Aligned */}
            <div className={`sg-quantity-bar ${isMobile ? 'mobile-left' : ''}`}>
              <span className="sg-quantity-label">How many tickets?</span>
              <div className="sg-quantity-control">
                <button 
                  className="sg-qty-minus" 
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  disabled={ticketQuantity <= 1}
                >
                  −
                </button>
                <span className="sg-qty-value">{ticketQuantity}</span>
                <button 
                  className="sg-qty-plus" 
                  onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                  disabled={ticketQuantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {/* SVG-based Seating Map with individual seat selection */}
            <AmphitheaterSeatingMap
              selectedDay={selectedDay}
              onSeatSelect={handleSeatClick}
              selectedSeats={selectedSeats}
              ticketQuantity={ticketQuantity}
            />

            {/* Selection Summary & Add to Cart */}
            <div className={`sg-cart-section ${selectedSeats.length > 0 ? 'active' : ''}`}>
              {selectedSeats.length > 0 ? (
                <>
                  <div className="sg-selected-summary">
                    <div className="sg-selected-count">
                      {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                    </div>
                    <div className="sg-selected-seats">
                      {selectedSeats.map(seat => (
                        <span key={seat.id} className="sg-seat-chip">
                          {seat.sectionName} · Row {seat.row}, Seat {seat.number}
                          <button onClick={() => setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))}>×</button>
                        </span>
                      ))}
                    </div>
                    <div className="sg-includes-badge">
                      <span>✓</span> Includes same-day festival access
                    </div>
                  </div>
                  <div className="sg-cart-total-row">
                    <div className="sg-total-label">Total{selectedDay === 'both' ? ' (Both Days - 2x)' : ''}</div>
                    <div className="sg-total-amount">${totalPrice}</div>
                  </div>
                  <button 
                    className="sg-add-to-cart-btn" 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    style={{
                      opacity: isAddingToCart ? 0.7 : 1,
                      cursor: isAddingToCart ? 'wait' : 'pointer',
                    }}
                  >
                    {isAddingToCart ? 'Reserving Seats...' : 'Add to Cart'}
                  </button>
                </>
              ) : (
                <div className="sg-empty-selection">
                  <p>Select up to <strong>{ticketQuantity}</strong> seats from the map above</p>
                </div>
              )}
            </div>
          </div>
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

export default AmphitheaterTickets;
