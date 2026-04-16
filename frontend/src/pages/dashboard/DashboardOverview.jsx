import { Printer, Calendar as CalendarIcon, Wrench, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { ticketService } from '../../services/ticketService';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resources: 0, bookings: 0, tickets: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.token) return;
      setLoading(true);
      try {
        const [resourcesRes, bookings, tickets] = await Promise.all([
          fetch(`${API_BASE}/api/resources`, { headers: { 'Authorization': `Bearer ${user.token}` } }),
          bookingService.getMyBookings(user.token),
          ticketService.getMyTickets(user.token)
        ]);

        const resources = await resourcesRes.json();
        setStats({
          resources: resources.length,
          bookings: bookings.length,
          tickets: tickets.length
        });
        setRecentBookings(bookings.slice(0, 4));
        setRecentTickets(tickets.slice(0, 3));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.token]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED': 
      case 'ACCEPTED': return { bg: '#dcfce7', text: '#22c55e' };
      case 'PENDING': return { bg: '#fef08a', text: '#eab308' };
      case 'REJECTED': return { bg: '#fee2e2', text: '#ef4444' };
      case 'CANCELLED': return { bg: '#f3f4f6', text: '#9ca3af' };
      case 'IN_PROGRESS':
      case 'IN PROGRESS': return { bg: '#ffedd5', text: '#f97316' };
      case 'OPEN': return { bg: '#e0f2fe', text: '#38bdf8' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  if (loading) {
     return (
       <div style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
         <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
         <p style={{ color: 'var(--text-muted)' }}>Loading Activity...</p>
       </div>
     );
  }

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
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.resources}</div>
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
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.bookings}</div>
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
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.tickets}</div>
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
                  <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '4px' }}>{item.resourceName}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.bookingDate} · {item.startTime}-{item.endTime}</div>
                </div>
                <div style={{ 
                  background: getStatusStyle(item.status).bg, 
                  color: getStatusStyle(item.status).text,
                  padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
                }}>
                  {item.status === 'APPROVED' ? 'ACCEPTED' : item.status}
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
                  <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '4px' }}>{item.category}: {item.description.substring(0, 30)}...</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ID: #{item.id} · {item.priority} Priority</div>
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
