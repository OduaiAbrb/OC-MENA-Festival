import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Circle, Rect, Text } from 'react-konva';
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
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    
    // Transform screen coords to world coords
    const worldX = (pointerPos.x - position.x) / scale;
    const worldY = (pointerPos.y - position.y) / scale;
    
    // Use quadtree for fast hit-testing
    if (quadtreeRef.current) {
      const clickedSeat = quadtreeRef.current.findNearest(worldX, worldY, 8 / scale);
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
        {/* Layer 1: Background */}
        <Layer>
          <Rect x={0} y={0} width={1000} height={1100} fill="#0f172a" listening={false} />
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

        {/* Layer 6: Overlays (Stage, Labels, ADA Banner, Tooltip) */}
        <Layer>
          {/* Stage */}
          <Rect
            x={bounds.centerX - 120}
            y={bounds.minY + 50}
            width={240}
            height={50}
            fill="#1e1e2e"
            stroke="#444"
            strokeWidth={3}
            cornerRadius={5}
            listening={false}
          />
          <Text
            x={bounds.centerX}
            y={bounds.minY + 68}
            text="STAGE"
            fontSize={18}
            fill="#888"
            fontStyle="bold"
            align="center"
            offsetX={27}
            listening={false}
          />
          
          {/* ADA Banner - High Contrast */}
          <Rect
            x={bounds.centerX - 180}
            y={bounds.minY + 200}
            width={360}
            height={35}
            fill="#1e40af"
            opacity={0.9}
            cornerRadius={6}
            listening={false}
          />
          <Text
            x={bounds.centerX}
            y={bounds.minY + 209}
            text="♿ ACCESSIBLE SEATING AVAILABLE"
            fontSize={13}
            fill="#fff"
            fontStyle="bold"
            align="center"
            offsetX={110}
            listening={false}
          />

          {/* Section Labels with Pills */}
          <Rect x={bounds.centerX - 25} y={bounds.minY + 170} width={50} height={20} fill="#10b981" opacity={0.8} cornerRadius={10} listening={false} />
          <Text x={bounds.centerX} y={bounds.minY + 174} text="PIT" fontSize={12} fill="#fff" fontStyle="bold" align="center" offsetX={12} listening={false} />

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

      {/* Navigation Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Pan Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 40px)',
          gap: '4px',
          background: 'rgba(0,0,0,0.7)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <div></div>
          <button
            onClick={() => setPosition(prev => ({ ...prev, y: prev.y + 50 }))}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Pan Up (↑)"
          >
            ↑
          </button>
          <div></div>
          <button
            onClick={() => setPosition(prev => ({ ...prev, x: prev.x + 50 }))}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Pan Left (←)"
          >
            ←
          </button>
          <button
            onClick={() => {
              setScale(1);
              const offsetX = dimensions.width / 2 - bounds.centerX;
              const offsetY = dimensions.height / 2 - bounds.centerY;
              setPosition({ x: offsetX, y: offsetY });
            }}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 'bold'
            }}
            title="Reset View"
          >
            ⌂
          </button>
          <button
            onClick={() => setPosition(prev => ({ ...prev, x: prev.x - 50 }))}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Pan Right (→)"
          >
            →
          </button>
          <div></div>
          <button
            onClick={() => setPosition(prev => ({ ...prev, y: prev.y - 50 }))}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Pan Down (↓)"
          >
            ↓
          </button>
          <div></div>
        </div>
        
        {/* Zoom Controls */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(0,0,0,0.7)',
          padding: '8px',
          borderRadius: '8px'
        }}>
          <button
            onClick={() => setScale(Math.max(scale / 1.2, 0.5))}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
            title="Zoom Out (-)"
          >
            −
          </button>
          <div style={{
            background: '#fff',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {Math.round(scale * 100)}%
          </div>
          <button
            onClick={() => setScale(Math.min(scale * 1.2, 4))}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
            title="Zoom In (+)"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Keyboard hint */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '11px',
        maxWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Keyboard:</div>
        <div>Arrow keys: Pan</div>
        <div>+/- keys: Zoom</div>
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
        Rendering {Object.values(visibleSeats).reduce((sum, arr) => sum + arr.length, 0)} / {amphitheaterSeats.length} seats
      </div>
    </div>
  );
};

export default AmphitheaterCanvas;
