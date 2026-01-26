import React, { useState } from 'react';
import { useCms } from '../cms/CmsContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './FAQ.css';

const FAQ = () => {
  const { content } = useCms();
  const cms = content?.faqPage || {};
  
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqSections = cms?.sections || [];

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
          <div className="faq-content">
            {faqSections.map((section, idx) => (
              <div key={idx} className="faq-section">
                <h2 className="faq-subheading">{section.subheading}</h2>
                <div className="faq-items">
                  {section.items.map((item) => (
                    <div key={item.id} className={`faq-item ${openItems[item.id] ? 'open' : ''}`}>
                      <button className="faq-question" onClick={() => toggleItem(item.id)}>
                        <span>{item.question}</span>
                        <span className="faq-icon">{openItems[item.id] ? '−' : '+'}</span>
                      </button>
                      {openItems[item.id] && (
                        <div className="faq-answer">
                          <p>{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

export default FAQ;
