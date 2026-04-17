import { MapPin, Users, Wifi, Tv, Monitor, Laptop } from 'lucide-react';
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
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid var(--border-color)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => navigate(`/dashboard/resources/${resource.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ position: 'relative', height: '180px' }}>
        <img 
          src={resource.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'} 
          alt={resource.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '600',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          color: getStatusColor(resource.status),
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: `1px solid ${getStatusColor(resource.status)}`
        }}>
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: getStatusColor(resource.status) 
          }}></span>
          {resource.status}
        </div>
        <div style={{
           position: 'absolute',
           top: '12px',
           left: '12px',
           padding: '4px 10px',
           borderRadius: '6px',
           fontSize: '0.7rem',
           fontWeight: '700',
           background: 'rgba(17, 24, 39, 0.8)',
           color: 'white',
           textTransform: 'uppercase',
           letterSpacing: '0.5px'
        }}>
          {resource.type}
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {resource.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <MapPin size={16} />
            <span>{resource.location}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} />
            <span>Capacity: {resource.capacity}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {resource.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              background: 'var(--bg-alt)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {amenityIcons[amenity] || null}
              {amenity}
            </span>
          ))}
          {resource.amenities.length > 3 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              +{resource.amenities.length - 3}
            </span>
          )}
        </div>

        <button 
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--accent)',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/resources/${resource.id}`);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
