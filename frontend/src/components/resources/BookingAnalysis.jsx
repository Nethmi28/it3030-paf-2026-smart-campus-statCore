import { useMemo } from 'react';
import { 
  TrendingUp, Clock, Crown, 
  BarChart, Calendar
} from 'lucide-react';

export default function BookingAnalysis({ bookings }) {
  const analysis = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;

    // Peak Hours Calculation
    const hourCounts = {};
    bookings.forEach(b => {
      if (b.startTime) {
        const hour = b.startTime.split(':')[0];
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ 
        hour: `${hour}:00`, 
        count,
        percentage: (count / bookings.length) * 100 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Most Booked Resources
    const resourceCounts = {};
    bookings.forEach(b => {
      if (b.resourceName) {
        resourceCounts[b.resourceName] = (resourceCounts[b.resourceName] || 0) + 1;
      }
    });

    const topResources = Object.entries(resourceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { peakHours, topResources };
  }, [bookings]);

  if (!analysis) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* Peak Hours Card */}
      <div className="glass-card" style={{ 
        padding: '32px', 
        borderRadius: '32px', 
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ background: '#6366f115', padding: '10px', borderRadius: '12px', color: '#6366f1' }}>
            <Clock size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Peak Usage Hours</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {analysis.peakHours.map((item, i) => (
            <div key={item.hour} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.hour}</span>
                <span style={{ color: 'var(--text-primary)' }}>{item.count} Bookings</span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'var(--bg-alt)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${item.percentage}%`, 
                  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '10px',
                  transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: `${i * 0.1}s`
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Resources Card */}
      <div className="glass-card" style={{ 
        padding: '32px', 
        borderRadius: '32px', 
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ background: '#10b98115', padding: '10px', borderRadius: '12px', color: '#10b981' }}>
            <Crown size={20} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Top Performing Facilities</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {analysis.topResources.map((res, i) => (
            <div key={res.name} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--bg-alt)',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s'
            }} className="hover-lift">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: i === 0 ? '#fbbf24' : 'var(--bg-card)', 
                  color: i === 0 ? '#92400e' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '0.85rem'
                }}>
                  {i + 1}
                </div>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{res.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent)' }}>{res.count}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visits</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}
