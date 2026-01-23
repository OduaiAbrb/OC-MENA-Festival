import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TicketSuccess.css';

const TicketSuccess = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleScanNext = () => {
    navigate('/scanner');
  };

  return (
    <div className="success-page">
      <div className="success-header">
        <button className="close-btn" onClick={handleClose}>✕</button>
      </div>

      <div className="success-content">
        <div className="success-icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="28" stroke="#00ff00" strokeWidth="2" />
            <path d="M20 30L27 37L40 24" stroke="#00ff00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="success-title">Valid ticket</h1>

        <div className="ticket-info">
          <div className="info-row">
            <span className="info-label">Check-in:</span>
            <span className="info-value">1/21/2026, 11:45:30 AM</span>
          </div>
          <div className="info-row">
            <span className="info-label">Pass type:</span>
            <span className="info-value">2-day</span>
          </div>
          <div className="info-row">
            <span className="info-label">Days left:</span>
            <span className="info-value">1</span>
          </div>
        </div>

        <div className="success-buttons">
          <button className="btn-close" onClick={handleClose}>
            Close
          </button>
          <button className="btn-scan-next" onClick={handleScanNext}>
            Scan next ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketSuccess;
