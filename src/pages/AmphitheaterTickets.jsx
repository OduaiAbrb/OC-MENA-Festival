import React, { useState, useRef, useMemo, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './AmphitheaterTickets.css';

const AmphitheaterTickets = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedDay, setSelectedDay] = useState('both');
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [zoomLevel, setZoomLevel] = useState(1.5);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const transformRef = useRef(null);
  const containerRef = useRef(null);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Generate ~8000 seats matching amphitheater layout
  const allSeats = useMemo(() => {
    const seats = [];
    const centerX = 500;
    const centerY = 500;
    
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
            seats.push({
              id: `${section.id}-${r}-${c}`,
              sectionId: section.id,
              sectionName: section.name,
              row: 'GA',
              number: r * cols + c + 1,
              x: pitX + (c * colSpacing),
              y: pitY + (r * rowSpacing),
              price: section.price,
              color: section.color,
              available: Math.random() > 0.1,
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
              available: Math.random() > 0.15,
              tier: section.tier,
              accessible: section.accessible || false
            });
          }
        }
      }
    });
    
    console.log(`Total seats generated: ${seats.length}`);
    return seats;
  }, [sectionsConfig]);

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

  const clearSectionSelection = useCallback(() => {
    setActiveSection(null);
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, []);

  // Handle section click - zoom to section
  const handleSectionClick = useCallback((sectionId) => {
    const section = sectionsConfig.find(s => s.id === sectionId);
    if (!section) return;
    
    if (activeSection === sectionId) {
      clearSectionSelection();
    } else {
      setActiveSection(sectionId);
      if (transformRef.current && section.startAngle !== undefined) {
        const midAngle = ((section.startAngle + section.endAngle) / 2 - 90) * (Math.PI / 180);
        let radius;
        if (section.tier === 'circle') radius = 160;
        else if (section.tier === 'orchestra') radius = 280;
        else radius = 450;
        
        const centerX = 500 + radius * Math.cos(midAngle);
        const centerY = 500 + radius * Math.sin(midAngle);
        
        transformRef.current.setTransform(
          -centerX * 2.5 + (isMobile ? 200 : 400),
          -centerY * 2.5 + 300,
          2.8
        );
      }
    }
  }, [activeSection, sectionsConfig, clearSectionSelection, isMobile]);

  // Handle seat hover (desktop only)
  const handleSeatHover = useCallback((seat, e) => {
    if (isMobile) return;
    setHoveredSeat(seat);
    if (containerRef.current && e) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [isMobile]);

  // Zoom controls
  const handleZoomIn = () => {
    if (transformRef.current) {
      transformRef.current.zoomIn(0.5);
    }
  };

  const handleZoomOut = () => {
    if (transformRef.current) {
      transformRef.current.zoomOut(0.5);
    }
  };

  const handleResetView = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    if (selectedSeats.length === 0) return;
    
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
      includesFestival: true
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
  };

  // Generate section paths for background
  const generateSectionPath = useCallback((section) => {
    const centerX = 500;
    const centerY = 500;
    
    if (section.tier === 'pit') {
      const pitWidth = 120;
      const pitHeight = 40;
      const pitX = centerX - pitWidth / 2;
      const pitY = centerY - 80;
      return `M ${pitX} ${pitY} L ${pitX + pitWidth} ${pitY} L ${pitX + pitWidth} ${pitY + pitHeight} L ${pitX} ${pitY + pitHeight} Z`;
    }
    
    let innerRadius, outerRadius;
    if (section.tier === 'circle') {
      innerRadius = 140;
      outerRadius = 140 + (section.rows * 10);
    } else if (section.tier === 'orchestra') {
      innerRadius = 200;
      outerRadius = 200 + (section.rows * 8);
    } else {
      innerRadius = 380;
      outerRadius = 380 + (section.rows * 7);
    }
    
    const startAngleRad = (section.startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (section.endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);
    
    const largeArc = Math.abs(section.endAngle - section.startAngle) > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  }, []);

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

            {/* Stadium Seating Map */}
            <div className="sg-seating-wrapper" ref={containerRef}>
              <TransformWrapper
                ref={transformRef}
                initialScale={isMobile ? 1.2 : 1.5}
                minScale={0.8}
                maxScale={4}
                centerOnInit={true}
                wheel={{ step: 0.3, smoothStep: 0.01 }}
                velocityAnimation={{ sensitivity: 0.8, animationTime: 200 }}
                onTransformed={(ref) => setZoomLevel(ref.state.scale)}
                limitToBounds={false}
                centerZoomedOut={true}
              >
                <TransformComponent wrapperClass="sg-transform-wrapper" contentClass="sg-transform-content">
                  <svg 
                    viewBox="0 0 1000 1100" 
                    className="sg-stadium-svg"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background */}
                    <defs>
                      <radialGradient id="stadiumBg" cx="50%" cy="45%" r="70%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </radialGradient>
                    </defs>
                    <rect x="0" y="0" width="1000" height="1100" fill="url(#stadiumBg)" />
                    
                    {/* Stage */}
                    <rect x="380" y="350" width="240" height="60" fill="#1e1e2e" stroke="#444" strokeWidth="3" rx="5" />
                    <text x="500" y="385" textAnchor="middle" fill="#888" fontSize="20" fontWeight="bold">STAGE</text>
                    
                    {/* Section Backgrounds - Clickable on both desktop and mobile */}
                    {sectionsConfig.map(section => {
                      const isActive = activeSection === section.id;
                      return (
                        <path
                          key={`bg-${section.id}`}
                          d={generateSectionPath(section)}
                          fill={isActive ? `${section.color}66` : `${section.color}33`}
                          stroke={isActive ? '#fff' : section.color}
                          strokeWidth={isActive ? 4 : 2}
                          opacity={activeSection && !isActive ? 0.25 : 0.8}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSectionClick(section.id)}
                        />
                      );
                    })}
                    
                    {/* Individual Seats - Only show for active section or at high zoom */}
                    {(activeSection || zoomLevel > 2.0) && allSeats.map(seat => {
                      const isSelected = selectedSeats.find(s => s.id === seat.id);
                      const isHovered = hoveredSeat?.id === seat.id;
                      
                      // Seat size based on zoom level
                      let seatSize = 4;
                      if (zoomLevel > 2.5) seatSize = 6;
                      else if (zoomLevel > 1.8) seatSize = 5;
                      
                      // Only show seats from active section
                      const showSeat = !activeSection || seat.sectionId === activeSection;
                      if (!showSeat) return null;
                      
                      // Skip rendering if too far from center at low zoom
                      if (!activeSection && zoomLevel < 2.5) {
                        const dx = seat.x - 500;
                        const dy = seat.y - 450;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist > 300) return null;
                      }
                      
                      return (
                        <circle
                          key={seat.id}
                          cx={seat.x}
                          cy={seat.y}
                          r={isHovered && !isMobile ? seatSize + 1 : seatSize}
                          fill={
                            !seat.available ? '#4a4a5a' :
                            isSelected ? '#00d4aa' :
                            isHovered ? '#fff' :
                            seat.color
                          }
                          stroke={isSelected ? '#fff' : isHovered ? '#fff' : 'rgba(0,0,0,0.3)'}
                          strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.5}
                          className="sg-seat"
                          style={{ 
                            cursor: seat.available && showSeat ? 'pointer' : 'not-allowed',
                            filter: isSelected ? 'drop-shadow(0 0 8px #00d4aa)' : isHovered ? 'drop-shadow(0 0 4px #fff)' : 'none',
                            opacity: showSeat ? 1 : 0.2,
                            pointerEvents: showSeat ? 'auto' : 'none'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (showSeat) handleSeatClick(seat);
                          }}
                          onMouseEnter={(e) => handleSeatHover(seat, e)}
                          onMouseLeave={() => setHoveredSeat(null)}
                        />
                      );
                    })}
                  </svg>
                </TransformComponent>
              </TransformWrapper>

              {/* Close zoomed section */}
              {activeSection && (
                <button
                  className="sg-close-section"
                  onClick={clearSectionSelection}
                  aria-label="Exit section view"
                >
                  ×
                </button>
              )}

              {/* Zoom Controls */}
              <div className="sg-zoom-controls">
                <button onClick={handleZoomIn} title="Zoom In">+</button>
                <span className="sg-zoom-level">{Math.round(zoomLevel * 100)}%</span>
                <button onClick={handleZoomOut} title="Zoom Out">−</button>
                <button onClick={handleResetView} title="Reset" className="sg-reset-btn">↺</button>
              </div>

              {/* Section Indicator - shows when a section is selected */}
              {activeSection && (
                <div className="sg-section-bar">
                  <span>{sectionsConfig.find(s => s.id === activeSection)?.name} - ${sectionsConfig.find(s => s.id === activeSection)?.price}</span>
                  <button onClick={clearSectionSelection}>Show All Sections</button>
                </div>
              )}

              {/* Hint - shows when no section selected */}
              {!activeSection && (
                <div className="sg-section-hint">
                  Click a section to zoom in
                </div>
              )}

              {/* Desktop Tooltip - Small & Clean */}
              {!isMobile && hoveredSeat && (
                <div 
                  className="sg-mini-tooltip"
                  style={{
                    left: tooltipPos.x,
                    top: tooltipPos.y - 45
                  }}
                >
                  <span className="sg-mini-price">${hoveredSeat.price}</span>
                </div>
              )}
            </div>

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
