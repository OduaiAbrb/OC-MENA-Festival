import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Column */}
          <div className="footer-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">About</Link></li>
              <li><Link to="/">What is MENA?</Link></li>
              <li><Link to="/">FAQ</Link></li>
              <li><Link to="/">My Account</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Event Info Column */}
          <div className="footer-column">
            <h4>Event Info</h4>
            <ul>
              <li><Link to="/">Festival Info</Link></li>
              <li><Link to="/sponsors">Sponsors</Link></li>
              <li><Link to="/vendors">About Vendors</Link></li>
              <li><Link to="/">Maps & Directions</Link></li>
              <li><Link to="/">Event Map</Link></li>
              <li><Link to="/event-schedule">Event Schedule</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">CA Privacy Policy</Link></li>
              <li><Link to="/">Accessibility / ADA</Link></li>
              <li><Link to="/">Terms of Use</Link></li>
              <li><Link to="/">Ticket Terms</Link></li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="footer-column">
            <h4>Follow Us</h4>
            <div className="footer-social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fab fa-x-twitter"></i>
              </a>
              <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                <i className="fab fa-snapchat"></i>
              </a>
            </div>
            <div className="footer-newsletter">
              <p className="footer-newsletter-label">Newsletter</p>
              <p className="footer-newsletter-text">Join our newsletter and stay informed!</p>
              <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="email@email.com" />
                <button type="submit">→</button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025-2026 OC MENA Festival. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
