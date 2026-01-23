import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTicketsSold: 0,
    totalRevenue: 0,
    totalAttendees: 0,
    totalVendors: 0,
    ticketsSoldToday: 0,
    vendorRegistrationsToday: 0
  });
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [bazaarRegistrations, setBazaarRegistrations] = useState([]);
  const [foodRegistrations, setFoodRegistrations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndFetchData = async () => {
    if (!api.isAuthenticated()) {
      navigate('/login?redirect=/admin-dashboard');
      return;
    }

    try {
      const profileResponse = await api.getProfile();
      if (!profileResponse.success || !profileResponse.data.is_superuser) {
        setError('Access denied. Admin permissions required.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      await fetchAllData();
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch ticket types
      const ticketsResponse = await api.getTicketTypes();
      if (ticketsResponse.success) {
        setTickets(ticketsResponse.data);
        
        // Calculate stats from ticket types
        const totalSold = ticketsResponse.data.reduce((sum, t) => sum + (t.sold_count || 0), 0);
        const totalRevenue = ticketsResponse.data.reduce((sum, t) => sum + ((t.sold_count || 0) * (t.price_cents || 0) / 100), 0);
        
        setStats(prev => ({
          ...prev,
          totalTicketsSold: totalSold,
          totalRevenue: totalRevenue
        }));
      }

      // Fetch all individual tickets for vendor booth display
      try {
        const allTicketsResponse = await api.getAllTickets();
        if (allTicketsResponse.success) {
          setAllTickets(allTicketsResponse.data);
        }
      } catch (err) {
        console.log('All tickets data not available');
      }

      // Fetch vendor registration data
      try {
        const bazaarResponse = await api.getBazaarRegistrations();
        if (bazaarResponse.success) {
          setBazaarRegistrations(bazaarResponse.data);
        }
      } catch (err) {
        console.log('Bazaar registrations not available');
      }

      try {
        const foodResponse = await api.getFoodRegistrations();
        if (foodResponse.success) {
          setFoodRegistrations(foodResponse.data);
        }
      } catch (err) {
        console.log('Food registrations not available');
      }

      // Update vendor stats
      try {
        const vendorResponse = await api.getVendorDashboard();
        if (vendorResponse.success) {
          setStats(prev => ({
            ...prev,
            totalVendors: vendorResponse.data.registrations?.length || 0
          }));
        }
      } catch (err) {
        console.log('Vendor data not available');
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <h2>⚠️ {error}</h2>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🎪 OC MENA Festival Dashboard</h1>
          <p className="admin-subtitle">Stakeholder Analytics & Management</p>
        </div>
        <div className="admin-header-actions">
          <button onClick={() => navigate('/')} className="admin-btn secondary">
            ← Back to Site
          </button>
          <a 
            href="https://api-production-34dd.up.railway.app/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="admin-btn primary"
          >
            Django Admin →
          </a>
        </div>
      </header>

      <nav className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          🎫 Tickets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          🏪 Vendors
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card tickets">
                <div className="stat-icon">🎫</div>
                <div className="stat-info">
                  <h3>Total Tickets Sold</h3>
                  <p className="stat-value">{stats.totalTicketsSold}</p>
                </div>
              </div>
              <div className="stat-card revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="stat-card vendors">
                <div className="stat-icon">🏪</div>
                <div className="stat-info">
                  <h3>Vendor Registrations</h3>
                  <p className="stat-value">{stats.totalVendors}</p>
                </div>
              </div>
              <div className="stat-card attendees">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Total Attendees</h3>
                  <p className="stat-value">{stats.totalTicketsSold}</p>
                </div>
              </div>
            </div>

            <div className="quick-links">
              <h2>Quick Actions</h2>
              <div className="quick-links-grid">
                <button onClick={() => setActiveTab('tickets')} className="quick-link">
                  <span className="link-icon">🎫</span>
                  <span>View Tickets</span>
                </button>
                <button onClick={() => setActiveTab('vendors')} className="quick-link">
                  <span className="link-icon">🏪</span>
                  <span>View Vendors</span>
                </button>
                <a 
                  href="https://api-production-34dd.up.railway.app/admin/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="quick-link"
                >
                  <span className="link-icon">⚙️</span>
                  <span>Django Admin (Advanced)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tickets-tab">
            <h2>🎫 Ticket Types & Sales</h2>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket Type</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Sold</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="ticket-name">
                        <strong>{ticket.name}</strong>
                        <span className="ticket-slug">{ticket.slug}</span>
                      </td>
                      <td>{formatCurrency(ticket.price_cents)}</td>
                      <td>{ticket.capacity || 'Unlimited'}</td>
                      <td>{ticket.sold_count || 0}</td>
                      <td>{formatCurrency((ticket.sold_count || 0) * (ticket.price_cents || 0))}</td>
                      <td>
                        <span className={`status-badge ${ticket.is_active ? 'active' : 'inactive'}`}>
                          {ticket.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="vendors-tab">
            <h2>🏪 Vendor Management</h2>
            
            <div className="vendor-summary">
              <div className="vendor-stat">
                <h4>Bazaar Registrations</h4>
                <p className="vendor-count">{bazaarRegistrations.length}</p>
              </div>
              <div className="vendor-stat">
                <h4>Food Registrations</h4>
                <p className="vendor-count">{foodRegistrations.length}</p>
              </div>
              <div className="vendor-stat">
                <h4>Total Vendors</h4>
                <p className="vendor-count">{bazaarRegistrations.length + foodRegistrations.length}</p>
              </div>
            </div>

            <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>🎪 Bazaar Vendor Registrations</h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business Type</th>
                    <th>Business Name</th>
                    <th>Booth Name</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Social Media</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {bazaarRegistrations.map(reg => (
                    <tr key={reg.id}>
                      <td><strong>{reg.business_type}</strong></td>
                      <td>{reg.legal_business_name}</td>
                      <td>{reg.booth_name}</td>
                      <td>{reg.contact_email}</td>
                      <td>{reg.phone_number}</td>
                      <td style={{fontSize: '0.85em'}}>
                        {reg.instagram_handle && <div>IG: @{reg.instagram_handle}</div>}
                        {reg.facebook_handle && <div>FB: {reg.facebook_handle}</div>}
                        {reg.tiktok_handle && <div>TT: @{reg.tiktok_handle}</div>}
                        {!reg.instagram_handle && !reg.facebook_handle && !reg.tiktok_handle && 'N/A'}
                      </td>
                      <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {bazaarRegistrations.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                        No bazaar vendor registrations yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>🍔 Food Vendor Registrations</h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business Type</th>
                    <th>Business Name</th>
                    <th>Booth Name</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Health Permit</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {foodRegistrations.map(reg => (
                    <tr key={reg.id}>
                      <td><strong>{reg.business_type}</strong></td>
                      <td>{reg.legal_business_name}</td>
                      <td>{reg.booth_name}</td>
                      <td>{reg.contact_email}</td>
                      <td>{reg.phone_number}</td>
                      <td>
                        <span className={`status-badge ${reg.has_health_permit ? 'active' : 'inactive'}`}>
                          {reg.has_health_permit ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {foodRegistrations.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                        No food vendor registrations yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>🎫 Vendor Booth Tickets (Paid)</h3>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booth Type</th>
                    <th>Business Name</th>
                    <th>Contact</th>
                    <th>Booth Name</th>
                    <th>Ticket Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTickets
                    .filter(t => {
                      const name = t.ticket_type_name?.toLowerCase() || '';
                      return name.includes('vendor') || name.includes('booth') || name.includes('bazaar') || name.includes('food');
                    })
                    .map(ticket => (
                      <tr key={ticket.id}>
                        <td><strong>{ticket.ticket_type_name}</strong></td>
                        <td>{ticket.metadata?.legal_business_name || 'N/A'}</td>
                        <td>
                          {ticket.metadata?.contact_email ? (
                            <div>
                              <div>{ticket.metadata.contact_email}</div>
                              <div style={{fontSize: '0.85em', color: '#666'}}>{ticket.metadata.phone_number || ''}</div>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td>{ticket.metadata?.booth_name || 'N/A'}</td>
                        <td><code>{ticket.ticket_code || 'N/A'}</code></td>
                        <td>
                          <span className={`status-badge ${ticket.status?.toLowerCase()}`}>
                            {ticket.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {allTickets.filter(t => {
                    const name = t.ticket_type_name?.toLowerCase() || '';
                    return name.includes('vendor') || name.includes('booth') || name.includes('bazaar') || name.includes('food');
                  }).length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                        No vendor booth tickets yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      <footer className="admin-footer">
        <p>OC MENA Festival 2026 - Stakeholder Dashboard</p>
        <p>Data updates in real-time from the database</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
