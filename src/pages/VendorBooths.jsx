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
    
    if (!formData.acceptTerms) {
      alert('Please accept the terms to continue');
      return;
    }
    
    const booth = boothOptions.find(b => b.id === selectedBooth);
    const price = calculateBoothPrice(selectedBooth);
    const daysLabel = selectedDays[selectedBooth] === '3days' ? 'Fri-Sun (3 days)' : 'Sat-Sun (2 days)';
    
    // Create cart item for the booth
    const boothCartItem = {
      id: `booth-${selectedBooth}-${Date.now()}`,
      ticket_type_id: selectedBooth,
      name: `${booth.name} - ${daysLabel}`,
      quantity: 1,
      price: price,
      type: 'vendor-booth',
      boothDetails: {
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

  const handleBackToSelection = () => {
    setShowRegistration(false);
    setSelectedBooth(null);
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
            <div className="registration-header">
              <h2 className="registration-title">Bazaar Vendor Registration</h2>
              <p className="registration-subtitle">Please fill out the form below to reserve your booth</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Choose what fits your business*</label>
<<<<<<< Updated upstream
              <select 
                className="form-select"
                value={formData.businessType}
                onChange={(e) => handleFormChange('businessType', e.target.value)}
              >
                <option>Arab Boutique</option>
                <option>Food Vendor</option>
                <option>Service Provider</option>
              </select>
=======
              {selectedBooth === 'bazaar' && (
                <select name="input_1" id="input_4_1" className="large gfield_select" aria-required="true" aria-invalid="false">
                  <option value="Arab Boutique">Arab Boutique</option>
                  <option value="North African Boutique">North African Boutique</option>
                  <option value="Desi Boutique">Desi Boutique</option>
                  <option value="American Boutique">American Boutique</option>
                  <option value="Men's Boutique">Men's Boutique</option>
                  <option value="Women's Boutique">Women's Boutique</option>
                  <option value="Hijab, Accessories, and Jewellery">Hijab, Accessories, and Jewellery</option>
                  <option value="Books">Books</option>
                  <option value="Business">Business</option>
                  <option value="Art Items">Art Items</option>
                  <option value="Kids">Kids</option>
                  <option value="Perfumes/Oils">Perfumes/Oils</option>
                  <option value="Other">Other</option>
                </select>
              )}
              {selectedBooth === 'food-truck' && (
                <select name="input_1" id="input_3_1" className="large gfield_select" aria-required="true" aria-invalid="false">
                  <option value="Arab Food">Arab Food</option>
                  <option value="North African Food">North African Food</option>
                  <option value="American Food">American Food</option>
                  <option value="General Food">General Food</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                </select>
              )}
              {selectedBooth === 'food-booth' && (
                <select name="input_1" id="input_4_1" className="large gfield_select" aria-required="true" aria-invalid="false">
                  <option value="Arab Boutique">Arab Boutique</option>
                  <option value="North African Boutique">North African Boutique</option>
                  <option value="Desi Boutique">Desi Boutique</option>
                  <option value="American Boutique">American Boutique</option>
                  <option value="Men's Boutique">Men's Boutique</option>
                  <option value="Women's Boutique">Women's Boutique</option>
                  <option value="Hijab, Accessories, and Jewellery">Hijab, Accessories, and Jewellery</option>
                  <option value="Books">Books</option>
                  <option value="Business">Business</option>
                  <option value="Art Items">Art Items</option>
                  <option value="Kids">Kids</option>
                  <option value="Perfumes/Oils">Perfumes/Oils</option>
                  <option value="Other">Other</option>
                </select>
              )}
>>>>>>> Stashed changes
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email*</label>
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

<<<<<<< Updated upstream
            <div className="simple-checkbox">
              <input 
                type="checkbox" 
                id="same-business"
                checked={formData.sameAsLegal}
                onChange={(e) => {
                  handleFormChange('sameAsLegal', e.target.checked);
                  if (e.target.checked) {
                    handleFormChange('boothName', formData.legalName);
                  }
                }}
              />
              <label htmlFor="same-business">Same as legal business name?</label>
            </div>
=======
            <label className="checkbox-label">
              <input type="checkbox" id="same-business" className="checkbox-input" />
              <span className="checkbox-custom"></span>
              <span>Same as legal business name?</span>
            </label>
>>>>>>> Stashed changes

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

            {selectedBooth === 'food-truck' && (
              <>
                <div className="health-permit-section">
                  <p className="health-permit-text">Do you have OC Health Permit? (TFF)*</p>
                  <div className="health-permit-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="health-permit"
                        value="yes"
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      Yes
                    </label>
                  </div>
                </div>

<<<<<<< Updated upstream
            <div className="simple-checkbox">
              <input 
                type="checkbox" 
                id="accept-terms"
                checked={formData.acceptTerms}
                onChange={(e) => handleFormChange('acceptTerms', e.target.checked)}
              />
              <label htmlFor="accept-terms">I accept the terms above</label>
            </div>
=======
            

                <div className="mandate-section">
                  <div className="mandate-box">
                    <p className="mandate-text">
                      Mandate by the Property Owner: I Understand I can only sell Pepsi Beverages for water and Soda. For water, I can only get AquaFina, and for standard soda, I need to get Pepsi products. I can get ethnic products that are not mainstream like Salaam Cola, Hawa Cola, Palestina or Shaista *
                    </p>
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" id="mandate-pepsi-single" className="checkbox-input" />
                    <span className="checkbox-custom"></span>
                    <span>I accept the terms above</span>
                  </label>
                </div>

                

                <div className="mandate-section">
                  <div className="mandate-box">
                    <p className="mandate-text">
                      I will bring a handwashing station for my booth which is required by OC Health Department. I can get a 5 Gallon water dispenser with a tap on the bottle and a collection vessel for used water*
                    </p>
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" id="handwashing-single" className="checkbox-input" />
                    <span className="checkbox-custom"></span>
                    <span>I accept the terms above</span>
                  </label>
                </div>

             

                <div className="mandate-section">
                  <div className="mandate-box">
                    <p className="mandate-text">
                      I will review the presentation to understand the requirements by OC Health Department. The link if provided to me on my confirmation email*
                    </p>
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" id="review-single" className="checkbox-input" />
                    <span className="checkbox-custom"></span>
                    <span>I accept the terms above</span>
                  </label>
                </div>

               

                <div className="mandate-section">
                  <div className="mandate-box">
                    <p className="mandate-text">
                      I understand that I can set up my booth starting Friday evening and Saturday morning from 8 AM to 11 AM. After 11 AM, I won't be able to set up my booth and I won't get any refunds.Also, if I am handling any food whether it is packaged or non packaged I would require OC MENA Festival*
                    </p>
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" id="setup-single" className="checkbox-input" />
                    <span className="checkbox-custom"></span>
                    <span>I accept the terms above</span>
                  </label>
                </div>
              </>
            )}

            {!selectedBooth || selectedBooth !== 'food-truck' ? (
              <>
                <div className="important-notice">
                  <p className="notice-text">
                    I understand that I can set up my booth starting Friday evening and Saturday morning from 8 AM to 11 AM. After 11 AM, I won't be able to set up my booth and I won't get any refunds. Also, if I am handling any food whether it is packaged or non packaged I would require OC MENA Festival approval*
                  </p>
                </div>

                <div className="simple-checkbox">
                  <input type="checkbox" id="accept-terms" />
                  <label htmlFor="accept-terms">I accept the terms above</label>
                </div>
              </>
            ) : null}
>>>>>>> Stashed changes

            <button className="continue-btn" onClick={handleContinueToCheckout}>Continue</button>
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
