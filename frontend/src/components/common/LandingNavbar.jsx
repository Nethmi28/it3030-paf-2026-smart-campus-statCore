import { useEffect } from 'react';
import { ArrowRight, School, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function LandingNavbar() {
  const location = useLocation();

  const navItems = [
    { 
      label: 'Home', 
      to: '/', 
      href: '#home',
      active: location.pathname === '/' && (location.hash === '' || location.hash === '#home')
    },
    { 
      label: 'Resources', 
      to: '/resources',
      active: location.pathname.startsWith('/resources')
    },
    { 
      label: 'Reservations', 
      to: '/login',
      active: location.pathname === '/login'
    },
    { 
      label: 'About Us', 
      to: '/#about-us', 
      href: '#about-us',
      active: location.pathname === '/' && location.hash === '#about-us'
    },
    { 
      label: 'Contact Us', 
      to: '/#contact-us', 
      href: '#contact-us',
      active: location.pathname === '/' && location.hash === '#contact-us'
    },
  ];

  // Handle smooth scrolling when already on the homepage
  const handleNavClick = (event, item) => {
    if (item.href && location.pathname === '/') {
      event.preventDefault();
      const target = document.querySelector(item.href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', item.href);
      }
    }
  };

  // Scroll to hash element when navigating from other pages to homepage
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const timer = setTimeout(() => {
        const target = document.querySelector(location.hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar__inner">
        <Link to="/" className="landing-navbar__brand" aria-label="Facilio Hub Home">
          <div className="landing-navbar__brand-mark">
            <School size={18} />
          </div>
          <div>
            <div className="landing-navbar__brand-title">Facilio Campus</div>
            <div className="landing-navbar__brand-subtitle">Smart campus portal</div>
          </div>
        </Link>

        <div className="landing-navbar__links" aria-label="Landing page sections">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`landing-navbar__link${item.active ? ' landing-navbar__link--active' : ''}`}
              onClick={(event) => handleNavClick(event, item)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="landing-navbar__actions">
          <ThemeToggle />

          <Link to="/login" className="landing-navbar__account">
            <div className="landing-navbar__account-avatar">
              <Sparkles size={15} />
            </div>
            <div>
              <div className="landing-navbar__account-label">Campus Access</div>
              <div className="landing-navbar__account-meta">Login</div>
            </div>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
