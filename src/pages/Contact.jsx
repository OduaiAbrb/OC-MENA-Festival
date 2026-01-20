import React, { useState } from 'react';
import ScrollToTop from '../components/ScrollToTop';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      content: 'info@ocmenafestival.com',
      link: 'mailto:info@ocmenafestival.com'
    },
    {
      icon: '📍',
      title: 'Location',
      content: 'Orange County, California',
      link: null
    },
    {
      icon: '📱',
      title: 'Social Media',
      content: '@ocmenafestival',
      link: 'https://instagram.com/ocmenafestival'
    }
  ];

  const inquiryTypes = [
    { value: '', label: 'Select inquiry type' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'tickets', label: 'Tickets & Pricing' },
    { value: 'vendor', label: 'Vendor Application' },
    { value: 'sponsor', label: 'Sponsorship Opportunities' },
    { value: 'media', label: 'Media & Press' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="page-hero contact-hero">
        <div className="page-hero-content">
          <h1 className="page-title">Contact Us</h1>
          <div className="title-decoration">
            <span className="deco-line"></span>
            <span className="deco-star">✦</span>
            <span className="deco-line"></span>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Get in Touch</h2>
              <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary btn-submit">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
              <h2>Contact Information</h2>
              <p>Reach out to us through any of the following channels</p>

              <div className="contact-cards">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-info-card">
                    <div className="info-icon">{info.icon}</div>
                    <div className="info-content">
                      <h3>{info.title}</h3>
                      {info.link ? (
                        <a href={info.link}>{info.content}</a>
                      ) : (
                        <p>{info.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Link */}
              <div className="faq-card">
                <div className="faq-icon">❓</div>
                <h3>Frequently Asked Questions</h3>
                <p>Find answers to common questions about the festival</p>
                <a href="/faq" className="btn-secondary">View FAQ</a>
              </div>

              {/* Business Hours */}
              <div className="hours-card">
                <h3>Response Times</h3>
                <p>We typically respond within 24-48 business hours. For urgent matters, please indicate so in your message subject.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="map-section">
        <div className="container">
          <h2 className="section-title">Find Us</h2>
          <p className="section-subtitle">
            OC MENA Festival takes place in the heart of Orange County, California
          </p>
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <p>Exact venue location will be announced soon</p>
            <span className="location-tag">Orange County, CA</span>
          </div>
        </div>
      </section>
      <ScrollToTop />
    </div>
  );
};

export default Contact;
