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
  const [vendorRegistrations, setVendorRegistrations] = useState([]);
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
      // Fetch tickets data
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

      // Fetch vendor dashboard data
      try {
        const vendorResponse = await api.getVendorDashboard();
        if (vendorResponse.success) {
          setVendorRegistrations(vendorResponse.data.registrations || []);
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
        <button 
          className={`tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          📱 Scanner
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
                <a href="https://api-production-34dd.up.railway.app/admin/tickets/ticket/" target="_blank" rel="noopener noreferrer" className="quick-link">
                  <span className="link-icon">🎫</span>
                  <span>View All Tickets</span>
                </a>
                <a href="https://api-production-34dd.up.railway.app/admin/tickets/order/" target="_blank" rel="noopener noreferrer" className="quick-link">
                  <span className="link-icon">🛒</span>
                  <span>View All Orders</span>
                </a>
                <a href="https://api-production-34dd.up.railway.app/admin/vendors/bazaarvendorregistration/" target="_blank" rel="noopener noreferrer" className="quick-link">
                  <span className="link-icon">🏪</span>
                  <span>Bazaar Vendors</span>
                </a>
                <a href="https://api-production-34dd.up.railway.app/admin/vendors/foodvendorregistration/" target="_blank" rel="noopener noreferrer" className="quick-link">
                  <span className="link-icon">🍔</span>
                  <span>Food Vendors</span>
                </a>
                <a href="https://api-production-34dd.up.railway.app/admin/accounts/user/" target="_blank" rel="noopener noreferrer" className="quick-link">
                  <span className="link-icon">👥</span>
                  <span>All Users</span>
                </a>
                <a href="https://api-production-34dd.up.railway.app/admin/scanning/scanlog/" target="_blank" rel="noopener noreferrer" className="quick-link">
                  <span className="link-icon">📱</span>
                  <span>Scan Logs</span>
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
            <div className="table-actions">
              <a 
                href="https://api-production-34dd.up.railway.app/admin/tickets/tickettype/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="admin-btn primary"
              >
                Manage Ticket Types in Admin →
              </a>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="vendors-tab">
            <h2>🏪 Vendor Registrations</h2>
            <p className="tab-description">
              View all vendor booth registrations. Click to open full details in Django Admin.
            </p>
            
            <div className="vendor-summary">
              <div className="vendor-stat">
                <h4>Bazaar Vendors</h4>
                <p className="vendor-count">{vendorRegistrations.filter(v => v.business_type === 'bazaar').length || 0}</p>
              </div>
              <div className="vendor-stat">
                <h4>Food Vendors</h4>
                <p className="vendor-count">{vendorRegistrations.filter(v => v.business_type === 'food').length || 0}</p>
              </div>
            </div>

            <div className="vendor-actions">
              <a 
                href="https://api-production-34dd.up.railway.app/admin/vendors/bazaarvendorregistration/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="admin-btn primary"
              >
                View Bazaar Registrations →
              </a>
              <a 
                href="https://api-production-34dd.up.railway.app/admin/vendors/foodvendorregistration/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="admin-btn primary"
              >
                View Food Registrations →
              </a>
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="scanner-tab">
            <h2>📱 Scanner & Entry Management</h2>
            <p className="tab-description">
              Monitor ticket scans and festival entry in real-time.
            </p>
            
            <div className="scanner-actions">
              <button 
                onClick={() => navigate('/scanner')}
                className="admin-btn large primary"
              >
                🔍 Open Scanner
              </button>
              <a 
                href="https://api-production-34dd.up.railway.app/admin/scanning/scanlog/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="admin-btn large secondary"
              >
                📊 View All Scan Logs
              </a>
            </div>

            <div className="scanner-info">
              <h3>Scanner Access</h3>
              <p>Staff members can access the scanner at <code>/scanner</code></p>
              <p>Usher credentials:</p>
              <ul>
                <li><strong>Email:</strong> usher1@ocmena.com</li>
                <li><strong>Password:</strong> Usher2026!</li>
              </ul>
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
