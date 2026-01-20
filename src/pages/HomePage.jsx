import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const targetDate = new Date('June 19, 2026 00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-video-container">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="hero-video"
          >
            <source src="/video_design.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          {/* Large Logo */}
          <div className="hero-logo">
            <img src="/logo.png" alt="OC MENA Festival" className="hero-logo-image" />
          </div>
          
          <div className="hero-badge">SUMMER 2026</div>
          <h1 className="hero-title">OC MENA Festival</h1>
          <div className="hero-date">
            <span className="date-icon">📅</span>
            June 19-21, 2026 • Orange County, CA
          </div>
          <p className="hero-description">
            Experience three days of Middle Eastern and North African (MENA) culture, 
            food, music, rides, shopping, and family-friendly fun—all in one lively 
            summer festival.
          </p>

          {/* Countdown Timer */}
          <div className="countdown">
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.days).padStart(3, '0')}</div>
              <div className="countdown-label">days</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="countdown-label">hrs</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="countdown-label">mins</div>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-item">
              <div className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="countdown-label">sec</div>
            </div>
          </div>

          <div className="hero-buttons">
            <Link to="/vendors" className="btn-secondary">Vendor Sign Up</Link>
            <Link to="/#tickets" className="btn-primary">Get Tickets</Link>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="experience-section">
        <div className="container">
          <h2 className="section-title">Experience the Magic</h2>
          <p className="section-subtitle">
            Immerse yourself in the vibrant traditions, flavors, and artistry of the MENA region
          </p>

          <div className="experience-grid">
            <div className="experience-card">
              <div className="experience-icon">🎵</div>
              <h3>Live Music</h3>
              <p>World-class performances from renowned MENA artists and musicians</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🍽️</div>
              <h3>Authentic Cuisine</h3>
              <p>Savor traditional dishes and modern fusion from across the region</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🎨</div>
              <h3>Art & Culture</h3>
              <p>Explore stunning exhibitions, crafts, and cultural demonstrations</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🎢</div>
              <h3>Rides & Games</h3>
              <p>Family-friendly attractions and entertainment for all ages</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">🛍️</div>
              <h3>Vibrant Bazaar</h3>
              <p>Shop unique finds from local artisans and international vendors</p>
            </div>
            <div className="experience-card">
              <div className="experience-icon">💃</div>
              <h3>Dance & Performance</h3>
              <p>Traditional and contemporary dance showcasing MENA heritage</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title" style={{ textAlign: 'left' }}>About the Festival</h2>
              <p>
                The OC MENA Festival is a large-scale cultural celebration honoring the rich 
                traditions, creativity, and diversity of the Middle East and North Africa. 
                Held in the heart of Orange County, the festival brings communities together 
                through music, art, food, fashion, and immersive experiences that reflect both 
                heritage and modern culture.
              </p>
              <p>
                More than just a festival, OC MENA Festival is a gathering rooted in connection, 
                storytelling, and shared experiences. Over three summer days, guests can explore 
                vendor booths, enjoy authentic cuisine, experience live music and performances, 
                and discover the cultural threads that unite generations across the MENA region.
              </p>
              <Link to="/contact" className="btn-primary">Learn More</Link>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">3</div>
                <div className="stat-label">Days of Celebration</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100+</div>
                <div className="stat-label">Vendors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Performances</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">∞</div>
                <div className="stat-label">Memories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="tickets" className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience OC MENA Festival?</h2>
            <p>Secure your tickets now and be part of Orange County's premier cultural celebration</p>
            <div className="cta-buttons">
              <Link to="/#tickets" className="btn-primary btn-large">Get Tickets Now</Link>
              <Link to="/event-schedule" className="btn-secondary btn-large">View Schedule</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default HomePage;
