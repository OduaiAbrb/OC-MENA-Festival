import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Circle, Rect, Text } from 'react-konva';
import amphitheaterSeats from '../utils/generateSeats';

/**
 * High-performance Canvas-based amphitheater seating
 * Uses react-konva for GPU rendering with viewport culling
 */
const AmphitheaterCanvas = ({ 
  onSeatSelect, 
  selectedSeats = [], 
  unavailableSeats = [],
  ticketQuantity = 1 
}) => {
  const stageRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [visibleSeats, setVisibleSeats] = useState([]);

  // Viewport culling - only render seats in view
  const updateVisibleSeats = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const viewport = {
      x: -position.x / scale,
      y: -position.y / scale,
      width: dimensions.width / scale,
      height: dimensions.height / scale
    };

    const padding = 100; // Extra padding for smooth scrolling
    const visible = amphitheaterSeats.filter(seat => {
      return seat.x >= viewport.x - padding &&
             seat.x <= viewport.x + viewport.width + padding &&
             seat.y >= viewport.y - padding &&
             seat.y <= viewport.y + viewport.height + padding;
    });

    setVisibleSeats(visible);
  }, [position, scale, dimensions]);

  useEffect(() => {
    updateVisibleSeats();
  }, [updateVisibleSeats]);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 
      ? Math.min(oldScale * scaleBy, 4) 
      : Math.max(oldScale / scaleBy, 0.5);

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleSeatClick = (seat) => {
    if (unavailableSeats.includes(seat.id)) return;
    onSeatSelect(seat);
  };

  const getSeatColor = (seat) => {
    if (unavailableSeats.includes(seat.id)) return '#9ca3af';
    if (selectedSeats.find(s => s.id === seat.id)) return '#10b981';
    
    // Color by tier
    switch (seat.priceTier) {
      case 'PIT': return '#10b981';
      case 'CIRCLE': return '#3b82f6';
      case 'ORCHESTRA': return '#991b1b';
      case 'TERRACE': return '#d97706';
      default: return '#6b7280';
    }
  };

  const getSeatRadius = (seat) => {
    if (seat.type === 'ACCESSIBLE') return 4;
    if (seat.type === 'STANDING') return 2.5;
    return 3;
  };

  return (
    <div id="canvas-container" style={{ width: '100%', height: '600px', background: '#0f172a', borderRadius: '12px', overflow: 'hidden' }}>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={(e) => {
          setPosition({
            x: e.target.x(),
            y: e.target.y()
          });
        }}
      >
        <Layer>
          {/* Stage */}
          <Rect
            x={380}
            y={350}
            width={240}
            height={60}
            fill="#1e1e2e"
            stroke="#444"
            strokeWidth={3}
            cornerRadius={5}
          />
          <Text
            x={500}
            y={375}
            text="STAGE"
            fontSize={20}
            fill="#888"
            fontStyle="bold"
            align="center"
            offsetX={30}
          />

          {/* Seats - only render visible ones */}
          {visibleSeats.map(seat => (
            <Circle
              key={seat.id}
              x={seat.x}
              y={seat.y}
              radius={getSeatRadius(seat)}
              fill={getSeatColor(seat)}
              stroke={hoveredSeat?.id === seat.id ? '#fff' : 'transparent'}
              strokeWidth={1}
              opacity={unavailableSeats.includes(seat.id) ? 0.3 : 1}
              onClick={() => handleSeatClick(seat)}
              onMouseEnter={() => setHoveredSeat(seat)}
              onMouseLeave={() => setHoveredSeat(null)}
              cursor={unavailableSeats.includes(seat.id) ? 'not-allowed' : 'pointer'}
            />
          ))}

          {/* Hover tooltip */}
          {hoveredSeat && (
            <>
              <Rect
                x={hoveredSeat.x + 10}
                y={hoveredSeat.y - 30}
                width={120}
                height={50}
                fill="#1a1a1a"
                cornerRadius={4}
                opacity={0.95}
              />
              <Text
                x={hoveredSeat.x + 15}
                y={hoveredSeat.y - 25}
                text={`${hoveredSeat.sectionName}\nRow ${hoveredSeat.row}, Seat ${hoveredSeat.number}\n$${hoveredSeat.price}`}
                fontSize={11}
                fill="#fff"
                lineHeight={1.4}
              />
            </>
          )}
        </Layer>
      </Stage>

      {/* Controls overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.7)',
        padding: '8px',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setScale(Math.min(scale * 1.2, 4))}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          +
        </button>
        <button
          onClick={() => setScale(Math.max(scale / 1.2, 0.5))}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Reset
        </button>
      </div>

      {/* Performance indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '11px'
      }}>
        Rendering {visibleSeats.length} / {amphitheaterSeats.length} seats
      </div>
    </div>
  );
};

export default AmphitheaterCanvas;
