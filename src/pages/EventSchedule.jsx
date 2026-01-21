import React, { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
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
    <div className="page-wrapper">
      <AnnouncementBar />
      
      {/* Hero Section with Background */}
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        {/* Torn Paper Card */}
        <div className="torn-paper-card">
          <h1 className="card-title">Event Schedule</h1>
          <p className="card-description" style={{ textAlign: 'center' }}>
            The countdown is on. Our full lineup of performances, experiences, and special moments will be announced soon. Get ready to plan your day, discover new favorites, and catch every unforgettable moment at OC MENA Festival.
          </p>

          <div className="newsletter-section">
            <h3 className="newsletter-heading">Subscribe to our newsletter to stay informed!</h3>
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@email.com"
                required
                className="newsletter-input"
              />
              <button type="submit" className="btn-primary newsletter-btn">
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Lanterns */}
        <div className="lanterns-container">
          <img src="/lanterns.png" alt="Festival Lanterns" className="lanterns-image" />
        </div>
      </section>

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* Footer */}
      <Footer />
      
      <ScrollToTop />
    </div>
  );
};

export default EventSchedule;
