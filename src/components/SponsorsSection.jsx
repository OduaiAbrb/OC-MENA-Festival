import React from 'react';
import { Link } from 'react-router-dom';
import './SponsorsSection.css';

const SponsorsSection = () => {
  return (
    <section className="sponsors-section">
      <h3>Main Event Sponsors</h3>
      <div className="sponsors-logos">
        <img src="/Liberty-Debt-Relief-Logo-all-white-2025.svg" alt="Liberty Debt Relief" className="sponsor-logo" />
      </div>
      <Link to="/sponsors" className="white-link">View all</Link>
    </section>
  );
};

export default SponsorsSection;
