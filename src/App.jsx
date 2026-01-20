import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import EventSchedule from './pages/EventSchedule';
import Vendors from './pages/Vendors';
import Sponsors from './pages/Sponsors';
import Contact from './pages/Contact';
import './App.css';

// Wrapper component to manage modal state
const AppWithModal = () => {
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [ticketQuantities, setTicketQuantities] = useState({
    '3day': 0,
    '2day': 0,
    '1day': 0
  });

  const handleTicketQuantityChange = (type, value) => {
    console.log('handleTicketQuantityChange called with:', type, value);
    const newValue = Math.max(0, parseInt(value) || 0);
    console.log('Setting new value:', newValue);
    setTicketQuantities(prev => ({
      ...prev,
      [type]: newValue
    }));
  };

  const getTotalPrice = () => {
    const prices = {
      '3day': 35,
      '2day': 25,
      '1day': 15
    };
    return Object.keys(ticketQuantities).reduce((total, type) => {
      return total + (ticketQuantities[type] * prices[type]);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(ticketQuantities).reduce((total, qty) => total + qty, 0);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <Header onGetTicketsClick={() => setShowTicketModal(true)} />
            <main className="main-content">
              <HomePage 
                showTicketModal={showTicketModal}
                setShowTicketModal={setShowTicketModal}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                ticketQuantities={ticketQuantities}
                handleTicketQuantityChange={handleTicketQuantityChange}
                getTotalPrice={getTotalPrice}
                getTotalTickets={getTotalTickets}
              />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/login" element={
          <div className="app">
            <Header />
            <main className="main-content">
              <LoginPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/signup" element={
          <div className="app">
            <Header />
            <main className="main-content">
              <SignupPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/dashboard" element={
          <div className="app">
            <Dashboard />
            <Footer />
          </div>
        } />
        <Route path="/event-schedule" element={
          <div className="app">
            <Header />
            <main className="main-content">
              <EventSchedule />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/vendors" element={
          <div className="app">
            <Header />
            <main className="main-content">
              <Vendors />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/sponsors" element={
          <div className="app">
            <Header />
            <main className="main-content">
              <Sponsors />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/contact" element={
          <div className="app">
            <Header />
            <main className="main-content">
              <Contact />
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return <AppWithModal />;
}

export default App;
