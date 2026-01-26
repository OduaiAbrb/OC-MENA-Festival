import React, { useState, useEffect } from 'react';
import { useCms } from '../cms/CmsContext';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const { content } = useCms();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`announcement-bar ${!isVisible ? 'hidden' : ''}`}>
      {content.global.announcementBar}
    </div>
  );
};

export default AnnouncementBar;
