import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './QRScanner.css';

const QRScanner = () => {
  const [searchParams] = useSearchParams();
  const [ticketCode, setTicketCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  // Auto-scan if code is in URL (from QR code scan)
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setTicketCode(codeFromUrl);
      validateTicket(codeFromUrl);
    }
  }, [searchParams]);

  const validateTicket = async (code) => {
    if (!code || !code.trim()) {
      setResult({
        success: false,
        message: 'Please enter a ticket code'
      });
      return;
    }

    setScanning(true);
    setResult(null);

    try {
      const response = await api.request('/scan/quick/', {
        method: 'POST',
        body: JSON.stringify({ qr_data: code.trim() }),
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

  const handleScan = () => validateTicket(ticketCode);

  const handleReset = () => {
    setTicketCode('');
    setResult(null);
  };

  return (
    <div className="page-wrapper" style={{overflow: 'hidden'}}>
      <section className="scanner-section">
        <div className="scanner-container">
          <h1 className="scanner-title">Ticket Validation</h1>
          <p className="scanner-description">Scan QR code or enter ticket code to validate</p>

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
              {scanning ? 'Validating...' : 'Validate Ticket'}
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
                    <p><strong>Status:</strong> <span className={`status-badge status-${result.status?.toLowerCase()}`}>{result.status}</span></p>
                  </div>
                )}
              </div>
              
              <button className="reset-btn" onClick={handleReset}>
                Validate Another Ticket
              </button>
            </div>
          )}

          {!result && (
            <div className="scanner-info">
              <h3>How it works:</h3>
              <ul>
                <li>Scan a ticket QR code with your phone camera</li>
                <li>Or enter the ticket code manually above</li>
                <li>See instant validation - green = valid, red = invalid</li>
              </ul>
              <div className="status-legend">
                <h4>Ticket Status Guide:</h4>
                <p><span className="status-badge status-issued">ISSUED</span> - Valid, ready to use</p>
                <p><span className="status-badge status-used">USED</span> - Already used for entry</p>
                <p><span className="status-badge status-cancelled">CANCELLED</span> - No longer valid</p>
                <p><span className="status-badge status-transfer_pending">TRANSFER PENDING</span> - Being transferred</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default QRScanner;
