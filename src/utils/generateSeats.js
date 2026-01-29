/**
 * Generate 8000+ amphitheater seats programmatically
 * Sections: Pit (X1), Circle (X2-X4), Orchestra (1-3), Terrace (1,4-8)
 */

const generateAmphitheaterSeats = () => {
  const seats = [];
  const centerX = 500;
  const centerY = 500;
  
  // Section configurations matching venue layout
  const sections = [
    // PIT X1 - Standing room (150 spots in grid)
    {
      id: 'pit-x1',
      name: 'Pit X1',
      type: 'standing',
      price: 299,
      tier: 'PIT',
      rows: 10,
      seatsPerRow: 15,
      startX: centerX - 60,
      startY: centerY - 80,
      spacing: 8
    },
    
    // CIRCLE - X2, X3, X4 (Premium accessible)
    {
      id: 'circle-x2',
      name: 'Circle X2',
      type: 'curved',
      price: 249,
      tier: 'CIRCLE',
      rows: 4,
      seatsPerRow: 30,
      startAngle: -55,
      endAngle: -20,
      baseRadius: 140,
      rowSpacing: 10,
      accessible: true
    },
    {
      id: 'circle-x3',
      name: 'Circle X3',
      type: 'curved',
      price: 249,
      tier: 'CIRCLE',
      rows: 4,
      seatsPerRow: 25,
      startAngle: -15,
      endAngle: 15,
      baseRadius: 140,
      rowSpacing: 10,
      accessible: true
    },
    {
      id: 'circle-x4',
      name: 'Circle X4',
      type: 'curved',
      price: 249,
      tier: 'CIRCLE',
      rows: 4,
      seatsPerRow: 30,
      startAngle: 20,
      endAngle: 55,
      baseRadius: 140,
      rowSpacing: 10,
      accessible: true
    },
    
    // ORCHESTRA - Sections 1, 2, 3
    {
      id: 'orch-1',
      name: 'Orchestra 1',
      type: 'curved',
      price: 199,
      tier: 'ORCHESTRA',
      rows: 25,
      seatsPerRow: 28,
      startAngle: -85,
      endAngle: -55,
      baseRadius: 200,
      rowSpacing: 8
    },
    {
      id: 'orch-2',
      name: 'Orchestra 2',
      type: 'curved',
      price: 229,
      tier: 'ORCHESTRA',
      rows: 25,
      seatsPerRow: 32,
      startAngle: -25,
      endAngle: 25,
      baseRadius: 200,
      rowSpacing: 8
    },
    {
      id: 'orch-3',
      name: 'Orchestra 3',
      type: 'curved',
      price: 199,
      tier: 'ORCHESTRA',
      rows: 25,
      seatsPerRow: 28,
      startAngle: 55,
      endAngle: 85,
      baseRadius: 200,
      rowSpacing: 8
    },
    
    // TERRACE - Sections 1, 4, 5, 6, 7, 8
    {
      id: 'terr-1',
      name: 'Terrace 1',
      type: 'curved',
      price: 149,
      tier: 'TERRACE',
      rows: 35,
      seatsPerRow: 32,
      startAngle: -85,
      endAngle: -55,
      baseRadius: 380,
      rowSpacing: 7
    },
    {
      id: 'terr-4',
      name: 'Terrace 4',
      type: 'curved',
      price: 139,
      tier: 'TERRACE',
      rows: 35,
      seatsPerRow: 32,
      startAngle: 55,
      endAngle: 85,
      baseRadius: 380,
      rowSpacing: 7
    },
    {
      id: 'terr-5',
      name: 'Terrace 5',
      type: 'curved',
      price: 139,
      tier: 'TERRACE',
      rows: 35,
      seatsPerRow: 30,
      startAngle: 30,
      endAngle: 55,
      baseRadius: 380,
      rowSpacing: 7
    },
    {
      id: 'terr-6',
      name: 'Terrace 6',
      type: 'curved',
      price: 99,
      tier: 'TERRACE',
      rows: 40,
      seatsPerRow: 45,
      startAngle: -25,
      endAngle: 25,
      baseRadius: 380,
      rowSpacing: 7
    },
    {
      id: 'terr-7',
      name: 'Terrace 7',
      type: 'curved',
      price: 139,
      tier: 'TERRACE',
      rows: 35,
      seatsPerRow: 30,
      startAngle: -55,
      endAngle: -30,
      baseRadius: 380,
      rowSpacing: 7
    },
    {
      id: 'terr-8',
      name: 'Terrace 8',
      type: 'curved',
      price: 149,
      tier: 'TERRACE',
      rows: 35,
      seatsPerRow: 28,
      startAngle: -100,
      endAngle: -85,
      baseRadius: 380,
      rowSpacing: 7
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

// Generate and export
const amphitheaterSeats = generateAmphitheaterSeats();
export default amphitheaterSeats;
