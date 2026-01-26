import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCmsData, saveCmsData, resetCmsData } from './cmsData';

const CmsContext = createContext();

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};

export const CmsProvider = ({ children }) => {
  const [cmsContent, setCmsContent] = useState(getCmsData());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleCmsUpdate = (event) => {
      // Force reload from localStorage to ensure we have the latest data
      const latestData = getCmsData();
      setCmsContent(latestData);
    };

    window.addEventListener('cmsDataUpdated', handleCmsUpdate);
    
    // Also listen for storage events (for cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === 'cmsData') {
        const latestData = getCmsData();
        setCmsContent(latestData);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cmsDataUpdated', handleCmsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateContent = (newContent) => {
    setIsLoading(true);
    try {
      saveCmsData(newContent);
      setCmsContent(newContent);
      return true;
    } catch (error) {
      console.error('Error saving CMS content:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    const defaultData = resetCmsData();
    setCmsContent(defaultData);
    return defaultData;
  };

  const value = {
    content: cmsContent,
    updateContent,
    resetToDefaults,
    isLoading,
  };

  return (
    <CmsContext.Provider value={value}>
      {children}
    </CmsContext.Provider>
  );
};

export default CmsContext;
