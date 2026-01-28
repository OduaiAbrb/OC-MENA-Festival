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
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeSection, setActiveSection] = useState(null); // For mobile section-first mode
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const transformRef = useRef(null);
  const containerRef = useRef(null);

  // Check for mobile on resize
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Section configuration - Sections 1,2,3 in front (premium), 4,5,6,7,8 in back
  // WIDER sections with BIGGER GAPS between them
  const sectionsConfig = useMemo(() => [
    { id: 1, name: 'Section 1', price: 179, color: '#c2703a', tier: 'front', startAngle: -38, endAngle: -15, rows: 5, seatsPerRow: 6 },
    { id: 2, name: 'Section 2', price: 199, color: '#1a6b8a', tier: 'front', startAngle: -10, endAngle: 10, rows: 5, seatsPerRow: 7 },
    { id: 3, name: 'Section 3', price: 179, color: '#c2703a', tier: 'front', startAngle: 15, endAngle: 38, rows: 5, seatsPerRow: 6 },
    { id: 4, name: 'Section 4', price: 129, color: '#d4913a', tier: 'back', startAngle: 50, endAngle: 70, rows: 6, seatsPerRow: 7 },
    { id: 5, name: 'Section 5', price: 119, color: '#d4913a', tier: 'back', startAngle: 26, endAngle: 46, rows: 6, seatsPerRow: 8 },
    { id: 6, name: 'Section 6', price: 99, color: '#d4913a', tier: 'back', startAngle: -22, endAngle: 22, rows: 7, seatsPerRow: 10 },
    { id: 7, name: 'Section 7', price: 119, color: '#d4913a', tier: 'back', startAngle: -46, endAngle: -26, rows: 6, seatsPerRow: 8 },
    { id: 8, name: 'Section 8', price: 129, color: '#d4913a', tier: 'back', startAngle: -70, endAngle: -50, rows: 6, seatsPerRow: 7 },
  ], []);

  // Generate seats for all sections - MORE spacing between seats
  const allSeats = useMemo(() => {
    const seats = [];
    const centerX = 500;
    const centerY = 520;
    
    sectionsConfig.forEach(section => {
      const isFront = section.tier === 'front';
      const baseRadius = isFront ? 130 : 270;
      const rowSpacing = isFront ? 28 : 26;
      
      for (let row = 0; row < section.rows; row++) {
        const radius = baseRadius + (row * rowSpacing);
        const rowLetter = String.fromCharCode(65 + row);
        const angleRange = section.endAngle - section.startAngle;
        const seatsInRow = section.seatsPerRow + Math.floor(row * 0.3);
        
        for (let seatNum = 0; seatNum < seatsInRow; seatNum++) {
          const angleOffset = seatsInRow > 1 ? (seatNum / (seatsInRow - 1)) * angleRange : angleRange / 2;
          const angle = (section.startAngle + angleOffset - 90) * (Math.PI / 180);
          
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          // Random availability (80% available)
          const isAvailable = Math.random() > 0.2;
          
          seats.push({
            id: `${section.id}-${rowLetter}-${seatNum + 1}`,
            sectionId: section.id,
            sectionName: section.name,
            row: rowLetter,
            number: seatNum + 1,
            x,
            y,
            price: section.price,
            color: section.color,
            available: isAvailable,
            tier: section.tier
          });
        }
      }
    });
    
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

  // Handle section click - zoom to section on both desktop and mobile
  const handleSectionClick = useCallback((sectionId) => {
    const section = sectionsConfig.find(s => s.id === sectionId);
    if (!section) return;
    
    // Toggle section selection
    if (activeSection === sectionId) {
      clearSectionSelection();
    } else {
      setActiveSection(sectionId);
      // Calculate center of section to zoom to
      if (transformRef.current) {
        const midAngle = ((section.startAngle + section.endAngle) / 2 - 90) * (Math.PI / 180);
        const isFront = section.tier === 'front';
        const radius = isFront ? 180 : 350;
        const centerX = 500 + radius * Math.cos(midAngle);
        const centerY = 520 + radius * Math.sin(midAngle);
        
        // Zoom to section
        transformRef.current.setTransform(
          -centerX * 1.8 + 400,
          -centerY * 1.8 + 250,
          2.2
        );
      }
    }
  }, [activeSection, sectionsConfig, clearSectionSelection]);

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
    
    const cartItem = {
      id: `amphitheater-${Date.now()}`,
      type: 'amphitheater',
      name: `Pacific Amphitheatre`,
      section: [...new Set(selectedSeats.map(s => s.sectionName))].join(', '),
      seats: seatsInfo,
      quantity: selectedSeats.length,
      price: selectedSeats[0]?.price || 0,
      total: totalPrice,
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
    const centerY = 520;
    const isFront = section.tier === 'front';
    const innerRadius = isFront ? 115 : 255;
    const outerRadius = isFront ? 115 + (section.rows * 28) + 15 : 255 + (section.rows * 26) + 15;
    
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
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
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

            {/* Ticket Quantity - Plus/Minus Style */}
            <div className="sg-quantity-bar">
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
                initialScale={1}
                minScale={0.6}
                maxScale={3}
                centerOnInit={true}
                wheel={{ step: 0.15 }}
                onTransformed={(ref) => setZoomLevel(ref.state.scale)}
              >
                <TransformComponent wrapperClass="sg-transform-wrapper" contentClass="sg-transform-content">
                  <svg 
                    viewBox="0 0 1000 600" 
                    className="sg-stadium-svg"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Background */}
                    <defs>
                      <radialGradient id="stadiumBg" cx="50%" cy="90%" r="80%">
                        <stop offset="0%" stopColor="#2a2a4a" />
                        <stop offset="100%" stopColor="#1a1a2e" />
                      </radialGradient>
                    </defs>
                    <rect x="0" y="0" width="1000" height="600" fill="url(#stadiumBg)" />
                    
                    {/* Stage */}
                    <ellipse cx="500" cy="510" rx="120" ry="30" fill="#3a3a5a" stroke="#555" strokeWidth="2" />
                    <text x="500" y="515" textAnchor="middle" fill="#aaa" fontSize="16" fontWeight="bold">STAGE</text>
                    
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
                    
                    {/* Individual Seats - LARGER for easier clicking */}
                    {allSeats.map(seat => {
                      const isSelected = selectedSeats.find(s => s.id === seat.id);
                      const isHovered = hoveredSeat?.id === seat.id;
                      const baseSeatSize = 7;
                      const seatSize = zoomLevel > 1.5 ? baseSeatSize + 2 : baseSeatSize;
                      
                      // Dim seats from other sections when one is active
                      const showSeat = !activeSection || seat.sectionId === activeSection;
                      const dimmed = activeSection && seat.sectionId !== activeSection;
                      
                      return (
                        <circle
                          key={seat.id}
                          cx={seat.x}
                          cy={seat.y}
                          r={isHovered && !isMobile ? seatSize + 2 : seatSize}
                          fill={
                            !seat.available ? '#4a4a5a' :
                            isSelected ? '#00d4aa' :
                            isHovered ? '#fff' :
                            seat.color
                          }
                          stroke={isSelected ? '#fff' : isHovered ? '#fff' : 'rgba(0,0,0,0.3)'}
                          strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                          className="sg-seat"
                          style={{ 
                            cursor: seat.available && showSeat ? 'pointer' : 'not-allowed',
                            filter: isSelected ? 'drop-shadow(0 0 8px #00d4aa)' : isHovered ? 'drop-shadow(0 0 4px #fff)' : 'none',
                            opacity: dimmed ? 0.2 : 1,
                            pointerEvents: dimmed ? 'none' : 'auto'
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
                <span className="sg-legend-dot" style={{ background: '#c2703a' }}></span>
                <span>Front $179</span>
              </div>
              <div className="sg-legend-item">
                <span className="sg-legend-dot" style={{ background: '#1a6b8a' }}></span>
                <span>Premium $199</span>
              </div>
              <div className="sg-legend-item">
                <span className="sg-legend-dot" style={{ background: '#d4913a' }}></span>
                <span>Upper $99-129</span>
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
