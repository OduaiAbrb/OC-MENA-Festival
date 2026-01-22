import React from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './SponsorsInfo.css';

const SponsorsInfo = () => {
  const sponsorshipLevels = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">Sponsors</h1>
          <div className="card-content">
            <p className="card-description">
              OC MENA Festival partners with brands and organizations that support culture, community, and live experiences. Sponsorship opportunities are designed to create meaningful engagement with our audience while aligning your brand with one of Orange County's premier cultural events.
            </p>
            <p className="card-description">
              We offer multiple sponsorship tiers with customizable benefits, including on-site visibility, digital promotion, experiential activations, and branded integrations throughout the festival.
            </p>
            
            <div className="sponsorship-levels">
              <h2 className="levels-title">Sponsorship Levels:</h2>
              <ul className="levels-list">
                {sponsorshipLevels.map((level, idx) => (
                  <li key={idx} className="level-item">{level}</li>
                ))}
              </ul>
            </div>
            
            <p className="card-description">
              Each level offers unique exposure opportunities, and custom packages are available upon request.
            </p>
            <p className="card-description">
              If you're interested in becoming a sponsor or would like to receive our sponsorship deck, please contact us. A member of our team will be in touch to discuss available opportunities and tailor a package that fits your goals.
            </p>
            
            <div className="cta-section">
              <h3 className="cta-title">Ready to become a sponsor?</h3>
              <Link to="/contact" className="inquire-btn">Inquire Now</Link>
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

export default SponsorsInfo;
