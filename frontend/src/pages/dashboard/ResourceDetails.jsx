import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Users, Wifi, Tv, Monitor,
  Laptop, Calendar, CheckCircle2, Clock, Info, Loader2, AlertCircle,
  Lock, UserCircle, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = { 'Accept': 'application/json' };
        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(`${API_BASE}/api/resources/${id}`, { headers });

        if (!response.ok) throw new Error('Resource not found');
        const data = await response.json();
        setResource(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id, user?.token]);

  const amenityIcons = {
    'Wi-Fi': <Wifi size={20} />,
    'Projector': <Tv size={20} />,
    'Whiteboard': <Monitor size={20} />,
    '3D Printer': <Info size={20} />,
    'Workstations': <Laptop size={20} />,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading resource details...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px', padding: '0 20px' }}>
        <AlertCircle size={64} style={{ color: '#ef4444' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Error Loading Resource</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{error || 'The resource could not be found.'}</p>
        <button
          onClick={() => navigate(location.pathname.startsWith('/dashboard') ? '/dashboard/resources' : '/resources')}
          style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}
        >
          Go Back to Resources
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          padding: '8px 0',
          width: 'fit-content'
        }}
      >
        <ArrowLeft size={18} />
        Back to Resources
      </button>

      <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
        <img
          src={resource.imageUrl}
          alt={resource.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '40px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              {resource.type}
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{resource.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '1rem', opacity: 0.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={18} />
              {resource.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={18} />
              {resource.capacity} people
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem' }}>
              {resource.description}
            </p>
          </section>

          <section style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Amenities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {resource.amenities.map((amenity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--bg-alt)',
                  color: 'var(--text-primary)',
                  fontWeight: '500'
                }}>
                  <div style={{ color: 'var(--accent)' }}>{amenityIcons[amenity] || <CheckCircle2 size={20} />}</div>
                  {amenity}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--bg-card)',
            padding: '32px',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '32px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px' }}>Quick Info</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{
                  color: resource.status === 'Available' ? '#10b981' : '#ef4444',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: resource.status === 'Available' ? '#10b981' : '#ef4444' }}></span>
                  {resource.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type</span>
                <span style={{ fontWeight: '600' }}>{resource.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Capacity</span>
                <span style={{ fontWeight: '600' }}>{resource.capacity}</span>
              </div>
            </div>

            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

            <button style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--accent)',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.2s ease'
            }}
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return;
                }
                navigate('/dashboard/bookings', { state: { selectedResourceId: resource.id, action: 'create' } });
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Calendar size={20} />
              Book This Resource
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Response time usually under 2 hours
            </p>
          </div>
        </div>
      </div>

      {/* Modern Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div
            className="glass-card premium-shadow animate-float"
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '32px',
              padding: '40px',
              textAlign: 'center',
              position: 'relative',
              animation: 'none' // Disable float for modal to keep it stable
            }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                padding: '8px',
                borderRadius: '12px',
                cursor: 'pointer',
                color: 'var(--text-primary)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Lock size={36} />
            </div>

            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Booking Shield
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', fontSize: '1.05rem' }}>
              To ensure all campus resources are managed fairly, we require a verified student or staff account for bookings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/login', { state: { from: location } })}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'var(--accent-text)',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              >
                Login to Continue
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
