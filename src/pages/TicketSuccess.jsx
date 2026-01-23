import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TicketSuccess.css';

const TicketSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketData = location.state || {};
  
  // Check if this is a vendor booth ticket
  const passType = ticketData.passType || ticketData.ticketData?.ticket_type || 'N/A';
  const isVendorBooth = passType.toLowerCase().includes('vendor') || 
                        passType.toLowerCase().includes('booth') ||
                        passType.toLowerCase().includes('bazaar') ||
                        passType.toLowerCase().includes('food truck') ||
                        passType.toLowerCase().includes('food booth');

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

        <h1 className="success-title">
          {isVendorBooth ? '✅ Vendor Booth Valid' : 'Valid ticket'}
        </h1>

        <div className="ticket-info">
          <div className="info-row">
            <span className="info-label">Check-in:</span>
            <span className="info-value">{ticketData.checkInTime || new Date().toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{isVendorBooth ? 'Booth Type:' : 'Pass type:'}</span>
            <span className="info-value highlight">{passType}</span>
          </div>
          
          {/* Holder/Owner Name */}
          {(ticketData.holderName || ticketData.ticketData?.owner_name) && (
            <div className="info-row">
              <span className="info-label">{isVendorBooth ? 'Vendor:' : 'Holder:'}</span>
              <span className="info-value">{ticketData.holderName || ticketData.ticketData?.owner_name}</span>
            </div>
          )}
          
          {/* Ticket Status */}
          {ticketData.status && (
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className={`info-value status-${ticketData.status.toLowerCase()}`}>
                {ticketData.status}
              </span>
            </div>
          )}
          
          {/* Vendor-specific details */}
          {isVendorBooth && ticketData.ticketData?.metadata && (
            <>
              {ticketData.ticketData.metadata.booth_name && (
                <div className="info-row">
                  <span className="info-label">Booth Name:</span>
                  <span className="info-value">{ticketData.ticketData.metadata.booth_name}</span>
                </div>
              )}
              {ticketData.ticketData.metadata.legal_business_name && (
                <div className="info-row">
                  <span className="info-label">Business:</span>
                  <span className="info-value">{ticketData.ticketData.metadata.legal_business_name}</span>
                </div>
              )}
              {ticketData.ticketData.metadata.contact_email && (
                <div className="info-row">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{ticketData.ticketData.metadata.contact_email}</span>
                </div>
              )}
              {ticketData.ticketData.metadata.phone_number && (
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{ticketData.ticketData.metadata.phone_number}</span>
                </div>
              )}
            </>
          )}
          
          {/* Days left for regular tickets */}
          {!isVendorBooth && ticketData.daysLeft && (
            <div className="info-row">
              <span className="info-label">Days left:</span>
              <span className="info-value">{ticketData.daysLeft}</span>
            </div>
          )}
        </div>

        {isVendorBooth && (
          <div className="vendor-badge">
            🏪 VENDOR ACCESS
          </div>
        )}

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
