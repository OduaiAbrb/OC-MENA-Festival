import React from 'react';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <Header />
            <main className="main-content">
              <HomePage />
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

export default App;
