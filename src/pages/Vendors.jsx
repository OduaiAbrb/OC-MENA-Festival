import React from 'react';
import { Link } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import './Vendors.css';

const Vendors = () => {
  const vendorCategories = [
    { icon: '🍽️', title: 'Food & Beverages', description: 'Authentic cuisines and refreshing drinks' },
    { icon: '👗', title: 'Fashion & Apparel', description: 'Traditional and modern clothing' },
    { icon: '🎨', title: 'Art & Crafts', description: 'Handmade treasures and artwork' },
    { icon: '💎', title: 'Jewelry & Accessories', description: 'Unique pieces and statement items' },
    { icon: '🏠', title: 'Home & Lifestyle', description: 'Decor and lifestyle products' },
    { icon: '🎁', title: 'Gifts & Souvenirs', description: 'Memorable keepsakes' },
  ];

  return (
    <div className="vendors-page">
      {/* Hero Section */}
      <section className="page-hero vendors-hero">
        <div className="page-hero-content">
          <h1 className="page-title">About Our Vendors</h1>
          <div className="title-decoration">
            <span className="deco-line"></span>
            <span className="deco-star">✦</span>
            <span className="deco-line"></span>
          </div>
        </div>
      </section>

      {/* Vendor Description */}
      <section className="vendor-description">
        <div className="container">
          <div className="description-content">
            <p className="lead-text">
              Get ready to explore a vibrant mix of vendors from across the region and beyond. 
              OC MENA Festival brings together food, art, fashion, culture, and community in 
              one dynamic marketplace designed to be discovered.
            </p>
            
            <p>
              From mouth-watering eats and refreshing drinks to handcrafted goods, apparel, 
              accessories, and cultural merchandise, our vendor village is curated to reflect 
              the creativity, flavors, and traditions of the MENA community — with plenty of 
              surprises along the way.
            </p>
            
            <p>
              You'll find local favorites, emerging brands, and unique makers offering everything 
              from savory street food and sweet treats to statement pieces, gifts, and lifestyle 
              finds you won't see anywhere else. Whether you're here to eat, shop, browse, or 
              simply soak in the energy, the vendor experience is a core part of the festival vibe.
            </p>
            
            <p className="highlight-text">
              Come hungry, come curious, and come ready to support incredible vendors who help 
              make OC MENA Festival an unforgettable celebration.
            </p>
          </div>
        </div>
      </section>

      {/* Vendor Categories */}
      <section className="vendor-categories">
        <div className="container">
          <h2 className="section-title">What You'll Find</h2>
          <p className="section-subtitle">
            Explore our diverse marketplace featuring vendors across multiple categories
          </p>
          
          <div className="categories-grid">
            {vendorCategories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor List Coming Soon */}
      <section className="vendor-list-section">
        <div className="container">
          <div className="vendor-list-card">
            <div className="list-icon">📋</div>
            <h2>Vendor List</h2>
            <p>We'll release the list of vendors as the event date nears</p>
            <div className="coming-soon-badge">Coming Soon</div>
          </div>
        </div>
      </section>

      {/* Become a Vendor CTA */}
      <section className="vendor-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Interested in Becoming a Vendor?</h2>
              <p>
                Join our vibrant marketplace and showcase your products to thousands of 
                festival attendees. We're looking for unique vendors who share our passion 
                for MENA culture and community.
              </p>
              <Link to="/contact" className="btn-primary">
                Apply Now
              </Link>
            </div>
            <div className="cta-decoration">
              <div className="deco-circle"></div>
              <div className="deco-circle"></div>
              <div className="deco-circle"></div>
            </div>
          </div>
        </div>
      </section>
      <ScrollToTop />
    </div>
  );
};

export default Vendors;
