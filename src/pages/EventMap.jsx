import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './EventMap.css';

const EventMap = () => {
  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">Event Map</h1>
          <div className="card-content">
            <p className="card-description">
              Your festival adventure starts here. The OC MENA Festival event map helps you navigate the grounds with ease — from live music stages and vendor bazaars to food, drinks, restrooms, medical tents, and accessibility services. Whether you're chasing your favorite performances or discovering something new, the map makes it easy to explore, plan your route, and soak in every moment.
            </p>
            <div className="event-map-container">
              <img src="/festival-map-2025-768x960.jpg" alt="OC MENA Festival Event Map" className="event-map-image" />
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

export default EventMap;
