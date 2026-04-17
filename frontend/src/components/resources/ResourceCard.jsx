import { MapPin, Users, Wifi, Tv, Monitor, Laptop, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResourceCard = ({ resource }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    return status === 'Available' ? '#10b981' : '#ef4444';
  };

  const amenityIcons = {
    'Wi-Fi': <Wifi size={14} />,
    'Projector': <Tv size={14} />,
    'Whiteboard': <Monitor size={14} />,
    'Workstations': <Laptop size={14} />,
  };

  return (
    <div 
      className="premium-shadow hover-glow"
      style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onClick={() => navigate(`/dashboard/resources/${resource.id}`)}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img 
          src={resource.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'} 
          alt={resource.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.6s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';
          }}
        />
        
        {/* Status Badge - Glassmorphic */}
        <div className="glass-card" style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '6px 14px',
          borderRadius: '99px',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: getStatusColor(resource.status),
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: getStatusColor(resource.status),
            boxShadow: `0 0 10px ${getStatusColor(resource.status)}`
          }}></span>
          {resource.status}
        </div>

        {/* Type Badge */}
        <div style={{
           position: 'absolute',
           bottom: '16px',
           left: '16px',
           padding: '6px 12px',
           borderRadius: '8px',
           fontSize: '0.7rem',
           fontWeight: '800',
           background: 'rgba(15, 23, 42, 0.8)',
           backdropFilter: 'blur(8px)',
           color: 'white',
           textTransform: 'uppercase',
           letterSpacing: '0.05em'
        }}>
          {resource.type}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
        <div>
          <h3 style={{ 
            fontSize: '1.4rem', 
            fontWeight: '800', 
            color: 'var(--text-primary)', 
            marginBottom: '6px',
            letterSpacing: '-0.01em'
          }}>
            {resource.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
            <MapPin size={16} />
            <span>{resource.location}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-alt)', padding: '6px 12px', borderRadius: '10px', fontWeight: '600' }}>
            <Users size={18} style={{ color: 'var(--accent)' }} />
            <span>{resource.capacity} Seats</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {resource.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: 'var(--bg-alt)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {amenityIcons[amenity] || null}
              {amenity}
            </span>
          ))}
        </div>

        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' }}>View Details</span>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'var(--accent)', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            transition: 'transform 0.3s ease'
          }}
          className="arrow-container"
          >
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
