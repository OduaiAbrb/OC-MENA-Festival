import React, { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './FAQ.css';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqSections = [
    {
      subheading: 'General Questions',
      items: [
        { id: 'g1', question: 'What is OC MENA Festival?', answer: 'OC MENA Festival is a large-scale cultural celebration honoring the rich traditions, creativity, and diversity of the Middle East and North Africa, held in Orange County.' },
        { id: 'g2', question: 'When and where is the festival?', answer: 'The festival takes place June 19-21, 2026 at the OC Fair Grounds in Orange County, California.' },
        { id: 'g3', question: 'Is the festival family-friendly?', answer: 'Yes! OC MENA Festival is designed to be an inclusive space for all ages and backgrounds with family-friendly attractions and entertainment.' },
        { id: 'g4', question: 'What can I expect at the festival?', answer: 'Guests can explore vendor booths, enjoy authentic cuisine, experience live music and performances, and discover cultural experiences from the MENA region.' },
      ]
    },
    {
      subheading: 'Tickets & Entry',
      items: [
        { id: 't1', question: 'How do I purchase tickets?', answer: 'Tickets can be purchased through our official website. Visit the Tickets page for more information.' },
        { id: 't2', question: 'Are children free?', answer: 'Children ages 5 and under receive free General Admission.' },
        { id: 't3', question: 'Can I get a refund?', answer: 'Please review our Ticket Terms & Conditions for refund policies.' },
        { id: 't4', question: 'What forms of payment are accepted?', answer: 'Food, beverage, and merchandise vendors accept credit, debit, and mobile payments only.' },
      ]
    }
  ];

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">FAQ</h1>
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
