import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Hero() {
  const phrases = ["Facilio Hub.", "Smart Campus.", "Your Workspace."];
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setOpacity(1);
      }, 500); // Wait for fade out before changing text
    }, 4000); // Change text every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)', transition: 'background-color 0.3s' }}>
      {/* Left Content */}
      <div style={{ flex: '1', padding: '12rem 5% 4rem 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div>
          <span style={{ background: 'var(--accent)', color: 'var(--accent-text)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', transition: 'background-color 0.3s, color 0.3s' }}>
            SMART CAMPUS
          </span>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: 1.1, marginTop: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', transition: 'color 0.3s' }}>
            Welcome to<br />
            <span style={{ color: 'var(--accent)', opacity: opacity, transition: 'opacity 0.5s ease-in-out, color 0.3s', display: 'inline-block' }}>
              {phrases[index]}
            </span>
          </h1>
          <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, transition: 'color 0.3s' }}>
            A unified platform for managing university facilities. Easily book rooms, access labs, and track maintenance incidents all in one place.
          </p>
          <div style={{ marginTop: '2.5rem' }}>
            <Link to="/dashboard/resources" style={{ background: 'var(--accent)', color: 'var(--accent-text)', padding: '1rem 2rem', borderRadius: '50px', fontWeight: '600', display: 'inline-block', transition: 'all 0.3s' }}>
              Explore Facilities
            </Link>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div style={{ flex: '1.2', position: 'relative' }}>
        {/* Full-bleed background image with rounded corner */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderBottomLeftRadius: '100px', overflow: 'hidden', zIndex: 1, backgroundColor: 'var(--bg-alt)', transition: 'background-color 0.3s' }}>
          <img
            src="/campus-hero.png"
            alt="Campus Student"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Optional gentle overlay to blend it with UI */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.05)' }} />
        </div>

        {/* Floating CSS UI Card 1 */}
        <div style={{ position: 'absolute', top: '25%', left: '-5%', background: 'var(--bg-card)', padding: '1.2rem 1.8rem', borderRadius: '16px', boxShadow: 'var(--shadow)', zIndex: 3, transition: 'background-color 0.3s, box-shadow 0.3s' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-icon)', padding: '12px', borderRadius: '10px', fontSize: '1.5rem', transition: 'background-color 0.3s' }}>📚</div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.3s' }}>Resources Available</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '2px', color: 'var(--text-primary)', transition: 'color 0.3s' }}>150+ Halls & Labs</p>
            </div>
          </div>
        </div>

        {/* Floating CSS UI Card 2 */}
        <div style={{ position: 'absolute', bottom: '25%', right: '10%', background: 'var(--bg-card)', padding: '1.2rem 1.8rem', borderRadius: '16px', boxShadow: 'var(--shadow)', zIndex: 3, transition: 'background-color 0.3s, box-shadow 0.3s' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-icon)', padding: '12px', borderRadius: '10px', fontSize: '1.5rem', transition: 'background-color 0.3s' }}>⚡</div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.3s' }}>Quick Bookings</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '2px', color: 'var(--text-primary)', transition: 'color 0.3s' }}>Instant Approval</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
