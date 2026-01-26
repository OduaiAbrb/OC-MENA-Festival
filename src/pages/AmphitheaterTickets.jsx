import React, { useState, useRef, useMemo, useCallback } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './AmphitheaterTickets.css';

const AmphitheaterTickets = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const mapRef = useRef(null);

  // NOTE for manual edits: tweak the polygon points below (viewBox 1024x662) for perfect alignment
  const sectionsMeta = [
    { id: 1, name: 'Section 1', rows: 'A-Z', price: 149, available: 42 },
    { id: 2, name: 'Section 2', rows: 'A-Z', price: 179, available: 28 },
    { id: 3, name: 'Section 3', rows: 'A-Z', price: 149, available: 38 },
    { id: 4, name: 'Section 4', rows: 'A-Y', price: 119, available: 56 },
    { id: 5, name: 'Section 5', rows: 'A-Y', price: 99, available: 64 },
    { id: 6, name: 'Section 6', rows: 'A-Y', price: 89, available: 72 },
    { id: 7, name: 'Section 7', rows: 'A-Y', price: 99, available: 58 },
    { id: 8, name: 'Section 8', rows: 'A-Y', price: 119, available: 48 },
  ];

  const rects = [
    { id: 1, x: 291.62011173184356, y: 333.2668733603625, w: 129.89944134078212, h: 143.47579298831386, rotation: 0 },
    { id: 2, x: 428.65921787709493, y: 287.9961841163844, w: 175.55307262569832, h: 144.0144125924159, rotation: 0 },
    { id: 3, x: 609.9441340782123, y: 311.7948962556642, w: 135.62011173184356, h: 167.47388504650607, rotation: 0 },
    { id: 4, x: 761.3631284916202, y: 235.5840686859051, w: 190.0223463687151, h: 159.89554018602433, rotation: 0 },
    { id: 5, x: 654.2905027932961, y: 131.36751729072262, w: 134.15642458100558, h: 152.00381588361557, rotation: 0 },
    { id: 6, x: 405.7653631284916, y: 97.68280467445743, w: 221.6536312849162, h: 164.63439065108514, rotation: 0 },
    { id: 7, x: 248.71508379888266, y: 153.2660920581922, w: 147.28491620111734, h: 131.36829859289296, rotation: 0 },
    { id: 8, x: 110.06703910614526, y: 231.79489625566424, w: 171.43016759776535, h: 173.356575244455, rotation: 0 },
  ];

  const rotatePoint = (px, py, cx, cy, deg) => {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = px - cx;
    const dy = py - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  };

  const getPointsFromRect = useCallback((r) => {
    const rot = r.rotation || 0;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const corners = [
      { x: r.x, y: r.y },
      { x: r.x + r.w, y: r.y },
      { x: r.x + r.w, y: r.y + r.h },
      { x: r.x, y: r.y + r.h }
    ];
    const rotated = corners.map(c => rotatePoint(c.x, c.y, cx, cy, rot));
    return rotated.map(p => `${p.x},${p.y}`).join(' ');
  }, []);

  const sections = useMemo(() => (
    sectionsMeta.map(meta => {
      const r = rects.find(rr => rr.id === meta.id) || { x: 0, y: 0, w: 0, h: 0 };
      return {
        ...meta,
        points: getPointsFromRect(r)
      };
    })
  ), [rects, sectionsMeta, getPointsFromRect]);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleAddToCart = () => {
    if (!selectedSection) return;
    
    const cartItem = {
      id: `amphitheater-${Date.now()}`,
      type: 'amphitheater',
      name: `Pacific Amphitheatre - ${selectedSection.name}`,
      section: selectedSection.name,
      quantity: ticketQuantity,
      price: selectedSection.price,
      total: selectedSection.price * ticketQuantity,
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
    
    setSelectedSection(null);
  };

  // Handle mouse move for tooltip positioning
  const getSectionCentroid = (section) => {
    const r = rects.find(rr => rr.id === section.id);
    if (!r) return { x: 512, y: 331 };
    const cx = (r.x + r.w / 2) / 1024;
    const cy = (r.y + r.h / 2) / 662;
    const mapEl = mapRef.current;
    if (!mapEl) return { x: 512, y: 331 };
    const mapRect = mapEl.getBoundingClientRect();
    return {
      x: cx * mapRect.width,
      y: cy * mapRect.height - 15
    };
  };

  const handleMouseMove = (e, section) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 15
      });
    }
    setHoveredSection(section);
  };

  const handlePanelHover = (section) => {
    setHoveredSection(section);
    const pos = getSectionCentroid(section);
    setTooltipPos(pos);
  };

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
              <div className="sg-event-info">
                <h1 className="sg-title">OC MENA Festival</h1>
                <p className="sg-venue">Pacific Amphitheatre · Costa Mesa, CA</p>
                <p className="sg-date">Aug 15 - 17, 2026 · 6:00 PM</p>
              </div>
            </div>

            {/* Ticket Quantity Selector */}
            <div className="sg-quantity-bar">
              <span className="sg-quantity-label">How many tickets?</span>
              <div className="sg-quantity-selector">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button
                    key={num}
                    className={`sg-qty-btn ${ticketQuantity === num ? 'active' : ''}`}
                    onClick={() => setTicketQuantity(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="sg-main">
              {/* Interactive Image Map */}
              <div className="sg-map-container" ref={mapRef}>
                {/* Actual PNG Image */}
                <img 
                  src="/pacific-amphitheatre-seating.png" 
                  alt="Pacific Amphitheatre Seating Chart"
                  className="sg-seating-image"
                  draggable="false"
                />
                
                {/* SVG overlay with polygon sections (driven by rects) */}
                <svg className="sg-overlay-svg" viewBox="0 0 1024 662" preserveAspectRatio="none">
                  {sections.map((section) => (
                    <polygon
                      key={section.id}
                      points={section.points}
                      className={`sg-section-polygon ${hoveredSection?.id === section.id ? 'hovered' : ''} ${selectedSection?.id === section.id ? 'selected' : ''}`}
                      onClick={() => handleSectionClick(section)}
                      onMouseEnter={(e) => handleMouseMove(e, section)}
                      onMouseMove={(e) => handleMouseMove(e, section)}
                      onMouseLeave={() => setHoveredSection(null)}
                    />
                  ))}
                </svg>

                {/* Hover Tooltip - follows cursor */}
                {hoveredSection && (
                  <div 
                    className="sg-tooltip"
                    style={{
                      left: tooltipPos.x,
                      top: tooltipPos.y,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="sg-tooltip-title">{hoveredSection.name}</div>
                    <div className="sg-tooltip-price">${hoveredSection.price}</div>
                    <div className="sg-tooltip-avail">{hoveredSection.available} tickets available</div>
                  </div>
                )}
              </div>

              
              {/* Right Panel - Ticket List or Selection */}
              <div className="sg-panel">
                {!selectedSection ? (
                  <>
                    <div className="sg-panel-header">
                      <h3>Select tickets</h3>
                      <p>Choose a section from the map or select below</p>
                    </div>
                    <div className="sg-ticket-list">
                      {sections.map(section => (
                        <div 
                          key={section.id}
                          className={`sg-ticket-item ${hoveredSection?.id === section.id ? 'hovered' : ''}`}
                          onClick={() => handleSectionClick(section)}
                          onMouseEnter={() => handlePanelHover(section)}
                          onMouseLeave={() => setHoveredSection(null)}
                        >
                          <div className="sg-ticket-info">
                            <span className="sg-ticket-section">{section.name}</span>
                            <span className="sg-ticket-rows">Rows {section.rows}</span>
                          </div>
                          <div className="sg-ticket-price">
                            <span className="sg-price">${section.price}</span>
                            <span className="sg-price-label">each</span>
                          </div>
                          <div className="sg-ticket-avail">
                            {section.available} left
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="sg-selection">
                    <button className="sg-back-btn" onClick={() => setSelectedSection(null)}>
                      ← Back to sections
                    </button>
                    
                    <div className="sg-selection-header">
                      <h2>{selectedSection.name}</h2>
                      <p>Rows {selectedSection.rows}</p>
                    </div>

                    <div className="sg-selection-details">
                      <div className="sg-detail-row">
                        <span>Price per ticket</span>
                        <span>${selectedSection.price}</span>
                      </div>
                      <div className="sg-detail-row">
                        <span>Quantity</span>
                        <span>{ticketQuantity} tickets</span>
                      </div>
                      <div className="sg-detail-row sg-subtotal">
                        <span>Subtotal</span>
                        <span>${selectedSection.price * ticketQuantity}</span>
                      </div>
                    </div>

                    <div className="sg-includes">
                      <div className="sg-includes-badge">
                        <span className="sg-check">✓</span>
                        Includes same-day festival access
                      </div>
                    </div>

                    <button className="sg-add-btn" onClick={handleAddToCart}>
                      Add to Cart - ${selectedSection.price * ticketQuantity}
                    </button>

                    <p className="sg-disclaimer">
                      All sales final. Mobile tickets will be delivered to your account.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Banner */}
            <div className="sg-info-banner">
              <div className="sg-info-item">
                <span className="sg-info-icon">🎵</span>
                <span>Amphitheater tickets include festival entry</span>
              </div>
              <div className="sg-info-item">
                <span className="sg-info-icon">📱</span>
                <span>Mobile tickets delivered instantly</span>
              </div>
              <div className="sg-info-item">
                <span className="sg-info-icon">🔒</span>
                <span>Secure checkout</span>
              </div>
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
