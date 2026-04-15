import { School, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function LandingNavbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    if (localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);



  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2rem 5%',
      backgroundColor: 'transparent',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
        <div style={{ background: 'var(--accent)', color: 'var(--accent-text)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
          <School size={20} />
        </div>
        facilio<span style={{ color: 'var(--text-muted)' }}>/campus</span>
      </div>


      <ul style={{ display: 'flex', gap: '2.5rem', fontWeight: '500', color: 'var(--text-muted)' }}>
        <li><Link style={{ color: 'var(--text-primary)' }} to="/">Home</Link></li>
        <li><Link to="/facilities">Facilities</Link></li>
        <li><Link to="/dashboard/resources">Resources</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contacts</Link></li>
      </ul>


      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>


        <Link
          to="/dashboard"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            padding: '0.7rem 1.8rem',
            borderRadius: '50px',
            fontWeight: '500',
            fontSize: '0.95rem',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.opacity = 0.8}
          onMouseOut={(e) => e.target.style.opacity = 1}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
