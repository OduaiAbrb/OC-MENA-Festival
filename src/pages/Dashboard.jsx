import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferModal, setTransferModal] = useState({ open: false, ticket: null });
  const [transferEmail, setTransferEmail] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  const userName = user?.full_name || 'Guest';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDashboardData();
    loadUserProfile();
  }, [isAuthenticated, navigate]);

  const loadUserProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response?.success) {
        setUserProfile(response.data);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [ticketsRes, ordersRes] = await Promise.all([
        api.getMyTickets(),
        api.getMyOrders()
      ]);
      if (ticketsRes?.success) {
        setTickets(ticketsRes.data);
      }
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

  const handleTransfer = async () => {
    if (!transferEmail || !transferModal.ticket) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(transferEmail)) {
      setTransferError('Please enter a valid email address');
      return;
    }

    setTransferLoading(true);
    setTransferError('');
    setTransferSuccess('');

    try {
      const response = await api.createTransfer(transferModal.ticket.id, transferEmail);
      if (response?.success) {
        setTransferSuccess(`Transfer initiated! An email has been sent to ${transferEmail}`);
        setTransferEmail('');
        loadDashboardData(); // Reload tickets
        setTimeout(() => {
          setTransferModal({ open: false, ticket: null });
          setTransferSuccess('');
        }, 3000);
      } else {
        setTransferError(response?.error?.message || 'Failed to initiate transfer');
      }
    } catch (err) {
      setTransferError(err.message || 'Failed to initiate transfer');
    } finally {
      setTransferLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'amphitheater-tickets', label: 'Amphitheater Tickets' },
    { id: 'tickets', label: 'Festival Tickets' },
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
              <button className="action-button" style={{backgroundColor: '#7c3aed', borderColor: '#7c3aed'}} onClick={() => setActiveSection('amphitheater-tickets')}>
                🎵 Amphitheater Tickets ({tickets.filter(t => 
                  t.ticket_type_name?.toLowerCase().includes('amphitheater') ||
                  t.ticket_type_name?.toLowerCase().includes('pacific') ||
                  t.ticket_type_name?.toLowerCase().includes('concert')
                ).length})
              </button>
              <button className="action-button" onClick={() => setActiveSection('tickets')}>Festival Tickets ({tickets.filter(t => 
                !t.ticket_type_name?.toLowerCase().includes('amphitheater') &&
                !t.ticket_type_name?.toLowerCase().includes('pacific') &&
                !t.ticket_type_name?.toLowerCase().includes('concert')
              ).length})</button>
              <button className="action-button" onClick={() => setActiveSection('orders')}>View orders ({orders.length})</button>
              {userProfile?.is_superuser && (
                <button className="action-button" style={{backgroundColor: '#dc2626', borderColor: '#dc2626'}} onClick={() => navigate('/admin-dashboard')}>
                  🎪 Admin Dashboard
                </button>
              )}
              {userProfile?.is_staff && (
                <button className="action-button" style={{backgroundColor: '#7c3aed', borderColor: '#7c3aed'}} onClick={() => navigate('/scanner')}>
                  📱 Scanner
                </button>
              )}
            </div>
          </div>
        );
      case 'amphitheater-tickets':
        return (
          <div className="content-section">
            <h2 className="section-title">Amphitheater Tickets</h2>
            <div className="static-content">
              {tickets.filter(ticket => 
                ticket.ticket_type_name?.toLowerCase().includes('amphitheater') ||
                ticket.ticket_type_name?.toLowerCase().includes('pacific') ||
                ticket.ticket_type_name?.toLowerCase().includes('concert')
              ).length === 0 ? (
                <div style={{textAlign: 'center', padding: '2rem'}}>
                  <div style={{fontSize: '48px', marginBottom: '1rem'}}>🎵</div>
                  <p style={{marginBottom: '1rem'}}>No amphitheater tickets yet.</p>
                  <p style={{color: '#666', fontSize: '14px', marginBottom: '1.5rem'}}>
                    Pacific Amphitheatre tickets include same-day access to the OC MENA Festival!
                  </p>
                  <a href="/amphitheater-tickets" style={{
                    display: 'inline-block',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                    Browse Amphitheater Tickets
                  </a>
                </div>
              ) : (
                tickets.filter(ticket => 
                  ticket.ticket_type_name?.toLowerCase().includes('amphitheater') ||
                  ticket.ticket_type_name?.toLowerCase().includes('pacific') ||
                  ticket.ticket_type_name?.toLowerCase().includes('concert')
                ).map(ticket => (
                  <div key={ticket.id} style={{
                    border: '2px solid #7c3aed',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    backgroundColor: '#faf5ff'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
                      <div style={{flex: 1, minWidth: '200px'}}>
                        <h3 style={{
                          margin: '0 0 0.5rem 0',
                          color: '#5b21b6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          🎵 {ticket.ticket_type_name}
                        </h3>
                        <p style={{margin: '0.25rem 0', color: '#666'}}>
                          <strong>Ticket Code:</strong> {ticket.ticket_code}
                        </p>
                        {ticket.metadata?.section_name && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Section:</strong> {ticket.metadata.section_name}</p>
                        )}
                        {ticket.metadata?.seats && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Seats:</strong> {ticket.metadata.seats}</p>
                        )}
                        {!ticket.metadata?.seats && ticket.metadata?.row && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Row:</strong> {ticket.metadata.row}</p>
                        )}
                        {!ticket.metadata?.seats && ticket.metadata?.seat_number && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Seat:</strong> {ticket.metadata.seat_number}</p>
                        )}
                        {ticket.metadata?.event_date && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Event Date:</strong> {new Date(ticket.metadata.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        )}
                        {ticket.metadata?.price_paid && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Price:</strong> ${(ticket.metadata.price_paid / 100).toFixed(2)}</p>
                        )}
                        <p style={{margin: '0.25rem 0'}}>
                          <strong>Status:</strong>{' '}
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            backgroundColor: ticket.status === 'ISSUED' ? '#dcfce7' : ticket.status === 'USED' ? '#fee2e2' : '#fef3c7',
                            color: ticket.status === 'ISSUED' ? '#166534' : ticket.status === 'USED' ? '#991b1b' : '#92400e'
                          }}>
                            {ticket.status}
                          </span>
                        </p>
                        {ticket.metadata?.includes_festival_access !== false && (
                          <p style={{margin: '0.75rem 0 0 0', padding: '8px 12px', backgroundColor: '#e0f2fe', borderRadius: '6px', fontSize: '13px', color: '#0369a1'}}>
                            ✓ Includes same-day festival access
                          </p>
                        )}
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
                        {ticket.qr_code && (
                          <>
                            <img 
                              src={ticket.qr_code} 
                              alt={`QR Code for ${ticket.ticket_code}`} 
                              style={{
                                width: '150px',
                                height: '150px',
                                border: '2px solid #7c3aed',
                                padding: '8px',
                                backgroundColor: 'white',
                                borderRadius: '8px'
                              }} 
                            />
                            <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', maxWidth: '150px', textAlign: 'center'}}>
                              Scan for amphitheater entry
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'tickets':
        return (
          <div className="content-section">
            <h2 className="section-title">Festival Tickets</h2>
            <div className="static-content">
              {tickets.length === 0 ? (
                <p>No tickets yet. <a href="/tickets" style={{color: '#0284c7'}}>Purchase tickets</a> to get started!</p>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} style={{
                    border: ticket.ticket_type_name?.toLowerCase().includes('vendor') || 
                           ticket.ticket_type_name?.toLowerCase().includes('booth') ? 
                           '2px solid #9333ea' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    backgroundColor: ticket.ticket_type_name?.toLowerCase().includes('vendor') || 
                                   ticket.ticket_type_name?.toLowerCase().includes('booth') ? 
                                   '#faf5ff' : '#fff'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
                      <div style={{flex: 1, minWidth: '200px'}}>
                        <h3 style={{
                          margin: '0 0 0.5rem 0',
                          color: ticket.ticket_type_name?.toLowerCase().includes('vendor') || 
                                 ticket.ticket_type_name?.toLowerCase().includes('booth') ? 
                                 '#6b21a8' : '#111',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {(ticket.ticket_type_name?.toLowerCase().includes('vendor') || 
                            ticket.ticket_type_name?.toLowerCase().includes('booth')) && '🏪 '}
                          {ticket.ticket_type_name}
                        </h3>
                        <p style={{margin: '0.25rem 0', color: '#666'}}>
                          <strong>{(ticket.ticket_type_name?.toLowerCase().includes('vendor') || 
                                    ticket.ticket_type_name?.toLowerCase().includes('booth')) ? 
                                   'Booth Code:' : 'Code:'}</strong> {ticket.ticket_code}
                        </p>
                        {ticket.metadata?.booth_name && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Booth Name:</strong> {ticket.metadata.booth_name}</p>
                        )}
                        {ticket.metadata?.legal_business_name && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Business:</strong> {ticket.metadata.legal_business_name}</p>
                        )}
                        {ticket.metadata?.contact_email && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Contact:</strong> {ticket.metadata.contact_email}</p>
                        )}
                        {ticket.metadata?.phone_number && (
                          <p style={{margin: '0.25rem 0', color: '#666'}}><strong>Phone:</strong> {ticket.metadata.phone_number}</p>
                        )}
                        <p style={{margin: '0.25rem 0'}}>
                          <strong>Status:</strong>{' '}
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            backgroundColor: ticket.status === 'ISSUED' ? '#dcfce7' : ticket.status === 'USED' ? '#fee2e2' : '#fef3c7',
                            color: ticket.status === 'ISSUED' ? '#166534' : ticket.status === 'USED' ? '#991b1b' : '#92400e'
                          }}>
                            {ticket.status}
                          </span>
                        </p>
                        {ticket.status === 'ISSUED' && 
                         !ticket.ticket_type_name?.toLowerCase().includes('vendor') && 
                         !ticket.ticket_type_name?.toLowerCase().includes('booth') && (
                          <button 
                            onClick={() => {
                              setTransferModal({ open: true, ticket });
                              setTransferEmail('');
                              setTransferError('');
                              setTransferSuccess('');
                            }}
                            style={{
                              marginTop: '1rem',
                              padding: '0.5rem 1rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem'
                            }}
                          >
                            Transfer Ticket
                          </button>
                        )}
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
                        {ticket.qr_code && (
                          <>
                            <img 
                              src={ticket.qr_code} 
                              alt={`QR Code for ${ticket.ticket_code}`} 
                              style={{
                                width: '150px',
                                height: '150px',
                                border: ticket.ticket_type_name?.toLowerCase().includes('vendor') || 
                                       ticket.ticket_type_name?.toLowerCase().includes('booth') ? 
                                       '2px solid #9333ea' : '1px solid #ddd',
                                padding: '8px',
                                backgroundColor: 'white',
                                borderRadius: '8px'
                              }} 
                            />
                            <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', maxWidth: '150px', textAlign: 'center'}}>
                              Scan to validate
                            </p>
                            {(ticket.ticket_type_name?.toLowerCase().includes('vendor') || 
                              ticket.ticket_type_name?.toLowerCase().includes('booth')) && (
                              <a 
                                href={ticket.qr_code} 
                                download={`vendor-booth-${ticket.ticket_code}.png`}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#9333ea',
                                  color: 'white',
                                  textDecoration: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600'
                                }}
                              >
                                Download QR
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
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
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
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

      {/* Transfer Modal */}
      {transferModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{margin: '0 0 1rem 0'}}>Transfer Ticket</h2>
            <p style={{color: '#666', marginBottom: '1rem'}}>
              Transfer <strong>{transferModal.ticket?.ticket_type_name}</strong> to another person
            </p>
            
            {transferSuccess ? (
              <div style={{padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#166534', marginBottom: '1rem'}}>
                {transferSuccess}
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Recipient's email address"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
                
                {transferError && (
                  <div style={{padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '6px', color: '#991b1b', marginBottom: '1rem'}}>
                    {transferError}
                  </div>
                )}
                
                <div style={{display: 'flex', gap: '1rem'}}>
                  <button
                    onClick={() => setTransferModal({ open: false, ticket: null })}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={transferLoading || !transferEmail}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      cursor: transferLoading ? 'not-allowed' : 'pointer',
                      opacity: transferLoading ? 0.6 : 1
                    }}
                  >
                    {transferLoading ? 'Transferring...' : 'Transfer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
