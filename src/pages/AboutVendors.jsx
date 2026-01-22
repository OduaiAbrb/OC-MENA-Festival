import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './AboutVendors.css';

const AboutVendors = () => {
  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">About Our Vendors</h1>
          <div className="card-content">
            <p className="card-description">
              Get ready to explore a vibrant mix of vendors from across the region and beyond. OC MENA Festival brings together food, art, fashion, culture, and community in one dynamic marketplace designed to be discovered.
            </p>
            <p className="card-description">
              From mouth-watering eats and refreshing drinks to handcrafted goods, apparel, accessories, and cultural merchandise, our vendor village is curated to reflect the creativity, flavors, and traditions of the MENA community — with plenty of surprises along the way.
            </p>
            <p className="card-description">
              You'll find local favorites, emerging brands, and unique makers offering everything from savory street food and sweet treats to statement pieces, gifts, and lifestyle finds you won't see anywhere else. Whether you're here to eat, shop, browse, or simply soak in the energy, the vendor experience is a core part of the festival vibe.
            </p>
            <p className="card-description">
              Come hungry, come curious, and come ready to support incredible vendors who help make OC MENA Festival an unforgettable celebration.
            </p>
            
            <div className="vendor-list-section">
              <h2 className="section-title">Vendor List</h2>
              <p className="coming-soon">We'll release the list of vendors as the event date nears</p>
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

export default AboutVendors;
