import React, { useState } from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './FestivalInfo.css';

const FestivalInfo = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'hours', label: 'Hours' },
    { id: 'conduct', label: 'Code of Conduct' },
    { id: 'safety', label: 'Public Safety' },
    { id: 'health', label: 'Health & Safety' },
  ];

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title">Festival Info</h1>
          
          <div className="info-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`info-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="info-content">
            {activeTab === 'general' && (
              <div className="info-section">
                <h2>General Info</h2>
                <ul className="info-list">
                  <li>Open to guests of all ages.</li>
                  <li>Children ages 5 and under receive free General Admission.</li>
                  <li>Each festival day features vendors, entertainment, food, and activities.</li>
                  <li>Rain or shine.</li>
                  <li>All attendees are subject to security screening upon entry.</li>
                  <li>Programming schedules and performance times may change without notice.*</li>
                  <li>Food, beverage, and merchandise vendors accept credit, debit, and mobile payments only.</li>
                  <li>Late-night activities are restricted to guests 18+ unless accompanied by a parent or legal guardian.</li>
                </ul>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="info-section">
                <h2>Hours</h2>
                <h3>Open</h3>
                <ul className="info-list">
                  <li>General parking opens Friday through Sunday at 11:00 AM.</li>
                  <li>Festival grounds open daily at approximately 1:00 PM.*</li>
                </ul>
                <h3>Close</h3>
                <ul className="info-list">
                  <li>Festival grounds close at 10:00 PM on Friday, Saturday, and Sunday.</li>
                  <li>General parking closes nightly at 12:00 AM, but please check with the venue to ensure accuracy.</li>
                </ul>
                <p className="info-note">View additional parking and transportation details for more information.</p>
                <p className="info-note">*All details, schedules, and hours are subject to change.</p>
              </div>
            )}

            {activeTab === 'conduct' && (
              <div className="info-section">
                <h2>Code of Conduct</h2>
                <p>OC MENA Festival and MENA Events, LLC are dedicated to providing a safe, respectful, and family-friendly environment for all attendees, artists, vendors, and staff. All guests are expected to behave responsibly and treat others with courtesy and respect throughout the event.</p>
                <p><strong>The following behaviors are strictly prohibited and may result in removal from the festival grounds:</strong></p>
                <ul className="info-list">
                  <li>Use of offensive, hateful, or inappropriate language, whether spoken, displayed on clothing, or shown on personal items</li>
                  <li>Excessive intoxication or behavior that indicates impairment due to alcohol consumption</li>
                  <li>Possession of prohibited items within the festival or designated event areas</li>
                  <li>Throwing objects, liquids, or substances of any kind</li>
                  <li>Harassing, threatening, aggressive, or disruptive conduct, including obscene gestures or imagery</li>
                  <li>Entering restricted or staff-only areas, including stages, without proper authorization</li>
                  <li>Public indecency, including inappropriate exposure or use of festival grounds as restrooms</li>
                  <li>Engaging in sexual activity in public areas</li>
                  <li>Possession, use, or distribution of illegal substances</li>
                  <li>Physical altercations or actions that may endanger the safety or comfort of others</li>
                  <li>Damage, vandalism, theft, or misuse of festival property or the property of others</li>
                  <li>Misuse or fraudulent claims related to accessibility accommodations</li>
                  <li>Blocking fire lanes, emergency access routes, or pedestrian walkways</li>
                  <li>Any violation of local, state, or federal laws</li>
                </ul>
                <p>Festival management reserves the right to enforce this Code of Conduct at their discretion. Any individual or group found in violation may be removed from the event immediately, have their wristbands revoked, and be denied re-entry. Vehicles associated with violations may be removed from the premises. Law enforcement may be involved when necessary.</p>
                <p><strong>No refunds will be issued for removal due to Code of Conduct violations.</strong></p>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="info-section">
                <h2>Public Safety</h2>
                <p>The safety and well-being of our guests, vendors, performers, and staff are a top priority at OC MENA Festival. We collaborate closely with local law enforcement, emergency services, and professional security teams to help ensure a safe and welcoming environment throughout the event. For security reasons, we do not publicly disclose specific operational details.</p>
                <p>Guests should expect standard safety procedures upon arrival, which may include bag inspections, security screenings, and walk-through detection systems at entry points. These measures apply to all attendees, staff, vendors, and performers. To help ensure a smooth entry experience, we encourage guests to arrive early and review the Prohibited Items list in advance. Items not permitted inside the festival will be denied entry and must be returned to vehicles or properly discarded.</p>
                <p>In the event of an emergency or important safety announcement, information may be shared through on-site video screens, public address systems, festival staff, or official digital communications. If you or someone nearby requires medical assistance, please visit the nearest medical tent or notify a staff or security team member immediately. We also encourage everyone to remain aware of their surroundings—if you see something concerning, please report it to a festival staff member or public safety official.</p>
                <h3>What to Expect at Entry</h3>
                <p>For the safety of all guests, OC MENA Festival conducts standard security screenings at all entry points. All attendees may be subject to bag checks and walk-through security screening. Please arrive early, review the Prohibited Items list in advance, and follow instructions from festival staff and security personnel for a smooth entry experience.</p>
              </div>
            )}

            {activeTab === 'health' && (
              <div className="info-section">
                <h2>Health & Safety</h2>
                <h3>Medical Services</h3>
                <p>Basic Life Support (BLS) and Advanced Life Support (ALS) medical services will be available to all attendees throughout OC MENA Festival. On-site medical care is provided by Global Medical Response. Medical tents will be located at designated areas across the festival grounds and clearly marked on festival maps. Our trained medical teams are available to assist—if you or someone with you is feeling unwell or needs attention, please visit a medical tent or notify a staff member immediately.</p>
                <h3>Health & Safety Policies</h3>
                <p>OC MENA Festival will operate in accordance with all applicable public health guidelines and requirements in effect at the time of the event. These guidelines may be issued by federal, state, or local authorities and are subject to change. Health and safety measures may include, but are not limited to, adjustments to attendance procedures, capacity limits, or other protective protocols as required.</p>
                <p>Failure to comply with applicable health directives, festival policies, or posted instructions may result in denied entry or removal from the event without refund.</p>
                <h3>Public Health Notice (COVID-19)</h3>
                <p>COVID-19 is a contagious illness that may result in serious health complications. Attendance at any large public gathering carries an inherent risk of exposure to infectious diseases, including COVID-19. OC MENA Festival cannot guarantee that attendees will not be exposed during the event.</p>
                <p>Guests are encouraged to assess their personal health conditions and take appropriate precautions prior to attending.</p>
                <h3>Attendee Health Acknowledgement</h3>
                <p>By attending OC MENA Festival, all guests agree to comply with festival health and safety policies, posted signage, and staff instructions. Attendance is voluntary, and all attendees assume responsibility for assessing their individual health risks. By entering the festival grounds, guests acknowledge and accept the risks associated with participation in a public event and agree to follow all applicable federal, state, and local health guidelines.</p>
              </div>
            )}
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

export default FestivalInfo;
