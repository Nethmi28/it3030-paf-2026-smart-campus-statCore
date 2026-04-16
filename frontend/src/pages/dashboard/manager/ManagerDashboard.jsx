import { Building, CalendarCheck, FileText, Settings, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { bookingService } from '../../../services/bookingService';
import { ticketService } from '../../../services/ticketService';
import { useNavigate } from 'react-router-dom';

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
        const [res, bk, tk] = await Promise.all([
          fetch(`${API_BASE}/api/resources`, { headers: { 'Authorization': `Bearer ${user.token}` } }),
          bookingService.getAllBookings(user.token),
          ticketService.getMyTickets(user.token)
        ]);

        const resources = await res.json();
        const pendingBk = bk.filter(b => b.status === 'PENDING').length;
        const openTk = tk.filter(t => t.status === 'OPEN').length;
        const inProgTk = tk.filter(t => t.status === 'IN_PROGRESS').length;

        setStats({
          facilities: resources.length,
          activeBookings: bk.filter(b => b.status === 'APPROVED' || b.status === 'PENDING').length,
          reports: openTk,
          repairs: inProgTk
        });
      } catch (err) {
        console.error("Manager dashboard stats error:", err);
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
        <p style={{ color: '#64748b' }}>Loading Manager Console...</p>
      </div>
    );
  }

  const statsDisplay = [
    { title: 'Total Facilities', value: stats.facilities, icon: <Building size={24} />, color: '#3b82f6' },
    { title: 'Active Bookings', value: stats.activeBookings, icon: <CalendarCheck size={24} />, color: '#10b981' },
    { title: 'Pending Reports', value: stats.reports, icon: <FileText size={24} />, color: '#f59e0b' },
    { title: 'Maintenance', value: stats.repairs, icon: <Settings size={24} />, color: '#6366f1' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Operations & Management</h2>
        <p style={{ color: '#64748b' }}>Oversee facility usage, resource allocation, and operational efficiency.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statsDisplay.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: `${stat.color}15`, padding: '16px', borderRadius: '12px', color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>{stat.title}</div>
              <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Weekly facility usage</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingTop: '40px' }}>
            {/* Simple CSS Bar Chart Placeholder */}
            {[40, 60, 55, 80, 70, 95, 50].map((h, i) => (
              <div key={i} style={{ flex: 1, background: '#3b82f6', height: `${h}%`, borderRadius: '6px 6px 0 0', opacity: 0.8, transition: 'all 0.3s' }}></div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Quick Actions</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <button 
               onClick={() => navigate('/dashboard/bookings')}
               style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}
             >
               Review Pending Bookings
             </button>
             <button style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>Generate Usage Report</button>
             <button 
               onClick={() => navigate('/dashboard/resources')}
               style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}
             >
               Manage Facilities
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
