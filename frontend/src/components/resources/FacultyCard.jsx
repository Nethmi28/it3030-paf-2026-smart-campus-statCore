import React from 'react';

const facultyConfig = {
  'Faculty of Computing': {
    gradient: 'faculty-gradient-comp',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    icon: '💻'
  },
  'Business School': {
    gradient: 'faculty-gradient-bus',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    icon: '📈'
  },
  'Faculty of Engineering': {
    gradient: 'faculty-gradient-eng',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800',
    icon: '⚙️'
  },
  'School of Architecture': {
    gradient: 'faculty-gradient-arc',
    image: 'https://images.unsplash.com/photo-1511818330032-954f7231e53e?auto=format&fit=crop&q=80&w=800',
    icon: '📐'
  },
  'Faculty of Humanities & science': {
    gradient: 'faculty-gradient-hum',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
    icon: '🧬'
  },
  'Student Services': {
    gradient: 'faculty-gradient-bus',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    icon: '🚌'
  },
  'General': {
    gradient: 'faculty-gradient-gen',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    icon: '🏛️'
  }
};

export default function FacultyCard({ faculty, count, onClick }) {
  const config = facultyConfig[faculty] || facultyConfig['General'];

  return (
    <div 
      onClick={() => onClick(faculty)}
      className="hover-glow premium-shadow"
      style={{
        position: 'relative',
        height: '320px',
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#121a2b'
      }}
    >
      {/* Background Image with Overlay */}
      <img 
        src={config.image} 
        alt={faculty}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.6,
          transition: 'transform 0.8s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      />
      
      {/* Gradient Overlay */}
      <div className={config.gradient} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.4,
        mixMode: 'multiply'
      }} />

      {/* Content Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '32px',
        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '2rem',
          marginBottom: '8px'
        }}>
          {config.icon}
        </div>
        <h3 style={{ 
          margin: 0, 
          color: '#ffffff', 
          fontSize: '1.5rem', 
          fontWeight: '800',
          letterSpacing: '-0.01em'
        }}>
          {faculty}
        </h3>
        <p style={{ 
          margin: 0, 
          color: 'rgba(255, 255, 255, 0.7)', 
          fontSize: '0.9rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {count} Facilities Available
        </p>
      </div>

      {/* Glassy "Explore" badge */}
      <div className="glass-card" style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        padding: '8px 16px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase'
      }}>
        Explore
      </div>
    </div>
  );
}
