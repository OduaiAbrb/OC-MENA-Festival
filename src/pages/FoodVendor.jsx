import React, { useState } from 'react';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './FoodVendor.css';

const FoodVendor = () => {
  const [formData, setFormData] = useState({
    businessType: 'Arab Food',
    contactEmail: '',
    legalBusinessName: '',
    boothName: '',
    sameAsLegalName: false,
    phoneNumber: '',
    instagramHandle: '',
    facebookHandle: '',
    tiktokHandle: '',
    hasHealthPermit: false,
    pepsiBeverageTerms: false,
    handwashingStationTerms: false,
    healthDepartmentTerms: false,
    setupTerms: false,
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const businessTypeOptions = [
    'Arab Food',
    'North African Food',
    'American Food',
    'General Food',
    'Dessert',
    'Beverage'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.contactEmail || !formData.legalBusinessName || !formData.boothName || !formData.phoneNumber) {
      setError('Please fill out all required fields');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.hasHealthPermit) {
      setError('You must confirm you have an OC Health Permit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.pepsiBeverageTerms || !formData.handwashingStationTerms || !formData.healthDepartmentTerms || !formData.setupTerms) {
      setError('You must accept all terms to proceed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.submitFoodVendor({
        business_type: formData.businessType,
        contact_email: formData.contactEmail,
        legal_business_name: formData.legalBusinessName,
        booth_name: formData.boothName,
        same_as_legal_name: formData.sameAsLegalName,
        phone_number: formData.phoneNumber,
        instagram_handle: formData.instagramHandle,
        facebook_handle: formData.facebookHandle,
        tiktok_handle: formData.tiktokHandle,
        has_health_permit: formData.hasHealthPermit,
        pepsi_beverage_terms: formData.pepsiBeverageTerms,
        handwashing_station_terms: formData.handwashingStationTerms,
        health_department_terms: formData.healthDepartmentTerms,
        setup_terms: formData.setupTerms,
        accept_terms: formData.acceptTerms
      });

      if (result?.success) {
        setSuccess(true);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            businessType: 'Arab Food',
            contactEmail: '',
            legalBusinessName: '',
            boothName: '',
            sameAsLegalName: false,
            phoneNumber: '',
            instagramHandle: '',
            facebookHandle: '',
            tiktokHandle: '',
            hasHealthPermit: false,
            pepsiBeverageTerms: false,
            handwashingStationTerms: false,
            healthDepartmentTerms: false,
            setupTerms: false,
            acceptTerms: false
          });
          setSuccess(false);
        }, 5000);
      } else {
        setError(result?.error?.message || 'Failed to submit registration');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Food vendor registration error:', err);
      setError(err.message || 'Failed to submit registration. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">Food Vendor Registration</h1>
          <p className="card-subtitle">
            Please fill out the form below to reserve your booth
          </p>

          {error && <div className="error-message" role="alert">{error}</div>}
          {success && <div className="success-message" role="status">Thank you! Your registration has been submitted successfully.</div>}

          <form onSubmit={handleSubmit} className="vendor-form">
            <div className="form-group">
              <label htmlFor="businessType">Choose what fits your business *</label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                required
              >
                {businessTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email *</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="legalBusinessName">Legal Business Name *</label>
              <input
                type="text"
                id="legalBusinessName"
                name="legalBusinessName"
                value={formData.legalBusinessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="boothName">Booth Name *</label>
              <input
                type="text"
                id="boothName"
                name="boothName"
                value={formData.boothName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="sameAsLegalName" 
                  name="sameAsLegalName" 
                  checked={formData.sameAsLegalName} 
                  onChange={handleChange} 
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span>Same as legal business name?</span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="instagramHandle">Instagram Handle</label>
              <input
                type="text"
                id="instagramHandle"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="facebookHandle">Facebook Handle</label>
              <input
                type="text"
                id="facebookHandle"
                name="facebookHandle"
                value={formData.facebookHandle}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tiktokHandle">TikTok Handle</label>
              <input
                type="text"
                id="tiktokHandle"
                name="tiktokHandle"
                value={formData.tiktokHandle}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="hasHealthPermit" 
                  name="hasHealthPermit" 
                  checked={formData.hasHealthPermit} 
                  onChange={handleChange} 
                  required 
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span>Do you have OC Health Permit? (TFF) *</span>
              </label>
            </div>

            <div className="form-group">
              <p className="form-text">
                Mandate by the Property Owner: I Understand I can only sell Pepsi Beverages for water and Soda. For water, I can only get AquaFina, and for standard soda, I need to get Pepsi products. I can get ethnic products that are not mainstream like Salaam Cola, Hawa Cola, Palestina or Shaista *
              </p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="pepsiBeverageTerms" 
                  name="pepsiBeverageTerms" 
                  checked={formData.pepsiBeverageTerms} 
                  onChange={handleChange} 
                  required 
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span>I accept the terms above</span>
              </label>
            </div>

            <div className="form-group">
              <p className="form-text">
                I will bring a handwashing station for my booth which is required by OC Health Department. I can get a 5 Gallon water dispenser with a tap on the bottle and a collection vessel for used water *
              </p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="handwashingStationTerms" 
                  name="handwashingStationTerms" 
                  checked={formData.handwashingStationTerms} 
                  onChange={handleChange} 
                  required 
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span>I accept the terms above</span>
              </label>
            </div>

            <div className="form-group">
              <p className="form-text">
                I will review the presentation to understand the requirements by OC Health Department. The link if provided to me on my confirmation email *
              </p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="healthDepartmentTerms" 
                  name="healthDepartmentTerms" 
                  checked={formData.healthDepartmentTerms} 
                  onChange={handleChange} 
                  required 
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span>I accept the terms above</span>
              </label>
            </div>

            <div className="form-group">
              <p className="form-text">
                I understand that I can set up my booth starting Friday evening and Saturday morning from 8 AM to 11 AM. After 11 AM, I won't be able to set up my booth and I won't get any refunds.Also, if I am handling any food whether it is packaged or non packaged I would require OC MENA Festival *
              </p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="setupTerms" 
                  name="setupTerms" 
                  checked={formData.setupTerms} 
                  onChange={handleChange} 
                  required 
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span>I accept the terms above</span>
              </label>
            </div>

            <button type="submit" className="btn-primary submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Continue'}
            </button>
          </form>
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

export default FoodVendor;
