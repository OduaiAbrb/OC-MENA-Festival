import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendorData, setVendorData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/vendor-dashboard');
      return;
    }
    loadVendorData();
  }, [isAuthenticated, navigate]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [vendorRes, ticketsRes, ordersRes] = await Promise.all([
        api.getVendorDashboard(),
        api.getMyTickets(),
        api.getMyOrders()
      ]);

      if (vendorRes?.success) {
        setVendorData(vendorRes.data);
      }

      if (ticketsRes?.success) {
        // Filter for vendor/booth tickets
        const vendorTickets = ticketsRes.data.filter(ticket => {
          const name = ticket.ticket_type_name?.toLowerCase() || '';
          return name.includes('vendor') || name.includes('booth') || 
                 name.includes('bazaar') || name.includes('food');
        });
        setTickets(vendorTickets);
      }

      if (ordersRes?.success) {
        setOrders(ordersRes.data);
      }
    } catch (err) {
      console.error('Failed to load vendor data:', err);
      setError('Failed to load vendor dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (orderId) => {
    try {
      const blob = await api.downloadOrderTicketsPDF(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <AnnouncementBar />
        <div className="vendor-loading">
          <div className="loading-spinner"></div>
          <p>Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-dashboard">
        <AnnouncementBar />
        <div className="vendor-error">
          <h2>⚠️ {error}</h2>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const profile = vendorData?.profile;

  return (
    <div className="vendor-dashboard">
      <AnnouncementBar />
      
      <div className="vendor-dashboard-container">
        <aside className="vendor-sidebar">
          <div className="vendor-profile-card">
            <div className="vendor-avatar">
              {profile?.business_name?.[0] || user?.full_name?.[0] || 'V'}
            </div>
            <h3>{profile?.business_name || 'Vendor'}</h3>
            <p>{user?.email}</p>
          </div>

          <nav className="vendor-nav">
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={activeTab === 'booth' ? 'active' : ''}
              onClick={() => setActiveTab('booth')}
            >
              🏪 My Booth
            </button>
            <button 
              className={activeTab === 'tickets' ? 'active' : ''}
              onClick={() => setActiveTab('tickets')}
            >
              🎫 Tickets & Passes
            </button>
            <button 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              📦 Orders
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>

          <button className="vendor-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </aside>

        <main className="vendor-main">
          <header className="vendor-header">
            <h1>🎪 Vendor Dashboard</h1>
            <p>Welcome back, {profile?.contact_name || user?.full_name || 'Vendor'}!</p>
          </header>

          {activeTab === 'overview' && (
            <div className="vendor-content">
              <div className="vendor-stats-grid">
                <div className="vendor-stat-card">
                  <div className="stat-icon">🎫</div>
                  <div className="stat-info">
                    <h4>Tickets</h4>
                    <p className="stat-value">{vendorData?.tickets_count || tickets.length}</p>
                  </div>
                </div>
                <div className="vendor-stat-card">
                  <div className="stat-icon">🎁</div>
                  <div className="stat-info">
                    <h4>Included Tickets</h4>
                    <p className="stat-value">{vendorData?.included_tickets || 0}</p>
                  </div>
                </div>
                <div className="vendor-stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h4>Orders</h4>
                    <p className="stat-value">{orders.length}</p>
                  </div>
                </div>
                <div className="vendor-stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h4>Status</h4>
                    <p className="stat-value status-active">Active</p>
                  </div>
                </div>
              </div>

              <div className="vendor-quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button onClick={() => setActiveTab('tickets')}>
                    🎫 View My Tickets
                  </button>
                  <button onClick={() => navigate('/vendor-booths')}>
                    🏪 View Booth Options
                  </button>
                  <button onClick={() => navigate('/contact')}>
                    📧 Contact Support
                  </button>
                </div>
              </div>

              <div className="vendor-info-section">
                <h3>Important Information</h3>
                <div className="info-cards">
                  <div className="info-card">
                    <h4>📅 Setup Day</h4>
                    <p>Vendor setup begins one day before the festival. Arrive early to set up your booth.</p>
                  </div>
                  <div className="info-card">
                    <h4>🎫 Entry Passes</h4>
                    <p>Your vendor pass includes entry for setup day and all festival days.</p>
                  </div>
                  <div className="info-card">
                    <h4>📍 Location</h4>
                    <p>OC Fair & Event Center<br/>88 Fair Drive, Costa Mesa, CA 92626</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booth' && (
            <div className="vendor-content">
              <h2>🏪 My Booth Information</h2>
              {profile ? (
                <div className="booth-details">
                  <div className="booth-card">
                    <h3>{profile.business_name}</h3>
                    <div className="booth-info-grid">
                      <div className="booth-info-item">
                        <label>Business Type</label>
                        <span>{profile.vendor_type || 'N/A'}</span>
                      </div>
                      <div className="booth-info-item">
                        <label>Contact Name</label>
                        <span>{profile.contact_name}</span>
                      </div>
                      <div className="booth-info-item">
                        <label>Contact Email</label>
                        <span>{profile.contact_email}</span>
                      </div>
                      <div className="booth-info-item">
                        <label>Phone</label>
                        <span>{profile.contact_phone || 'N/A'}</span>
                      </div>
                      <div className="booth-info-item">
                        <label>Setup Pass ID</label>
                        <span className="pass-id">{profile.setup_qr_id || 'Pending'}</span>
                      </div>
                      <div className="booth-info-item">
                        <label>Status</label>
                        <span className={`status ${profile.is_approved ? 'approved' : 'pending'}`}>
                          {profile.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-booth">
                  <p>No booth information found. Register for a vendor booth to see your details here.</p>
                  <button onClick={() => navigate('/vendor-booths')}>Browse Booth Options</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="vendor-content">
              <h2>🎫 My Tickets & Passes</h2>
              {tickets.length > 0 ? (
                <div className="tickets-list">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-info">
                        <h4>{ticket.ticket_type_name}</h4>
                        <p className="ticket-code">Code: {ticket.ticket_code}</p>
                        <p className="ticket-status">Status: {ticket.status}</p>
                      </div>
                      <div className="ticket-actions">
                        <button 
                          className="download-btn"
                          onClick={() => handleDownloadPDF(ticket.order_id)}
                        >
                          📥 Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-tickets">
                  <p>No tickets found. Purchase a vendor booth to get your entry passes.</p>
                  <button onClick={() => navigate('/vendor-booths')}>Get Vendor Booth</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="vendor-content">
              <h2>📦 My Orders</h2>
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h4>Order #{order.order_number}</h4>
                        <span className={`order-status ${order.status?.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> ${(order.total_cents / 100).toFixed(2)}</p>
                        <p><strong>Items:</strong> {order.items_count || order.items?.length || 0}</p>
                      </div>
                      <div className="order-actions">
                        <button 
                          className="download-btn"
                          onClick={() => handleDownloadPDF(order.id)}
                        >
                          📥 Download Tickets PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-orders">
                  <p>No orders found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="vendor-content">
              <h2>⚙️ Settings</h2>
              <div className="settings-section">
                <h3>Account Information</h3>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={user?.full_name || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user?.email || ''} disabled />
                  </div>
                </div>
                <p className="settings-note">Contact support to update your account information.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default VendorDashboard;
