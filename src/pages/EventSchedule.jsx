import React, { useState } from 'react';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './EventSchedule.css';

const EventSchedule = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Submit as a contact form with newsletter subject
      const result = await api.submitContact({
        first_name: 'Newsletter',
        last_name: 'Subscriber',
        email: email,
        subject: 'GENERAL_QUESTION',
        message: 'Newsletter signup - wants to be notified when lineup is announced.'
      });

      if (result?.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(result?.error?.message || 'Failed to subscribe');
      }
    } catch (err) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      {/* Hero Section with Background */}
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        {/* Torn Paper Card */}
        <TornPaperWrapper>
          <h1 className="card-title">Event Schedule</h1>
          <p className="card-description" style={{ textAlign: 'center' }}>
            The countdown is on. Our full lineup of performances, experiences, and special moments will be announced soon. Get ready to plan your day, discover new favorites, and catch every unforgettable moment at OC MENA Festival.
          </p>

          {/* Newsletter Section - At bottom of card, centered */}
          <div className="newsletter-section" style={{ marginTop: '40px', textAlign: 'center' }}>
            <h3 className="newsletter-heading">Subscribe to our newsletter to stay informed!</h3>
            {success ? (
              <div className="success-message" style={{color: '#27ae60', textAlign: 'center', padding: '1rem'}}>
                Thank you for subscribing! We'll notify you when the lineup is announced.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="newsletter-form" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@email.com"
                  required
                  className="newsletter-input"
                  disabled={loading}
                  style={{ width: '100%', maxWidth: '450px', padding: '14px 16px', border: '2px solid #808080', borderRadius: '4px', fontSize: '14px', outline: 'none', transition: 'all 0.3s ease', fontFamily: 'inherit' }}
                />
                <button type="submit" className="btn-primary newsletter-btn" disabled={loading} style={{ 
                  backgroundColor: '#dc2626', 
                  color: '#ffffff', 
                  padding: '12px 45px', 
                  border: '1px solid #dc2626', 
                  borderRadius: '25px', 
                  fontSize: '15px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  textDecoration: 'none', 
                  transition: 'all 0.3s ease', 
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'inherit',
                  width: '100%',
                  maxWidth: '450px'
                }}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </form>
            )}
            {error && <div className="error-message" style={{color: '#e74c3c', textAlign: 'center', marginTop: '0.5rem'}}>{error}</div>}
          </div>
        </TornPaperWrapper>

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
