import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck2, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export default function Hero() {
  const phrases = ['All in One', 'Ready to Reserve', 'Built for Campus'];
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setIndex((previousIndex) => (previousIndex + 1) % phrases.length);
        setOpacity(1);
      }, 280);
    }, 3200);

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section id="home" className="landing-hero">
      <div className="landing-hero__inner">
        <div className="landing-hero__copy">
          <div className="landing-hero__eyebrow">
            <Sparkles size={14} />
            Smart campus operations
          </div>

          <h1 className="landing-hero__title">
            Your Campus
            <br />
            Flow,
            <br />
            <span
              className="landing-hero__title-accent"
              style={{ opacity, transition: 'opacity 0.45s ease' }}
            >
              {phrases[index]}
              <span className="landing-hero__caret"></span>
            </span>
          </h1>

          <p className="landing-hero__description">
            Book halls, find labs, coordinate facilities, and stay on top of campus requests
            from one focused workspace built for students and staff.
          </p>

          <div className="landing-hero__actions">
            <Link to="/login" className="landing-button landing-button--primary">
              Explore Portal
            </Link>
            <a href="#reservations" className="landing-button landing-button--secondary">
              See How It Works
            </a>
          </div>

          <div className="landing-hero__meta">
            <div className="landing-hero__meta-item">
              <CalendarCheck2 size={18} />
              <span>Room and resource booking in one place</span>
            </div>
            <div className="landing-hero__meta-item">
              <ShieldCheck size={18} />
              <span>Approvals, tracking, and issue reporting together</span>
            </div>
          </div>
        </div>

        <div className="landing-hero__visual">
          <div className="landing-hero__visual-shell">
            <div className="landing-hero__visual-card">
              <img
                src="/campus-hero.png"
                alt="Facilio Hub campus preview"
                className="landing-hero__image"
              />
              <div className="landing-hero__image-overlay" />
            </div>

            <div className="landing-hero__floating landing-hero__floating--top">
              <div className="landing-hero__floating-icon">
                <MapPin size={18} />
              </div>
              <div>
                <div className="landing-hero__floating-title">57 active spaces</div>
                <div className="landing-hero__floating-copy">Halls, labs, venues, and equipment</div>
              </div>
            </div>

            <div className="landing-hero__floating landing-hero__floating--bottom">
              <div className="landing-hero__floating-icon">
                <ArrowRight size={18} />
              </div>
              <div>
                <div className="landing-hero__floating-title">Approval-ready booking flow</div>
                <div className="landing-hero__floating-copy">From request to confirmation, fast</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
