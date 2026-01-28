import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../cms/CmsContext';
import { Eye, EyeOff } from 'lucide-react';
import AnnouncementBar from '../components/AnnouncementBar';
import Footer from '../components/Footer';
import SponsorsSection from '../components/SponsorsSection';
import ScrollToTop from '../components/ScrollToTop';
import TornPaperWrapper from '../components/TornPaperWrapper';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { content } = useCms();
  const cms = content?.loginPage || {};
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/dashboard');
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result?.success) {
        const searchParams = new URLSearchParams(location.search);
        const redirect = searchParams.get('redirect');
        navigate(redirect || '/dashboard');
      } else {
        setError(result?.error?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <AnnouncementBar />
      
      <section className="hero-section">
        <div className="hero-background-wrapper">
          <video src="/background.mp4" alt="OC MENA Festival" className="hero-background-video" autoPlay muted loop playsInline />
          <div className="hero-gradient-overlay"></div>
        </div>

        <TornPaperWrapper>
          <h1 className="card-title" style={{ paddingBottom: '30px' }}>{cms.title}</h1>
          <style>{".card-title { font-size: 36px !important; }"}</style>
          
          <div className="auth-options" style={{ paddingBottom: '30px' }}>
            <Link to="/login" className="auth-option active">
              {cms.loginTab}
              <div className="active-indicator"></div>
            </Link>
            <Link to="/signup" className="auth-option">
              {cms.registerTab}
            </Link>
          </div>

          <h2 className="login-heading" style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '30px' }}>{cms.loginHeading}</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">{cms.emailLabel}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={cms.emailPlaceholder}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">{cms.passwordLabel}</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={cms.passwordPlaceholder}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>{cms.rememberMe}</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">{cms.forgotPassword}</Link>
            </div>

            {error && <div className="error-message" style={{color: '#e74c3c', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

            <button type="submit" className="btn-primary submit-btn" disabled={loading}>
              {loading ? cms.submittingButton : cms.submitButton}
            </button>
          </form>
        </TornPaperWrapper>

        <div className="lanterns-container">
          <img src="/lanterns.png" alt="Festival Lanterns" className="lanterns-image" />
        </div>
      </section>

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* Footer */}
      <Footer />
      
      <ScrollToTop />
    </div>
  );
};

export default LoginPage;
