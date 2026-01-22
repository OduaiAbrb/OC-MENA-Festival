import React from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Sponsors.css';

const Sponsors = () => {
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
        <TornPaperWrapper>
          <h1 className="card-title">Sponsors</h1>
          
          <p className="card-description">
            OC MENA Festival partners with brands and organizations that support culture, community, and live experiences. Sponsorship opportunities are designed to create meaningful engagement with our audience while aligning your brand with one of Orange County's premier cultural events. We offer multiple sponsorship tiers with customizable benefits, including on-site visibility, digital promotion, experiential activations, and branded integrations throughout the festival.
          </p>

          <div className="sponsorship-levels">
            <h3 className="section-heading">Sponsorship Levels:</h3>
            <ul className="levels-list">
              <li>Diamond</li>
              <li>Platinum</li>
              <li>Gold</li>
              <li>Silver</li>
              <li>Bronze</li>
            </ul>
          </div>

          <p className="card-description">
            Each level offers unique exposure opportunities, and custom packages are available upon request.
          </p>

          <p className="card-description">
            If you're interested in becoming a sponsor or would like to receive our sponsorship deck, please contact us <Link to="/contact" className="link-underline">here</Link>. A member of our team will be in touch to discuss available opportunities and tailor a package that fits your goals.
          </p>

          <div className="cta-section">
            <p className="cta-text">Ready to become a sponsor?</p>
            <Link to="/contact" className="btn-primary">Inquire Now</Link>
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

export default Sponsors;
