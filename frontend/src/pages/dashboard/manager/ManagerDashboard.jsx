import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, CalendarClock, ShieldAlert, BellRing,
  Loader2, ArrowRight, Activity, Layers,
  ClipboardList, Wrench, PieChart
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { bookingService } from '../../../services/bookingService';
import { ticketService } from '../../../services/ticketService';
import ResourceAnalysis from '../../../components/resources/ResourceAnalysis';
import BookingAnalysis from '../../../components/resources/BookingAnalysis';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalFacilities: 0,
    pendingBookings: 0,
    activeTickets: 0,
    unreadAlerts: 0
  });
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManagerStats = async () => {
      if (!user?.token) return;
      setLoading(true);

      try {
        const [resourcesResp, bookings, tickets] = await Promise.all([
          fetch(`${API_BASE}/api/resources`, { headers: { Authorization: `Bearer ${user.token}` } }),
          bookingService.getAllBookings(user.token),
          ticketService.getMyTickets(user.token)
        ]);

        const resources = await resourcesResp.json();
        const pending = bookings.filter(b => b.status === 'PENDING').length;
        const active = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

        setStats({
          totalFacilities: resources.length,
          pendingBookings: pending,
          activeTickets: active,
          unreadAlerts: 3 // Placeholder for demo
        });

        setAllBookings(bookings);

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
        <p style={{ color: 'var(--text-muted)' }}>Initialising Management Console...</p>
      </div>
    );
  }

  const primaryCards = [
    {
      title: 'Facilities Inventory',
      value: stats.totalFacilities,
      label: 'Managed Assets',
      icon: <Layers size={22} />,
      color: '#3b82f6',
      path: '/dashboard/manager/manage-resources'
    },
    {
      title: 'Pending Reservations',
      value: stats.pendingBookings,
      label: 'Awaiting Review',
      icon: <CalendarClock size={22} />,
      color: '#10b981',
      path: '/dashboard/bookings'
    },
    {
      title: 'Active Operations',
      value: stats.activeTickets,
      label: 'Incidents & Repairs',
      icon: <Wrench size={22} />,
      color: '#f59e0b',
      path: '/dashboard/tickets'
    },
    {
      title: 'System Alerts',
      value: stats.unreadAlerts,
      label: 'New Notifications',
      icon: <BellRing size={22} />,
      color: '#6366f1',
      path: '/dashboard/notifications'
    },
  ];

  const surfaceStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
    overflow: 'hidden'
  };


  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '56px' }}>

      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
            <Activity size={16} />
            Operations Overview
          </div>
          <h2 style={{ fontSize: '2.75rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Manager Console</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', marginTop: '8px' }}>Performance metrics and administrative control centre.</p>
        </div>
      </div>

      {/* Main Area Cards - Restructured for Sidebar Coverage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {primaryCards.map((stat) => (
          <div
            key={stat.title}
            onClick={() => navigate(stat.path)}
            style={{
              ...surfaceStyle,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'linear-gradient(145deg, var(--bg-card) 0%, var(--bg-alt) 100%)'
            }}
            className="hover-lift hover-glow"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ background: `${stat.color}15`, padding: '12px', borderRadius: '14px', color: stat.color }}>
                {stat.icon}
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {stat.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '2.25rem', fontWeight: '800' }}>{stat.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</div>
              </div>
            </div>

            {/* Subtle progress bar or accent */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: `${stat.color}30` }}>
              <div style={{ height: '100%', width: '40%', background: stat.color, borderRadius: '0 2px 2px 0' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Analysis Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--accent)', borderRadius: '2px' }}></div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Infrastructure Insights</h3>
        </div>
        <div className="glass-card" style={{ padding: '4px', borderRadius: '32px' }}>
          <ResourceAnalysis />
        </div>
      </div>

      {/* Utilization Analytics Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
          <div style={{ width: '4px', height: '24px', background: '#6366f1', borderRadius: '2px' }}></div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Utilization Analytics</h3>
        </div>
        <BookingAnalysis bookings={allBookings} />
      </div>


      <style>{`
        .hover-lift:hover {
          transform: translateY(-8px);
        }
        .hover-glow:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          border-color: var(--accent) !important;
        }
        .btn-primary {
          background: var(--accent);
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}