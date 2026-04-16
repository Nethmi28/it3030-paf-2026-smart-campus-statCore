import { Wrench, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ticketService } from '../../../services/ticketService';
import { useNavigate } from 'react-router-dom';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, highPriority: 0, resolved: 0 });

  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (!user?.token) return;
      setLoading(true);
      try {
        const data = await ticketService.getMyTickets(user.token);
        setTickets(data);
        
        setStats({
          open: data.filter(t => t.status === 'OPEN').length,
          inProgress: data.filter(t => t.status === 'IN_PROGRESS').length,
          highPriority: data.filter(t => t.priority === 'HIGH').length,
          resolved: data.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length
        });
      } catch (err) {
        console.error("Technician dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicianData();
  }, [user?.token]);

  if (loading) {
    return (
      <div style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: '#64748b' }}>Loading Assignments...</p>
      </div>
    );
  }

  const statsDisplay = [
    { title: 'My Open Tickets', value: stats.open, icon: <Wrench size={24} />, color: '#3b82f6' },
    { title: 'In Progress', value: stats.inProgress, icon: <Clock size={24} />, color: '#f59e0b' },
    { title: 'High Priority', value: stats.highPriority, icon: <AlertTriangle size={24} />, color: '#ef4444' },
    { title: 'Resolved Total', value: stats.resolved, icon: <CheckCircle2 size={24} />, color: '#10b981' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Technician Workspace</h2>
        <p style={{ color: '#64748b' }}>Manage your assigned tickets and resolve facility issues.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {statsDisplay.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>{stat.title}</div>
              <div style={{ background: `${stat.color}15`, padding: '8px', borderRadius: '8px', color: stat.color }}>{stat.icon}</div>
            </div>
            <div style={{ color: '#0f172a', fontSize: '2rem', fontWeight: 'bold' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>Current Ticket Queue</h3>
          <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}>View All Tickets</button>
        </div>
        <div style={{ padding: '0' }}>
          {tickets.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No tickets assigned to you yet.</div>
          ) : tickets.map((t, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate('/dashboard/tickets')}
              style={{ padding: '20px 24px', borderBottom: idx !== tickets.length - 1 ? '1px solid #e2e8f0' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} 
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>TCK-{t.id}</span>
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>{t.category}: {t.description.substring(0, 50)}...</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '16px' }}>
                   <span>Reported by {t.reportedByName}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', 
                  background: t.priority === 'HIGH' ? '#fee2e2' : t.priority === 'MEDIUM' ? '#fef3c7' : '#f1f5f9',
                  color: t.priority === 'HIGH' ? '#ef4444' : t.priority === 'MEDIUM' ? '#d97706' : '#64748b' }}>
                  {t.priority}
                </span>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', 
                  background: t.status === 'OPEN' ? '#e0f2fe' : '#dcfce7',
                  color: t.status === 'OPEN' ? '#0ea5e9' : '#22c55e' }}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
