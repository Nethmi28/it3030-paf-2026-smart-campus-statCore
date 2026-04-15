import { BookOpen, MapPin, Search, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Welcome back, {user?.name.split(' ')[0]}!</h2>
        <p style={{ color: '#64748b' }}>Book facilities, find resources, and manage your campus experience.</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '20px', padding: '40px', color: 'white', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
           <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>What do you need today?</h3>
           <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '12px', width: '100%', maxWidth: '500px', backdropFilter: 'blur(10px)' }}>
             <div style={{ padding: '12px', color: 'rgba(255,255,255,0.8)' }}><Search size={20} /></div>
             <input type="text" placeholder="Search for rooms, labs, auditoriums..." style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '1rem' }} />
             <button style={{ background: 'white', color: '#1d4ed8', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Search</button>
           </div>
        </div>
        <div style={{ position: 'absolute', right: '-20px', top: '-40px', opacity: 0.1 }}>
          <BookOpen size={240} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div style={{ background: '#e0e7ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', marginBottom: '16px' }}>
            <CalendarPlus size={24} />
          </div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Book a Facility</h4>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Reserve study rooms, labs, or sports facilities for your group.</p>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
          <div style={{ background: '#fce7f3', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', marginBottom: '16px' }}>
            <MapPin size={24} />
          </div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Campus Map</h4>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Find your way around the smart campus and locate empty rooms.</p>
        </div>

      </div>
    </div>
  );
}
