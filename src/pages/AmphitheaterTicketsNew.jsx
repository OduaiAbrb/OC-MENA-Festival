import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './AmphitheaterTickets.css';

const AmphitheaterTicketsNew = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedDay, setSelectedDay] = useState('both');

  // Amphitheater sections configuration
  const sections = [
    { id: 'pit', name: 'Pit (Standing)', price: 299, color: '#dc2626', rows: 10, seatsPerRow: 20, description: 'Standing room only - closest to stage' },
    { id: 'circle', name: 'Circle', price: 249, color: '#7c3aed', rows: 8, seatsPerRow: 35, description: 'Premium curved seating around pit' },
    { id: 'section1', name: 'Section 1', price: 199, color: '#c2703a', rows: 25, seatsPerRow: 28, description: 'Front left premium seating' },
    { id: 'section2', name: 'Section 2', price: 229, color: '#1a6b8a', rows: 25, seatsPerRow: 32, description: 'Front center - best view' },
    { id: 'section3', name: 'Section 3', price: 199, color: '#c2703a', rows: 25, seatsPerRow: 28, description: 'Front right premium seating' },
    { id: 'section4', name: 'Section 4', price: 149, color: '#d4913a', rows: 30, seatsPerRow: 32, description: 'Mid-level right seating' },
    { id: 'section5', name: 'Section 5', price: 139, color: '#d4913a', rows: 30, seatsPerRow: 35, description: 'Mid-level seating' },
    { id: 'section6', name: 'Section 6', price: 99, color: '#16a34a', rows: 35, seatsPerRow: 45, description: 'Back center - most affordable' },
    { id: 'section7', name: 'Section 7', price: 139, color: '#d4913a', rows: 30, seatsPerRow: 35, description: 'Mid-level seating' },
    { id: 'section8', name: 'Section 8', price: 149, color: '#d4913a', rows: 30, seatsPerRow: 32, description: 'Mid-level left seating' },
  ];

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSelectedSeats([]);
  };

  const handleSeatClick = (seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    
    const section = sections.find(s => s.id === selectedSection.id);
    const cartItem = {
      type: 'amphitheater',
      section: section.name,
      seats: selectedSeats,
      price: section.price,
      quantity: selectedSeats.length,
      day: selectedDay,
      total: section.price * selectedSeats.length
    };

    // Add to cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    navigate('/checkout');
  };

  const generateSeats = (section) => {
    const seats = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let row = 0; row < section.rows; row++) {
      const rowLetter = rowLetters[row % 26];
      for (let seat = 1; seat <= section.seatsPerRow; seat++) {
        const seatId = `${section.id}-${rowLetter}${seat}`;
        const isAvailable = Math.random() > 0.3; // 70% available
        seats.push({
          id: seatId,
          row: rowLetter,
          number: seat,
          available: isAvailable,
          selected: selectedSeats.includes(seatId)
        });
      }
    }
    return seats;
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">Amphitheater Seating</h1>
          
          {!selectedSection ? (
            <>
              <p className="card-description">
                Select a section to view available seats. Each amphitheater ticket includes admission to the OC MENA Festival for the same day.
              </p>

              {/* Day Selection */}
              <div className="day-selector" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#333' }}>Select Day:</label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['Saturday', 'Sunday', 'Both Days'].map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day.toLowerCase().replace(' ', ''))}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: selectedDay === day.toLowerCase().replace(' ', '') ? '2px solid #dc2626' : '2px solid #ddd',
                        background: selectedDay === day.toLowerCase().replace(' ', '') ? '#dc2626' : 'white',
                        color: selectedDay === day.toLowerCase().replace(' ', '') ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Grid */}
              <style>{`
                .amphitheater-sections-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 20px;
                  margin-top: 30px;
                }
                @media (max-width: 768px) {
                  .amphitheater-sections-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                  }
                }
              `}</style>
              <div className="amphitheater-sections-grid">
                {sections.map(section => (
                  <div
                    key={section.id}
                    className="section-card"
                    onClick={() => handleSectionSelect(section)}
                    style={{
                      background: 'white',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = section.color;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 20px ${section.color}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      background: section.color, 
                      borderRadius: '50%', 
                      margin: '0 auto 15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {section.id === 'pit' ? 'P' : section.id === 'circle' ? 'C' : section.id.replace('section', '')}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                      {section.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0', minHeight: '40px' }}>
                      {section.description}
                    </p>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: section.color }}>
                      ${section.price}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                      {section.rows} rows × {section.seatsPerRow} seats
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Seat Selection View */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => setSelectedSection(null)}
                  style={{
                    background: 'white',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#333'
                  }}
                >
                  ← Back to Sections
                </button>
              </div>

              <div style={{ 
                background: selectedSection.color + '22', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 10px 0' }}>
                  {selectedSection.name}
                </h2>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>
                  {selectedSection.description}
                </p>
                <div style={{ fontSize: '32px', fontWeight: '700', color: selectedSection.color }}>
                  ${selectedSection.price} per seat
                </div>
                {selectedSeats.length > 0 && (
                  <div style={{ marginTop: '15px', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    Selected: {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} - Total: ${selectedSection.price * selectedSeats.length}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#10b981', borderRadius: '4px' }}></div>
                  <span style={{ fontSize: '14px', color: '#666' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: selectedSection.color, borderRadius: '4px' }}></div>
                  <span style={{ fontSize: '14px', color: '#666' }}>Selected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#999', borderRadius: '4px' }}></div>
                  <span style={{ fontSize: '14px', color: '#666' }}>Unavailable</span>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="seat-grid-container" style={{ 
                background: 'white', 
                padding: '30px', 
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                overflowX: 'auto',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                <div style={{ minWidth: '600px' }}>
                  {/* Stage indicator */}
                  <div style={{ 
                    background: '#333', 
                    color: 'white', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontWeight: '700',
                    fontSize: '16px'
                  }}>
                    STAGE
                  </div>

                  {/* Seats by row */}
                  {(() => {
                    const seats = generateSeats(selectedSection);
                    const rowLetters = [...new Set(seats.map(s => s.row))];
                    
                    return rowLetters.map(rowLetter => {
                      const rowSeats = seats.filter(s => s.row === rowLetter);
                      return (
                        <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                          <div style={{ width: '30px', fontWeight: '600', color: '#666', fontSize: '14px' }}>
                            {rowLetter}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                            {rowSeats.map(seat => (
                              <button
                                key={seat.id}
                                onClick={() => seat.available && handleSeatClick(seat.id)}
                                disabled={!seat.available}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: !seat.available ? '#999' : seat.selected ? selectedSection.color : '#10b981',
                                  color: 'white',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: seat.available ? 'pointer' : 'not-allowed',
                                  transition: 'all 0.2s',
                                  opacity: seat.available ? 1 : 0.5
                                }}
                                onMouseEnter={(e) => {
                                  if (seat.available) {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                {seat.number}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Continue Button */}
              {selectedSeats.length > 0 && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <button
                    onClick={handleContinue}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      padding: '15px 40px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#b91c1c';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Continue to Checkout ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
                  </button>
                </div>
              )}
            </>
          )}
        </TornPaperWrapper>
      </section>

      <SponsorsSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default AmphitheaterTicketsNew;
