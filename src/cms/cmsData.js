// CMS Data Store - Static content management
// This file contains all editable text content across the website
// Will be connected to backend later

const cmsData = {
  // Global Site Settings
  global: {
    siteName: 'OC MENA Festival',
    siteTagline: 'Middle East & North Africa Cultural Festival',
    eventDate: 'June 19-21, 2026',
    eventLocation: 'OC Fair Grounds',
    contactEmail: 'info@ocmenafestival.com',
    copyrightText: '© 2025-2026 OC MENA Festival. All Rights Reserved',
    announcementBar: 'June 19-21, 2026 — OC Fair Grounds — Middle East & North Africa (MENA) Festival!',
  },

  // Home Page
  homePage: {
    heroTitle: 'OC MENA Festival',
    heroSubtitle: 'June 19-21, 2026. Orange County, CA',
    heroDescription: 'Experience three days of Middle Eastern and North African (MENA) culture, food, music, rides, shopping, and family-friendly fun—all in one lively summer festival.',
    countdownTargetDate: 'June 19, 2026 00:00:00',
    welcomeTitle: 'Welcome to OC MENA Festival',
    welcomeText: 'Please browse our site for more information. You can purchase tickets, booths, and inquire about sponsorship opportunities!',
    ctaVendorButton: 'Vendor sign up',
    ctaTicketsButton: 'Get Tickets',
  },

  // About Page
  aboutPage: {
    title: 'About',
    paragraph1: 'The OC MENA Festival is a large-scale cultural celebration honoring the rich traditions, creativity, and diversity of the Middle East and North Africa. Held in the heart of Orange County, the festival brings communities together through music, art, food, fashion, and immersive experiences that reflect both heritage and modern culture. From vibrant bazaars and live performances to family-friendly attractions and entertainment, OC MENA Festival is designed to be an inclusive space for all ages and backgrounds.',
    paragraph2: "More than just a festival, OC MENA Festival is a gathering rooted in connection, storytelling, and shared experiences. Over three summer days, guests can explore vendor booths, enjoy authentic cuisine, experience live music and performances, and discover the cultural threads that unite generations across the MENA region. Whether you're attending with family, friends, or as a first-time visitor, the OC MENA Festival invites you to celebrate culture, community, and the spirit of summer together.",
  },

  // What is MENA Page
  whatIsMenaPage: {
    title: 'What is MENA?',
    paragraph1: 'MENA stands for the Middle East and North Africa, a diverse and vibrant region that stretches from Morocco in the west to Iran in the east and from Turkey down through the Arabian Peninsula and North Africa. The region is home to dozens of cultures, languages, traditions, and histories that have shaped the world for thousands of years.',
    paragraph2: 'Often described as a bridge between Africa, Asia, and Europe, the MENA region has long been a center of innovation, trade, art, and storytelling. From ancient civilizations and architectural wonders to modern cities and evolving creative scenes, MENA embodies both deep-rooted heritage and forward-looking expression.',
    paragraph3: 'At OC MENA Festival, we celebrate the beauty, resilience, and diversity of the MENA region through food, music, art, fashion, and community. This festival invites you to explore rich, dynamic, and living cultures, honoring tradition while amplifying contemporary voices.',
  },

  // FAQ Page
  faqPage: {
    title: 'FAQ',
    sections: [
      {
        subheading: 'General Questions',
        items: [
          { id: 'g1', question: 'What is OC MENA Festival?', answer: 'OC MENA Festival is a large-scale cultural celebration honoring the rich traditions, creativity, and diversity of the Middle East and North Africa, held in Orange County.' },
          { id: 'g2', question: 'When and where is the festival?', answer: 'The festival takes place June 19-21, 2026 at the OC Fair Grounds in Orange County, California.' },
          { id: 'g3', question: 'Is the festival family-friendly?', answer: 'Yes! OC MENA Festival is designed to be an inclusive space for all ages and backgrounds with family-friendly attractions and entertainment.' },
          { id: 'g4', question: 'What can I expect at the festival?', answer: 'Guests can explore vendor booths, enjoy authentic cuisine, experience live music and performances, and discover cultural experiences from the MENA region.' },
        ]
      },
      {
        subheading: 'Tickets & Entry',
        items: [
          { id: 't1', question: 'How do I purchase tickets?', answer: 'Tickets can be purchased through our official website. Visit the Tickets page for more information.' },
          { id: 't2', question: 'Are children free?', answer: 'Children ages 5 and under receive free General Admission.' },
          { id: 't3', question: 'Can I get a refund?', answer: 'Please review our Ticket Terms & Conditions for refund policies.' },
          { id: 't4', question: 'What forms of payment are accepted?', answer: 'Food, beverage, and merchandise vendors accept credit, debit, and mobile payments only.' },
        ]
      }
    ]
  },

  // Tickets Page
  ticketsPage: {
    title: 'OC MENA Festival Tickets',
    intro1: 'Discover the excitement of the OC MENA Festival, a vibrant summer celebration in Orange County inspired by the rich cultures of the Middle East and North Africa. Enjoy three unforgettable days of music, food, carnival rides, cultural showcases, shopping, and family-friendly entertainment.',
    intro2: 'Choose from single-day or full-weekend passes to experience everything the festival has to offer.',
    sectionTitle: 'Tickets',
    parkingNotice: '*Parking is $12, paid directly to the OC Fairgrounds on site. Carpooling is encouraged.',
    ridesNote: '*Rides at event range from $2-$10/person',
    ticketOptions: [
      {
        id: '3day',
        name: '3-Day Pass',
        description: 'Come enjoy the festival for three days',
        savings: 'Save $10 on entry',
        price: 35
      },
      {
        id: '2day',
        name: '2-Day Pass',
        description: 'Come enjoy the festival for two days',
        savings: 'Save $5 on entry',
        price: 25
      },
      {
        id: '1day',
        name: '1-Day Pass',
        description: 'Come enjoy the festival for a single day',
        savings: 'Save $0 on entry',
        price: 15
      }
    ]
  },

  // Contact Page
  contactPage: {
    title: 'Contact',
    subtitle: 'Please fill out the form below or email us at',
    email: 'info@ocmenafestival.com',
    successMessage: "Thank you! We'll get back to you soon.",
    subjectOptions: [
      'Sponsor Inquiry',
      'Vendor Inquiry',
      'General Question',
      'Press Inquiry',
      'Other'
    ],
    formLabels: {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      subject: 'Subject',
      message: 'Message',
      submit: 'Send Message',
      submitting: 'Sending...'
    }
  },

  // Festival Info Page
  festivalInfoPage: {
    title: 'Festival Info',
    tabs: [
      { id: 'general', label: 'General Info' },
      { id: 'hours', label: 'Hours' },
      { id: 'conduct', label: 'Code of Conduct' },
      { id: 'safety', label: 'Public Safety' },
      { id: 'health', label: 'Health & Safety' },
    ],
    generalInfo: {
      title: 'General Info',
      items: [
        'Open to guests of all ages.',
        'Children ages 5 and under receive free General Admission.',
        'Each festival day features vendors, entertainment, food, and activities.',
        'Rain or shine.',
        'All attendees are subject to security screening upon entry.',
        'Programming schedules and performance times may change without notice.*',
        'Food, beverage, and merchandise vendors accept credit, debit, and mobile payments only.',
        'Late-night activities are restricted to guests 18+ unless accompanied by a parent or legal guardian.',
      ]
    },
    hours: {
      title: 'Hours',
      openTitle: 'Open',
      openItems: [
        'General parking opens Friday through Sunday at 11:00 AM.',
        'Festival grounds open daily at approximately 1:00 PM.*',
      ],
      closeTitle: 'Close',
      closeItems: [
        'Festival grounds close at 10:00 PM on Friday, Saturday, and Sunday.',
        'General parking closes nightly at 12:00 AM, but please check with the venue to ensure accuracy.',
      ],
      notes: [
        'View additional parking and transportation details for more information.',
        '*All details, schedules, and hours are subject to change.',
      ]
    },
    codeOfConduct: {
      title: 'Code of Conduct',
      intro: 'OC MENA Festival and MENA Events, LLC are dedicated to providing a safe, respectful, and family-friendly environment for all attendees, artists, vendors, and staff. All guests are expected to behave responsibly and treat others with courtesy and respect throughout the event.',
      prohibitedIntro: 'The following behaviors are strictly prohibited and may result in removal from the festival grounds:',
      prohibitedItems: [
        'Use of offensive, hateful, or inappropriate language, whether spoken, displayed on clothing, or shown on personal items',
        'Excessive intoxication or behavior that indicates impairment due to alcohol consumption',
        'Possession of prohibited items within the festival or designated event areas',
        'Throwing objects, liquids, or substances of any kind',
        'Harassing, threatening, aggressive, or disruptive conduct, including obscene gestures or imagery',
        'Entering restricted or staff-only areas, including stages, without proper authorization',
        'Public indecency, including inappropriate exposure or use of festival grounds as restrooms',
        'Engaging in sexual activity in public areas',
        'Possession, use, or distribution of illegal substances',
        'Physical altercations or actions that may endanger the safety or comfort of others',
        'Damage, vandalism, theft, or misuse of festival property or the property of others',
        'Misuse or fraudulent claims related to accessibility accommodations',
        'Blocking fire lanes, emergency access routes, or pedestrian walkways',
        'Any violation of local, state, or federal laws',
      ],
      enforcement: 'Festival management reserves the right to enforce this Code of Conduct at their discretion. Any individual or group found in violation may be removed from the event immediately, have their wristbands revoked, and be denied re-entry. Vehicles associated with violations may be removed from the premises. Law enforcement may be involved when necessary.',
      refundPolicy: 'No refunds will be issued for removal due to Code of Conduct violations.',
    },
    publicSafety: {
      title: 'Public Safety',
      paragraphs: [
        'The safety and well-being of our guests, vendors, performers, and staff are a top priority at OC MENA Festival. We collaborate closely with local law enforcement, emergency services, and professional security teams to help ensure a safe and welcoming environment throughout the event. For security reasons, we do not publicly disclose specific operational details.',
        'Guests should expect standard safety procedures upon arrival, which may include bag inspections, security screenings, and walk-through detection systems at entry points. These measures apply to all attendees, staff, vendors, and performers. To help ensure a smooth entry experience, we encourage guests to arrive early and review the Prohibited Items list in advance. Items not permitted inside the festival will be denied entry and must be returned to vehicles or properly discarded.',
        'In the event of an emergency or important safety announcement, information may be shared through on-site video screens, public address systems, festival staff, or official digital communications. If you or someone nearby requires medical assistance, please visit the nearest medical tent or notify a staff or security team member immediately. We also encourage everyone to remain aware of their surroundings—if you see something concerning, please report it to a festival staff member or public safety official.',
      ],
      entryTitle: 'What to Expect at Entry',
      entryText: 'For the safety of all guests, OC MENA Festival conducts standard security screenings at all entry points. All attendees may be subject to bag checks and walk-through security screening. Please arrive early, review the Prohibited Items list in advance, and follow instructions from festival staff and security personnel for a smooth entry experience.',
    },
    healthSafety: {
      title: 'Health & Safety',
      medicalTitle: 'Medical Services',
      medicalText: 'Basic Life Support (BLS) and Advanced Life Support (ALS) medical services will be available to all attendees throughout OC MENA Festival. On-site medical care is provided by Global Medical Response. Medical tents will be located at designated areas across the festival grounds and clearly marked on festival maps. Our trained medical teams are available to assist—if you or someone with you is feeling unwell or needs attention, please visit a medical tent or notify a staff member immediately.',
      policiesTitle: 'Health & Safety Policies',
      policiesText: [
        'OC MENA Festival will operate in accordance with all applicable public health guidelines and requirements in effect at the time of the event. These guidelines may be issued by federal, state, or local authorities and are subject to change. Health and safety measures may include, but are not limited to, adjustments to attendance procedures, capacity limits, or other protective protocols as required.',
        'Failure to comply with applicable health directives, festival policies, or posted instructions may result in denied entry or removal from the event without refund.',
      ],
      covidTitle: 'Public Health Notice (COVID-19)',
      covidText: [
        'COVID-19 is a contagious illness that may result in serious health complications. Attendance at any large public gathering carries an inherent risk of exposure to infectious diseases, including COVID-19. OC MENA Festival cannot guarantee that attendees will not be exposed during the event.',
        'Guests are encouraged to assess their personal health conditions and take appropriate precautions prior to attending.',
      ],
      acknowledgementTitle: 'Attendee Health Acknowledgement',
      acknowledgementText: 'By attending OC MENA Festival, all guests agree to comply with festival health and safety policies, posted signage, and staff instructions. Attendance is voluntary, and all attendees assume responsibility for assessing their individual health risks. By entering the festival grounds, guests acknowledge and accept the risks associated with participation in a public event and agree to follow all applicable federal, state, and local health guidelines.',
    }
  },

  // Sponsors Page
  sponsorsPage: {
    title: 'Sponsors',
    description: "OC MENA Festival partners with brands and organizations that support culture, community, and live experiences. Sponsorship opportunities are designed to create meaningful engagement with our audience while aligning your brand with one of Orange County's premier cultural events. We offer multiple sponsorship tiers with customizable benefits, including on-site visibility, digital promotion, experiential activations, and branded integrations throughout the festival.",
    levelsTitle: 'Sponsorship Levels:',
    levels: ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'],
    levelsDescription: 'Each level offers unique exposure opportunities, and custom packages are available upon request.',
    contactText: "If you're interested in becoming a sponsor or would like to receive our sponsorship deck, please contact us here. A member of our team will be in touch to discuss available opportunities and tailor a package that fits your goals.",
    ctaText: 'Ready to become a sponsor?',
    ctaButton: 'Inquire Now',
  },

  // Sponsors Info Page
  sponsorsInfoPage: {
    title: 'Sponsors',
    paragraph1: "OC MENA Festival partners with brands and organizations that support culture, community, and live experiences. Sponsorship opportunities are designed to create meaningful engagement with our audience while aligning your brand with one of Orange County's premier cultural events.",
    paragraph2: 'We offer multiple sponsorship tiers with customizable benefits, including on-site visibility, digital promotion, experiential activations, and branded integrations throughout the festival.',
    levelsTitle: 'Sponsorship Levels:',
    levels: ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'],
    levelsDescription: 'Each level offers unique exposure opportunities, and custom packages are available upon request.',
    contactText: "If you're interested in becoming a sponsor or would like to receive our sponsorship deck, please contact us. A member of our team will be in touch to discuss available opportunities and tailor a package that fits your goals.",
    ctaTitle: 'Ready to become a sponsor?',
    ctaButton: 'Inquire Now',
  },

  // About Vendors Page
  aboutVendorsPage: {
    title: 'About Our Vendors',
    paragraph1: 'Get ready to explore a vibrant mix of vendors from across the region and beyond. OC MENA Festival brings together food, art, fashion, culture, and community in one dynamic marketplace designed to be discovered.',
    paragraph2: 'From mouth-watering eats and refreshing drinks to handcrafted goods, apparel, accessories, and cultural merchandise, our vendor village is curated to reflect the creativity, flavors, and traditions of the MENA community — with plenty of surprises along the way.',
    paragraph3: "You'll find local favorites, emerging brands, and unique makers offering everything from savory street food and sweet treats to statement pieces and lifestyle finds you won't see anywhere else. Whether you're here to eat, shop, browse, or simply soak in the energy, the vendor experience is a core part of the festival vibe.",
    paragraph4: 'Come hungry, come curious, and come ready to support incredible vendors who help make OC MENA Festival an unforgettable celebration.',
    vendorListTitle: 'Vendor List',
    vendorListText: "We'll release the list of vendors as the event date nears",
  },

  // Vendors Page
  vendorsPage: {
    title: 'About Our Vendors',
    paragraph1: 'Get ready to explore a vibrant mix of vendors from across the region and beyond. OC MENA Festival brings together food, art, fashion, culture, and community in one dynamic marketplace designed to be discovered.',
    paragraph2: 'From mouth-watering eats and refreshing drinks to handcrafted goods, apparel, accessories, and cultural merchandise, our vendor village is curated to reflect the creativity, flavors, and traditions of the MENA community — with plenty of surprises along the way.',
    paragraph3: "You'll find local favorites, emerging brands, and unique makers offering everything from savory street food and sweet treats to statement pieces, gifts, and lifestyle finds you won't see anywhere else. Whether you're here to eat, shop, browse, or simply soak in the energy, the vendor experience is a core part of the festival vibe.",
    paragraph4: 'Come hungry, come curious, and come ready to support incredible vendors who help make OC MENA Festival an unforgettable celebration.',
    vendorListTitle: 'Vendor List',
    vendorListText: "We'll release the list of vendors as the event date nears",
  },

  // Maps & Directions Page
  mapsDirectionsPage: {
    title: 'Maps & Directions',
    content: 'Info here',
  },

  // Event Map Page
  eventMapPage: {
    title: 'Event Map',
    description: "Your festival adventure starts here. The OC MENA Festival event map helps you navigate the grounds with ease — from live music stages and vendor bazaars to food, drinks, restrooms, medical tents, and accessibility services. Whether you're chasing your favorite performances or discovering something new, the map makes it easy to explore, plan your route, and soak in every moment.",
  },

  // Event Schedule Page
  eventSchedulePage: {
    title: 'Event Schedule',
    description: 'The countdown is on. Our full lineup of performances, experiences, and special moments will be announced soon. Get ready to plan your day, discover new favorites, and catch every unforgettable moment at OC MENA Festival.',
    newsletterHeading: 'Subscribe to our newsletter to stay informed!',
    newsletterSuccess: "Thank you for subscribing! We'll notify you when the lineup is announced.",
    newsletterButton: 'Sign Up',
    newsletterButtonLoading: 'Signing up...',
  },

  // Login Page
  loginPage: {
    title: 'My Account',
    loginTab: 'Login',
    registerTab: 'Register',
    loginHeading: 'Login',
    emailLabel: 'Username or email address *',
    emailPlaceholder: 'Enter your username or email',
    passwordLabel: 'Password *',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    submitButton: 'Sign In',
    submittingButton: 'Signing in...',
  },

  // Signup Page
  signupPage: {
    title: 'My Account',
    loginTab: 'Login',
    registerTab: 'Register',
    registerHeading: 'Register',
    emailLabel: 'Email address *',
    emailPlaceholder: 'Enter your email address',
    passwordLabel: 'Password *',
    passwordPlaceholder: 'Enter your password',
    privacyNotice: 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our privacy policy.',
    submitButton: 'Register',
    submittingButton: 'Registering...',
  },

  // Vendor Booths Page
  vendorBoothsPage: {
    title: 'OC MENA Festival Vendor Booths',
    intro1: "Join us at the OC MENA Festival, one of Orange County's most exciting cultural events, bringing together thousands of families and visitors for three days of food, shopping, music, and entertainment inspired by the Middle East and North Africa.",
    intro2: 'Showcase your products, cuisine, services, or brand in a vibrant festival environment filled with energy and community engagement. With a variety of booth options available, vendors can choose the ideal space to connect with guests, drive sales, and be part of an unforgettable summer celebration.',
    intro3: 'Explore the booth packages and secure your spot today—spaces are limited and fill quickly each year.',
    selectBoothTitle: 'Please select a booth option:',
    registrationTitle: 'Vendor Registration',
    continueButton: 'Continue to Checkout',
    boothOptions: [
      {
        id: 'bazaar',
        name: '10x10 Bazaar Booth',
        description: 'Sell goods inside the decorated bazaar',
        price: 1100,
        includes: ['10x10 booth', 'Vendor credentials', '4 guest entry tickets', '1 parking ticket'],
        upgradeText: "Upgrade to 20'x10' (+$100)",
      },
      {
        id: 'food-truck',
        name: '10x10 Food Truck',
        description: 'Serve guests from your mobile kitchen',
        price: 3000,
        includes: ['Food truck parking spot', 'Vendor credentials', '4 guest entry tickets', '1 parking ticket'],
      },
      {
        id: 'food-booth',
        name: '10x10 Food Booth',
        description: 'Serve food from a fixed booth space',
        price: 1750,
        includes: ['10x10 booth', 'Vendor credentials', '4 guest entry tickets', '1 parking ticket'],
        upgradeText: "Upgrade to 20'x10' (+$200)",
      }
    ],
    formLabels: {
      email: 'Email*',
      legalName: 'Legal Business Name*',
      boothName: 'Booth Name*',
      phone: 'Phone Number*',
      instagram: 'Instagram Handle',
      facebook: 'Facebook Handle',
      tiktok: 'TikTok Handle',
    },
    bazaarTerms: "I understand that I can set up my booth starting Friday evening and Saturday morning from 8 AM to 11 AM. After 11 AM, I won't be able to set up my booth and I won't get any refunds. Also, if I am handling any food whether it is packaged or non packaged I would require OC MENA Festival approval*",
    acceptTermsLabel: 'I accept the terms above',
  },

  // Privacy Policy Page
  privacyPolicyPage: {
    title: 'Privacy Policy',
    effectiveDate: 'Effective Date: January 1, 2026',
    intro: 'MENA Events, LLC ("MENA Events," "we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard information in connection with OC MENA Festival and our related services.',
    scope: 'This Policy applies to information collected through our websites, ticketing platforms, mobile applications, social media pages, in-person events, and other services we operate or provide (collectively, the "Services").',
    sections: [
      {
        title: 'Who We Are',
        content: 'MENA Events, LLC is the organizer and operator of OC MENA Festival, a live cultural and entertainment event. We produce, promote, and manage festival experiences, including ticketed events, vendor participation, digital services, and on-site operations.',
      },
      {
        title: 'Personal Data We Collect',
        content: '"Personal Data" means information that identifies, relates to, describes, or can reasonably be linked to you or your household.',
      },
    ],
    contactInfo: {
      company: 'MENA Events, LLC',
      email: 'info@ocmenafestival.com',
      website: 'ocmenafestival.com',
    },
  },

  // CPRA Notice Page
  cpraNoticePage: {
    title: 'California Privacy Rights (CPRA Notice)',
    intro: 'This section applies only to California residents and supplements the Privacy Policy above. It is provided in accordance with the California Consumer Privacy Act, as amended by the California Privacy Rights Act ("CPRA").',
    contactInfo: {
      company: 'MENA Events, LLC',
      email: 'info@ocmenafestival.com',
      website: 'ocmenafestival.com',
    },
  },

  // Accessibility Page
  accessibilityPage: {
    title: 'Accessibility / ADA',
    content: 'Accessibility and ADA information coming soon. Please contact info@ocmenafestival.com for any questions or click here.',
  },

  // Terms of Use Page
  termsOfUsePage: {
    title: 'Terms of Use',
    effectiveDate: 'Last updated and effective: 1/5/2026',
    contactInfo: {
      company: 'MENA Events, LLC',
      email: 'info@ocmenafestival.com',
    },
  },

  // Ticket Terms Page
  ticketTermsPage: {
    title: 'Ticket Terms & Conditions',
    effectiveDate: 'Effective Date: January 1, 2026',
    intro: 'Please read these OC MENA Festival Ticket Terms ("Terms" or "Agreement") carefully, as they affect your legal rights. These Terms apply to admission to OC MENA Festival (the "Event"), produced by MENA Events, LLC ("Event Producer").',
  },

  // Header Navigation
  header: {
    navItems: [
      { name: 'EXPERIENCE', path: '/' },
      { name: 'EVENT SCHEDULE', path: '/event-schedule' },
      { name: 'VENDORS', path: '/vendors' },
      { name: 'SPONSORS', path: '/sponsors' },
      { name: 'CONTACT', path: '/contact' },
    ],
    getTicketsButton: 'Get Tickets',
    cartLabel: 'Cart',
    accountLabel: 'Account',
    dashboardLabel: 'Dashboard',
  },

  // Footer
  footer: {
    companyLinks: [
      { label: 'About', path: '/about' },
      { label: 'What is MENA?', path: '/what-is-mena' },
      { label: 'FAQ', path: '/faq' },
      { label: 'My Account', path: '/login' },
      { label: 'Contact', path: '/contact' },
    ],
    eventInfoLinks: [
      { label: 'Festival Info', path: '/festival-info' },
      { label: 'Sponsors', path: '/sponsors-info' },
      { label: 'About Vendors', path: '/about-vendors' },
      { label: 'Maps & Directions', path: '/maps-directions' },
      { label: 'Event Map', path: '/event-map' },
      { label: 'Event Schedule', path: '/event-schedule' },
    ],
    legalLinks: [
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'CA Privacy Policy', path: '/cpra-notice' },
      { label: 'Accessibility / ADA', path: '/accessibility' },
      { label: 'Terms of Use', path: '/terms-of-use' },
      { label: 'Ticket Terms', path: '/ticket-terms' },
    ],
    socialLinks: {
      instagram: 'https://www.instagram.com/ocmenafest',
      tiktok: 'https://www.tiktok.com/@ocmenafest',
      youtube: 'https://www.youtube.com/@ocmenafest',
      facebook: 'https://www.facebook.com/ocmenafest',
      twitter: 'https://x.com/ocmenafest',
      snapchat: 'https://www.snapchat.com/add/ocmenafest',
    },
    newsletterLabel: 'Newsletter',
    newsletterText: 'Join our newsletter and stay informed!',
  },
};

// Helper function to get CMS data (will be replaced with API call later)
export const getCmsData = () => {
  // Try to get from localStorage first (for admin edits)
  const savedData = localStorage.getItem('cmsData');
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Error parsing CMS data:', e);
    }
  }
  return cmsData;
};

// Helper function to save CMS data (will be replaced with API call later)
export const saveCmsData = (data) => {
  localStorage.setItem('cmsData', JSON.stringify(data));
  // Dispatch event to notify components of update
  window.dispatchEvent(new CustomEvent('cmsDataUpdated', { detail: data }));
  return true;
};

// Helper function to reset to defaults
export const resetCmsData = () => {
  localStorage.removeItem('cmsData');
  window.dispatchEvent(new CustomEvent('cmsDataUpdated', { detail: cmsData }));
  return cmsData;
};

export default cmsData;
