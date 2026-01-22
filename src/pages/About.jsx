import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './About.css';

const About = () => {
  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
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

        <TornPaperWrapper>
          <h1 className="card-title">About</h1>
          <div className="card-content">
            <p className="card-description">
              The OC MENA Festival is a large-scale cultural celebration honoring the rich traditions, creativity, and diversity of the Middle East and North Africa. Held in the heart of Orange County, the festival brings communities together through music, art, food, fashion, and immersive experiences that reflect both heritage and modern culture. From vibrant bazaars and live performances to family-friendly attractions and entertainment, OC MENA Festival is designed to be an inclusive space for all ages and backgrounds.
            </p>
            <p className="card-description">
              More than just a festival, OC MENA Festival is a gathering rooted in connection, storytelling, and shared experiences. Over three summer days, guests can explore vendor booths, enjoy authentic cuisine, experience live music and performances, and discover the cultural threads that unite generations across the MENA region. Whether you're attending with family, friends, or as a first-time visitor, the OC MENA Festival invites you to celebrate culture, community, and the spirit of summer together.
            </p>
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

export default About;
