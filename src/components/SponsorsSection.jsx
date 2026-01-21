import React from 'react';
import './SponsorsSection.css';

const SponsorsSection = () => {
  return (
    <section className="sponsors-section">
      <h3>Main Event Sponsors</h3>
      <div className="sponsors-logos">
        <img src="/oc-fair-logo.png" alt="OC Fair" className="sponsor-logo" />
        <img src="/oc-fair-logo.png" alt="OC Fair" className="sponsor-logo" />
        <img src="/oc-fair-logo.png" alt="OC Fair" className="sponsor-logo" />
        <img src="/oc-fair-logo.png" alt="OC Fair" className="sponsor-logo" />
        <img src="/oc-fair-logo.png" alt="OC Fair" className="sponsor-logo" />
      </div>
      <a href="/sponsors" className="view-all-link">View all</a>
    </section>
  );
};

export default SponsorsSection;
