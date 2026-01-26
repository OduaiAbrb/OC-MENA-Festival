import React from 'react';
import { useCms } from '../cms/CmsContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const { content } = useCms();
  const cms = content?.privacyPolicyPage || {};

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">{cms.title}</h1>
          <div className="legal-content">
            <p className="effective-date">{cms.effectiveDate}</p>
            
            <p>MENA Events, LLC ("MENA Events," "we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard information in connection with OC MENA Festival and our related services.</p>
            
            <p>This Policy applies to information collected through our websites, ticketing platforms, mobile applications, social media pages, in-person events, and other services we operate or provide (collectively, the "Services").</p>

            <h2>Who We Are</h2>
            <p>MENA Events, LLC is the organizer and operator of OC MENA Festival, a live cultural and entertainment event. We produce, promote, and manage festival experiences, including ticketed events, vendor participation, digital services, and on-site operations.</p>
            <p>This Privacy Policy does not apply to employment-related data for job applicants, employees, or contractors, which are governed by separate policies.</p>

            <h2>Personal Data We Collect</h2>
            <p>"Personal Data" means information that identifies, relates to, describes, or can reasonably be linked to you or your household.</p>
            
            <h3>Categories of Personal Data</h3>
            <p>We may collect the following categories of Personal Data:</p>
            <ul>
              <li><strong>Identifiers & Contact Information</strong> - Name, email address, phone number, mailing address, social media handles, ticket or wristband identifiers, and account usernames.</li>
              <li><strong>Commercial Information</strong> - Ticket purchases, vendor transactions, merchandise purchases, donations, and related transaction data.</li>
              <li><strong>Payment Information</strong> - Credit or debit card details or other payment information processed securely by third-party payment processors.</li>
              <li><strong>Internet & Device Information</strong> - IP address, browser type, device identifiers, operating system, cookies, analytics data, and usage behavior.</li>
              <li><strong>Audio / Visual Information</strong> - Photographs, video recordings, or surveillance footage captured at festival grounds.</li>
              <li><strong>Location Information</strong> - General location data based on IP address or areas visited within festival grounds.</li>
              <li><strong>Preferences & Inferences</strong> - Interests, preferences, and engagement patterns inferred from interactions with our Services.</li>
              <li><strong>Health or Safety Information (Limited)</strong> - Information shared to accommodate accessibility requests or respond to medical or safety incidents.</li>
              <li><strong>User-Generated Content</strong> - Messages, inquiries, reviews, survey responses, or content you voluntarily submit.</li>
            </ul>

            <h3>Sources of Personal Data</h3>
            <p>We collect Personal Data from:</p>
            <ul>
              <li>You directly (ticket purchases, registrations, forms, inquiries)</li>
              <li>Third-party service providers (ticketing platforms, payment processors)</li>
              <li>Event partners and vendors (where applicable)</li>
              <li>Automatically through our Digital Services (cookies, analytics, Wi-Fi, RFID)</li>
              <li>Publicly available sources and social media platforms (when you interact with us)</li>
            </ul>

            <h2>How We Use Personal Data</h2>
            <p>We process Personal Data for the following purposes:</p>
            <ul>
              <li><strong>Service Delivery</strong> - To process ticket sales, manage festival entry, provide customer support, and fulfill transactions.</li>
              <li><strong>Event Operations & Safety</strong> - To manage crowd flow, security, incident response, accessibility services, and lost-and-found.</li>
              <li><strong>Communications</strong> - To send transactional messages, event updates, customer service responses, and marketing communications (with opt-out options).</li>
              <li><strong>Marketing & Promotions</strong> - To promote events, analyze engagement, and deliver relevant advertising.</li>
              <li><strong>Service Improvement</strong> - To analyze usage trends, improve functionality, and enhance guest experience.</li>
              <li><strong>Legal & Compliance</strong> - To comply with laws, enforce terms, protect rights, and respond to lawful requests.</li>
              <li><strong>With Your Consent</strong> - For any additional purpose disclosed at the time of collection.</li>
            </ul>

            <h2>Disclosure of Personal Data</h2>
            <p>We may share Personal Data with:</p>
            <ul>
              <li><strong>Service Providers</strong> - Vendors who support ticketing, payments, analytics, marketing, security, or IT services.</li>
              <li><strong>Event Partners & Sponsors</strong> - When permitted by law or with your consent.</li>
              <li><strong>Public Authorities & Law Enforcement</strong> - When required by law or to protect safety and legal rights.</li>
              <li><strong>Successors</strong> - In the event of a merger, acquisition, or sale of assets.</li>
            </ul>
            <p>We do not knowingly sell or share Personal Data of minors or use their data for targeted advertising.</p>

            <h2>Cookies & Tracking Technologies</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul>
              <li>Essential website functionality</li>
              <li>Analytics and performance measurement</li>
              <li>Marketing and advertising</li>
              <li>Social media integration</li>
            </ul>
            <p>You may control cookies through browser settings, though disabling cookies may affect functionality.</p>

            <h2>Your Rights & Choices</h2>
            <p>Depending on your location, you may have rights to:</p>
            <ul>
              <li>Access or request copies of your Personal Data</li>
              <li>Request correction or deletion</li>
              <li>Opt out of marketing communications</li>
              <li>Opt out of targeted advertising (where applicable)</li>
            </ul>
            <p>You may exercise these rights by contacting us using the information below.</p>

            <h2>Data Security</h2>
            <p>We implement reasonable administrative, technical, and physical safeguards to protect Personal Data. However, no system is completely secure, and we cannot guarantee absolute security.</p>

            <h2>Children's Privacy</h2>
            <p>Our Services are not directed to children, and we do not knowingly collect Personal Data from individuals under the age of majority without parental consent. If we learn that such data has been collected, we will take appropriate steps to delete it.</p>

            <h2>Data Retention</h2>
            <p>We retain Personal Data only for as long as necessary to fulfill the purposes described in this Policy or as required by law.</p>

            <h2>Third-Party Services</h2>
            <p>Our Services may link to third-party websites or platforms. We are not responsible for their privacy practices. Please review their policies separately.</p>

            <h2>Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Changes will be posted on this page, and material updates may be communicated via email or website notice.</p>

            <h2>Contact Us</h2>
            <p>For questions or privacy requests, contact:</p>
            <p><strong>MENA Events, LLC</strong><br />
            Email: info@ocmenafestival.com<br />
            Website: ocmenafestival.com</p>
          </div>
        </TornPaperWrapper>

        <div className="lanterns-container">
          <img src="/lanterns.png" alt="Festival Lanterns" className="lanterns-image" />
        </div>
      </section>

      <SponsorsSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default PrivacyPolicy;
