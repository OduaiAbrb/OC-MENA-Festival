import React from 'react';
import { Link } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './SponsorsInfo.css';

const SponsorsInfo = () => {
  const { content } = useCms();
  const cms = content?.sponsorsInfoPage || {};

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">{cms.title}</h1>
          <div className="card-content">
            <p className="card-description">
              {cms.paragraph1}
            </p>
            <p className="card-description">
              {cms.paragraph2}
            </p>
            
            <div className="sponsorship-levels">
              <h2 className="levels-title">{cms.levelsTitle}</h2>
              <ul className="levels-list">
                {(cms?.levels || []).map((level, idx) => (
                  <li key={idx} className="level-item">{level}</li>
                ))}
              </ul>
            </div>
            
            <p className="card-description">
              {cms.levelsDescription}
            </p>
            <p className="card-description">
              {cms.contactText}
            </p>
            
            <div className="cta-section">
              <h3 className="cta-title">{cms.ctaTitle}</h3>
              <Link to="/contact" className="inquire-btn">{cms.ctaButton}</Link>
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
