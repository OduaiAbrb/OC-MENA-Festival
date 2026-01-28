import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import './CoordinatorDashboard.css';

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Overview stats
  const [stats, setStats] = useState({
    pendingPayments: 0,
    totalOrders: 0,
    totalTickets: 0,
    scannedTickets: 0
  });
  
  // Pending payments
  const [pendingOrders, setPendingOrders] = useState([]);
  
  // QR Scanner
  const [scannerInput, setScannerInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  
  // Ticket search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Selected ticket details
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data.is_staff) {
        setUser(response.data);
      } else {
        navigate('/login');
      }
    } catch (error) {
      navigate('/login');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load pending payments
      const ordersResponse = await api.request('/payments/orders/');
      if (ordersResponse.success) {
        const pending = ordersResponse.data.filter(o => o.status === 'PAYMENT_PENDING');
        setPendingOrders(pending);
        setStats(prev => ({
          ...prev,
          pendingPayments: pending.length,
          totalOrders: ordersResponse.data.length
        }));
      }
      
      // Load ticket stats
      const ticketsResponse = await api.request('/tickets/');
      if (ticketsResponse.success) {
        const tickets = ticketsResponse.data;
        setStats(prev => ({
          ...prev,
          totalTickets: tickets.length,
          scannedTickets: tickets.filter(t => t.status === 'USED').length
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    if (!window.confirm('Confirm that cash payment has been received for this order?')) {
      return;
    }
    
    try {
      const response = await api.request(`/payments/orders/${orderId}/verify-payment/`, {
        method: 'POST'
      });
      
      if (response.success) {
        alert('Payment verified successfully!');
        loadData();
      } else {
        alert('Failed to verify payment: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error verifying payment: ' + error.message);
    }
  };

  const handleScanTicket = async (e) => {
    e.preventDefault();
    if (!scannerInput.trim()) return;
    
    setScanLoading(true);
    setScanResult(null);
    
    try {
      const response = await api.request('/scan/validate/', {
        method: 'POST',
        body: JSON.stringify({ qr_data: scannerInput.trim() })
      });
      
      if (response.success) {
        setScanResult(response.data);
      } else {
        setScanResult({
          valid: false,
          message: response.error?.message || 'Invalid ticket'
        });
      }
    } catch (error) {
      setScanResult({
        valid: false,
        message: error.message || 'Error scanning ticket'
      });
    } finally {
      setScanLoading(false);
    }
  };

  const handleCommitScan = async (ticketCode) => {
    if (!window.confirm('Mark this ticket as used?')) {
      return;
    }
    
    try {
      const response = await api.request('/scan/commit/', {
        method: 'POST',
        body: JSON.stringify({ 
          ticket_code: ticketCode,
          gate: 'Main Entrance',
          device_id: 'coordinator-dashboard'
        })
      });
      
      if (response.success) {
        alert('Ticket marked as used!');
        setScanResult(null);
        setScannerInput('');
        loadData();
      } else {
        alert('Failed to mark ticket: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleSearchTickets = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await api.request(`/tickets/?search=${encodeURIComponent(searchQuery.trim())}`);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching tickets:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="coord-section">
      <h2 className="coord-title">Overview</h2>
      <div className="coord-stats-grid">
        <div className="coord-stat-card" style={{borderColor: '#dc2626'}}>
          <div className="coord-stat-value">{stats.pendingPayments}</div>
          <div className="coord-stat-label">Pending Cash Payments</div>
          <button 
            className="coord-stat-action"
            onClick={() => setActiveSection('payments')}
          >
            Review →
          </button>
        </div>
        <div className="coord-stat-card" style={{borderColor: '#0284c7'}}>
          <div className="coord-stat-value">{stats.totalOrders}</div>
          <div className="coord-stat-label">Total Orders</div>
        </div>
        <div className="coord-stat-card" style={{borderColor: '#16a34a'}}>
          <div className="coord-stat-value">{stats.totalTickets}</div>
          <div className="coord-stat-label">Total Tickets</div>
        </div>
        <div className="coord-stat-card" style={{borderColor: '#9333ea'}}>
          <div className="coord-stat-value">{stats.scannedTickets}</div>
          <div className="coord-stat-label">Scanned Tickets</div>
        </div>
      </div>
      
      <div className="coord-quick-actions">
        <h3>Quick Actions</h3>
        <div className="coord-action-buttons">
          <button onClick={() => setActiveSection('scanner')} className="coord-action-btn scanner">
            📱 Scan Ticket
          </button>
          <button onClick={() => setActiveSection('payments')} className="coord-action-btn payments">
            💵 Verify Payments
          </button>
          <button onClick={() => setActiveSection('search')} className="coord-action-btn search">
            🔍 Search Tickets
          </button>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="coord-section">
      <h2 className="coord-title">Pending Cash Payments</h2>
      {pendingOrders.length === 0 ? (
        <div className="coord-empty">
          <p>✓ No pending cash payments</p>
        </div>
      ) : (
        <div className="coord-orders-list">
          {pendingOrders.map(order => (
            <div key={order.id} className="coord-order-card">
              <div className="coord-order-header">
                <h3>Order #{order.order_number}</h3>
                <span className="coord-order-status pending">PENDING</span>
              </div>
              <div className="coord-order-details">
                <p><strong>Customer:</strong> {order.buyer_email}</p>
                <p><strong>Total:</strong> ${(order.total_cents / 100).toFixed(2)}</p>
                <p><strong>Payment Method:</strong> Cash</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Items:</strong> {order.items?.length || 0} ticket(s)</p>
              </div>
              <button 
                className="coord-verify-btn"
                onClick={() => handleVerifyPayment(order.id)}
              >
                ✓ Verify Cash Payment Received
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScanner = () => (
    <div className="coord-section">
      <h2 className="coord-title">QR Code Scanner</h2>
      <form onSubmit={handleScanTicket} className="coord-scanner-form">
        <input
          type="text"
          value={scannerInput}
          onChange={(e) => setScannerInput(e.target.value)}
          placeholder="Scan QR code or enter ticket code..."
          className="coord-scanner-input"
          autoFocus
        />
        <button type="submit" className="coord-scan-btn" disabled={scanLoading}>
          {scanLoading ? 'Scanning...' : '📱 Scan'}
        </button>
      </form>
      
      {scanResult && (
        <div className={`coord-scan-result ${scanResult.valid || scanResult.can_enter ? 'valid' : 'invalid'}`}>
          <div className="coord-scan-header">
            <span className="coord-scan-icon">
              {scanResult.valid || scanResult.can_enter ? '✓' : '✗'}
            </span>
            <h3>{scanResult.message || (scanResult.valid ? 'Valid Ticket' : 'Invalid Ticket')}</h3>
          </div>
          
          {scanResult.ticket_code && (
            <div className="coord-scan-details">
              <p><strong>Ticket Code:</strong> {scanResult.ticket_code}</p>
              <p><strong>Type:</strong> {scanResult.ticket_type}</p>
              <p><strong>Owner:</strong> {scanResult.owner_name}</p>
              <p><strong>Status:</strong> <span className={`status-badge ${scanResult.status?.toLowerCase()}`}>{scanResult.status}</span></p>
              
              {scanResult.section && (
                <p><strong>Section:</strong> {scanResult.section}</p>
              )}
              {scanResult.row && (
                <p><strong>Row:</strong> {scanResult.row}</p>
              )}
              {scanResult.seat && (
                <p><strong>Seat:</strong> {scanResult.seat}</p>
              )}
            </div>
          )}
          
          {scanResult.can_enter && scanResult.status === 'VALID' && (
            <button 
              className="coord-commit-btn"
              onClick={() => handleCommitScan(scanResult.ticket_code)}
            >
              ✓ Mark as Used
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="coord-section">
      <h2 className="coord-title">Search Tickets</h2>
      <form onSubmit={handleSearchTickets} className="coord-search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ticket code, email, or name..."
          className="coord-search-input"
        />
        <button type="submit" className="coord-search-btn" disabled={searchLoading}>
          {searchLoading ? 'Searching...' : '🔍 Search'}
        </button>
      </form>
      
      {searchResults.length > 0 && (
        <div className="coord-search-results">
          <h3>{searchResults.length} ticket(s) found</h3>
          {searchResults.map(ticket => (
            <div 
              key={ticket.id} 
              className="coord-ticket-card"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="coord-ticket-header">
                <h4>{ticket.ticket_type_name}</h4>
                <span className={`status-badge ${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </div>
              <p><strong>Code:</strong> {ticket.ticket_code}</p>
              <p><strong>Owner:</strong> {ticket.owner_name}</p>
              {ticket.metadata?.section_name && (
                <p><strong>Section:</strong> {ticket.metadata.section_name}</p>
              )}
              {ticket.metadata?.seats && (
                <p><strong>Seats:</strong> {ticket.metadata.seats}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {selectedTicket && (
        <div className="coord-modal" onClick={() => setSelectedTicket(null)}>
          <div className="coord-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="coord-modal-close" onClick={() => setSelectedTicket(null)}>×</button>
            <h2>Ticket Details</h2>
            <div className="coord-ticket-details">
              <p><strong>Ticket Code:</strong> {selectedTicket.ticket_code}</p>
              <p><strong>Type:</strong> {selectedTicket.ticket_type_name}</p>
              <p><strong>Owner:</strong> {selectedTicket.owner_name} ({selectedTicket.owner_email})</p>
              <p><strong>Status:</strong> <span className={`status-badge ${selectedTicket.status.toLowerCase()}`}>{selectedTicket.status}</span></p>
              <p><strong>Issued:</strong> {new Date(selectedTicket.issued_at).toLocaleString()}</p>
              {selectedTicket.used_at && (
                <p><strong>Used:</strong> {new Date(selectedTicket.used_at).toLocaleString()}</p>
              )}
              
              {selectedTicket.metadata && Object.keys(selectedTicket.metadata).length > 0 && (
                <>
                  <h3>Additional Details</h3>
                  {Object.entries(selectedTicket.metadata).map(([key, value]) => (
                    <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {String(value)}</p>
                  ))}
                </>
              )}
              
              {selectedTicket.qr_code && (
                <div className="coord-qr-display">
                  <h3>QR Code</h3>
                  <img src={selectedTicket.qr_code} alt="QR Code" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="coordinator-dashboard">
        <AnnouncementBar />
        <div className="coord-container">
          <div className="coord-loading">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="coordinator-dashboard">
      <AnnouncementBar />
      <div className="coord-container">
        <div className="coord-header">
          <h1>Coordinator Dashboard</h1>
          <p>Welcome, {user?.full_name || user?.email}</p>
        </div>
        
        <div className="coord-nav">
          <button 
            className={activeSection === 'overview' ? 'active' : ''}
            onClick={() => setActiveSection('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeSection === 'payments' ? 'active' : ''}
            onClick={() => setActiveSection('payments')}
          >
            💵 Payments ({stats.pendingPayments})
          </button>
          <button 
            className={activeSection === 'scanner' ? 'active' : ''}
            onClick={() => setActiveSection('scanner')}
          >
            📱 Scanner
          </button>
          <button 
            className={activeSection === 'search' ? 'active' : ''}
            onClick={() => setActiveSection('search')}
          >
            🔍 Search
          </button>
        </div>
        
        <div className="coord-content">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'payments' && renderPayments()}
          {activeSection === 'scanner' && renderScanner()}
          {activeSection === 'search' && renderSearch()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoordinatorDashboard;
