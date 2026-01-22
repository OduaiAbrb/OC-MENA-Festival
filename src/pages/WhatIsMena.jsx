import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './WhatIsMena.css';

const WhatIsMena = () => {
  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">What is MENA?</h1>
          <div className="card-content">
            <p className="card-description">
              MENA stands for the Middle East and North Africa, a diverse and vibrant region that stretches from Morocco in the west to Iran in the east and from Turkey down through the Arabian Peninsula and North Africa. The region is home to dozens of cultures, languages, traditions, and histories that have shaped the world for thousands of years.
            </p>
            <p className="card-description">
              Often described as a bridge between Africa, Asia, and Europe, the MENA region has long been a center of innovation, trade, art, and storytelling. From ancient civilizations and architectural wonders to modern cities and evolving creative scenes, MENA embodies both deep-rooted heritage and forward-looking expression.
            </p>
            <p className="card-description">
              At OC MENA Festival, we celebrate the beauty, resilience, and diversity of the MENA region through food, music, art, fashion, and community. This festival invites you to explore rich, dynamic, and living cultures, honoring tradition while amplifying contemporary voices.
            </p>
            <div className="mena-map-container">
              <img src="/mena-map-c-768x512.png" alt="MENA Region Map" className="mena-map-image" />
            </div>
          </div>
        </TornPaperWrapper>

        <div className="lanterns-container">
          <img src="/lanterns.png" alt="Festival Lanterns" className="lanterns-image" />
        </div>
      </section>

      <SponsorsSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default WhatIsMena;
