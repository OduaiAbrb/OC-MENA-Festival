import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './TermsOfUse.css';

const TermsOfUse = () => {
  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">Terms of Use</h1>
          <div className="legal-content">
            <p className="effective-date">Last updated and effective: 1/5/2026</p>

            <h2>OVERVIEW</h2>
            <p>This website and any related online or technology services are owned and operated by MENA Events, LLC ("MENA Events," "we," "us," or "our") in connection with OC MENA Festival (the "Event"). These Terms of Use ("Terms") govern your access to and use of our "Digital Services," which may include, as applicable: our websites (including subdomains and subpages), mobile applications (if any), email communications, online advertising, and SMS/text message programs, our official social media pages, and any content, features, and tools made available on or through our Digital Services.</p>
            <p>Please read these Terms carefully. By accessing or using any Digital Service, you agree to these Terms. If you do not agree, do not use our Digital Services.</p>

            <h2>ARBITRATION AND CLASS ACTION WAIVER NOTICE</h2>
            <p>These Terms include a dispute resolution provision that generally requires binding, individual arbitration (instead of court) and includes a class action waiver. This means disputes are typically decided by an arbitrator, and you may be giving up the right to a judge or jury trial and the ability to participate in a class action. See "DISPUTE RESOLUTION, ARBITRATION, AND CLASS WAIVER" below.</p>

            <h2>WHO WE ARE</h2>
            <p>MENA Events, LLC produces and operates OC MENA Festival and may operate related websites, pages, communications, and other digital experiences connected to the Event. References to "MENA Events," "we," or "our" include our owners, contractors, service providers, and affiliates acting on our behalf for the Digital Services.</p>

            <h2>PRIVACY POLICY</h2>
            <p>Our Privacy Policy explains how we collect, use, and share information when you use our Digital Services or otherwise interact with us. By using our Digital Services, you acknowledge that you have read and understood our Privacy Policy.</p>

            <h2>BINDING CONTRACT; ELIGIBILITY</h2>
            <p>These Terms form a binding agreement between you and MENA Events, LLC. You represent that you are legally able to enter into a contract and that you are not prohibited from using the Digital Services under applicable laws.</p>
            <p>Our Digital Services are not intended for children. If you are under 18, please do not use the Digital Services unless a parent or legal guardian provides permission and supervises your use, to the extent allowed by law.</p>

            <h2>RESTRICTED ACTIVITIES</h2>
            <p>You agree not to do any of the following in connection with the Digital Services:</p>
            <ul>
              <li>Violate any applicable law or encourage others to do so.</li>
              <li>Collect, harvest, or store personal information about other users without authorization.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation.</li>
              <li>Post, transmit, or promote content that is unlawful, defamatory, harassing, hateful, threatening, obscene, or otherwise objectionable.</li>
              <li>Infringe intellectual property rights, privacy rights, or other legal rights of any person or entity.</li>
              <li>Send spam, bulk messages, chain letters, pyramid schemes, or unauthorized promotions or solicitations.</li>
              <li>Disrupt, interfere with, or compromise the security, integrity, or performance of the Digital Services.</li>
              <li>Introduce malware or harmful code, attempt denial-of-service attacks, spoofing, or similar technical abuse.</li>
              <li>Attempt to access non-public areas or systems without authorization.</li>
              <li>Reverse engineer or attempt to derive source code or underlying components of the Digital Services.</li>
            </ul>

            <h2>INTELLECTUAL PROPERTY; TRADEMARKS</h2>
            <p>All content and materials made available by us—including text, graphics, branding, design elements, audio/visual materials, and the selection and arrangement of these materials (collectively, "Content")—are owned by MENA Events or used under license and are protected by intellectual property laws. Trademarks and logos appearing on the Digital Services belong to their respective owners and do not necessarily imply endorsement.</p>

            <h2>DISCLAIMER OF WARRANTIES</h2>
            <p>To the fullest extent permitted by law, the Digital Services and all Content are provided "as is" and "as available," without warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. Your use of the Digital Services is at your own risk.</p>

            <h2>LIMITATION OF LIABILITY</h2>
            <p>To the fullest extent permitted by law, MENA Events and its officers, directors, employees, contractors, service providers, licensors, and partners will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, or for loss of data, revenue, profits, goodwill, or other intangible losses, arising out of or related to your use of (or inability to use) the Digital Services.</p>

            <h2>DISPUTE RESOLUTION, ARBITRATION, AND CLASS WAIVER</h2>
            <p><strong>Informal resolution first:</strong> Before initiating arbitration or court proceedings, you agree to contact us with a written description of the issue and the relief you seek, and to attempt in good faith to resolve the dispute informally.</p>
            <p><strong>Arbitration:</strong> Except for disputes that may be brought in small claims court (if eligible) or claims seeking injunctive relief for misuse of our intellectual property, you and MENA Events agree that disputes arising from or relating to these Terms or the Digital Services will be resolved by binding, individual arbitration.</p>
            <p><strong>Class waiver:</strong> You and MENA Events agree to bring claims only in an individual capacity and not as part of a class, collective, representative, or private attorney general proceeding, to the fullest extent permitted by law.</p>

            <h2>CHANGES TO THESE TERMS</h2>
            <p>We may update these Terms at any time. Changes are effective when posted. Your continued use after changes are posted constitutes acceptance of the updated Terms.</p>

            <h2>CONTACT US</h2>
            <p>If you have questions about these Terms, contact:</p>
            <p><strong>MENA Events, LLC</strong><br />
            info@ocmenafestival.com</p>
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

export default TermsOfUse;
