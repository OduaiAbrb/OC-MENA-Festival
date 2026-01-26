import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCmsData, saveCmsData, resetCmsData } from '../cms/cmsData';
import './CmsDashboard.css';

const CmsDashboard = () => {
  const navigate = useNavigate();
  const [cmsData, setCmsData] = useState(getCmsData());
  const [activeSection, setActiveSection] = useState('global');
  const [saveStatus, setSaveStatus] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = sessionStorage.getItem('cmsAdmin');
    if (!adminSession) {
      navigate('/oc-admin-login-2026');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      if (!session.isAuthenticated) {
        navigate('/oc-admin-login-2026');
      }
    } catch (e) {
      navigate('/oc-admin-login-2026');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('cmsAdmin');
    navigate('/oc-admin-login-2026');
  };

  const handleInputChange = (section, field, value, nestedField = null, index = null) => {
    setCmsData(prev => {
      const newData = { ...prev };
      
      if (nestedField !== null && index !== null) {
        // Handle nested array items (like FAQ items)
        newData[section] = { ...newData[section] };
        newData[section][field] = [...newData[section][field]];
        newData[section][field][index] = { ...newData[section][field][index], [nestedField]: value };
      } else if (nestedField !== null) {
        // Handle nested objects
        newData[section] = { ...newData[section] };
        newData[section][field] = { ...newData[section][field], [nestedField]: value };
      } else if (Array.isArray(newData[section][field])) {
        // Handle arrays
        newData[section] = { ...newData[section] };
        newData[section][field] = value;
      } else {
        // Handle simple fields
        newData[section] = { ...newData[section], [field]: value };
      }
      
      return newData;
    });
    setHasChanges(true);
  };

  const handleArrayItemChange = (section, field, index, subField, value) => {
    setCmsData(prev => {
      const newData = { ...prev };
      newData[section] = { ...newData[section] };
      newData[section][field] = [...newData[section][field]];
      newData[section][field][index] = { ...newData[section][field][index], [subField]: value };
      return newData;
    });
    setHasChanges(true);
  };

  const handleNestedArrayChange = (section, field, nestedField, index, subField, value) => {
    setCmsData(prev => {
      const newData = { ...prev };
      newData[section] = { ...newData[section] };
      newData[section][field] = { ...newData[section][field] };
      newData[section][field][nestedField] = [...newData[section][field][nestedField]];
      newData[section][field][nestedField][index] = value;
      return newData;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    saveCmsData(cmsData);
    setSaveStatus('Changes saved successfully!');
    setHasChanges(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all content to defaults? This cannot be undone.')) {
      const defaultData = resetCmsData();
      setCmsData(defaultData);
      setSaveStatus('Content reset to defaults');
      setHasChanges(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const sections = [
    { id: 'global', label: 'Global Settings', icon: '⚙️' },
    { id: 'header', label: 'Header / Navigation', icon: '📍' },
    { id: 'homePage', label: 'Home Page', icon: '🏠' },
    { id: 'aboutPage', label: 'About Page', icon: '📄' },
    { id: 'whatIsMenaPage', label: 'What is MENA', icon: '🌍' },
    { id: 'faqPage', label: 'FAQ Page', icon: '❓' },
    { id: 'ticketsPage', label: 'Tickets Page', icon: '🎟️' },
    { id: 'contactPage', label: 'Contact Page', icon: '📧' },
    { id: 'festivalInfoPage', label: 'Festival Info', icon: '📋' },
    { id: 'sponsorsPage', label: 'Sponsors Page', icon: '🤝' },
    { id: 'vendorsPage', label: 'Vendors Page', icon: '🏪' },
    { id: 'eventSchedulePage', label: 'Event Schedule', icon: '📅' },
    { id: 'eventMapPage', label: 'Event Map', icon: '🗺️' },
    { id: 'mapsDirectionsPage', label: 'Maps & Directions', icon: '📍' },
    { id: 'loginPage', label: 'Login Page', icon: '🔑' },
    { id: 'signupPage', label: 'Signup Page', icon: '📝' },
    { id: 'legalPages', label: 'Legal Pages', icon: '⚖️' },
    { id: 'footer', label: 'Footer', icon: '🦶' },
  ];

  const renderGlobalSettings = () => (
    <div className="cms-section-content">
      <h2>Global Settings</h2>
      <div className="cms-field-group">
        <label>Site Name</label>
        <input
          type="text"
          value={cmsData.global.siteName}
          onChange={(e) => handleInputChange('global', 'siteName', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Site Tagline</label>
        <input
          type="text"
          value={cmsData.global.siteTagline}
          onChange={(e) => handleInputChange('global', 'siteTagline', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Event Date</label>
        <input
          type="text"
          value={cmsData.global.eventDate}
          onChange={(e) => handleInputChange('global', 'eventDate', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Event Location</label>
        <input
          type="text"
          value={cmsData.global.eventLocation}
          onChange={(e) => handleInputChange('global', 'eventLocation', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Contact Email</label>
        <input
          type="email"
          value={cmsData.global.contactEmail}
          onChange={(e) => handleInputChange('global', 'contactEmail', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Copyright Text</label>
        <input
          type="text"
          value={cmsData.global.copyrightText}
          onChange={(e) => handleInputChange('global', 'copyrightText', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Announcement Bar Text</label>
        <textarea
          value={cmsData.global.announcementBar}
          onChange={(e) => handleInputChange('global', 'announcementBar', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );

  const renderHomePage = () => (
    <div className="cms-section-content">
      <h2>Home Page</h2>
      <div className="cms-field-group">
        <label>Hero Title</label>
        <input
          type="text"
          value={cmsData.homePage.heroTitle}
          onChange={(e) => handleInputChange('homePage', 'heroTitle', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Hero Subtitle</label>
        <input
          type="text"
          value={cmsData.homePage.heroSubtitle}
          onChange={(e) => handleInputChange('homePage', 'heroSubtitle', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Hero Description</label>
        <textarea
          value={cmsData.homePage.heroDescription}
          onChange={(e) => handleInputChange('homePage', 'heroDescription', e.target.value)}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Countdown Target Date</label>
        <input
          type="text"
          value={cmsData.homePage.countdownTargetDate}
          onChange={(e) => handleInputChange('homePage', 'countdownTargetDate', e.target.value)}
          placeholder="e.g., June 19, 2026 00:00:00"
        />
      </div>
      <div className="cms-field-group">
        <label>Welcome Title</label>
        <input
          type="text"
          value={cmsData.homePage.welcomeTitle}
          onChange={(e) => handleInputChange('homePage', 'welcomeTitle', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Welcome Text</label>
        <textarea
          value={cmsData.homePage.welcomeText}
          onChange={(e) => handleInputChange('homePage', 'welcomeText', e.target.value)}
          rows={3}
        />
      </div>
      <div className="cms-field-group">
        <label>Vendor Button Text</label>
        <input
          type="text"
          value={cmsData.homePage.ctaVendorButton}
          onChange={(e) => handleInputChange('homePage', 'ctaVendorButton', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Tickets Button Text</label>
        <input
          type="text"
          value={cmsData.homePage.ctaTicketsButton}
          onChange={(e) => handleInputChange('homePage', 'ctaTicketsButton', e.target.value)}
        />
      </div>
    </div>
  );

  const renderAboutPage = () => (
    <div className="cms-section-content">
      <h2>About Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.aboutPage.title}
          onChange={(e) => handleInputChange('aboutPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 1</label>
        <textarea
          value={cmsData.aboutPage.paragraph1}
          onChange={(e) => handleInputChange('aboutPage', 'paragraph1', e.target.value)}
          rows={6}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 2</label>
        <textarea
          value={cmsData.aboutPage.paragraph2}
          onChange={(e) => handleInputChange('aboutPage', 'paragraph2', e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );

  const renderWhatIsMenaPage = () => (
    <div className="cms-section-content">
      <h2>What is MENA Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.whatIsMenaPage.title}
          onChange={(e) => handleInputChange('whatIsMenaPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 1</label>
        <textarea
          value={cmsData.whatIsMenaPage.paragraph1}
          onChange={(e) => handleInputChange('whatIsMenaPage', 'paragraph1', e.target.value)}
          rows={5}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 2</label>
        <textarea
          value={cmsData.whatIsMenaPage.paragraph2}
          onChange={(e) => handleInputChange('whatIsMenaPage', 'paragraph2', e.target.value)}
          rows={5}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 3</label>
        <textarea
          value={cmsData.whatIsMenaPage.paragraph3}
          onChange={(e) => handleInputChange('whatIsMenaPage', 'paragraph3', e.target.value)}
          rows={5}
        />
      </div>
    </div>
  );

  const renderFaqPage = () => (
    <div className="cms-section-content">
      <h2>FAQ Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.faqPage.title}
          onChange={(e) => handleInputChange('faqPage', 'title', e.target.value)}
        />
      </div>
      
      {cmsData.faqPage.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="cms-faq-section">
          <h3 className="cms-subsection-title">{section.subheading}</h3>
          <div className="cms-field-group">
            <label>Section Heading</label>
            <input
              type="text"
              value={section.subheading}
              onChange={(e) => {
                const newSections = [...cmsData.faqPage.sections];
                newSections[sectionIndex] = { ...newSections[sectionIndex], subheading: e.target.value };
                handleInputChange('faqPage', 'sections', newSections);
              }}
            />
          </div>
          
          {section.items.map((item, itemIndex) => (
            <div key={item.id} className="cms-faq-item">
              <div className="cms-field-group">
                <label>Question {itemIndex + 1}</label>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const newSections = [...cmsData.faqPage.sections];
                    newSections[sectionIndex].items[itemIndex] = { ...item, question: e.target.value };
                    handleInputChange('faqPage', 'sections', newSections);
                  }}
                />
              </div>
              <div className="cms-field-group">
                <label>Answer</label>
                <textarea
                  value={item.answer}
                  onChange={(e) => {
                    const newSections = [...cmsData.faqPage.sections];
                    newSections[sectionIndex].items[itemIndex] = { ...item, answer: e.target.value };
                    handleInputChange('faqPage', 'sections', newSections);
                  }}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderTicketsPage = () => (
    <div className="cms-section-content">
      <h2>Tickets Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.ticketsPage.title}
          onChange={(e) => handleInputChange('ticketsPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Intro Paragraph 1</label>
        <textarea
          value={cmsData.ticketsPage.intro1}
          onChange={(e) => handleInputChange('ticketsPage', 'intro1', e.target.value)}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Intro Paragraph 2</label>
        <textarea
          value={cmsData.ticketsPage.intro2}
          onChange={(e) => handleInputChange('ticketsPage', 'intro2', e.target.value)}
          rows={2}
        />
      </div>
      <div className="cms-field-group">
        <label>Section Title</label>
        <input
          type="text"
          value={cmsData.ticketsPage.sectionTitle}
          onChange={(e) => handleInputChange('ticketsPage', 'sectionTitle', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Parking Notice</label>
        <input
          type="text"
          value={cmsData.ticketsPage.parkingNotice}
          onChange={(e) => handleInputChange('ticketsPage', 'parkingNotice', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Rides Note</label>
        <input
          type="text"
          value={cmsData.ticketsPage.ridesNote}
          onChange={(e) => handleInputChange('ticketsPage', 'ridesNote', e.target.value)}
        />
      </div>
      
      <h3 className="cms-subsection-title">Ticket Options</h3>
      {cmsData.ticketsPage.ticketOptions.map((ticket, index) => (
        <div key={ticket.id} className="cms-ticket-item">
          <h4>{ticket.name}</h4>
          <div className="cms-field-group">
            <label>Name</label>
            <input
              type="text"
              value={ticket.name}
              onChange={(e) => handleArrayItemChange('ticketsPage', 'ticketOptions', index, 'name', e.target.value)}
            />
          </div>
          <div className="cms-field-group">
            <label>Description</label>
            <input
              type="text"
              value={ticket.description}
              onChange={(e) => handleArrayItemChange('ticketsPage', 'ticketOptions', index, 'description', e.target.value)}
            />
          </div>
          <div className="cms-field-group">
            <label>Savings Text</label>
            <input
              type="text"
              value={ticket.savings}
              onChange={(e) => handleArrayItemChange('ticketsPage', 'ticketOptions', index, 'savings', e.target.value)}
            />
          </div>
          <div className="cms-field-group">
            <label>Price ($)</label>
            <input
              type="number"
              value={ticket.price}
              onChange={(e) => handleArrayItemChange('ticketsPage', 'ticketOptions', index, 'price', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderContactPage = () => (
    <div className="cms-section-content">
      <h2>Contact Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.contactPage.title}
          onChange={(e) => handleInputChange('contactPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Subtitle</label>
        <input
          type="text"
          value={cmsData.contactPage.subtitle}
          onChange={(e) => handleInputChange('contactPage', 'subtitle', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Contact Email</label>
        <input
          type="email"
          value={cmsData.contactPage.email}
          onChange={(e) => handleInputChange('contactPage', 'email', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Success Message</label>
        <input
          type="text"
          value={cmsData.contactPage.successMessage}
          onChange={(e) => handleInputChange('contactPage', 'successMessage', e.target.value)}
        />
      </div>
      
      <h3 className="cms-subsection-title">Form Labels</h3>
      {Object.entries(cmsData.contactPage.formLabels).map(([key, value]) => (
        <div key={key} className="cms-field-group">
          <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newLabels = { ...cmsData.contactPage.formLabels, [key]: e.target.value };
              handleInputChange('contactPage', 'formLabels', newLabels);
            }}
          />
        </div>
      ))}
    </div>
  );

  const renderFestivalInfoPage = () => (
    <div className="cms-section-content">
      <h2>Festival Info Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.festivalInfoPage.title}
          onChange={(e) => handleInputChange('festivalInfoPage', 'title', e.target.value)}
        />
      </div>
      
      <h3 className="cms-subsection-title">General Info Tab</h3>
      <div className="cms-field-group">
        <label>Section Title</label>
        <input
          type="text"
          value={cmsData.festivalInfoPage.generalInfo.title}
          onChange={(e) => {
            const newGeneralInfo = { ...cmsData.festivalInfoPage.generalInfo, title: e.target.value };
            handleInputChange('festivalInfoPage', 'generalInfo', newGeneralInfo);
          }}
        />
      </div>
      {cmsData.festivalInfoPage.generalInfo.items.map((item, index) => (
        <div key={index} className="cms-field-group">
          <label>Item {index + 1}</label>
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const newItems = [...cmsData.festivalInfoPage.generalInfo.items];
              newItems[index] = e.target.value;
              const newGeneralInfo = { ...cmsData.festivalInfoPage.generalInfo, items: newItems };
              handleInputChange('festivalInfoPage', 'generalInfo', newGeneralInfo);
            }}
          />
        </div>
      ))}

      <h3 className="cms-subsection-title">Hours Tab</h3>
      <div className="cms-field-group">
        <label>Section Title</label>
        <input
          type="text"
          value={cmsData.festivalInfoPage.hours.title}
          onChange={(e) => {
            const newHours = { ...cmsData.festivalInfoPage.hours, title: e.target.value };
            handleInputChange('festivalInfoPage', 'hours', newHours);
          }}
        />
      </div>
      
      <h3 className="cms-subsection-title">Code of Conduct Tab</h3>
      <div className="cms-field-group">
        <label>Introduction</label>
        <textarea
          value={cmsData.festivalInfoPage.codeOfConduct.intro}
          onChange={(e) => {
            const newConduct = { ...cmsData.festivalInfoPage.codeOfConduct, intro: e.target.value };
            handleInputChange('festivalInfoPage', 'codeOfConduct', newConduct);
          }}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Enforcement Policy</label>
        <textarea
          value={cmsData.festivalInfoPage.codeOfConduct.enforcement}
          onChange={(e) => {
            const newConduct = { ...cmsData.festivalInfoPage.codeOfConduct, enforcement: e.target.value };
            handleInputChange('festivalInfoPage', 'codeOfConduct', newConduct);
          }}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Refund Policy</label>
        <input
          type="text"
          value={cmsData.festivalInfoPage.codeOfConduct.refundPolicy}
          onChange={(e) => {
            const newConduct = { ...cmsData.festivalInfoPage.codeOfConduct, refundPolicy: e.target.value };
            handleInputChange('festivalInfoPage', 'codeOfConduct', newConduct);
          }}
        />
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="cms-section-content">
      <h2>Header / Navigation</h2>
      <div className="cms-field-group">
        <label>Get Tickets Button Text</label>
        <input
          type="text"
          value={cmsData.header?.getTicketsButton || ''}
          onChange={(e) => handleInputChange('header', 'getTicketsButton', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Cart Label</label>
        <input
          type="text"
          value={cmsData.header?.cartLabel || ''}
          onChange={(e) => handleInputChange('header', 'cartLabel', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Account Label</label>
        <input
          type="text"
          value={cmsData.header?.accountLabel || ''}
          onChange={(e) => handleInputChange('header', 'accountLabel', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Dashboard Label</label>
        <input
          type="text"
          value={cmsData.header?.dashboardLabel || ''}
          onChange={(e) => handleInputChange('header', 'dashboardLabel', e.target.value)}
        />
      </div>
      <h3 className="cms-subsection-title">Navigation Items</h3>
      {cmsData.header?.navItems?.map((item, index) => (
        <div key={index} className="cms-field-group">
          <label>Nav Item {index + 1} - Name</label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => {
              const newItems = [...cmsData.header.navItems];
              newItems[index] = { ...newItems[index], name: e.target.value };
              handleInputChange('header', 'navItems', newItems);
            }}
          />
        </div>
      ))}
    </div>
  );

  const renderSponsorsPage = () => (
    <div className="cms-section-content">
      <h2>Sponsors Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.sponsorsPage?.title || ''}
          onChange={(e) => handleInputChange('sponsorsPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Description</label>
        <textarea
          value={cmsData.sponsorsPage?.description || ''}
          onChange={(e) => handleInputChange('sponsorsPage', 'description', e.target.value)}
          rows={5}
        />
      </div>
      <div className="cms-field-group">
        <label>Levels Title</label>
        <input
          type="text"
          value={cmsData.sponsorsPage?.levelsTitle || ''}
          onChange={(e) => handleInputChange('sponsorsPage', 'levelsTitle', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Levels Description</label>
        <input
          type="text"
          value={cmsData.sponsorsPage?.levelsDescription || ''}
          onChange={(e) => handleInputChange('sponsorsPage', 'levelsDescription', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Contact Text</label>
        <textarea
          value={cmsData.sponsorsPage?.contactText || ''}
          onChange={(e) => handleInputChange('sponsorsPage', 'contactText', e.target.value)}
          rows={3}
        />
      </div>
      <div className="cms-field-group">
        <label>CTA Text</label>
        <input
          type="text"
          value={cmsData.sponsorsPage?.ctaText || ''}
          onChange={(e) => handleInputChange('sponsorsPage', 'ctaText', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>CTA Button Text</label>
        <input
          type="text"
          value={cmsData.sponsorsPage?.ctaButton || ''}
          onChange={(e) => handleInputChange('sponsorsPage', 'ctaButton', e.target.value)}
        />
      </div>
    </div>
  );

  const renderVendorsPage = () => (
    <div className="cms-section-content">
      <h2>Vendors Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.vendorsPage?.title || ''}
          onChange={(e) => handleInputChange('vendorsPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 1</label>
        <textarea
          value={cmsData.vendorsPage?.paragraph1 || ''}
          onChange={(e) => handleInputChange('vendorsPage', 'paragraph1', e.target.value)}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 2</label>
        <textarea
          value={cmsData.vendorsPage?.paragraph2 || ''}
          onChange={(e) => handleInputChange('vendorsPage', 'paragraph2', e.target.value)}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 3</label>
        <textarea
          value={cmsData.vendorsPage?.paragraph3 || ''}
          onChange={(e) => handleInputChange('vendorsPage', 'paragraph3', e.target.value)}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Paragraph 4</label>
        <textarea
          value={cmsData.vendorsPage?.paragraph4 || ''}
          onChange={(e) => handleInputChange('vendorsPage', 'paragraph4', e.target.value)}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Vendor List Title</label>
        <input
          type="text"
          value={cmsData.vendorsPage?.vendorListTitle || ''}
          onChange={(e) => handleInputChange('vendorsPage', 'vendorListTitle', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Vendor List Text</label>
        <input
          type="text"
          value={cmsData.vendorsPage?.vendorListText || ''}
          onChange={(e) => handleInputChange('vendorsPage', 'vendorListText', e.target.value)}
        />
      </div>
    </div>
  );

  const renderEventSchedulePage = () => (
    <div className="cms-section-content">
      <h2>Event Schedule Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.eventSchedulePage?.title || ''}
          onChange={(e) => handleInputChange('eventSchedulePage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Description</label>
        <textarea
          value={cmsData.eventSchedulePage?.description || ''}
          onChange={(e) => handleInputChange('eventSchedulePage', 'description', e.target.value)}
          rows={4}
        />
      </div>
      <div className="cms-field-group">
        <label>Newsletter Heading</label>
        <input
          type="text"
          value={cmsData.eventSchedulePage?.newsletterHeading || ''}
          onChange={(e) => handleInputChange('eventSchedulePage', 'newsletterHeading', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Newsletter Success Message</label>
        <input
          type="text"
          value={cmsData.eventSchedulePage?.newsletterSuccess || ''}
          onChange={(e) => handleInputChange('eventSchedulePage', 'newsletterSuccess', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Newsletter Button Text</label>
        <input
          type="text"
          value={cmsData.eventSchedulePage?.newsletterButton || ''}
          onChange={(e) => handleInputChange('eventSchedulePage', 'newsletterButton', e.target.value)}
        />
      </div>
    </div>
  );

  const renderEventMapPage = () => (
    <div className="cms-section-content">
      <h2>Event Map Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.eventMapPage?.title || ''}
          onChange={(e) => handleInputChange('eventMapPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Description</label>
        <textarea
          value={cmsData.eventMapPage?.description || ''}
          onChange={(e) => handleInputChange('eventMapPage', 'description', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );

  const renderMapsDirectionsPage = () => (
    <div className="cms-section-content">
      <h2>Maps & Directions Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.mapsDirectionsPage?.title || ''}
          onChange={(e) => handleInputChange('mapsDirectionsPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Content</label>
        <textarea
          value={cmsData.mapsDirectionsPage?.content || ''}
          onChange={(e) => handleInputChange('mapsDirectionsPage', 'content', e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="cms-section-content">
      <h2>Login Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.loginPage?.title || ''}
          onChange={(e) => handleInputChange('loginPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Login Tab Label</label>
        <input
          type="text"
          value={cmsData.loginPage?.loginTab || ''}
          onChange={(e) => handleInputChange('loginPage', 'loginTab', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Register Tab Label</label>
        <input
          type="text"
          value={cmsData.loginPage?.registerTab || ''}
          onChange={(e) => handleInputChange('loginPage', 'registerTab', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Login Heading</label>
        <input
          type="text"
          value={cmsData.loginPage?.loginHeading || ''}
          onChange={(e) => handleInputChange('loginPage', 'loginHeading', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Email Label</label>
        <input
          type="text"
          value={cmsData.loginPage?.emailLabel || ''}
          onChange={(e) => handleInputChange('loginPage', 'emailLabel', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Password Label</label>
        <input
          type="text"
          value={cmsData.loginPage?.passwordLabel || ''}
          onChange={(e) => handleInputChange('loginPage', 'passwordLabel', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Remember Me Text</label>
        <input
          type="text"
          value={cmsData.loginPage?.rememberMe || ''}
          onChange={(e) => handleInputChange('loginPage', 'rememberMe', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Forgot Password Text</label>
        <input
          type="text"
          value={cmsData.loginPage?.forgotPassword || ''}
          onChange={(e) => handleInputChange('loginPage', 'forgotPassword', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Submit Button Text</label>
        <input
          type="text"
          value={cmsData.loginPage?.submitButton || ''}
          onChange={(e) => handleInputChange('loginPage', 'submitButton', e.target.value)}
        />
      </div>
    </div>
  );

  const renderSignupPage = () => (
    <div className="cms-section-content">
      <h2>Signup Page</h2>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.signupPage?.title || ''}
          onChange={(e) => handleInputChange('signupPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Register Heading</label>
        <input
          type="text"
          value={cmsData.signupPage?.registerHeading || ''}
          onChange={(e) => handleInputChange('signupPage', 'registerHeading', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Email Label</label>
        <input
          type="text"
          value={cmsData.signupPage?.emailLabel || ''}
          onChange={(e) => handleInputChange('signupPage', 'emailLabel', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Password Label</label>
        <input
          type="text"
          value={cmsData.signupPage?.passwordLabel || ''}
          onChange={(e) => handleInputChange('signupPage', 'passwordLabel', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Privacy Notice</label>
        <textarea
          value={cmsData.signupPage?.privacyNotice || ''}
          onChange={(e) => handleInputChange('signupPage', 'privacyNotice', e.target.value)}
          rows={3}
        />
      </div>
      <div className="cms-field-group">
        <label>Submit Button Text</label>
        <input
          type="text"
          value={cmsData.signupPage?.submitButton || ''}
          onChange={(e) => handleInputChange('signupPage', 'submitButton', e.target.value)}
        />
      </div>
    </div>
  );

  const renderLegalPages = () => (
    <div className="cms-section-content">
      <h2>Legal Pages</h2>
      
      <h3 className="cms-subsection-title">Privacy Policy</h3>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.privacyPolicyPage?.title || ''}
          onChange={(e) => handleInputChange('privacyPolicyPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Effective Date</label>
        <input
          type="text"
          value={cmsData.privacyPolicyPage?.effectiveDate || ''}
          onChange={(e) => handleInputChange('privacyPolicyPage', 'effectiveDate', e.target.value)}
        />
      </div>

      <h3 className="cms-subsection-title">CPRA Notice</h3>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.cpraNoticePage?.title || ''}
          onChange={(e) => handleInputChange('cpraNoticePage', 'title', e.target.value)}
        />
      </div>

      <h3 className="cms-subsection-title">Accessibility / ADA</h3>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.accessibilityPage?.title || ''}
          onChange={(e) => handleInputChange('accessibilityPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Content</label>
        <textarea
          value={cmsData.accessibilityPage?.content || ''}
          onChange={(e) => handleInputChange('accessibilityPage', 'content', e.target.value)}
          rows={4}
        />
      </div>

      <h3 className="cms-subsection-title">Terms of Use</h3>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.termsOfUsePage?.title || ''}
          onChange={(e) => handleInputChange('termsOfUsePage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Effective Date</label>
        <input
          type="text"
          value={cmsData.termsOfUsePage?.effectiveDate || ''}
          onChange={(e) => handleInputChange('termsOfUsePage', 'effectiveDate', e.target.value)}
        />
      </div>

      <h3 className="cms-subsection-title">Ticket Terms</h3>
      <div className="cms-field-group">
        <label>Page Title</label>
        <input
          type="text"
          value={cmsData.ticketTermsPage?.title || ''}
          onChange={(e) => handleInputChange('ticketTermsPage', 'title', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Effective Date</label>
        <input
          type="text"
          value={cmsData.ticketTermsPage?.effectiveDate || ''}
          onChange={(e) => handleInputChange('ticketTermsPage', 'effectiveDate', e.target.value)}
        />
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="cms-section-content">
      <h2>Footer Settings</h2>
      <div className="cms-field-group">
        <label>Newsletter Label</label>
        <input
          type="text"
          value={cmsData.footer.newsletterLabel}
          onChange={(e) => handleInputChange('footer', 'newsletterLabel', e.target.value)}
        />
      </div>
      <div className="cms-field-group">
        <label>Newsletter Text</label>
        <input
          type="text"
          value={cmsData.footer.newsletterText}
          onChange={(e) => handleInputChange('footer', 'newsletterText', e.target.value)}
        />
      </div>

      <h3 className="cms-subsection-title">Social Media Links</h3>
      {Object.entries(cmsData.footer.socialLinks).map(([platform, url]) => (
        <div key={platform} className="cms-field-group">
          <label>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              const newSocialLinks = { ...cmsData.footer.socialLinks, [platform]: e.target.value };
              handleInputChange('footer', 'socialLinks', newSocialLinks);
            }}
          />
        </div>
      ))}
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'global':
        return renderGlobalSettings();
      case 'header':
        return renderHeader();
      case 'homePage':
        return renderHomePage();
      case 'aboutPage':
        return renderAboutPage();
      case 'whatIsMenaPage':
        return renderWhatIsMenaPage();
      case 'faqPage':
        return renderFaqPage();
      case 'ticketsPage':
        return renderTicketsPage();
      case 'contactPage':
        return renderContactPage();
      case 'festivalInfoPage':
        return renderFestivalInfoPage();
      case 'sponsorsPage':
        return renderSponsorsPage();
      case 'vendorsPage':
        return renderVendorsPage();
      case 'eventSchedulePage':
        return renderEventSchedulePage();
      case 'eventMapPage':
        return renderEventMapPage();
      case 'mapsDirectionsPage':
        return renderMapsDirectionsPage();
      case 'loginPage':
        return renderLoginPage();
      case 'signupPage':
        return renderSignupPage();
      case 'legalPages':
        return renderLegalPages();
      case 'footer':
        return renderFooter();
      default:
        return renderGlobalSettings();
    }
  };

  return (
    <div className="cms-dashboard">
      {/* Sidebar */}
      <aside className="cms-sidebar">
        <div className="cms-sidebar-header">
          <img src="/logo.png" alt="OC MENA Festival" className="cms-sidebar-logo" />
          <h2>CMS Dashboard</h2>
        </div>
        
        <nav className="cms-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`cms-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="cms-nav-icon">{section.icon}</span>
              <span className="cms-nav-label">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="cms-sidebar-footer">
          <button className="cms-logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="cms-main">
        <header className="cms-header">
          <h1>Content Management</h1>
          <div className="cms-header-actions">
            {saveStatus && (
              <span className={`cms-save-status ${saveStatus.includes('success') ? 'success' : ''}`}>
                {saveStatus}
              </span>
            )}
            <button className="cms-reset-btn" onClick={handleReset}>
              Reset to Defaults
            </button>
            <button 
              className={`cms-save-btn ${hasChanges ? 'has-changes' : ''}`} 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              {hasChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </header>

        <div className="cms-content">
          {renderSectionContent()}
        </div>
      </main>
    </div>
  );
};

export default CmsDashboard;
