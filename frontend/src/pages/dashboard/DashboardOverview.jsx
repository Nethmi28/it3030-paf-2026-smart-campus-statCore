import { Printer, Calendar as CalendarIcon, Wrench } from 'lucide-react';

export default function DashboardOverview() {
  const recentBookings = [
    { id: 1, title: 'Computer Science Lab A', time: '2026-04-10 · 09:00-11:00', status: 'APPROVED' },
    { id: 2, title: 'Main Auditorium', time: '2026-04-12 · 14:00-17:00', status: 'PENDING' },
    { id: 3, title: 'Conference Room 101', time: '2026-04-08 · 10:00-11:30', status: 'REJECTED' },
    { id: 4, title: 'Computer Science Lab A', time: '2026-04-20 · 14:00-16:00', status: 'CANCELLED' },
  ];

  const recentTickets = [
    { id: 1, title: 'Projector not working in Lab A', desc: 'Equipment · High', status: 'IN PROGRESS' },
    { id: 2, title: 'AC malfunction in Seminar Hall 2', desc: 'HVAC · Medium', status: 'OPEN' },
    { id: 3, title: 'Water leak in Physics Lab B', desc: 'Plumbing · High', status: 'IN PROGRESS' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': return { bg: '#dcfce7', text: '#22c55e' };
      case 'PENDING': return { bg: '#fef08a', text: '#eab308' };
      case 'REJECTED': return { bg: '#fee2e2', text: '#ef4444' };
      case 'CANCELLED': return { bg: '#f3f4f6', text: '#9ca3af' };
      case 'IN PROGRESS': return { bg: '#ffedd5', text: '#f97316' };
      case 'OPEN': return { bg: '#e0f2fe', text: '#38bdf8' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>Dashboard</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overview of your campus operations</div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Card 1 */}
        <div style={{ 
          background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', 
          flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>Available Resources</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>7</div>
          </div>
          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', color: '#3b82f6' }}>
            <Printer size={28} />
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ 
          background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', 
          flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>My Bookings</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>4</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', color: '#22c55e' }}>
            <CalendarIcon size={28} />
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ 
          background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', 
          flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>My Tickets</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>3</div>
          </div>
          <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', color: '#f59e0b' }}>
            <Wrench size={28} />
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Recent Bookings */}
        <div style={{ 
          background: 'var(--bg-card)', borderRadius: '12px', padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Recent Bookings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentBookings.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '16px', background: 'var(--bg-icon)', borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.time}</div>
                </div>
                <div style={{ 
                  background: getStatusStyle(item.status).bg, 
                  color: getStatusStyle(item.status).text,
                  padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                }}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div style={{ 
          background: 'var(--bg-card)', borderRadius: '12px', padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Recent Tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTickets.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '16px', background: 'var(--bg-icon)', borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.desc}</div>
                </div>
                <div style={{ 
                  background: getStatusStyle(item.status).bg, 
                  color: getStatusStyle(item.status).text,
                  padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                }}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
