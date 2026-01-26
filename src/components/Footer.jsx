import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCms } from '../cms/CmsContext';
import footerImage from '../assets/footer-image-scaled.jpg';
import './Footer.css';

const Footer = () => {
  const { content } = useCms();
  const cms = content?.footer || {};
  const globalCms = content?.global || {};
  
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (section) => {
    setOpenDropdown(openDropdown === section ? null : section);
  };

  const footerStyle = {
    backgroundImage: `url(${footerImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <footer className="site-footer" style={footerStyle}>
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Column */}
          <div className="footer-column">
            <h4 className="dropdown-header" onClick={() => toggleDropdown('company')}>
              Company
              <span className={`dropdown-arrow ${openDropdown === 'company' ? 'open' : ''}`}>▼</span>
            </h4>
            <ul className={`dropdown-content ${openDropdown === 'company' ? 'open' : ''}`}>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/what-is-mena">What is MENA?</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/login">My Account</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Event Info Column */}
          <div className="footer-column">
            <h4 className="dropdown-header" onClick={() => toggleDropdown('event-info')}>
              Event Info
              <span className={`dropdown-arrow ${openDropdown === 'event-info' ? 'open' : ''}`}>▼</span>
            </h4>
            <ul className={`dropdown-content ${openDropdown === 'event-info' ? 'open' : ''}`}>
              <li><Link to="/festival-info">Festival Info</Link></li>
              <li><Link to="/sponsors-info">Sponsors</Link></li>
              <li><Link to="/about-vendors">About Vendors</Link></li>
              <li><Link to="/maps-directions">Maps & Directions</Link></li>
              <li><Link to="/event-map">Event Map</Link></li>
              <li><Link to="/event-schedule">Event Schedule</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-column">
            <h4 className="dropdown-header" onClick={() => toggleDropdown('legal')}>
              Legal
              <span className={`dropdown-arrow ${openDropdown === 'legal' ? 'open' : ''}`}>▼</span>
            </h4>
            <ul className={`dropdown-content ${openDropdown === 'legal' ? 'open' : ''}`}>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/cpra-notice">CA Privacy Policy</Link></li>
              <li><Link to="/accessibility">Accessibility / ADA</Link></li>
              <li><Link to="/terms-of-use">Terms of Use</Link></li>
              <li><Link to="/ticket-terms">Ticket Terms</Link></li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="footer-column">
            <h4>Follow Us</h4>
            <div className="footer-social-icons">
              <a href="https://www.instagram.com/ocmenafest" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><g clipPath="url(#clip0_ig)"><path d="M16.0036 7.79777C11.4632 7.79777 7.801 11.46 7.801 16.0003C7.801 20.5407 11.4632 24.2029 16.0036 24.2029C20.5439 24.2029 24.2061 20.5407 24.2061 16.0003C24.2061 11.46 20.5439 7.79777 16.0036 7.79777ZM16.0036 21.3331C13.0695 21.3331 10.6708 18.9416 10.6708 16.0003C10.6708 13.0591 13.0624 10.6676 16.0036 10.6676C18.9448 10.6676 21.3363 13.0591 21.3363 16.0003C21.3363 18.9416 18.9376 21.3331 16.0036 21.3331ZM26.4549 7.46224C26.4549 8.52594 25.5982 9.37546 24.5417 9.37546C23.478 9.37546 22.6284 8.5188 22.6284 7.46224C22.6284 6.40569 23.4851 5.54903 24.5417 5.54903C25.5982 5.54903 26.4549 6.40569 26.4549 7.46224ZM31.8876 9.40402C31.7662 6.84116 31.1808 4.571 29.3033 2.70062C27.4329 0.830231 25.1627 0.244843 22.5999 0.116344C19.9585 -0.0335728 12.0415 -0.0335728 9.40011 0.116344C6.8444 0.237704 4.57423 0.823092 2.69671 2.69348C0.819186 4.56386 0.240937 6.83402 0.112437 9.39688C-0.0374791 12.0383 -0.0374791 19.9553 0.112437 22.5967C0.233798 25.1595 0.819186 27.4297 2.69671 29.3001C4.57423 31.1704 6.83726 31.7558 9.40011 31.8843C12.0415 32.0342 19.9585 32.0342 22.5999 31.8843C25.1627 31.763 27.4329 31.1776 29.3033 29.3001C31.1737 27.4297 31.7591 25.1595 31.8876 22.5967C32.0375 19.9553 32.0375 12.0454 31.8876 9.40402ZM28.4752 25.4308C27.9184 26.83 26.8404 27.908 25.434 28.4719C23.3281 29.3072 18.3308 29.1144 16.0036 29.1144C13.6763 29.1144 8.67195 29.3001 6.57312 28.4719C5.1739 27.9151 4.09593 26.8371 3.53196 25.4308C2.69671 23.3248 2.88946 18.3276 2.88946 16.0003C2.88946 13.6731 2.70385 8.66871 3.53196 6.56989C4.08879 5.17067 5.16676 4.0927 6.57312 3.52872C8.67909 2.69348 13.6763 2.88623 16.0036 2.88623C18.3308 2.88623 23.3352 2.70062 25.434 3.52872C26.8332 4.08556 27.9112 5.16353 28.4752 6.56989C29.3104 8.67585 29.1177 13.6731 29.1177 16.0003C29.1177 18.3276 29.3104 23.332 28.4752 25.4308Z"></path></g></svg>
              </a>
              <a href="https://www.tiktok.com/@ocmenafest" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M30.0014 13.12C27.2486 13.1259 24.5635 12.2666 22.3257 10.6635V21.8396C22.325 23.9095 21.6924 25.9298 20.5124 27.6304C19.3325 29.331 17.6614 30.6308 15.7227 31.3559C13.784 32.081 11.6701 32.1969 9.66375 31.6881C7.65739 31.1793 5.85422 30.07 4.4954 28.5086C3.13657 26.9472 2.28687 25.0082 2.05993 22.9508C1.833 20.8934 2.23965 18.8158 3.2255 16.9958C4.21135 15.1757 5.7294 13.7001 7.57662 12.7662C9.42385 11.8324 11.5122 11.4848 13.5623 11.7699V17.3892C12.6249 17.0941 11.6182 17.1027 10.686 17.4139C9.75372 17.725 8.94363 18.3227 8.37135 19.1217C7.79906 19.9207 7.49385 20.88 7.49928 21.8628C7.50471 22.8455 7.82051 23.8015 8.4016 24.594C8.98268 25.3866 9.79933 25.9754 10.7349 26.2762C11.6706 26.577 12.6773 26.5745 13.6114 26.269C14.5455 25.9636 15.3592 25.3708 15.9364 24.5754C16.5135 23.7799 16.8246 22.8224 16.8251 21.8396V0H22.3257C22.3226 0.465211 22.3623 0.929719 22.4444 1.38764C22.6357 2.40836 23.0331 3.37936 23.6124 4.24129C24.1917 5.10321 24.9406 5.83796 25.8135 6.40063C27.056 7.22124 28.5124 7.65817 30.0014 7.657V13.12Z"></path></svg>
              </a>
              <a href="https://www.youtube.com/@ocmenafest" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M31.3321 8.27252C30.963 6.88402 29.8792 5.79431 28.5024 5.42521C26.0066 4.75146 16 4.75146 16 4.75146C16 4.75146 5.99341 4.75146 3.49762 5.42521C2.12083 5.79431 1.03698 6.88402 0.667887 8.27252C0 10.7859 0 16.0235 0 16.0235C0 16.0235 0 21.2612 0.667887 23.7745C1.03698 25.163 2.12083 26.2059 3.49762 26.575C5.99341 27.2487 16 27.2487 16 27.2487C16 27.2487 26.0066 27.2487 28.5024 26.575C29.8792 26.2059 30.963 25.1572 31.3321 23.7745C32 21.2612 32 16.0235 32 16.0235C32 16.0235 32 10.7859 31.3321 8.27252ZM12.7309 20.7808V11.2663L21.0912 16.0235L12.7309 20.7808Z"></path></svg>
              </a>
              <a href="https://www.facebook.com/ocmenafest" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><g clipPath="url(#clip0_fb)"><path d="M32 3.42857V28.5714C32 30.4643 30.4643 32 28.5714 32H22.4786V19.3429H26.8071L27.4286 14.5143H22.4786V11.4286C22.4786 10.0286 22.8643 9.07857 24.8714 9.07857H27.4286V4.76429C26.9857 4.70714 25.4714 4.57143 23.7 4.57143C20.0143 4.57143 17.4857 6.82143 17.4857 10.9571V14.5214H13.1429V19.35H17.4929V32H3.42857C1.53571 32 0 30.4643 0 28.5714V3.42857C0 1.53571 1.53571 0 3.42857 0H28.5714C30.4643 0 32 1.53571 32 3.42857Z"></path></g></svg>
              </a>
              <a href="https://x.com/ocmenafest" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M25.1995 1.53662H30.1086L19.3864 13.7887L32 30.4632H22.126L14.3868 20.3528L5.54194 30.4632H0.625815L12.0921 17.3558L0 1.53662H10.1243L17.1126 10.7778L25.1995 1.53662ZM23.475 27.5288H26.1938L8.6432 4.31802H5.72273L23.475 27.5288Z"></path></svg>
              </a>
              <a href="https://www.snapchat.com/add/ocmenafest" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M31.9086 23.2954C31.6843 22.6886 31.2622 22.3654 30.7806 22.0949C30.6883 22.0421 30.6091 21.996 30.5366 21.9696C30.3914 21.897 30.2463 21.8245 30.1012 21.7453C28.5973 20.9472 27.4231 19.9445 26.6052 18.7506C26.3743 18.4142 26.1698 18.058 26.0049 17.6886C25.9324 17.4907 25.939 17.3786 25.9917 17.273C26.0445 17.1939 26.1039 17.1279 26.183 17.0751C26.4403 16.9036 26.7107 16.7321 26.8888 16.6134C27.212 16.4023 27.4693 16.2374 27.6276 16.1253C28.2477 15.6965 28.6764 15.2348 28.9469 14.7203C29.1382 14.3641 29.2437 13.9749 29.2701 13.5725C29.2965 13.1702 29.2305 12.7678 29.0854 12.3984C28.6764 11.3232 27.6606 10.657 26.4271 10.657C26.1698 10.657 25.906 10.6834 25.6553 10.7361C25.5894 10.7493 25.5168 10.7691 25.4508 10.7823C25.464 10.0435 25.4442 9.27176 25.3783 8.50659C25.1474 5.81531 24.2041 4.4103 23.2213 3.28234C22.5947 2.57654 21.8559 1.98287 21.0313 1.52113C19.5406 0.670213 17.8519 0.241455 16.0116 0.241455C14.1712 0.241455 12.4892 0.670213 10.9984 1.52113C10.1739 1.98287 9.43508 2.58313 8.80184 3.28893C7.819 4.4103 6.87573 5.8219 6.64486 8.51318C6.5789 9.27835 6.5657 10.0567 6.5723 10.7889C6.50634 10.7691 6.44037 10.7559 6.36782 10.7427C6.11056 10.69 5.85331 10.6636 5.59605 10.6636C4.36255 10.6636 3.34672 11.3298 2.93775 12.405C2.79263 12.781 2.72667 13.1833 2.75306 13.5791C2.77944 13.9749 2.88498 14.3707 3.07627 14.7269C3.34672 15.2414 3.78208 15.6965 4.39553 16.1319C4.56044 16.244 4.81769 16.4089 5.13431 16.62C5.30582 16.7321 5.56307 16.897 5.81373 17.062C5.89948 17.1213 5.97204 17.1939 6.03141 17.2796C6.08418 17.3852 6.08418 17.5039 6.00502 17.715C5.84011 18.0778 5.64223 18.4274 5.41795 18.7572C4.6198 19.9247 3.47865 20.9076 2.02747 21.6991C1.2557 22.1081 0.450957 22.3786 0.114547 23.302C-0.142708 23.9946 0.0287956 24.7862 0.675231 25.4524C0.912696 25.7031 1.18974 25.9076 1.49317 26.0725C2.12641 26.4221 2.79923 26.6859 3.49184 26.8706C3.63696 26.9102 3.77548 26.9696 3.89421 27.0487C4.13168 27.2532 4.0987 27.5698 4.40872 28.025C4.56703 28.2624 4.76492 28.4669 5.00239 28.6252C5.66201 29.0804 6.40739 29.1133 7.19235 29.1397C7.90475 29.1661 8.70949 29.1991 9.62638 29.5025C10.009 29.6279 10.4047 29.8719 10.8599 30.1556C11.9615 30.835 13.472 31.7585 15.9918 31.7585C18.5116 31.7585 20.0353 30.8284 21.1435 30.149C21.5986 29.8719 21.9944 29.6279 22.3638 29.5025C23.2807 29.1991 24.092 29.1661 24.7978 29.1397C25.5828 29.1068 26.3281 29.0804 26.9878 28.6252C27.2648 28.4339 27.4957 28.1833 27.6606 27.8864C27.8849 27.5039 27.8849 27.2334 28.0959 27.0421C28.2147 26.963 28.34 26.9036 28.4785 26.8706C29.1843 26.6859 29.8637 26.4155 30.5102 26.0659C30.8334 25.8944 31.1236 25.6635 31.3677 25.393L31.3743 25.3799C31.9811 24.7268 32.1329 23.9617 31.8888 23.2822L31.9086 23.2954Z"></path></svg>
              </a>
            </div>
            <div className="footer-newsletter">
              <p className="footer-newsletter-label">{cms.newsletterLabel}</p>
              <p className="footer-newsletter-text">{cms.newsletterText}</p>
              <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="email@email.com" />
                <button type="submit">→</button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{globalCms.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
