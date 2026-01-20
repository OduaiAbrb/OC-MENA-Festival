import React, { useState } from 'react';
import './EventSchedule.css';

const EventSchedule = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
    alert('Thank you for subscribing! We\'ll notify you when the lineup is announced.');
  };

  return (
    <div className="event-schedule-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-content">
          <h1 className="page-title">Event Schedule</h1>
          <div className="title-decoration">
            <span className="deco-line"></span>
            <span className="deco-star">✦</span>
            <span className="deco-line"></span>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="schedule-countdown">
        <div className="container">
          <div className="countdown-content">
            <div className="countdown-icon">🗓️</div>
            <h2>The Countdown Is On</h2>
            <p>
              Our full lineup of performances, experiences, and special moments will be 
              announced soon. Get ready to plan your day, discover new favorites, and 
              catch every unforgettable moment at OC MENA Festival.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="coming-soon-section">
        <div className="container">
          <div className="coming-soon-grid">
            <div className="schedule-preview-card">
              <div className="preview-day">Day 1</div>
              <div className="preview-date">June 19, 2026</div>
              <div className="preview-status">Coming Soon</div>
              <div className="preview-teaser">
                <span>🎵</span> Live Performances
                <span>🍽️</span> Food Village
                <span>🎨</span> Art Exhibits
              </div>
            </div>
            
            <div className="schedule-preview-card">
              <div className="preview-day">Day 2</div>
              <div className="preview-date">June 20, 2026</div>
              <div className="preview-status">Coming Soon</div>
              <div className="preview-teaser">
                <span>💃</span> Dance Shows
                <span>🎪</span> Family Fun
                <span>🛍️</span> Vendor Market
              </div>
            </div>
            
            <div className="schedule-preview-card">
              <div className="preview-day">Day 3</div>
              <div className="preview-date">June 21, 2026</div>
              <div className="preview-status">Coming Soon</div>
              <div className="preview-teaser">
                <span>🎉</span> Grand Finale
                <span>🎶</span> Special Guests
                <span>✨</span> Closing Ceremony
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="schedule-newsletter">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-icon">📧</div>
            <h2>Subscribe to Our Newsletter</h2>
            <p>Be the first to know when we announce our full lineup and schedule!</p>
            
            <form onSubmit={handleSubmit} className="schedule-newsletter-form">
              <label htmlFor="schedule-email">Email</label>
              <div className="form-group">
                <input
                  type="email"
                  id="schedule-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@email.com"
                  required
                />
                <button type="submit" className="btn-primary">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="what-to-expect">
        <div className="container">
          <h2 className="section-title">What to Expect</h2>
          <p className="section-subtitle">
            Three days packed with unforgettable experiences
          </p>
          
          <div className="expect-grid">
            <div className="expect-item">
              <div className="expect-icon">🎵</div>
              <h3>Live Music</h3>
              <p>Multiple stages featuring artists from across the MENA region</p>
            </div>
            <div className="expect-item">
              <div className="expect-icon">🍖</div>
              <h3>Food & Drinks</h3>
              <p>Authentic cuisine from 20+ countries</p>
            </div>
            <div className="expect-item">
              <div className="expect-icon">🎭</div>
              <h3>Cultural Shows</h3>
              <p>Traditional and contemporary performances</p>
            </div>
            <div className="expect-item">
              <div className="expect-icon">👨‍👩‍👧‍👦</div>
              <h3>Family Zone</h3>
              <p>Activities and entertainment for all ages</p>
            </div>
            <div className="expect-item">
              <div className="expect-icon">🛒</div>
              <h3>Shopping</h3>
              <p>Unique finds from local and international vendors</p>
            </div>
            <div className="expect-item">
              <div className="expect-icon">📸</div>
              <h3>Photo Ops</h3>
              <p>Instagram-worthy moments throughout the venue</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventSchedule;
