import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EventSchedule from './pages/EventSchedule';
import Vendors from './pages/Vendors';
import Sponsors from './pages/Sponsors';
import Contact from './pages/Contact';
import Tickets from './pages/Tickets';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import WhatIsMena from './pages/WhatIsMena';
import FAQ from './pages/FAQ';
import FestivalInfo from './pages/FestivalInfo';
import SponsorsInfo from './pages/SponsorsInfo';
import AboutVendors from './pages/AboutVendors';
import MapsDirections from './pages/MapsDirections';
import EventMap from './pages/EventMap';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CPRANotice from './pages/CPRANotice';
import Accessibility from './pages/Accessibility';
import TermsOfUse from './pages/TermsOfUse';
import TicketTerms from './pages/TicketTerms';
import VendorBooths from './pages/VendorBooths';
import BazaarVendor from './pages/BazaarVendor';
import FoodVendor from './pages/FoodVendor';
import Scanner from './pages/Scanner';
import TicketSuccess from './pages/TicketSuccess';
import GlobalTicketModal from './components/GlobalTicketModal';
import './App.css';

const RouteChangeHandler = ({ setIsScanPage }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsScanPage(location.pathname === '/scanner' || location.pathname === '/success');
  }, [location.pathname, setIsScanPage]);

  return null;
};

const AppWithModal = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanPage, setIsScanPage] = useState(false);
  const [ticketQuantities, setTicketQuantities] = useState({
    '3day': 0,
    '2day': 0,
    '1day': 0
  });

  const handleTicketQuantityChange = (type, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setTicketQuantities(prev => ({
      ...prev,
      [type]: newValue
    }));
  };

  const getTotalPrice = () => {
    const prices = { '3day': 35, '2day': 25, '1day': 15 };
    return Object.keys(ticketQuantities).reduce((total, type) => {
      return total + (ticketQuantities[type] * prices[type]);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(ticketQuantities).reduce((total, qty) => total + qty, 0);
  };

  const openTicketModal = () => {
    setShowTicketModal(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setCurrentStep(1);
  };

  return (
    <Router>
      <RouteChangeHandler setIsScanPage={setIsScanPage} />
      <div className="app">
        {!isScanPage && <Header onGetTicketsClick={openTicketModal} />}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage onGetTicketsClick={openTicketModal} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/event-schedule" element={<EventSchedule />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/what-is-mena" element={<WhatIsMena />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/festival-info" element={<FestivalInfo />} />
            <Route path="/sponsors-info" element={<SponsorsInfo />} />
            <Route path="/about-vendors" element={<AboutVendors />} />
            <Route path="/maps-directions" element={<MapsDirections />} />
            <Route path="/event-map" element={<EventMap />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cpra-notice" element={<CPRANotice />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/ticket-terms" element={<TicketTerms />} />
            <Route path="/vendor-booths" element={<VendorBooths />} />
            <Route path="/bazaar-vendor" element={<BazaarVendor />} />
            <Route path="/food-vendor" element={<FoodVendor />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/success" element={<TicketSuccess />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {showTicketModal && (
        <GlobalTicketModal
          isOpen={showTicketModal}
          onClose={closeTicketModal}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          ticketQuantities={ticketQuantities}
          handleTicketQuantityChange={handleTicketQuantityChange}
          getTotalPrice={getTotalPrice}
          getTotalTickets={getTotalTickets}
        />
      )}
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppWithModal />
    </AuthProvider>
  );
}

export default App;
