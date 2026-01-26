import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CmsLogin.css';

const CmsLogin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Check if user is logged in
      if (!api.isAuthenticated()) {
        setError('Please log in to your admin account first');
        setLoading(false);
        setTimeout(() => {
          navigate('/login?redirect=/oc-admin-login-2026');
        }, 2000);
        return;
      }

      // Get user profile to check if admin
      try {
        const user = api.getUser();
        
        if (user && user.is_staff) {
          // User is admin, grant CMS access
          sessionStorage.setItem('cmsAdmin', JSON.stringify({
            isAuthenticated: true,
            username: user.email,
            loginTime: new Date().toISOString()
          }));
          navigate('/oc-admin-cms-2026');
        } else {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Error verifying admin access. Please try logging in again.');
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  return (
    <div className="cms-login-container">
      <div className="cms-login-box">
        <div className="cms-login-header">
          <img src="/logo.png" alt="OC MENA Festival" className="cms-login-logo" />
          <h1>CMS Admin Portal</h1>
          <p>Content Management System</p>
        </div>

        <div className="cms-login-form">
          {loading ? (
            <div className="cms-loading">
              <div className="cms-spinner"></div>
              <p>Verifying admin access...</p>
            </div>
          ) : error ? (
            <div className="cms-error-message">{error}</div>
          ) : null}
        </div>

        <div className="cms-login-footer">
          <p>Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default CmsLogin;
