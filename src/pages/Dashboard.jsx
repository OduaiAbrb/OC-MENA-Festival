import React, { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userName = 'First Last';

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
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="content-section">
            <h2 className="section-title">Hello {userName}</h2>
            <p className="section-subtitle">(not {userName}? Log out)</p>
            <div className="dashboard-buttons">
              <button className="action-button">View booth details</button>
              <button className="action-button">View tickets</button>
            </div>
          </div>
        );
      case 'tickets':
        return (
          <div className="content-section">
            <h2 className="section-title">Tickets</h2>
            <div className="static-content">
              <p>Ticket ID: TKT-2024-001</p>
              <p>Event: OC MENA Festival</p>
              <p>Type: 3-Day Pass</p>
              <p>Status: Active</p>
            </div>
          </div>
        );
      case 'vendor-booth':
        return (
          <div className="content-section">
            <h2 className="section-title">Vendor Booth</h2>
            <div className="static-content">
              <p>Booth ID: BOOTH-001</p>
              <p>Location: Section A</p>
              <p>Size: 10x10 ft</p>
              <p>Status: Confirmed</p>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="content-section">
            <h2 className="section-title">Orders</h2>
            <div className="static-content">
              <p>Order ID: ORD-2024-001</p>
              <p>Date: January 15, 2024</p>
              <p>Total: $150.00</p>
              
              <p>Status: Completed</p>
            </div>
          </div>
        );
      case 'downloads':
        return (
          <div className="content-section">
            <h2 className="section-title">Downloads</h2>
            <div className="static-content">
              <p>Festival Guide - PDF</p>
              <p>Vendor Handbook - PDF</p>
              <p>Map & Schedule - PDF</p>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="content-section">
            <h2 className="section-title">Addresses</h2>
            <div className="static-content">
              <p>Primary Address: 123 Main St, Orange County, CA 92801</p>
              <p>Billing Address: Same as primary</p>
            </div>
          </div>
        );
      case 'account-details':
        return (
          <div className="content-section">
            <h2 className="section-title">Account details</h2>
            <div className="static-content">
              <p>Name: {userName}</p>
              <p>Email: user@example.com</p>
              <p>Phone: (555) 123-4567</p>
              <p>Member Since: January 2024</p>
            </div>
          </div>
        );
      case 'logout':
        return (
          <div className="content-section">
            <h2 className="section-title">Log out</h2>
            <div className="static-content">
              <p>You have been logged out successfully.</p>
            </div>
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

        <TornPaperWrapper>
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
        </TornPaperWrapper>

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
