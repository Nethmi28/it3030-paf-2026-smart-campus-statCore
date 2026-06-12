import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact-us" className="landing-contact" style={{ padding: '56px 5% 92px' }}>
      <div className="landing-contact__inner" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
        gap: '48px',
      }}>
        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="landing-trusted__eyebrow" style={{
            color: 'var(--landing-subtitle)',
            fontSize: '0.78rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: '700'
          }}>
            Get In Touch
          </div>
          <h2 style={{
            marginTop: '12px',
            fontSize: 'clamp(1.9rem, 4vw, 2.7rem)',
            lineHeight: '1.08',
            fontWeight: '800',
            color: 'var(--landing-title)',
            letterSpacing: '-0.04em'
          }}>
            Have questions? Contact our support team.
          </h2>
          <p style={{
            marginTop: '16px',
            fontSize: '1rem',
            lineHeight: '1.75',
            color: 'var(--landing-description)',
            marginBottom: '32px'
          }}>
            Whether you are a student booking resources, a technician resolving tickets, or an administrator configuring the campus ecosystem, we are here to support you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'color-mix(in srgb, var(--landing-subtitle) 12%, transparent)',
                color: 'var(--landing-subtitle)'
              }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email us anytime</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--landing-title)' }}>support@faciliocampus.edu</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'color-mix(in srgb, var(--landing-subtitle) 12%, transparent)',
                color: 'var(--landing-subtitle)'
              }}>
                <Phone size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Call support desk</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--landing-title)' }}>+1 (555) 234-5678</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'color-mix(in srgb, var(--landing-subtitle) 12%, transparent)',
                color: 'var(--landing-subtitle)'
              }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Campus Head Office</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--landing-title)' }}>Building 07, Innovation Hub, West Campus</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="landing-highlight-card" style={{
          background: 'var(--landing-card-bg)',
          border: '1px solid var(--landing-card-border)',
          borderRadius: '32px',
          boxShadow: 'var(--landing-card-shadow)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {isSuccess && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--landing-card-bg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              zIndex: 5,
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ color: '#22c55e' }}>
                <CheckCircle2 size={54} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--landing-title)' }}>Thank You!</h3>
              <p style={{ color: 'var(--landing-description)', textAlign: 'center', maxWidth: '320px', fontSize: '0.95rem' }}>
                Your message has been sent successfully. Our support desk will reach out to you shortly.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'color-mix(in srgb, var(--landing-subtitle) 12%, transparent)',
              color: 'var(--landing-subtitle)'
            }}>
              <MessageSquare size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--landing-title)' }}>Send us a message</h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Your Name *
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    background: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Email Address *
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. you@university.edu"
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    background: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </label>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Subject
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g. Question about booking rules"
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Message *
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Type your question or feedback here..."
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
              className="landing-button landing-button--primary"
              style={{
                border: 'none',
                cursor: 'pointer',
                borderRadius: '12px',
                width: '100%',
                minHeight: '50px',
                marginTop: '8px',
                opacity: (isSubmitting || !formData.name || !formData.email || !formData.message) ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Dynamic CSS animations inside component */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 1080px) {
          .landing-contact__inner {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}
