import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.full_name || 'Guest';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    try {
      const [ticketsRes, ordersRes] = await Promise.all([
        api.getMyTickets(),
        api.getMyOrders()
      ]);
      if (ticketsRes?.success) setTickets(ticketsRes.data);
      if (ordersRes?.success) setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tickets', label: 'Tickets' },
    { id: 'vendor-booth', label: 'Vendor Booth' },
    { id: 'orders', label: 'Orders' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'account-details', label: 'Account details' },
    { id: 'logout', label: 'Log out' }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="content-section">
          <p>Loading...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="content-section">
            <h2 className="section-title">Hello {userName}</h2>
            <p className="section-subtitle">(<span onClick={handleLogout} style={{cursor: 'pointer', textDecoration: 'underline'}}>not {userName}? Log out</span>)</p>
            <div className="dashboard-buttons">
              <button className="action-button" onClick={() => setActiveSection('tickets')}>View tickets ({tickets.length})</button>
              <button className="action-button" onClick={() => setActiveSection('orders')}>View orders ({orders.length})</button>
            </div>
          </div>
        );
      case 'tickets':
        return (
          <div className="content-section">
            <h2 className="section-title">My Tickets</h2>
            <div className="static-content">
              {tickets.length === 0 ? (
                <p>No tickets yet. Purchase tickets to get started!</p>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} style={{borderBottom: '1px solid #eee', padding: '1rem 0'}}>
                    <p><strong>Code:</strong> {ticket.ticket_code}</p>
                    <p><strong>Type:</strong> {ticket.ticket_type_name}</p>
                    <p><strong>Status:</strong> {ticket.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'vendor-booth':
        return (
          <div className="content-section">
            <h2 className="section-title">Vendor Booth</h2>
            <div className="static-content">
              {user?.role === 'VENDOR' ? (
                <p>View your vendor dashboard for booth details.</p>
              ) : (
                <p>This section is for vendors only.</p>
              )}
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="content-section">
            <h2 className="section-title">Orders</h2>
            <div className="static-content">
              {orders.length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} style={{borderBottom: '1px solid #eee', padding: '1rem 0'}}>
                    <p><strong>Order:</strong> {order.order_number}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Total:</strong> ${order.total}</p>
                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'downloads':
        return (
          <div className="content-section">
            <h2 className="section-title">Downloads</h2>
            <div className="static-content">
              <p>Festival Guide - Coming Soon</p>
              <p>Vendor Handbook - Coming Soon</p>
              <p>Map & Schedule - Coming Soon</p>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="content-section">
            <h2 className="section-title">Addresses</h2>
            <div className="static-content">
              <p>Address management coming soon.</p>
            </div>
          </div>
        );
      case 'account-details':
        return (
          <div className="content-section">
            <h2 className="section-title">Account details</h2>
            <div className="static-content">
              <p><strong>Name:</strong> {user?.full_name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone || 'Not set'}</p>
              <p><strong>Role:</strong> {user?.role}</p>
            </div>
          </div>
        );
      case 'logout':
        handleLogout();
        return (
          <div className="content-section">
            <h2 className="section-title">Logging out...</h2>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <div className="dashboard-container">
          <div className="dashboard-page-header">
            <h1 className="dashboard-title">My Account</h1>
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
          </div>

          <div className={`dashboard-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
              <nav className="sidebar-nav">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsSidebarOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <main className="dashboard-content">
              {renderContent()}
            </main>
          </div>
        </div>

        <div className="lanterns-container">
          <img src="/lanterns.png" alt="Festival Lanterns" className="lanterns-image" />
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
