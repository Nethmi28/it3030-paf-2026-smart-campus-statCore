import { ArrowRight, School, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function LandingNavbar() {
  const navItems = [
    { label: 'Home', href: '#home', active: true },
    { label: 'Resources', to: '/dashboard/resources' },
    { label: 'Reservations', to: '/login' },
    { label: 'About Us', href: '#about-us' },
    { label: 'Contact Us', href: '#contact-us' },
  ];

  const handleNavClick = (event, href) => {
    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
  };

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar__inner">
        <Link to="/" className="landing-navbar__brand" aria-label="Facilio Hub Home">
          <div className="landing-navbar__brand-mark">
            <School size={18} />
          </div>
          <div>
            <div className="landing-navbar__brand-title">Facilio Hub</div>
            <div className="landing-navbar__brand-subtitle">Smart campus portal</div>
          </div>
        </Link>

        <div className="landing-navbar__links" aria-label="Landing page sections">
          {navItems.map((item) => (
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className={`landing-navbar__link${item.active ? ' landing-navbar__link--active' : ''}`}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className={`landing-navbar__link${item.active ? ' landing-navbar__link--active' : ''}`}
                onClick={(event) => handleNavClick(event, item.href)}
              >
                {item.label}
              </a>
            )
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
