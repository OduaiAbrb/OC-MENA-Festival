import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import './Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('tickets');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: 'January 2024',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNDAiIGZpbGw9IiNGRjZCMzUiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkpEPC90ZXh0Pgo8L3N2Zz4K'
  });

  const [tickets] = useState([
    {
      id: 'TKT001',
      eventName: 'OC MENA Festival 2024',
      date: 'March 15-17, 2024',
      location: 'Dubai World Trade Centre',
      type: 'VIP Pass',
      status: 'active',
      price: '$299',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzMzMzMzMyIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMzMzMzMzMiLz4KPHRleHQgeD0iNTAlIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4K'
    },
    {
      id: 'TKT002',
      eventName: 'Exclusive Artist Meet & Greet',
      date: 'March 16, 2024',
      location: 'VIP Lounge',
      type: 'Premium',
      status: 'active',
      price: '$99',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzMzMzMzMyIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMzMzMzMzMiLz4KPHRleHQgeD0iNTAlIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4K'
    }
  ]);

  const [vendorBooth] = useState({
    boothNumber: 'Awaiting Assignment',
    location: 'Main Exhibition Hall',
    size: '10x10 ft',
    status: 'confirmed',
    package: 'Premium Vendor Package',
    amenities: ['Table', '2 Chairs', 'Power Outlet', 'WiFi', 'Storage'],
    setupDate: 'March 14, 2024',
    setupTime: '8:00 AM - 6:00 PM',
    teardownDate: 'March 18, 2024',
    teardownTime: '9:00 AM - 2:00 PM',
    contactPerson: 'Sarah Johnson',
    vendorQRCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwN0E0QyIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMwMDdBNEMiLz4KPHRleHQgeD0iNTAlIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WZW5kb3IgUVI8L3RleHQ+Cjwvc3ZnPg==',
    freeTickets: 2,
    importantInfo: [
      'Vendor wristbands required for setup access',
      'All vendors must check in at registration desk',
      'Parking available in Vendor Lot A',
      'Security briefing at 7:30 AM on setup day'
    ]
  });

  const [orders] = useState([
    {
      id: 'ORD001',
      date: '2024-01-15',
      invoiceNumber: 'INV-2024-001',
      items: ['VIP Festival Pass', 'Meet & Greet Ticket'],
      total: '$398',
      status: 'completed',
      paymentMethod: 'Credit Card',
      taxAmount: '$31.84',
      downloadable: true
    },
    {
      id: 'ORD002',
      date: '2024-01-10',
      invoiceNumber: 'INV-2024-002',
      items: ['Premium Vendor Booth', '2 Additional Vendor Passes'],
      total: '$1,800',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      taxAmount: '$144.00',
      downloadable: true
    }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/login');
  };

  const renderTickets = () => (
    <div className="dashboard-section">
      <h2 className="section-title">My Tickets</h2>
      <div className="tickets-grid">
        {tickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <div className="ticket-type">{ticket.type}</div>
              <div className={`ticket-status ${ticket.status}`}>{ticket.status}</div>
            </div>
            <div className="ticket-body">
              <h3 className="ticket-event">{ticket.eventName}</h3>
              
              {/* Attendee Information */}
              <div className="attendee-info">
                <h4>Attendee Information</h4>
                <div className="attendee-details">
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">{userData.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{userData.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="ticket-details">
                <div className="ticket-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {ticket.date}
                </div>
                <div className="ticket-detail">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {ticket.location}
                </div>
              </div>
              
              <div className="ticket-footer">
                <div className="ticket-price">{ticket.price}</div>
                <div className="ticket-id">ID: {ticket.id}</div>
              </div>
              
              {/* Ticket Actions */}
              <div className="ticket-actions">
                <button className="action-btn transfer-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                    <polyline points="17 8 23 11 17 14"></polyline>
                  </svg>
                  Transfer Ticket
                </button>
                <button className="action-btn upgrade-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="16"></line>
                  </svg>
                  Upgrade
                </button>
              </div>
              
              <div className="qr-code">
                <img src={ticket.qrCode} alt="QR Code" className="qr-image" />
                <div className="qr-text">Scan for entry</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVendorBooth = () => (
    <div className="dashboard-section">
      <h2 className="section-title">Vendor Booth Information</h2>
      
      {/* Vendor QR Code for Setup */}
      <div className="vendor-qr-section">
        <h3>Setup Day QR Code</h3>
        <p>Use this QR code to verify your identity and pick up vendor wristbands on setup day</p>
        <div className="vendor-qr-card">
          <img src={vendorBooth.vendorQRCode} alt="Vendor QR Code" className="vendor-qr-image" />
          <div className="vendor-qr-text">Vendor Setup QR</div>
        </div>
      </div>
      
      <div className="vendor-booth-card">
        <div className="booth-header">
          <div className="booth-number">
            {vendorBooth.boothNumber === 'Awaiting Assignment' ? (
              <span className="awaiting-assignment">⏳ Awaiting Booth Assignment</span>
            ) : (
              `Booth ${vendorBooth.boothNumber}`
            )}
          </div>
          <div className={`booth-status ${vendorBooth.status}`}>{vendorBooth.status}</div>
        </div>
        
        <div className="booth-body">
          <div className="booth-info-grid">
            <div className="booth-info">
              <h4>Location</h4>
              <p>{vendorBooth.location}</p>
            </div>
            <div className="booth-info">
              <h4>Size</h4>
              <p>{vendorBooth.size}</p>
            </div>
            <div className="booth-info">
              <h4>Package</h4>
              <p>{vendorBooth.package}</p>
            </div>
            <div className="booth-info">
              <h4>Free Tickets</h4>
              <p>{vendorBooth.freeTickets} Vendor Passes Included</p>
            </div>
          </div>
          
          {/* Setup & Teardown Information */}
          <div className="schedule-section">
            <h4>Setup & Teardown Schedule</h4>
            <div className="schedule-grid">
              <div className="schedule-item">
                <div className="schedule-date">{vendorBooth.setupDate}</div>
                <div className="schedule-time">{vendorBooth.setupTime}</div>
                <div className="schedule-label">Setup Day</div>
              </div>
              <div className="schedule-item">
                <div className="schedule-date">{vendorBooth.teardownDate}</div>
                <div className="schedule-time">{vendorBooth.teardownTime}</div>
                <div className="schedule-label">Teardown Day</div>
              </div>
            </div>
          </div>
          
          <div className="amenities-section">
            <h4>Included Amenities</h4>
            <div className="amenities-list">
              {vendorBooth.amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {amenity}
                </div>
              ))}
            </div>
          </div>
          
          {/* Important Information */}
          <div className="important-info-section">
            <h4>Important Information</h4>
            <div className="important-info-list">
              {vendorBooth.importantInfo.map((info, index) => (
                <div key={index} className="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {info}
                </div>
              ))}
            </div>
          </div>
          
          <div className="contact-section">
            <h4>Contact Person</h4>
            <p>{vendorBooth.contactPerson}</p>
            <button className="contact-btn">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="dashboard-section">
      <h2 className="section-title">Order History & Invoices</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <div className="order-id">Order #{order.id}</div>
                <div className="invoice-number">Invoice: {order.invoiceNumber}</div>
              </div>
              <div className={`order-status ${order.status}`}>{order.status}</div>
            </div>
            <div className="order-body">
              <div className="order-date">{order.date}</div>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">{item}</div>
                ))}
              </div>
              <div className="order-financials">
                <div className="order-breakdown">
                  <div className="breakdown-row">
                    <span>Subtotal:</span>
                    <span>${(parseFloat(order.total.replace('$', '')) - parseFloat(order.taxAmount.replace('$', ''))).toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Tax:</span>
                    <span>{order.taxAmount}</span>
                  </div>
                  <div className="breakdown-row total-row">
                    <span>Total:</span>
                    <span className="order-total">{order.total}</span>
                  </div>
                </div>
                <div className="order-payment">
                  <span className="payment-method">{order.paymentMethod}</span>
                </div>
              </div>
              
              {/* Invoice Actions */}
              <div className="invoice-actions">
                <button className="invoice-btn download-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Invoice
                </button>
                <button className="invoice-btn email-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Email Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="dashboard-section">
      <h2 className="section-title">Account Settings</h2>
      <div className="settings-card">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={userData.avatar} alt="Profile" className="avatar-image" />
              <button className="change-avatar-btn">Change Photo</button>
            </div>
            <div className="profile-info">
              <h3>{userData.name}</h3>
              <p>{userData.email}</p>
              <p className="member-since">Member since {userData.memberSince}</p>
            </div>
          </div>
        </div>
        
        {/* Personal Information */}
        <div className="settings-form">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" defaultValue={userData.name.split(' ')[0]} className="form-input" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" defaultValue={userData.name.split(' ')[1] || ''} className="form-input" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" defaultValue={userData.email} className="form-input" />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="+1 (555) 123-4567" className="form-input" />
          </div>
        </div>
        
        {/* Password Change */}
        <div className="password-section">
          <h3>Change Password</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" className="form-input" placeholder="Enter current password" />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-input" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" className="form-input" placeholder="Confirm new password" />
            </div>
          </div>
          
          <button className="change-password-btn">Update Password</button>
        </div>
        
        {/* Save Settings */}
        <div className="settings-actions">
          <button className="save-settings-btn">Save All Changes</button>
          <button className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'tickets':
        return renderTickets();
      case 'vendor':
        return renderVendorBooth();
      case 'orders':
        return renderOrders();
      case 'settings':
        return renderAccountSettings();
      default:
        return renderTickets();
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <div className="logo">
                <div className="logo-icon">
                  <span className="logo-oc">OC</span>
                </div>
                <div className="logo-text-group">
                  <span className="logo-mena">MENA</span>
                  <span className="logo-festival">FESTIVAL</span>
                </div>
              </div>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <img src={userData.avatar} alt="User" />
              </div>
              <div className="user-details">
                <div className="user-name">{userData.name}</div>
                <div className="user-email">{userData.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="dashboard-container">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        
        {/* Sidebar Navigation */}
        <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav className="sidebar-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <button 
                  className={`nav-btn ${activeSection === 'tickets' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('tickets');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                    <line x1="7" y1="7" x2="17" y2="7"></line>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                    <line x1="7" y1="17" x2="9" y2="17"></line>
                  </svg>
                  My Tickets
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-btn ${activeSection === 'vendor' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('vendor');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Vendor Booth
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('orders');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Orders
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-btn ${activeSection === 'settings' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('settings');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24 4.24M7.78 7.78L3.54 3.54"></path>
                  </svg>
                  Account Settings
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
