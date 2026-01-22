import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import api from '../services/api';
import './QRScanner.css';

const QRScanner = () => {
  const navigate = useNavigate();
  const [ticketCode, setTicketCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    if (!ticketCode.trim()) {
      setResult({
        success: false,
        message: 'Please enter a ticket code'
      });
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const response = await api.request('/scanning/quick/', {
        method: 'POST',
        body: JSON.stringify({ qr_data: ticketCode.trim() }),
        skipAuth: true
      });

      if (response?.success && response?.data) {
        setResult({
          success: response.data.is_valid,
          message: response.data.message || (response.data.is_valid ? 'Valid Ticket' : 'Invalid Ticket'),
          ticketCode: response.data.ticket_code,
          ticketType: response.data.ticket_type,
          ownerName: response.data.owner_name,
          status: response.data.status
        });
      } else {
        setResult({
          success: false,
          message: 'Unable to validate ticket'
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      setResult({
        success: false,
        message: error.message || 'Error scanning ticket'
      });
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setTicketCode('');
    setResult(null);
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="scanner-section">
        <div className="scanner-container">
          <h1 className="scanner-title">QR Code Scanner</h1>
          <p className="scanner-description">Scan or enter ticket code to validate</p>

          <div className="scanner-input-group">
            <input
              type="text"
              className="scanner-input"
              placeholder="Enter ticket code"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              disabled={scanning}
            />
            <button 
              className="scanner-btn"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? 'Scanning...' : 'Scan Ticket'}
            </button>
          </div>

          {result && (
            <div className={`scanner-result ${result.success ? 'valid' : 'invalid'}`}>
              <div className="result-icon">
                {result.success ? '✓' : '✗'}
              </div>
              <div className="result-content">
                <h2 className="result-status">
                  {result.success ? 'VALID TICKET' : 'INVALID TICKET'}
                </h2>
                <p className="result-message">{result.message}</p>
                
                {result.success && (
                  <div className="result-details">
                    <p><strong>Ticket Code:</strong> {result.ticketCode}</p>
                    <p><strong>Type:</strong> {result.ticketType}</p>
                    <p><strong>Owner:</strong> {result.ownerName}</p>
                    <p><strong>Status:</strong> {result.status}</p>
                  </div>
                )}
              </div>
              
              <button className="reset-btn" onClick={handleReset}>
                Scan Another Ticket
              </button>
            </div>
          )}

          <div className="scanner-info">
            <p>Enter the ticket code from the QR code to check its validity.</p>
            <p>Valid tickets will show green with ticket details.</p>
            <p>Invalid or used tickets will show red.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QRScanner;
