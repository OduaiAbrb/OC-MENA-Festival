/**
 * Quadtree for efficient spatial indexing of seats
 * Enables fast hit-testing without looping through all 8k seats
 */
class Quadtree {
  constructor(bounds, capacity = 4) {
    this.bounds = bounds; // {x, y, width, height}
    this.capacity = capacity;
    this.seats = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  subdivide() {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;

    this.northeast = new Quadtree({ x: x + w, y: y, width: w, height: h }, this.capacity);
    this.northwest = new Quadtree({ x: x, y: y, width: w, height: h }, this.capacity);
    this.southeast = new Quadtree({ x: x + w, y: y + h, width: w, height: h }, this.capacity);
    this.southwest = new Quadtree({ x: x, y: y + h, width: w, height: h }, this.capacity);

    this.divided = true;
  }

  insert(seat) {
    if (!this.contains(seat)) {
      return false;
    }

    if (this.seats.length < this.capacity) {
      this.seats.push(seat);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northeast.insert(seat) ||
      this.northwest.insert(seat) ||
      this.southeast.insert(seat) ||
      this.southwest.insert(seat)
    );
  }

  contains(seat) {
    return (
      seat.x >= this.bounds.x &&
      seat.x < this.bounds.x + this.bounds.width &&
      seat.y >= this.bounds.y &&
      seat.y < this.bounds.y + this.bounds.height
    );
  }

  query(range, found = []) {
    if (!this.intersects(range)) {
      return found;
    }

    for (const seat of this.seats) {
      if (this.pointInRange(seat, range)) {
        found.push(seat);
      }
    }

    if (this.divided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }

    return found;
  }

  intersects(range) {
    return !(
      range.x > this.bounds.x + this.bounds.width ||
      range.x + range.width < this.bounds.x ||
      range.y > this.bounds.y + this.bounds.height ||
      range.y + range.height < this.bounds.y
    );
  }

  pointInRange(seat, range) {
    return (
      seat.x >= range.x &&
      seat.x <= range.x + range.width &&
      seat.y >= range.y &&
      seat.y <= range.y + range.height
    );
  }

  findNearest(x, y, maxRadius = 20) {
    const range = {
      x: x - maxRadius,
      y: y - maxRadius,
      width: maxRadius * 2,
      height: maxRadius * 2
    };

    const candidates = this.query(range);
    let nearest = null;
    let minDist = maxRadius;

    for (const seat of candidates) {
      const dist = Math.sqrt((seat.x - x) ** 2 + (seat.y - y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = seat;
      }
    }

    return nearest;
  }
}

export default Quadtree;
