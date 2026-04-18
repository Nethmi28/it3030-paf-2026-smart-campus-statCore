import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, CalendarCheck, FileText, Loader2, Settings } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { bookingService } from '../../../services/bookingService';
import { ticketService } from '../../../services/ticketService';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ facilities: 0, activeBookings: 0, reports: 0, repairs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerStats = async () => {
      if (!user?.token) return;
      setLoading(true);

      try {
        const [resourcesResponse, bookings, tickets] = await Promise.all([
          fetch(`${API_BASE}/api/resources`, { headers: { Authorization: `Bearer ${user.token}` } }),
          bookingService.getAllBookings(user.token),
          ticketService.getMyTickets(user.token)
        ]);

        const resources = await resourcesResponse.json();
        const openReports = tickets.filter((ticket) => ticket.status === 'OPEN').length;
        const repairsInProgress = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;

        setStats({
          facilities: resources.length,
          activeBookings: bookings.filter((booking) => booking.status === 'APPROVED' || booking.status === 'PENDING').length,
          reports: openReports,
          repairs: repairsInProgress
        });
      } catch (err) {
        console.error('Manager dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerStats();
  }, [user?.token]);

  if (loading) {
    return (
      <div style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Manager Console...</p>
      </div>
    );
  }

  const statsDisplay = [
    { title: 'Total Facilities', value: stats.facilities, icon: <Building size={24} />, color: '#3b82f6' },
    { title: 'Active Bookings', value: stats.activeBookings, icon: <CalendarCheck size={24} />, color: '#10b981' },
    { title: 'Pending Reports', value: stats.reports, icon: <FileText size={24} />, color: '#f59e0b' },
    { title: 'Maintenance', value: stats.repairs, icon: <Settings size={24} />, color: '#6366f1' },
  ];

  const surfaceStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  };

  const quickActionStyle = {
    padding: '12px 16px',
    background: 'var(--bg-alt)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer'
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Operations &amp; Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Oversee facility usage, resource allocation, and operational efficiency.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statsDisplay.map((stat) => (
          <div key={stat.title} style={{ ...surfaceStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: `${stat.color}18`, padding: '16px', borderRadius: '12px', color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>{stat.title}</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={surfaceStyle}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Weekly facility usage</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingTop: '40px' }}>
            {[40, 60, 55, 80, 70, 95, 50].map((height, index) => (
              <div key={index} style={{ flex: 1, background: '#3b82f6', height: `${height}%`, borderRadius: '6px 6px 0 0', opacity: 0.8, transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div style={surfaceStyle}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => navigate('/dashboard/bookings')} style={quickActionStyle}>
              Review Pending Bookings
            </button>
            <button style={quickActionStyle}>Generate Usage Report</button>
            <button onClick={() => navigate('/dashboard/resources')} style={quickActionStyle}>
              Manage Facilities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
