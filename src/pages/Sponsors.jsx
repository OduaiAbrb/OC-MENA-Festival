import React from 'react';
import { Link } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Sponsors.css';

const Sponsors = () => {
  const { content } = useCms();
  const cms = content?.sponsorsPage || {};

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
          <h1 className="card-title">{cms.title}</h1>
          
          <p className="card-description">
            {cms.description}
          </p>

          <div className="sponsorship-levels">
            <h3 className="section-heading">{cms.levelsTitle}</h3>
            <ul className="levels-list">
              {cms.levels.map((level, idx) => (
                <li key={idx}>{level}</li>
              ))}
            </ul>
          </div>

          <p className="card-description">
            {cms.levelsDescription}
          </p>

          <p className="card-description">
            {cms.contactText.split('here')[0]}<Link to="/contact" className="link-underline">here</Link>{cms.contactText.split('here')[1] || ''}
          </p>

          <div className="cta-section">
            <p className="cta-text">{cms.ctaText}</p>
            <Link to="/contact" className="btn-primary">{cms.ctaButton}</Link>
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
