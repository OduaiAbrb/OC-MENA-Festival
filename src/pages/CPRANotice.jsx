import React from 'react';
import { useCms } from '../cms/CmsContext';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './CPRANotice.css';

const CPRANotice = () => {
  const { content } = useCms();
  const cms = content?.cpraNoticePage || {};

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
            <p>This section applies only to California residents and supplements the Privacy Policy above. It is provided in accordance with the California Consumer Privacy Act, as amended by the California Privacy Rights Act ("CPRA").</p>

            <h2>Categories of Personal Information Collected</h2>
            <p>In the past 12 months, MENA Events, LLC may have collected the following categories of Personal Information as defined by California law:</p>
            <ul>
              <li>Identifiers (such as name, email address, phone number, ticket or account identifiers)</li>
              <li>Customer records (such as billing or transaction details)</li>
              <li>Commercial information (such as ticket purchases or vendor transactions)</li>
              <li>Internet or network activity (such as website usage, IP address, or device data)</li>
              <li>Audio, electronic, visual, or similar information (such as event photography or security footage)</li>
              <li>Geolocation data (general, non-precise location)</li>
              <li>Inferences drawn from other personal information (such as preferences or interests)</li>
            </ul>
            <p>We collect this information for the business and commercial purposes described in the "How We Use Personal Data" section above.</p>

            <h2>Sensitive Personal Information</h2>
            <p>We may collect limited Sensitive Personal Information, such as health-related information provided to accommodate accessibility requests or respond to safety incidents. We do not use or disclose Sensitive Personal Information for purposes other than those permitted by the CPRA and do not use it for targeted advertising.</p>

            <h2>Sale or Sharing of Personal Information</h2>
            <p>MENA Events, LLC does not knowingly sell Personal Information for monetary compensation.</p>
            <p>However, under California law, certain disclosures of Personal Information for advertising or analytics purposes may be considered a "sale" or "sharing." These may include sharing information such as identifiers, internet activity, or preferences with advertising or analytics partners to improve marketing effectiveness.</p>
            <p>We do not sell or share Personal Information of individuals under 16 years of age.</p>
            <p>California residents may opt out of such sharing by exercising their rights described below.</p>

            <h2>Your California Privacy Rights</h2>
            <p>As a California resident, you have the right to:</p>
            <ul>
              <li><strong>Right to Know</strong> – Request information about the categories and specific pieces of Personal Information we have collected about you.</li>
              <li><strong>Right to Delete</strong> – Request deletion of your Personal Information, subject to certain legal exceptions.</li>
              <li><strong>Right to Correct</strong> – Request correction of inaccurate Personal Information.</li>
              <li><strong>Right to Opt-Out</strong> – Opt out of the sale or sharing of Personal Information for targeted advertising.</li>
              <li><strong>Right to Limit Use of Sensitive Personal Information</strong> – Where applicable.</li>
              <li><strong>Right to Non-Discrimination</strong> – You will not be discriminated against for exercising your privacy rights.</li>
            </ul>

            <h2>How to Exercise Your Rights</h2>
            <p>You may submit a privacy request by contacting us at:</p>
            <p><strong>MENA Events, LLC</strong><br />
            Email: info@ocmenafestival.com<br />
            Website: ocmenafestival.com</p>
            <p>To protect your privacy, we may need to verify your identity before processing your request.</p>

            <h2>Authorized Agents</h2>
            <p>You may designate an authorized agent to submit a request on your behalf. Proof of authorization may be required.</p>

            <h2>Updates to This Notice</h2>
            <p>We may update this California Privacy Notice from time to time. Any changes will be posted on this page with an updated effective date.</p>
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

export default CPRANotice;
