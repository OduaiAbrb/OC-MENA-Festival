import React from 'react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import './Sponsors.css';

const Sponsors = () => {
  const sponsorshipLevels = [
    {
      name: 'Diamond',
      icon: '💎',
      color: '#b9f2ff',
      benefits: [
        'Premium logo placement on all materials',
        'Exclusive main stage naming rights',
        'VIP hospitality suite',
        'Full festival access for 50+ guests',
        'Custom experiential activation space',
        'Social media feature campaign'
      ]
    },
    {
      name: 'Platinum',
      icon: '⚪',
      color: '#e5e4e2',
      benefits: [
        'Prominent logo placement',
        'Stage naming opportunity',
        'VIP access for 30 guests',
        'Branded activation booth',
        'Newsletter feature',
        'On-site signage'
      ]
    },
    {
      name: 'Gold',
      icon: '🥇',
      color: '#FFD700',
      benefits: [
        'Logo on marketing materials',
        'VIP access for 20 guests',
        'Vendor booth space',
        'Social media mentions',
        'Website recognition',
        'Event program listing'
      ]
    },
    {
      name: 'Silver',
      icon: '🥈',
      color: '#C0C0C0',
      benefits: [
        'Logo on select materials',
        'VIP access for 10 guests',
        'Social media recognition',
        'Website listing',
        'Event program mention'
      ]
    },
    {
      name: 'Bronze',
      icon: '🥉',
      color: '#CD7F32',
      benefits: [
        'Logo on website',
        'VIP access for 5 guests',
        'Social media thank you',
        'Event program listing'
      ]
    }
  ];

  return (
    <div className="sponsors-page">
      {/* Hero Section */}
      <section className="page-hero sponsors-hero">
        <div className="page-hero-content">
          <h1 className="page-title">Sponsors</h1>
          <div className="title-decoration">
            <span className="deco-line"></span>
            <span className="deco-star">✦</span>
            <span className="deco-line"></span>
          </div>
        </div>
      </section>

      {/* Sponsor Description */}
      <section className="sponsor-description">
        <div className="container">
          <div className="description-content">
            <p className="lead-text">
              OC MENA Festival partners with brands and organizations that support culture, 
              community, and live experiences.
            </p>
            <p>
              Sponsorship opportunities are designed to create meaningful engagement with our 
              audience while aligning your brand with one of Orange County's premier cultural events.
            </p>
            <p>
              We offer multiple sponsorship tiers with customizable benefits, including on-site 
              visibility, digital promotion, experiential activations, and branded integrations 
              throughout the festival.
            </p>
          </div>
        </div>
      </section>

      {/* Sponsorship Levels */}
      <section className="sponsorship-levels">
        <div className="container">
          <h2 className="section-title">Sponsorship Levels</h2>
          <p className="section-subtitle">
            Each level offers unique exposure opportunities, and custom packages are available upon request.
          </p>

          <div className="levels-grid">
            {sponsorshipLevels.map((level, index) => (
              <div 
                key={index} 
                className="level-card"
                style={{ '--level-color': level.color }}
              >
                <div className="level-icon">{level.icon}</div>
                <h3 className="level-name">{level.name}</h3>
                <ul className="level-benefits">
                  {level.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="sponsor-cta">
        <div className="container">
          <div className="sponsor-cta-card">
            <div className="cta-icon">🤝</div>
            <h2>Ready to Become a Sponsor?</h2>
            <p>
              If you're interested in becoming a sponsor or would like to receive our 
              sponsorship deck, please contact us. A member of our team will be in touch 
              to discuss available opportunities and tailor a package that fits your goals.
            </p>
            <Link to="/contact" className="btn-primary btn-large">
              Inquire Now
            </Link>
          </div>
        </div>
      </section>

      {/* Current Sponsors Placeholder */}
      <section className="current-sponsors">
        <div className="container">
          <h2 className="section-title">Our Sponsors</h2>
          <p className="section-subtitle">
            Thank you to our amazing sponsors who make this festival possible
          </p>
          
          <div className="sponsors-placeholder">
            <div className="placeholder-icon">🏆</div>
            <p>Sponsor logos will be displayed here as partnerships are confirmed</p>
          </div>
        </div>
      </section>
      <ScrollToTop />
    </div>
  );
};

export default Sponsors;
