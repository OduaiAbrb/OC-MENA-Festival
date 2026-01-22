import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './TicketTerms.css';

const TicketTerms = () => {
  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <img src="/wrapper-image.jpg" alt="OC MENA Festival" className="hero-background-image" />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">Ticket Terms & Conditions</h1>
          <div className="legal-content">
            <p className="effective-date">Effective Date: January 1, 2026</p>
            <p>Please read these OC MENA Festival Ticket Terms ("Terms" or "Agreement") carefully, as they affect your legal rights. These Terms apply to admission to OC MENA Festival (the "Event"), produced by MENA Events, LLC ("Event Producer").</p>

            <h2>1. Acceptance of Ticket Terms</h2>
            <p>All event tickets, wristbands, passes, credentials, parking permissions, vehicle permits, and other entry methods (whether physical or digital) (collectively, "Tickets") are issued subject to these Terms.</p>
            <p>By purchasing, accepting, possessing, transferring, or using a Ticket, or by entering the Event grounds, you ("User") agree to be legally bound by these Terms. The original purchaser and any recipient of a Ticket are responsible for informing all guests of these Terms.</p>

            <h2>2. Event Policies, Health & Safety Compliance</h2>
            <p>The Event will be conducted in accordance with applicable federal, state, and local laws, venue policies, and public health, safety, and security requirements in effect at the time of the Event, which may change at any time.</p>
            <p>Failure to comply with Event rules, venue policies, health directives, or instructions from Event staff or security may result in denial of entry or removal without refund.</p>

            <h2>3. Revocable License</h2>
            <p>Each Ticket represents a revocable license to enter the Event premises. This license may be revoked at any time for violation of these Terms or Event rules, without notice or refund.</p>

            <h2>4. Unauthorized Transfers & Resale Prohibited</h2>
            <p>Tickets are valid only for the original authorized purchaser or authorized recipient and their invited guests. Tickets may not be sold, resold, transferred, exchanged, or used for commercial purposes without the express written consent of the Event Producer.</p>
            <ul>
              <li>Tickets obtained from unauthorized sources may be invalid, counterfeit, or void.</li>
              <li>Any attempt to resell or commercially exploit Tickets may result in cancellation without refund and removal from the Event.</li>
            </ul>

            <h2>5. No Commercial or Promotional Use</h2>
            <p>Tickets may not be used for advertising, promotions, contests, giveaways, hospitality, sponsorships, or any commercial activity without prior written approval from the Event Producer.</p>
            <p>Unauthorized vending, sampling, marketing, or promotional activity — including in parking areas — is strictly prohibited.</p>

            <h2>6. Image, Likeness & Recording Consent</h2>
            <p>By attending the Event, User grants the Event Producer and its designees the irrevocable right to record, photograph, and use User's image, voice, likeness, actions, and statements in any media now known or later developed, for any lawful purpose, including marketing and promotional use, without compensation.</p>

            <h2>7. Event Intellectual Property</h2>
            <p>All trademarks, logos, names, designs, and branding associated with OC MENA Festival ("Event Intellectual Property") are owned by the Event Producer. Unauthorized use of Event Intellectual Property is prohibited.</p>

            <h2>8. Streaming, Broadcasting & Recording Restrictions</h2>
            <p>Live audio or video streaming, broadcasting, or transmission from the Event is prohibited without prior written authorization.</p>
            <p>Professional audio/video equipment, recording devices, drones, or similar equipment are not permitted unless expressly approved in writing by the Event Producer.</p>

            <h2>9. Photography & Personal Content</h2>
            <p>Personal, non-commercial photography and short-form video using handheld devices (such as mobile phones or small cameras without detachable lenses) is permitted.</p>
            <p>The following are not allowed without written approval:</p>
            <ul>
              <li>Professional or commercial camera equipment</li>
              <li>Detachable lenses</li>
              <li>Tripods, monopods, selfie sticks, stabilizers</li>
              <li>Drones or aerial devices</li>
            </ul>

            <h2>10. Artists & Schedule Changes</h2>
            <p>Performers, programming, and set times are subject to change without notice. No refunds will be issued for lineup or schedule changes.</p>

            <h2>11. Medical Consent</h2>
            <p>User consents to receive medical treatment deemed necessary in the event of injury or illness during the Event and releases the Event Producer and medical providers from liability related to such care.</p>

            <h2>12. Security Screening & Searches</h2>
            <p>All persons, vehicles, and belongings are subject to search upon entry. Refusal to submit to a search may result in denial of entry without refund.</p>

            <h2>13. Prohibited Items & Conduct</h2>
            <p>Prohibited items include, but are not limited to:</p>
            <ul>
              <li>Weapons of any kind</li>
              <li>Glass or metal containers</li>
              <li>Drones or remote-controlled devices</li>
              <li>Laser pointers</li>
              <li>Large backpacks</li>
              <li>Illegal substances</li>
            </ul>
            <p>The Event Producer reserves the right to remove any person whose conduct is disruptive, unsafe, unlawful, or violates Event rules.</p>

            <h2>14. Assumption of Risk & Release of Liability</h2>
            <p>Attendance at the Event involves inherent risks, including illness, injury, or exposure to communicable diseases. User voluntarily assumes all risks associated with attending the Event.</p>
            <p>User releases and agrees not to hold liable MENA Events, LLC, the venue, artists, performers, vendors, sponsors, contractors, and their respective affiliates, officers, employees, and agents ("Released Parties") for any claims arising from attendance at the Event, to the fullest extent permitted by law.</p>

            <h2>15. Arbitration & Class Action Waiver</h2>
            <p>Any dispute arising from these Ticket Terms or attendance at the Event shall be resolved through binding individual arbitration, and not as a class action, unless prohibited by law.</p>

            <h2>16. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to conflict-of-law principles.</p>

            <h2>17. Reservation of Rights</h2>
            <p>The Event Producer reserves all rights not expressly granted herein. In the event of a conflict between these Ticket Terms and any other policy, these Terms shall govern.</p>
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

export default TicketTerms;
