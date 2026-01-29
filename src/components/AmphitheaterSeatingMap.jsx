import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';

/**
 * Pacific Amphitheatre Seating Map - Exact replica of reference image
 * Supports individual seat selection with day 1/day 2 backend integration
 */
const AmphitheaterSeatingMap = ({
  selectedDay = 'saturday', // 'saturday' | 'sunday'
  onSeatSelect,
  selectedSeats = [],
  ticketQuantity = 2,
}) => {
  const svgRef = useRef(null);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [seatAvailability, setSeatAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch seat availability from backend for the selected day - with graceful fallback
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const eventDate = selectedDay === 'saturday' ? '2026-08-15' : '2026-08-16';
        const response = await api.getAmphitheaterSeats(eventDate);
        if (response?.success && response.data) {
          const availMap = {};
          response.data.forEach(seat => {
            const key = `${seat.section_id}-${seat.row}-${seat.seat_number}`;
            availMap[key] = seat.is_available;
          });
          setSeatAvailability(availMap);
        }
      } catch (err) {
        // Graceful fallback - all seats available if backend unavailable
        console.log('Backend unavailable, using local availability');
        setSeatAvailability({});
      }
      setLoading(false);
    };
    
    fetchAvailability();
    const interval = setInterval(fetchAvailability, 30000);
    return () => clearInterval(interval);
  }, [selectedDay]);

  // Center point for all sections - CENTERED at x=500
  const CENTER_X = 500;
  const CENTER_Y = 800;

  // Section configurations - exact match to reference image layout - ALL CENTERED
  const sections = useMemo(() => [
    // PIT X1 - Green section (standing room closest to stage)
    {
      id: 'pit-x1',
      name: 'Pit X1',
      tier: 'PIT',
      color: '#4ade80',
      price: 299,
      rows: 5,
      seatsPerRow: 16,
      type: 'grid',
      centerX: CENTER_X,
      centerY: CENTER_Y - 45,
      width: 140,
      height: 45,
    },
    // CIRCLE X2, X3, X4 - Blue accessible sections - SYMMETRICAL
    {
      id: 'circle-x2',
      name: 'Circle X2',
      tier: 'CIRCLE',
      color: '#3b82f6',
      price: 249,
      rows: 3,
      seatsPerRow: 14,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -55,
      endAngle: -20,
      innerRadius: 85,
      rowSpacing: 9,
      accessible: true,
    },
    {
      id: 'circle-x3',
      name: 'Circle X3',
      tier: 'CIRCLE',
      color: '#3b82f6',
      price: 249,
      rows: 3,
      seatsPerRow: 12,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -15,
      endAngle: 15,
      innerRadius: 85,
      rowSpacing: 9,
      accessible: true,
    },
    {
      id: 'circle-x4',
      name: 'Circle X4',
      tier: 'CIRCLE',
      color: '#3b82f6',
      price: 249,
      rows: 3,
      seatsPerRow: 14,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: 20,
      endAngle: 55,
      innerRadius: 85,
      rowSpacing: 9,
      accessible: true,
    },
    // ORCHESTRA 1, 2, 3 - Brown/red sections - SYMMETRICAL
    {
      id: 'orch-1',
      name: 'Orchestra 1',
      tier: 'ORCHESTRA',
      color: '#b45309',
      price: 199,
      rows: 18,
      seatsPerRow: 18,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -72,
      endAngle: -40,
      innerRadius: 125,
      rowSpacing: 6.5,
      sectionNumber: '1',
    },
    {
      id: 'orch-2',
      name: 'Orchestra 2',
      tier: 'ORCHESTRA',
      color: '#92400e',
      price: 229,
      rows: 20,
      seatsPerRow: 24,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -32,
      endAngle: 32,
      innerRadius: 125,
      rowSpacing: 6.5,
      sectionNumber: '2',
    },
    {
      id: 'orch-3',
      name: 'Orchestra 3',
      tier: 'ORCHESTRA',
      color: '#b45309',
      price: 199,
      rows: 18,
      seatsPerRow: 18,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: 40,
      endAngle: 72,
      innerRadius: 125,
      rowSpacing: 6.5,
      sectionNumber: '3',
    },
    // TERRACE 8, 1, 7, 6, 5, 4 - Orange/tan sections (outer ring) - SYMMETRICAL & CENTERED
    {
      id: 'terr-8',
      name: 'Terrace 8',
      tier: 'TERRACE',
      color: '#d97706',
      price: 149,
      rows: 22,
      seatsPerRow: 14,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -95,
      endAngle: -75,
      innerRadius: 270,
      rowSpacing: 5.5,
      sectionNumber: '8',
    },
    {
      id: 'terr-1',
      name: 'Terrace 1',
      tier: 'TERRACE',
      color: '#d97706',
      price: 149,
      rows: 22,
      seatsPerRow: 18,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -73,
      endAngle: -48,
      innerRadius: 270,
      rowSpacing: 5.5,
      sectionNumber: '1',
    },
    {
      id: 'terr-7',
      name: 'Terrace 7',
      tier: 'TERRACE',
      color: '#d97706',
      price: 139,
      rows: 22,
      seatsPerRow: 18,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -46,
      endAngle: -18,
      innerRadius: 270,
      rowSpacing: 5.5,
      sectionNumber: '7',
    },
    {
      id: 'terr-6',
      name: 'Terrace 6',
      tier: 'TERRACE',
      color: '#d97706',
      price: 99,
      rows: 26,
      seatsPerRow: 26,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: -16,
      endAngle: 16,
      innerRadius: 270,
      rowSpacing: 5.5,
      sectionNumber: '6',
    },
    {
      id: 'terr-5',
      name: 'Terrace 5',
      tier: 'TERRACE',
      color: '#d97706',
      price: 139,
      rows: 22,
      seatsPerRow: 18,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: 18,
      endAngle: 46,
      innerRadius: 270,
      rowSpacing: 5.5,
      sectionNumber: '5',
    },
    {
      id: 'terr-4',
      name: 'Terrace 4',
      tier: 'TERRACE',
      color: '#d97706',
      price: 139,
      rows: 22,
      seatsPerRow: 18,
      type: 'arc',
      centerX: CENTER_X,
      centerY: CENTER_Y,
      startAngle: 48,
      endAngle: 73,
      innerRadius: 270,
      rowSpacing: 5.5,
      sectionNumber: '4',
    },
  ], []);

  // Generate all seats with coordinates
  const allSeats = useMemo(() => {
    const seats = [];
    
    sections.forEach(section => {
      if (section.type === 'grid') {
        // Grid layout for pit
        const startX = section.centerX - section.width / 2;
        const startY = section.centerY - section.height / 2;
        const colSpacing = section.width / section.seatsPerRow;
        const rowSpacing = section.height / section.rows;
        
        for (let row = 0; row < section.rows; row++) {
          for (let col = 0; col < section.seatsPerRow; col++) {
            const seatNum = row * section.seatsPerRow + col + 1;
            const seatId = `${section.id}-GA-${seatNum}`;
            const backendKey = `${section.id}-GA-${seatNum}`;
            
            seats.push({
              id: seatId,
              sectionId: section.id,
              sectionName: section.name,
              row: 'GA',
              number: seatNum,
              x: startX + col * colSpacing + colSpacing / 2,
              y: startY + row * rowSpacing + rowSpacing / 2,
              price: section.price,
              color: section.color,
              tier: section.tier,
              backendKey,
              isAccessible: false,
            });
          }
        }
      } else if (section.type === 'arc') {
        // Arc/curved layout
        for (let row = 0; row < section.rows; row++) {
          const radius = section.innerRadius + row * section.rowSpacing;
          const rowLetter = String.fromCharCode(65 + row);
          const angleRange = section.endAngle - section.startAngle;
          const seatsInRow = Math.floor(section.seatsPerRow + row * 0.4);
          
          for (let seatNum = 0; seatNum < seatsInRow; seatNum++) {
            const angleOffset = seatsInRow > 1 
              ? (seatNum / (seatsInRow - 1)) * angleRange 
              : angleRange / 2;
            const angleDeg = section.startAngle + angleOffset - 90;
            const angleRad = angleDeg * (Math.PI / 180);
            
            const seatId = `${section.id}-${rowLetter}-${seatNum + 1}`;
            const backendKey = `${section.id}-${rowLetter}-${seatNum + 1}`;
            
            seats.push({
              id: seatId,
              sectionId: section.id,
              sectionName: section.name,
              row: rowLetter,
              number: seatNum + 1,
              x: section.centerX + radius * Math.cos(angleRad),
              y: section.centerY + radius * Math.sin(angleRad),
              price: section.price,
              color: section.color,
              tier: section.tier,
              backendKey,
              isAccessible: section.accessible && row < 2,
            });
          }
        }
      }
    });
    
    return seats;
  }, [sections]);

  // Check if seat is available
  const isSeatAvailable = useCallback((seat) => {
    const available = seatAvailability[seat.backendKey];
    return available === undefined ? true : available;
  }, [seatAvailability]);

  // Check if seat is selected
  const isSeatSelected = useCallback((seat) => {
    return selectedSeats.some(s => s.id === seat.id);
  }, [selectedSeats]);

  // Handle seat click
  const handleSeatClick = useCallback((seat) => {
    if (!isSeatAvailable(seat)) return;
    onSeatSelect?.(seat);
  }, [isSeatAvailable, onSeatSelect]);

  // Mouse handlers for pan/zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 3));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'circle') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Get seat fill color based on state
  const getSeatFill = useCallback((seat) => {
    if (!isSeatAvailable(seat)) return '#1a1a1a'; // Black for reserved/sold
    if (isSeatSelected(seat)) return '#10b981';
    if (hoveredSeat?.id === seat.id) return '#fbbf24';
    return seat.color;
  }, [isSeatAvailable, isSeatSelected, hoveredSeat]);

  // Section label positions - adjusted for centered layout
  const sectionLabels = useMemo(() => [
    { id: 'terr-8', x: 115, y: 420, number: '8', labelY: 320 },
    { id: 'terr-1', x: 195, y: 320, number: '1', labelY: 220 },
    { id: 'terr-7', x: 295, y: 240, number: '7', labelY: 140 },
    { id: 'terr-6', x: 500, y: 200, number: '6', labelY: 100 },
    { id: 'terr-5', x: 705, y: 240, number: '5', labelY: 140 },
    { id: 'terr-4', x: 805, y: 320, number: '4', labelY: 220 },
    { id: 'orch-1', x: 310, y: 530, number: '1', isOrch: true },
    { id: 'orch-2', x: 500, y: 490, number: '2', isOrch: true },
    { id: 'orch-3', x: 690, y: 530, number: '3', isOrch: true },
  ], []);

  return (
    <div style={{ 
      width: '100%', 
      background: '#e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Day indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: selectedDay === 'saturday' ? '#dc2626' : '#7c3aed',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontWeight: '700',
        fontSize: '14px',
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        {selectedDay === 'saturday' ? 'Saturday Aug 15' : 'Sunday Aug 16'}
      </div>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        gap: '8px',
        zIndex: 10,
      }}>
        <button
          onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.5))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '18px',
            border: 'none',
            background: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>
              Loading seats...
            </div>
          </div>
        </div>
      )}

      {/* SVG Seating Map */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 950"
        style={{
          width: '100%',
          height: '600px',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background */}
          <rect x="0" y="0" width="1000" height="950" fill="#e5e7eb" />

          {/* Section background shapes for visual grouping - CENTERED */}
          {/* Terrace background arc */}
          <path
            d="M 100 800 A 400 400 0 0 1 900 800"
            fill="none"
            stroke="#d97706"
            strokeWidth="150"
            opacity="0.15"
          />
          
          {/* Orchestra background arc */}
          <path
            d="M 220 800 A 280 280 0 0 1 780 800"
            fill="none"
            stroke="#92400e"
            strokeWidth="140"
            opacity="0.15"
          />

          {/* Circle background */}
          <ellipse cx="500" cy="770" rx="100" ry="45" fill="#3b82f6" opacity="0.15" />

          {/* Pit background */}
          <rect x="430" y="735" width="140" height="50" rx="4" fill="#4ade80" opacity="0.2" />

          {/* Render all seats */}
          {allSeats.map(seat => (
            <g key={seat.id}>
              <circle
                cx={seat.x}
                cy={seat.y}
                r={seat.tier === 'PIT' ? 3.5 : seat.tier === 'CIRCLE' ? 4 : 3}
                fill={getSeatFill(seat)}
                stroke={isSeatSelected(seat) ? '#065f46' : hoveredSeat?.id === seat.id ? '#92400e' : 'transparent'}
                strokeWidth={isSeatSelected(seat) || hoveredSeat?.id === seat.id ? 1.5 : 0}
                opacity={isSeatAvailable(seat) ? 1 : 0.9}
                style={{ cursor: isSeatAvailable(seat) ? 'pointer' : 'not-allowed' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSeatClick(seat);
                }}
                onMouseEnter={() => setHoveredSeat(seat)}
                onMouseLeave={() => setHoveredSeat(null)}
              />
              {/* Show 'R' for reserved seats */}
              {!isSeatAvailable(seat) && (
                <text
                  x={seat.x}
                  y={seat.y + 1}
                  textAnchor="middle"
                  fill="white"
                  fontSize="2.5"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  R
                </text>
              )}
            </g>
          ))}

          {/* Section labels - SECTION X text */}
          {sectionLabels.filter(l => !l.isOrch).map(label => (
            <g key={`label-${label.id}`}>
              <text
                x={label.x}
                y={label.labelY}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="11"
                fontWeight="bold"
              >
                SECTION {label.number}
              </text>
              {/* Number circle */}
              <circle cx={label.x} cy={label.y} r="18" fill="#9ca3af" />
              <text
                x={label.x}
                y={label.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {label.number}
              </text>
            </g>
          ))}

          {/* Orchestra section number labels */}
          {sectionLabels.filter(l => l.isOrch).map(label => (
            <g key={`label-${label.id}`}>
              <circle cx={label.x} cy={label.y} r="16" fill="rgba(255,255,255,0.9)" />
              <text
                x={label.x}
                y={label.y + 5}
                textAnchor="middle"
                fill="#1f2937"
                fontSize="14"
                fontWeight="bold"
              >
                {label.number}
              </text>
            </g>
          ))}

          {/* Accessible seating indicators - CENTERED */}
          <g>
            {/* Left accessible strip */}
            <rect x="310" y="695" width="60" height="14" rx="3" fill="#3b82f6" />
            <text x="340" y="706" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">♿</text>
            
            {/* Center accessible strip */}
            <rect x="435" y="685" width="130" height="14" rx="3" fill="#3b82f6" />
            <text x="500" y="696" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">♿ ACCESSIBLE</text>
            
            {/* Right accessible strip */}
            <rect x="630" y="695" width="60" height="14" rx="3" fill="#3b82f6" />
            <text x="660" y="706" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">♿</text>
          </g>

          {/* Stage - CENTERED at bottom */}
          <rect x="320" y="830" width="360" height="50" fill="#1a1a1a" rx="0" />
          <text x="500" y="862" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
            STAGE
          </text>

          {/* Row labels on sides */}
          <text x="65" y="500" fill="#6b7280" fontSize="10" fontWeight="bold" transform="rotate(-90, 65, 500)">
            SECTION 8
          </text>
          <text x="935" y="500" fill="#6b7280" fontSize="10" fontWeight="bold" transform="rotate(90, 935, 500)">
            SECTION 4
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredSeat && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1f2937',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 100,
          minWidth: '200px',
          textAlign: 'center',
        }}>
          <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
            {hoveredSeat.sectionName}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Row {hoveredSeat.row}, Seat {hoveredSeat.number}
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#10b981',
            marginTop: '6px',
          }}>
            ${hoveredSeat.price}
          </div>
          {!isSeatAvailable(hoveredSeat) && (
            <div style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>
              RESERVED
            </div>
          )}
          {hoveredSeat.isAccessible && (
            <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>
              ♿ Accessible Seating
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{
        background: 'white',
        padding: '12px 16px',
        borderRadius: '0 0 12px 12px',
        borderTop: '1px solid #e5e7eb',
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '16px', 
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', background: '#4ade80', borderRadius: '3px' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>PIT - X1</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', background: '#3b82f6', borderRadius: '3px' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>CIRCLE - X2,X3,X4</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', background: '#92400e', borderRadius: '3px' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>ORCHESTRA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', background: '#d97706', borderRadius: '3px' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>TERRACE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ 
              width: '14px', 
              height: '14px', 
              background: '#3b82f6', 
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'white',
            }}>♿</div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>ACCESSIBLE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', background: '#10b981', borderRadius: '3px' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>SELECTED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', background: '#1a1a1a', borderRadius: '3px' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>RESERVED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmphitheaterSeatingMap;
