import React from 'react';

const TornPaperWrapper = ({ children }) => {
  return (
    <div className="torn-paper-wrapper">
      <img src="/paper-torn-top.png" alt="Torn paper top" className="torn-paper-top" />
      <div className="torn-paper-card">
        {children}
      </div>
      <img src="/paper-torn-bottom.png" alt="Torn paper bottom" className="torn-paper-bottom" />
    </div>
  );
};

export default TornPaperWrapper;
