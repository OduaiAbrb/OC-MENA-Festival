import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './VendorBooths.css';

const VendorBooths = () => {
  const navigate = useNavigate();
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
    'food-truck': false,
    'food-booth': false
  });

  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    businessType: 'Arab Boutique',
    email: '',
    legalName: '',
    boothName: '',
    sameAsLegal: false,
    phone: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    acceptTerms: false
  });

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

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const calculateBoothPrice = (boothId) => {
    const booth = boothOptions.find(b => b.id === boothId);
    if (!booth) return 0;
    
    let price = booth.price;
    
    // Add upgrade cost if selected
    if (upgrades[boothId]) {
      if (boothId === 'bazaar') price += 100;
      if (boothId === 'food-booth') price += 200;
    }
    
    // Adjust for 2-day selection (reduce by 30%)
    if (selectedDays[boothId] === '2days') {
      price = Math.round(price * 0.7);
    }
    
    return price;
  };

  const handleContinueToCheckout = () => {
    // Validate form
    if (!formData.email || !formData.legalName || !formData.boothName || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Only check terms acceptance for bazaar booths (where terms are shown)
    if (selectedBooth === 'bazaar' && !formData.acceptTerms) {
      alert('Please accept the terms to continue');
      return;
    }
    
    const booth = boothOptions.find(b => b.id === selectedBooth);
    const price = calculateBoothPrice(selectedBooth);
    const daysLabel = selectedDays[selectedBooth] === '3days' ? 'Fri-Sun (3 days)' : 'Sat-Sun (2 days)';
    
    // Create cart item for the booth with registration data
    const boothCartItem = {
      id: `booth-${selectedBooth}-${Date.now()}`,
      ticket_type_id: selectedBooth,
      name: `${booth.name} - ${daysLabel}`,
      quantity: 1,
      price: price,
      type: 'vendor-booth',
      boothDetails: {
        boothType: selectedBooth,
        days: selectedDays[selectedBooth],
        upgrade: upgrades[selectedBooth],
        halal: halal[selectedBooth],
        formData: formData
      }
    };
    
    // Add to cart
    const existingCart = localStorage.getItem('cart');
    let cartItems = [];
    
    if (existingCart) {
      try {
        const parsed = JSON.parse(existingCart);
        cartItems = parsed.items || [];
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
    
    // Add booth to cart
    cartItems.push(boothCartItem);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify({
      items: cartItems,
      total: total
    }));
    
    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { items: cartItems, total: total } 
    }));
    
    // Navigate to checkout
    navigate('/checkout', { 
      state: { items: cartItems, total: total } 
    });
  };


  const boothOptions = [
    {
      id: 'bazaar',
      name: '10x10 Bazaar Booth',
      description: 'Sell goods inside the decorated bazaar',
      price: 1100,
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
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
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
            <h2 className="booths-title">Please select a booth option:</h2>
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
                      <div className="vendor-section-title" style={{color: '#000000', background: 'transparent', fontSize: '12.7px', fontWeight: '600'}}>Days required</div>
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
                      <div className="vendor-section-title" style={{color: '#000000', background: 'transparent', fontSize: '12.7px', fontWeight: '600'}}>Includes</div>
                      <ul className="includes-list">
                        {booth.includes.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {booth.hasHalal && (
                      <div className="booth-section">
                        <div className="vendor-section-title" style={{color: '#000000', background: 'transparent', fontSize: '12.7px', fontWeight: '600'}}>Do you serve Halal food?</div>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={halal[booth.id]}
                            onChange={() => handleHalalChange(booth.id)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-custom"></span>
                          <span>Yes</span>
                        </label>
                      </div>
                    )}

                    {booth.hasUpgrade && (
                      <div className="booth-section">
                        <div className="vendor-section-title" style={{color: '#000000', background: 'transparent', fontSize: '12.7px', fontWeight: '600'}}>Do you need more space?</div>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={upgrades[booth.id]}
                            onChange={() => handleUpgradeChange(booth.id)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-custom"></span>
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
            <h3>Vendor Registration</h3>
            
            <div className="form-group">
              <label className="form-label">Email*</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Legal Business Name*</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Your legal business name"
                value={formData.legalName}
                onChange={(e) => handleFormChange('legalName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Booth Name*</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Your booth display name"
                value={formData.boothName}
                onChange={(e) => handleFormChange('boothName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number*</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Instagram Handle</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="@yourbusiness"
                value={formData.instagram}
                onChange={(e) => handleFormChange('instagram', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Facebook Handle</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="facebook.com/yourbusiness"
                value={formData.facebook}
                onChange={(e) => handleFormChange('facebook', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">TikTok Handle</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="@yourbusiness"
                value={formData.tiktok}
                onChange={(e) => handleFormChange('tiktok', e.target.value)}
              />
            </div>

            {selectedBooth === 'bazaar' && (
              <>
                <div className="important-notice">
                  <p className="notice-text">
                    I understand that I can set up my booth starting Friday evening and Saturday morning from 8 AM to 11 AM. After 11 AM, I won't be able to set up my booth and I won't get any refunds. Also, if I am handling any food whether it is packaged or non packaged I would require OC MENA Festival approval*
                  </p>
                </div>

                <div className="simple-checkbox">
                  <input 
                    type="checkbox" 
                    id="accept-terms"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleFormChange('acceptTerms', e.target.checked)}
                  />
                  <label htmlFor="accept-terms">I accept the terms above</label>
                </div>
              </>
            )}

            <button className="continue-btn" onClick={handleContinueToCheckout}>Continue to Checkout</button>
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
