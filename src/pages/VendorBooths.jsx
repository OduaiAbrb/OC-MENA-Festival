import React, { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './VendorBooths.css';

const VendorBooths = () => {
  const [selectedDays, setSelectedDays] = useState({
    bazaar: '3days',
    'food-truck': '3days',
    'food-booth': '3days'
  });
  
  const [upgrades, setUpgrades] = useState({
    bazaar: false,
    'food-truck': false,
    'food-booth': false
  });
  
  const [halal, setHalal] = useState({
    'food-truck': true,
    'food-booth': true
  });

  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleDayChange = (boothId, days) => {
    setSelectedDays(prev => ({
      ...prev,
      [boothId]: days
    }));
  };

  const handleUpgradeChange = (boothId) => {
    setUpgrades(prev => ({
      ...prev,
      [boothId]: !prev[boothId]
    }));
  };

  const handleHalalChange = (boothId) => {
    setHalal(prev => ({
      ...prev,
      [boothId]: !prev[boothId]
    }));
  };

  const handleSelect = (boothId) => {
    if (selectedBooth === boothId) {
      // If already selected and clicking Continue, show registration form
      setShowRegistration(true);
    } else {
      // Select the booth
      setSelectedBooth(boothId);
    }
  };

  const handleBackToSelection = () => {
    setShowRegistration(false);
    setSelectedBooth(null);
  };

  const boothOptions = [
    {
      id: 'bazaar',
      name: '10x10 Bazaar Booth',
      description: 'Sell goods inside the decorated bazaar',
      price: 1000,
      days: [
        { id: '3days', label: 'Fri-Sun (3 days)' },
        { id: '2days', label: 'Sat-Sun (2 days)' }
      ],
      includes: [
        '10x10 booth',
        'Vendor credentials',
        '4 guest entry tickets',
        '1 parking ticket'
      ],
      upgradeText: 'Upgrade to 20\'x10\' (+$100)',
      hasUpgrade: true,
      hasHalal: false
    },
    {
      id: 'food-truck',
      name: '10x10 Food Truck',
      description: 'Serve guests from your mobile kitchen',
      price: 3000,
      days: [
        { id: '3days', label: 'Fri-Sun (3 days)' },
        { id: '2days', label: 'Sat-Sun (2 days)' }
      ],
      includes: [
        'Food truck parking spot',
        'Vendor credentials',
        '4 guest entry tickets',
        '1 parking ticket'
      ],
      hasUpgrade: false,
      hasHalal: true
    },
    {
      id: 'food-booth',
      name: '10x10 Food Booth',
      description: 'Serve food from a fixed booth space',
      price: 1750,
      days: [
        { id: '3days', label: 'Fri-Sun (3 days)' },
        { id: '2days', label: 'Sat-Sun (2 days)' }
      ],
      includes: [
        '10x10 booth',
        'Vendor credentials',
        '4 guest entry tickets',
        '1 parking ticket'
      ],
      upgradeText: 'Upgrade to 20\'x10\' (+$200)',
      hasUpgrade: true,
      hasHalal: true
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
          <h1 className="card-title">OC MENA Festival Vendor Booths</h1>
          <p className="card-description">
            Join us at the OC MENA Festival, one of Orange County's most exciting cultural events, bringing together thousands of families and visitors for three days of food, shopping, music, and entertainment inspired by the Middle East and North Africa.
          </p>
          <p className="card-description">
            Showcase your products, cuisine, services, or brand in a vibrant festival environment filled with energy and community engagement. With a variety of booth options available, vendors can choose the ideal space to connect with guests, drive sales, and be part of an unforgettable summer celebration.
          </p>
          <p className="card-description">
            Explore the booth packages and secure your spot today—spaces are limited and fill quickly each year.
          </p>
          
          {!showRegistration ? (
          <>
            <div className="booths-container">
              {boothOptions.map(booth => (
                <div key={booth.id} className={`booth-card ${selectedBooth === booth.id ? 'selected' : ''}`}>
                  {selectedBooth === booth.id && (
                    <div className="selected-checkmark">✓</div>
                  )}
                  <div className="booth-header">
                    <h3 className="booth-name">{booth.name}</h3>
                    <p className="booth-description">{booth.description}</p>
                  </div>
                  
                  <div className="booth-details">
                    <div className="booth-section">
                      <div className="vendor-section-title" style={{color: '#000000', background: 'transparent', fontSize: '16px', fontWeight: '600'}}>Days required</div>
                      <div className="radio-group">
                        {booth.days.map(day => (
                          <label key={day.id} className="radio-label">
                            <input
                              type="radio"
                              name={`days-${booth.id}`}
                              value={day.id}
                              checked={selectedDays[booth.id] === day.id}
                              onChange={() => handleDayChange(booth.id, day.id)}
                              className="radio-input"
                            />
                            <span className="radio-custom"></span>
                            {day.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="booth-section">
                      <div className="vendor-section-title" style={{color: '#000000', background: 'transparent', fontSize: '16px', fontWeight: '600'}}>Includes</div>
                      <ul className="includes-list">
                        {booth.includes.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {booth.hasHalal && (
                      <div className="booth-section">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={halal[booth.id]}
                            onChange={() => handleHalalChange(booth.id)}
                            className="checkbox-input"
                          />
                          <span>Do you serve Halal food? Yes</span>
                        </label>
                      </div>
                    )}

                    {booth.hasUpgrade && (
                      <div className="booth-section">
                        <div className="vendor-section-title" style={{color: '#000000', background: 'transparent', fontSize: '16px', fontWeight: '600'}}>Do you need more space?</div>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={upgrades[booth.id]}
                            onChange={() => handleUpgradeChange(booth.id)}
                            className="checkbox-input"
                          />
                          <span>{booth.upgradeText}</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="booth-pricing">
                    <span className="booth-price">${booth.price}</span>
                  </div>

                  <button 
                    className={`select-btn ${selectedBooth === booth.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(booth.id)}
                  >
                    {selectedBooth === booth.id ? 'Continue' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="registration-form">
            <div className="registration-header">
              <button className="back-btn" onClick={handleBackToSelection}>← Back to Selection</button>
              <h2 className="registration-title">Bazaar Vendor Registration</h2>
              <p className="registration-subtitle">Please fill out the form below to reserve your booth</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Choose what fits your business*</label>
              <select className="form-select">
                <option>Arab Boutique</option>
                <option>Food Vendor</option>
                <option>Service Provider</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email*</label>
              <input type="email" className="form-input" placeholder="your@email.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Legal Business Name*</label>
              <input type="text" className="form-input" placeholder="Your legal business name" />
            </div>

            <div className="form-group">
              <label className="form-label">Booth Name*</label>
              <input type="text" className="form-input" placeholder="Your booth display name" />
            </div>

            <div className="simple-checkbox">
              <input type="checkbox" id="same-business" />
              <label htmlFor="same-business">Same as legal business name?</label>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number*</label>
              <input type="tel" className="form-input" placeholder="(555) 123-4567" />
            </div>

            <div className="form-group">
              <label className="form-label">Instagram Handle</label>
              <input type="text" className="form-input" placeholder="@yourbusiness" />
            </div>

            <div className="form-group">
              <label className="form-label">Facebook Handle</label>
              <input type="text" className="form-input" placeholder="facebook.com/yourbusiness" />
            </div>

            <div className="form-group">
              <label className="form-label">TikTok Handle</label>
              <input type="text" className="form-input" placeholder="@yourbusiness" />
            </div>

            <div className="important-notice">
              <p className="notice-text">
                I understand that I can set up my booth starting Friday evening and Saturday morning from 8 AM to 11 AM. After 11 AM, I won't be able to set up my booth and I won't get any refunds. Also, if I am handling any food whether it is packaged or non packaged I would require OC MENA Festival approval*
              </p>
            </div>

            <div className="simple-checkbox">
              <input type="checkbox" id="accept-terms" />
              <label htmlFor="accept-terms">I accept the terms above</label>
            </div>

            <button className="continue-btn">Continue</button>
          </div>
        )}
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

export default VendorBooths;
