import React from 'react';
import { useCms } from '../cms/CmsContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './WhatIsMena.css';

const WhatIsMena = () => {
  const { content } = useCms();
  const cms = content.whatIsMenaPage;
  
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
            <p className="card-description">
              {cms.paragraph3}
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
