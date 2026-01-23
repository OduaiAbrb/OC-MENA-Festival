import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import './HomePage.css';

const HomePage = ({ onGetTicketsClick }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

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

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="hero-background-wrapper">
          <video 
            src="/background.mp4" 
            alt="OC MENA Festival" 
            className="hero-background-video"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="hero-gradient-overlay"></div>
        </div>

        <div className="hero-content" style={{ paddingTop: '135px' }}>
          <h1 className="hero-title">OC MENA Festival</h1>
          <p className="hero-subtitle">June 19-21, 2026. Orange County, CA</p>
          <p className="hero-description">
            Experience three days of Middle Eastern and North African (MENA) culture, food, music, rides, shopping, and family-friendly fun—all in one lively summer festival.
          </p>

          {/* Countdown */}
          <div className="countdown-container">
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.days}</span>
              <span className="countdown-label">days</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.hours}</span>
              <span className="countdown-label">hrs</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.minutes}</span>
              <span className="countdown-label">mins</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.seconds}</span>
              <span className="countdown-label">sec</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <Link to="/vendors" className="btn-outline-white">Vendor sign up</Link>
            <Link to="/tickets" className="btn-primary-red">Get Tickets</Link>
          </div>
        </div>

        {/* Everything in One Torn Paper Card */}
        <div className="main-content-section">
          <img src="/paper-torn-top.png" alt="Torn paper top" className="torn-paper-top" />
          <div className="torn-paper-card main-card">
            {/* Poster */}
            <div className="poster-section">
              <img src="/poster-c-767x1024.png" alt="OC MENA Festival Poster" className="poster-image" />
            </div>

            {/* Welcome Text */}
            <div className="welcome-content">
              <h2 className="welcome-title">Welcome to OC MENA Festival</h2>
              <p className="welcome-text">
                Please browse our site for more information. You can purchase tickets, booths, and inquire about sponsorship opportunities!
              </p>
            </div>
            
            {/* Orange County Sign */}
            <div className="oc-sign-container">
              <img src="/oc-sign-palm-trees-c-768x512.png" alt="Orange County" className="oc-sign-image" />
            </div>
          </div>
          <img src="/paper-torn-bottom.png" alt="Torn paper bottom" className="torn-paper-bottom" />
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

export default HomePage;
