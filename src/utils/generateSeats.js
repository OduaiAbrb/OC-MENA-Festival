/**
 * Generate amphitheater seats matching Pacific Amphitheatre layout
 * Sections: Pit (X1), Circle (X2-X4), Orchestra (1-3), Terrace (1,4-8)
 * Based on exact reference image
 */

const generateAmphitheaterSeats = () => {
  const seats = [];
  const centerX = 500;
  const centerY = 650; // Adjusted for proper stage positioning
  
  // Section configurations matching reference image exactly
  const sections = [
    // PIT X1 - Green section at front (standing room)
    {
      id: 'pit-x1',
      name: 'Pit X1',
      type: 'standing',
      price: 299,
      tier: 'PIT',
      rows: 8,
      seatsPerRow: 20,
      startX: centerX - 80,
      startY: centerY - 100,
      spacing: 8
    },
    
    // CIRCLE - X2, X3, X4 (Blue accessible sections)
    {
      id: 'circle-x2',
      name: 'Circle X2',
      type: 'curved',
      price: 249,
      tier: 'CIRCLE',
      rows: 3,
      seatsPerRow: 22,
      startAngle: -70,
      endAngle: -30,
      baseRadius: 120,
      rowSpacing: 8,
      accessible: true
    },
    {
      id: 'circle-x3',
      name: 'Circle X3',
      type: 'curved',
      price: 249,
      tier: 'CIRCLE',
      rows: 3,
      seatsPerRow: 20,
      startAngle: -22,
      endAngle: 22,
      baseRadius: 120,
      rowSpacing: 8,
      accessible: true
    },
    {
      id: 'circle-x4',
      name: 'Circle X4',
      type: 'curved',
      price: 249,
      tier: 'CIRCLE',
      rows: 3,
      seatsPerRow: 22,
      startAngle: 30,
      endAngle: 70,
      baseRadius: 120,
      rowSpacing: 8,
      accessible: true
    },
    
    // ORCHESTRA - Sections 1, 2, 3 (Dark red/brown)
    {
      id: 'orch-1',
      name: 'Orchestra 1',
      type: 'curved',
      price: 199,
      tier: 'ORCHESTRA',
      rows: 28,
      seatsPerRow: 26,
      startAngle: -90,
      endAngle: -60,
      baseRadius: 160,
      rowSpacing: 6
    },
    {
      id: 'orch-2',
      name: 'Orchestra 2',
      type: 'curved',
      price: 229,
      tier: 'ORCHESTRA',
      rows: 30,
      seatsPerRow: 35,
      startAngle: -28,
      endAngle: 28,
      baseRadius: 160,
      rowSpacing: 6
    },
    {
      id: 'orch-3',
      name: 'Orchestra 3',
      type: 'curved',
      price: 199,
      tier: 'ORCHESTRA',
      rows: 28,
      seatsPerRow: 26,
      startAngle: 60,
      endAngle: 90,
      baseRadius: 160,
      rowSpacing: 6
    },
    
    // TERRACE - Sections 1, 4, 5, 6, 7, 8 (Orange/tan)
    {
      id: 'terr-8',
      name: 'Terrace 8',
      type: 'curved',
      price: 149,
      tier: 'TERRACE',
      rows: 32,
      seatsPerRow: 24,
      startAngle: -120,
      endAngle: -95,
      baseRadius: 340,
      rowSpacing: 5.5
    },
    {
      id: 'terr-1',
      name: 'Terrace 1',
      type: 'curved',
      price: 149,
      tier: 'TERRACE',
      rows: 32,
      seatsPerRow: 28,
      startAngle: -95,
      endAngle: -65,
      baseRadius: 340,
      rowSpacing: 5.5
    },
    {
      id: 'terr-7',
      name: 'Terrace 7',
      type: 'curved',
      price: 139,
      tier: 'TERRACE',
      rows: 32,
      seatsPerRow: 26,
      startAngle: -65,
      endAngle: -35,
      baseRadius: 340,
      rowSpacing: 5.5
    },
    {
      id: 'terr-6',
      name: 'Terrace 6',
      type: 'curved',
      price: 99,
      tier: 'TERRACE',
      rows: 38,
      seatsPerRow: 42,
      startAngle: -32,
      endAngle: 32,
      baseRadius: 340,
      rowSpacing: 5.5
    },
    {
      id: 'terr-5',
      name: 'Terrace 5',
      type: 'curved',
      price: 139,
      tier: 'TERRACE',
      rows: 32,
      seatsPerRow: 26,
      startAngle: 35,
      endAngle: 65,
      baseRadius: 340,
      rowSpacing: 5.5
    },
    {
      id: 'terr-4',
      name: 'Terrace 4',
      type: 'curved',
      price: 139,
      tier: 'TERRACE',
      rows: 32,
      seatsPerRow: 28,
      startAngle: 65,
      endAngle: 95,
      baseRadius: 340,
      rowSpacing: 5.5
    }
  ];
  
  sections.forEach(section => {
    if (section.type === 'standing') {
      // Grid layout for pit
      for (let row = 0; row < section.rows; row++) {
        for (let col = 0; col < section.seatsPerRow; col++) {
          const seatNum = row * section.seatsPerRow + col + 1;
          seats.push({
            id: `${section.id}-GA-${seatNum}`,
            section: section.id,
            sectionName: section.name,
            row: 'GA',
            number: seatNum,
            x: section.startX + (col * section.spacing),
            y: section.startY + (row * section.spacing),
            type: 'STANDING',
            isAccessible: false,
            priceTier: section.tier,
            price: section.price
          });
        }
      }
    } else if (section.type === 'curved') {
      // Curved sections
      for (let row = 0; row < section.rows; row++) {
        const radius = section.baseRadius + (row * section.rowSpacing);
        const rowLetter = String.fromCharCode(65 + row); // A, B, C...
        const angleRange = section.endAngle - section.startAngle;
        const seatsInRow = Math.floor(section.seatsPerRow + (row * 0.5));
        
        for (let seatNum = 0; seatNum < seatsInRow; seatNum++) {
          const angleOffset = seatsInRow > 1 
            ? (seatNum / (seatsInRow - 1)) * angleRange 
            : angleRange / 2;
          const angle = (section.startAngle + angleOffset - 90) * (Math.PI / 180);
          
          // Mark some seats as accessible (first 2 rows in accessible sections)
          const isAccessible = section.accessible && row < 2;
          
          seats.push({
            id: `${section.id}-${rowLetter}-${seatNum + 1}`,
            section: section.id,
            sectionName: section.name,
            row: rowLetter,
            number: seatNum + 1,
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            type: isAccessible ? 'ACCESSIBLE' : 'STANDARD',
            isAccessible: isAccessible,
            priceTier: section.tier,
            price: section.price
          });
        }
      }
    }
  });
  
  console.log(`Generated ${seats.length} seats`);
  return seats;
};

// Export the generator function and pre-generated seats
export default generateAmphitheaterSeats();
