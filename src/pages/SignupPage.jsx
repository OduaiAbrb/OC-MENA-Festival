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
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();
  const { content } = useCms();
  const cms = content?.signupPage || {};
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      // Check if user came from checkout
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
      const result = await register(
        formData.email,
        formData.password,
        formData.password,
        ''
      );
      
      if (result?.success) {
        // Check if user came from checkout
        const searchParams = new URLSearchParams(location.search);
        const redirect = searchParams.get('redirect');
        navigate(redirect || '/dashboard');
      } else {
        setError(result?.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <Link to="/login" className="auth-option">
              {cms.loginTab}
            </Link>
            <Link to="/signup" className="auth-option active">
              {cms.registerTab}
              <div className="active-indicator"></div>
            </Link>
          </div>

          <h2 className="register-heading" style={{ textAlign: 'center', fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '30px' }}>{cms.registerHeading}</h2>

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

            {error && <div className="error-message" style={{color: '#e74c3c', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

            <div className="privacy-notice">
              <p>
                {cms.privacyNotice.split('privacy policy')[0]}<Link to="/privacy-policy" className="privacy-link">privacy policy</Link>.
              </p>
            </div>

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

export default SignupPage;
