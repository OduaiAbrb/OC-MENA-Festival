import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import AmphitheaterCanvas from '../components/AmphitheaterCanvas';
import api from '../services/api';
import './AmphitheaterTickets.css';

const AmphitheaterTickets = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedDay, setSelectedDay] = useState('both');
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [backendSeats, setBackendSeats] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch real-time seat availability from backend
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await api.getAmphitheaterSeats();
        if (response?.success) {
          setBackendSeats(response.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch amphitheater seats:', err);
      }
    };
    fetchSeats();
    
    // Refresh availability every 30 seconds
    const interval = setInterval(fetchSeats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Pacific Amphitheatre - Based on actual venue layout with ~8000 seats
  // Sections: Pit (X1), Circle (X2,X3,X4), Orchestra (1,2,3), Terrace (4,5,6,7,8)
  const sectionsConfig = useMemo(() => [
    // PIT X1 - Standing room (Green in image)
    { id: 'pit', name: 'Pit - X1', price: 299, color: '#10b981', tier: 'pit', rows: 1, seatsPerRow: 150, capacity: 150, type: 'standing' },
    
    // CIRCLE - X2, X3, X4 (Blue accessible sections in image)
    { id: 'circle-x2', name: 'Circle - X2', price: 249, color: '#3b82f6', tier: 'circle', startAngle: -55, endAngle: -20, rows: 4, seatsPerRow: 30, accessible: true },
    { id: 'circle-x3', name: 'Circle - X3', price: 249, color: '#3b82f6', tier: 'circle', startAngle: -15, endAngle: 15, rows: 4, seatsPerRow: 25, accessible: true },
    { id: 'circle-x4', name: 'Circle - X4', price: 249, color: '#3b82f6', tier: 'circle', startAngle: 20, endAngle: 55, rows: 4, seatsPerRow: 30, accessible: true },
    
    // ORCHESTRA - Sections 1, 2, 3 (Dark red/brown in image)
    { id: 'orch-1', name: 'Orchestra - 1', price: 199, color: '#991b1b', tier: 'orchestra', startAngle: -70, endAngle: -30, rows: 30, seatsPerRow: 35 },
    { id: 'orch-2', name: 'Orchestra - 2', price: 229, color: '#7f1d1d', tier: 'orchestra', startAngle: -25, endAngle: 25, rows: 32, seatsPerRow: 40 },
    { id: 'orch-3', name: 'Orchestra - 3', price: 199, color: '#991b1b', tier: 'orchestra', startAngle: 30, endAngle: 70, rows: 30, seatsPerRow: 35 },
    
    // TERRACE - Sections 1, 4, 5, 6, 7, 8 (Orange/tan in image)
    { id: 'terr-1', name: 'Terrace - 1', price: 149, color: '#d97706', tier: 'terrace', startAngle: -85, endAngle: -55, rows: 35, seatsPerRow: 32 },
    { id: 'terr-4', name: 'Terrace - 4', price: 139, color: '#d97706', tier: 'terrace', startAngle: 55, endAngle: 85, rows: 35, seatsPerRow: 32 },
    { id: 'terr-5', name: 'Terrace - 5', price: 139, color: '#d97706', tier: 'terrace', startAngle: 30, endAngle: 55, rows: 35, seatsPerRow: 30 },
    { id: 'terr-6', name: 'Terrace - 6', price: 99, color: '#d97706', tier: 'terrace', startAngle: -25, endAngle: 25, rows: 40, seatsPerRow: 45 },
    { id: 'terr-7', name: 'Terrace - 7', price: 139, color: '#d97706', tier: 'terrace', startAngle: -55, endAngle: -30, rows: 35, seatsPerRow: 30 },
    { id: 'terr-8', name: 'Terrace - 8', price: 149, color: '#d97706', tier: 'terrace', startAngle: -100, endAngle: -85, rows: 35, seatsPerRow: 28 },
  ], []);

  // Generate ~8000 seats with real-time availability from backend
  const allSeats = useMemo(() => {
    const seats = [];
    const centerX = 500;
    const centerY = 500;
    
    // Create availability map from backend data
    const availabilityMap = new Map();
    backendSeats.forEach(seat => {
      const key = `${seat.section_id}-${seat.row}-${seat.seat_number}`;
      availabilityMap.set(key, seat.is_available);
    });
    
    sectionsConfig.forEach(section => {
      // PIT - Standing room (grid layout in front of stage)
      if (section.tier === 'pit') {
        const pitWidth = 120;
        const pitHeight = 40;
        const pitX = centerX - pitWidth / 2;
        const pitY = centerY - 80;
        const cols = 15;
        const rows = 10;
        const colSpacing = pitWidth / cols;
        const rowSpacing = pitHeight / rows;
        
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const seatNum = r * cols + c + 1;
            const key = `${section.id}-GA-${seatNum}`;
            seats.push({
              id: `${section.id}-${r}-${c}`,
              sectionId: section.id,
              sectionName: section.name,
              row: 'GA',
              number: seatNum,
              x: pitX + (c * colSpacing),
              y: pitY + (r * rowSpacing),
              price: section.price,
              color: section.color,
              available: availabilityMap.get(key) ?? true,
              tier: section.tier,
              isPit: true
            });
          }
        }
      }
      // CIRCLE & ORCHESTRA & TERRACE - Curved sections
      else {
        let baseRadius, rowSpacing;
        
        if (section.tier === 'circle') {
          baseRadius = 140;
          rowSpacing = 10;
        } else if (section.tier === 'orchestra') {
          baseRadius = 200;
          rowSpacing = 8;
        } else { // terrace
          baseRadius = 380;
          rowSpacing = 7;
        }
        
        for (let row = 0; row < section.rows; row++) {
          const radius = baseRadius + (row * rowSpacing);
          const rowLetter = String.fromCharCode(65 + row);
          const angleRange = section.endAngle - section.startAngle;
          
          // More seats in outer rows
          const seatsInRow = Math.floor(section.seatsPerRow + (row * 0.5));
          
          for (let seatNum = 0; seatNum < seatsInRow; seatNum++) {
            const angleOffset = seatsInRow > 1 ? (seatNum / (seatsInRow - 1)) * angleRange : angleRange / 2;
            const angle = (section.startAngle + angleOffset - 90) * (Math.PI / 180);
            const key = `${section.id}-${rowLetter}-${seatNum + 1}`;
            
            seats.push({
              id: `${section.id}-${rowLetter}-${seatNum + 1}`,
              sectionId: section.id,
              sectionName: section.name,
              row: rowLetter,
              number: seatNum + 1,
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle),
              price: section.price,
              color: section.color,
              available: availabilityMap.get(key) ?? true,
              tier: section.tier,
              accessible: section.accessible || false
            });
          }
        }
      }
    });
    
    console.log(`Total seats generated: ${seats.length}, Backend seats: ${backendSeats.length}`);
    return seats;
  }, [sectionsConfig, backendSeats]);

  // Handle seat click
  const handleSeatClick = useCallback((seat) => {
    if (!seat.available) return;
    
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) {
        return prev.filter(s => s.id !== seat.id);
      }
      if (prev.length >= ticketQuantity) {
        return [...prev.slice(1), seat];
      }
      return [...prev, seat];
    });
  }, [ticketQuantity]);


  // Add to cart with seat hold
  const handleAddToCart = async () => {
    if (selectedSeats.length === 0) return;
    
    try {
      // Create seat hold on backend (10-minute reservation)
      const seatIds = selectedSeats.map(s => s.id);
      const eventDate = selectedDay === 'saturday' ? '2026-08-15' : 
                       selectedDay === 'sunday' ? '2026-08-16' : '2026-08-15'; // Default to Saturday for "both"
      
      const holdResponse = await api.holdAmphitheaterSeats(seatIds, eventDate);
      
      if (!holdResponse?.success) {
        alert('Failed to reserve seats. They may have been taken by another user.');
        // Refresh seat availability
        const seatsResponse = await api.getAmphitheaterSeats();
        if (seatsResponse?.success) {
          setBackendSeats(seatsResponse.data || []);
        }
        setSelectedSeats([]);
        return;
      }
      
      const seatsInfo = selectedSeats.map(s => `Row ${s.row}, Seat ${s.number}`).join('; ');
      const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
      
      // Adjust price for both days (multiply by 2)
      const finalPrice = selectedDay === 'both' ? totalPrice * 2 : totalPrice;
      const dayLabel = selectedDay === 'saturday' ? 'Saturday' : selectedDay === 'sunday' ? 'Sunday' : 'Both Days';
      
      const cartItem = {
        id: `amphitheater-${Date.now()}`,
        type: 'amphitheater',
        name: `Pacific Amphitheatre - ${dayLabel}`,
        section: [...new Set(selectedSeats.map(s => s.sectionName))].join(', '),
        seats: seatsInfo,
        day: selectedDay,
        quantity: selectedSeats.length,
        price: selectedSeats[0]?.price || 0,
        total: finalPrice,
        includesFestival: true,
        holdId: holdResponse.data.hold_id,
        expiresAt: holdResponse.data.expires_at
      };

      const existingCart = localStorage.getItem('cart');
      let cart = { items: [], total: 0 };
      
      if (existingCart) {
        try {
          cart = JSON.parse(existingCart);
        } catch (e) {
          console.error('Error parsing cart:', e);
        }
      }

      cart.items.push(cartItem);
      cart.total += cartItem.total;

      localStorage.setItem('cart', JSON.stringify(cart));
      
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: { items: cart.items, total: cart.total } 
      }));
      window.dispatchEvent(new CustomEvent('openCart'));
      
      setSelectedSeats([]);
      
      // Show hold timer
      alert(`Seats reserved for 10 minutes! Complete checkout before ${new Date(holdResponse.data.expires_at).toLocaleTimeString()}`);
      
    } catch (err) {
      console.error('Failed to hold seats:', err);
      alert('Failed to reserve seats. Please try again.');
    }
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

            {/* Day Selection Toggle */}
            <div className="sg-day-selector">
              <span className="sg-day-label">Select Event Day:</span>
              <div className="sg-day-buttons">
                <button 
                  className={`sg-day-btn ${selectedDay === 'saturday' ? 'active' : ''}`}
                  onClick={() => setSelectedDay('saturday')}
                >
                  Saturday
                </button>
                <button 
                  className={`sg-day-btn ${selectedDay === 'sunday' ? 'active' : ''}`}
                  onClick={() => setSelectedDay('sunday')}
                >
                  Sunday
                </button>
                <button 
                  className={`sg-day-btn ${selectedDay === 'both' ? 'active' : ''}`}
                  onClick={() => setSelectedDay('both')}
                >
                  Both Days
                </button>
              </div>
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

            {/* Canvas-based Seating Map with GPU rendering */}
            <AmphitheaterCanvas
              onSeatSelect={handleSeatClick}
              selectedSeats={selectedSeats}
              unavailableSeats={allSeats.filter(s => !s.available).map(s => s.id)}
              ticketQuantity={ticketQuantity}
            />

            {/* Legend */}
            <div className="sg-legend">
              <div className="sg-legend-item">
                <span className="sg-legend-dot" style={{ background: '#10b981' }}></span>
                <span>Pit $299</span>
              </div>
              <div className="sg-legend-item">
                <span className="sg-legend-dot" style={{ background: '#3b82f6' }}></span>
                <span>Circle $249</span>
              </div>
              <div className="sg-legend-item">
                <span className="sg-legend-dot" style={{ background: '#991b1b' }}></span>
                <span>Orchestra $199-229</span>
              </div>
              <div className="sg-legend-item">
                <span className="sg-legend-dot" style={{ background: '#d97706' }}></span>
                <span>Terrace $99-149</span>
              </div>
              <div className="sg-legend-item">
                <span className="sg-legend-dot selected"></span>
                <span>Selected</span>
              </div>
              <div className="sg-legend-item">
                <span className="sg-legend-dot unavailable"></span>
                <span>Sold</span>
              </div>
            </div>

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
                    <div className="sg-total-label">Total</div>
                    <div className="sg-total-amount">${totalPrice}</div>
                  </div>
                  <button className="sg-add-to-cart-btn" onClick={handleAddToCart}>
                    Add to Cart
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
