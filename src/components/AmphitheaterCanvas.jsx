import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Circle, Rect, Text, Line } from 'react-konva';
import amphitheaterSeats from '../utils/generateSeats';
import Quadtree from '../utils/quadtree';

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
  const quadtreeRef = useRef(null);
  const hoverThrottleRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [visibleSeats, setVisibleSeats] = useState({ terrace: [], orchestra: [], circle: [], pit: [] });
  const zoomTimeoutRef = useRef(null);

  // Compute global bounds and build quadtree
  const { bounds, quadtree } = useMemo(() => {
    if (amphitheaterSeats.length === 0) {
      return { bounds: { minX: 0, maxX: 1000, minY: 0, maxY: 1000, centerX: 500, centerY: 500 }, quadtree: null };
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    amphitheaterSeats.forEach(seat => {
      minX = Math.min(minX, seat.x);
      maxX = Math.max(maxX, seat.x);
      minY = Math.min(minY, seat.y);
      maxY = Math.max(maxY, seat.y);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = maxX - minX + 100;
    const height = maxY - minY + 100;

    const qt = new Quadtree({ x: minX - 50, y: minY - 50, width, height });
    amphitheaterSeats.forEach(seat => qt.insert(seat));

    return {
      bounds: { minX, maxX, minY, maxY, centerX, centerY, width, height },
      quadtree: qt
    };
  }, []);

  useEffect(() => {
    quadtreeRef.current = quadtree;
  }, [quadtree]);

  // Initialize centered position
  useEffect(() => {
    if (dimensions.width > 0 && bounds) {
      const offsetX = dimensions.width / 2 - bounds.centerX;
      const offsetY = dimensions.height / 2 - bounds.centerY;
      setPosition({ x: offsetX, y: offsetY });
    }
  }, [dimensions.width, dimensions.height, bounds]);

  // Viewport culling - only render seats in view, grouped by tier for layering
  const updateVisibleSeats = useCallback(() => {
    const viewport = {
      x: -position.x / scale,
      y: -position.y / scale,
      width: dimensions.width / scale,
      height: dimensions.height / scale
    };

    const padding = 150;
    const visible = { terrace: [], orchestra: [], circle: [], pit: [] };
    
    amphitheaterSeats.forEach(seat => {
      if (seat.x >= viewport.x - padding &&
          seat.x <= viewport.x + viewport.width + padding &&
          seat.y >= viewport.y - padding &&
          seat.y <= viewport.y + viewport.height + padding) {
        const tier = seat.priceTier.toLowerCase();
        if (visible[tier]) {
          visible[tier].push(seat);
        }
      }
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const panAmount = 50;
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setPosition(prev => ({ ...prev, y: prev.y + panAmount }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPosition(prev => ({ ...prev, y: prev.y - panAmount }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x + panAmount }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPosition(prev => ({ ...prev, x: prev.x - panAmount }));
          break;
        case '+':
        case '=':
          e.preventDefault();
          setScale(prev => Math.min(prev * 1.2, 4));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setScale(prev => Math.max(prev / 1.2, 0.5));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.05; // Smoother zoom
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
    
    // Debounce viewport update for performance
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      updateVisibleSeats();
    }, 100);
  };

  const handleStageClick = (e) => {
    // Prevent clicks on background elements
    if (e.target === e.target.getStage()) return;
    
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    if (!pointerPos) return;
    
    // Transform screen coords to world coords
    const worldX = (pointerPos.x - position.x) / scale;
    const worldY = (pointerPos.y - position.y) / scale;
    
    // Use quadtree for fast hit-testing with larger radius
    if (quadtreeRef.current) {
      const clickedSeat = quadtreeRef.current.findNearest(worldX, worldY, 15 / scale);
      if (clickedSeat && !unavailableSeats.includes(clickedSeat.id)) {
        onSeatSelect(clickedSeat);
      }
    }
  };

  const handleStageMouseMove = useCallback((e) => {
    // Throttle hover to 30fps max
    if (hoverThrottleRef.current) return;
    
    hoverThrottleRef.current = setTimeout(() => {
      hoverThrottleRef.current = null;
    }, 33); // ~30fps

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    const worldX = (pointerPos.x - position.x) / scale;
    const worldY = (pointerPos.y - position.y) / scale;
    
    if (quadtreeRef.current) {
      const hoveredSeat = quadtreeRef.current.findNearest(worldX, worldY, 10 / scale);
      setHoveredSeat(hoveredSeat);
    }
  }, [position, scale]);

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
        onClick={handleStageClick}
        onMouseMove={handleStageMouseMove}
        onDragEnd={(e) => {
          setPosition({
            x: e.target.x(),
            y: e.target.y()
          });
        }}
      >
        {/* Layer 1: Background and Section Boundaries */}
        <Layer>
          <Rect x={0} y={0} width={1000} height={1100} fill="#0f172a" listening={false} />
          
          {/* Gray section boundary arcs - matching reference image */}
          {/* Outer terrace boundary */}
          <Circle x={bounds.centerX} y={bounds.centerY} radius={520} stroke="#9ca3af" strokeWidth={3} listening={false} />
          {/* Orchestra boundary */}
          <Circle x={bounds.centerX} y={bounds.centerY} radius={340} stroke="#9ca3af" strokeWidth={3} listening={false} />
          {/* Circle boundary */}
          <Circle x={bounds.centerX} y={bounds.centerY} radius={160} stroke="#9ca3af" strokeWidth={3} listening={false} />
          {/* Pit boundary */}
          <Circle x={bounds.centerX} y={bounds.centerY} radius={120} stroke="#9ca3af" strokeWidth={2} listening={false} />
          
          {/* Radial aisle lines between sections */}
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(-2.09), bounds.centerY + 520 * Math.sin(-2.09)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(-1.66), bounds.centerY + 520 * Math.sin(-1.66)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(-1.14), bounds.centerY + 520 * Math.sin(-1.14)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(-0.61), bounds.centerY + 520 * Math.sin(-0.61)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(-0.52), bounds.centerY + 520 * Math.sin(-0.52)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(0.52), bounds.centerY + 520 * Math.sin(0.52)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(0.61), bounds.centerY + 520 * Math.sin(0.61)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(1.14), bounds.centerY + 520 * Math.sin(1.14)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(1.66), bounds.centerY + 520 * Math.sin(1.66)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
          <Line points={[bounds.centerX, bounds.centerY, bounds.centerX + 520 * Math.cos(2.09), bounds.centerY + 520 * Math.sin(2.09)]} stroke="#9ca3af" strokeWidth={3} listening={false} />
        </Layer>

        {/* Layer 2: Terrace Seats (yellow - bottom layer) */}
        <Layer>
          {visibleSeats.terrace?.map(seat => (
            <Circle
              key={seat.id}
              x={seat.x}
              y={seat.y}
              radius={getSeatRadius(seat)}
              fill={getSeatColor(seat)}
              stroke={hoveredSeat?.id === seat.id ? '#fff' : 'transparent'}
              strokeWidth={1}
              opacity={unavailableSeats.includes(seat.id) ? 0.3 : 1}
              listening={false}
              perfectDrawEnabled={false}
            />
          ))}
        </Layer>

        {/* Layer 3: Orchestra Seats (red) */}
        <Layer>
          {visibleSeats.orchestra?.map(seat => (
            <Circle
              key={seat.id}
              x={seat.x}
              y={seat.y}
              radius={getSeatRadius(seat)}
              fill={getSeatColor(seat)}
              stroke={hoveredSeat?.id === seat.id ? '#fff' : 'transparent'}
              strokeWidth={1}
              opacity={unavailableSeats.includes(seat.id) ? 0.3 : 1}
              listening={false}
              perfectDrawEnabled={false}
            />
          ))}
        </Layer>

        {/* Layer 4: Circle Seats (blue) */}
        <Layer>
          {visibleSeats.circle?.map(seat => (
            <Circle
              key={seat.id}
              x={seat.x}
              y={seat.y}
              radius={getSeatRadius(seat)}
              fill={getSeatColor(seat)}
              stroke={hoveredSeat?.id === seat.id ? '#fff' : 'transparent'}
              strokeWidth={1}
              opacity={unavailableSeats.includes(seat.id) ? 0.3 : 1}
              listening={false}
              perfectDrawEnabled={false}
            />
          ))}
        </Layer>

        {/* Layer 5: Pit Seats (green - top seat layer) */}
        <Layer>
          {visibleSeats.pit?.map(seat => (
            <Circle
              key={seat.id}
              x={seat.x}
              y={seat.y}
              radius={getSeatRadius(seat)}
              fill={getSeatColor(seat)}
              stroke={hoveredSeat?.id === seat.id ? '#fff' : 'transparent'}
              strokeWidth={1}
              opacity={unavailableSeats.includes(seat.id) ? 0.3 : 1}
              listening={false}
              perfectDrawEnabled={false}
            />
          ))}
        </Layer>

        {/* Layer 6: Overlays (Stage, Section Labels, Blue Accessible Strips, Tooltip) */}
        <Layer>
          {/* Stage - Black box at bottom */}
          <Rect
            x={bounds.centerX - 150}
            y={bounds.maxY + 20}
            width={300}
            height={60}
            fill="#1a1a1a"
            cornerRadius={0}
            listening={false}
          />
          <Text
            x={bounds.centerX}
            y={bounds.maxY + 43}
            text="STAGE"
            fontSize={24}
            fill="#fff"
            fontStyle="bold"
            align="center"
            offsetX={35}
            listening={false}
          />
          
          {/* Blue Accessible Seating Strips - matching reference image positions */}
          {/* Left accessible strip */}
          <Rect x={bounds.centerX - 200} y={bounds.centerY - 140} width={60} height={15} fill="#3b82f6" cornerRadius={3} listening={false} />
          <Text x={bounds.centerX - 170} y={bounds.centerY - 136} text="♿" fontSize={10} fill="#fff" align="center" offsetX={8} listening={false} />
          
          {/* Center accessible strip */}
          <Rect x={bounds.centerX - 80} y={bounds.centerY - 150} width={160} height={15} fill="#3b82f6" cornerRadius={3} listening={false} />
          <Text x={bounds.centerX} y={bounds.centerY - 146} text="♿ ACCESSIBLE" fontSize={10} fill="#fff" fontStyle="bold" align="center" offsetX={45} listening={false} />
          
          {/* Right accessible strip */}
          <Rect x={bounds.centerX + 140} y={bounds.centerY - 140} width={60} height={15} fill="#3b82f6" cornerRadius={3} listening={false} />
          <Text x={bounds.centerX + 170} y={bounds.centerY - 136} text="♿" fontSize={10} fill="#fff" align="center" offsetX={8} listening={false} />

          {/* Section Number Labels - White numbers on gray backgrounds */}
          {/* Section 8 */}
          <Text x={bounds.centerX - 420} y={bounds.centerY - 280} text="SECTION 8" fontSize={11} fill="#6b7280" fontStyle="bold" listening={false} />
          <Circle x={bounds.centerX - 400} y={bounds.centerY - 200} radius={20} fill="#9ca3af" listening={false} />
          <Text x={bounds.centerX - 400} y={bounds.centerY - 206} text="8" fontSize={18} fill="#fff" fontStyle="bold" align="center" offsetX={6} listening={false} />
          
          {/* Section 1 */}
          <Text x={bounds.centerX - 320} y={bounds.centerY - 350} text="SECTION 1" fontSize={11} fill="#6b7280" fontStyle="bold" listening={false} />
          <Circle x={bounds.centerX - 280} y={bounds.centerY - 250} radius={20} fill="#9ca3af" listening={false} />
          <Text x={bounds.centerX - 280} y={bounds.centerY - 256} text="1" fontSize={18} fill="#fff" fontStyle="bold" align="center" offsetX={6} listening={false} />
          
          {/* Section 7 */}
          <Text x={bounds.centerX - 200} y={bounds.centerY - 380} text="SECTION 7" fontSize={11} fill="#6b7280" fontStyle="bold" listening={false} />
          <Circle x={bounds.centerX - 160} y={bounds.centerY - 280} radius={20} fill="#9ca3af" listening={false} />
          <Text x={bounds.centerX - 160} y={bounds.centerY - 286} text="7" fontSize={18} fill="#fff" fontStyle="bold" align="center" offsetX={6} listening={false} />
          
          {/* Section 6 - Center top */}
          <Text x={bounds.centerX - 40} y={bounds.centerY - 420} text="SECTION 6" fontSize={11} fill="#6b7280" fontStyle="bold" listening={false} />
          <Circle x={bounds.centerX} y={bounds.centerY - 340} radius={20} fill="#9ca3af" listening={false} />
          <Text x={bounds.centerX} y={bounds.centerY - 346} text="6" fontSize={18} fill="#fff" fontStyle="bold" align="center" offsetX={6} listening={false} />
          
          {/* Section 5 */}
          <Text x={bounds.centerX + 140} y={bounds.centerY - 380} text="SECTION 5" fontSize={11} fill="#6b7280" fontStyle="bold" listening={false} />
          <Circle x={bounds.centerX + 160} y={bounds.centerY - 280} radius={20} fill="#9ca3af" listening={false} />
          <Text x={bounds.centerX + 160} y={bounds.centerY - 286} text="5" fontSize={18} fill="#fff" fontStyle="bold" align="center" offsetX={6} listening={false} />
          
          {/* Section 4 */}
          <Text x={bounds.centerX + 260} y={bounds.centerY - 350} text="SECTION 4" fontSize={11} fill="#6b7280" fontStyle="bold" listening={false} />
          <Circle x={bounds.centerX + 280} y={bounds.centerY - 250} radius={20} fill="#9ca3af" listening={false} />
          <Text x={bounds.centerX + 280} y={bounds.centerY - 256} text="4" fontSize={18} fill="#fff" fontStyle="bold" align="center" offsetX={6} listening={false} />
          
          {/* Orchestra/Circle section labels */}
          <Text x={bounds.centerX - 180} y={bounds.centerY - 100} text="1" fontSize={16} fill="#fff" fontStyle="bold" listening={false} />
          <Text x={bounds.centerX} y={bounds.centerY - 80} text="2" fontSize={16} fill="#fff" fontStyle="bold" listening={false} />
          <Text x={bounds.centerX + 180} y={bounds.centerY - 100} text="3" fontSize={16} fill="#fff" fontStyle="bold" listening={false} />

          {/* Hover tooltip */}
          {hoveredSeat && (
            <>
              <Rect
                x={hoveredSeat.x + 10}
                y={hoveredSeat.y - 35}
                width={130}
                height={55}
                fill="#1a1a1a"
                cornerRadius={6}
                opacity={0.95}
                shadowColor="#000"
                shadowBlur={10}
                shadowOpacity={0.5}
              />
              <Text
                x={hoveredSeat.x + 15}
                y={hoveredSeat.y - 28}
                text={`${hoveredSeat.sectionName}\nRow ${hoveredSeat.row}, Seat ${hoveredSeat.number}\n$${hoveredSeat.price}`}
                fontSize={11}
                fill="#fff"
                lineHeight={1.5}
              />
            </>
          )}
        </Layer>
      </Stage>


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
        Rendering {Object.values(visibleSeats).reduce((sum, arr) => sum + arr.length, 0)} / {amphitheaterSeats.length} seats
      </div>
    </div>
  );
};

export default AmphitheaterCanvas;
