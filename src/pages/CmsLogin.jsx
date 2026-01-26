import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CmsLogin.css';

const CmsLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Static admin credentials (will be replaced with backend auth later)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'OCMena2026!'
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (
      credentials.username === ADMIN_CREDENTIALS.username &&
      credentials.password === ADMIN_CREDENTIALS.password
    ) {
      // Store admin session (will be replaced with proper auth later)
      sessionStorage.setItem('cmsAdmin', JSON.stringify({
        isAuthenticated: true,
        username: credentials.username,
        loginTime: new Date().toISOString()
      }));
      navigate('/oc-admin-cms-2026');
    } else {
      setError('Invalid username or password');
    }

    setLoading(false);
  };

  return (
    <div className="cms-login-container">
      <div className="cms-login-box">
        <div className="cms-login-header">
          <img src="/logo.png" alt="OC MENA Festival" className="cms-login-logo" />
          <h1>CMS Admin Portal</h1>
          <p>Content Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="cms-login-form">
          <div className="cms-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>

          <div className="cms-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="cms-error-message">{error}</div>}

          <button type="submit" className="cms-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="cms-login-footer">
          <p>Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default CmsLogin;
