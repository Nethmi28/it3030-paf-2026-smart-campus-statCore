import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, CalendarClock, ShieldAlert, BellRing, 
  Loader2, ArrowRight, Activity, Layers, 
  ClipboardList, Wrench, PieChart
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { bookingService } from '../../../services/bookingService';
import { ticketService } from '../../../services/ticketService';
import ResourceAnalysis from '../../../components/resources/ResourceAnalysis';
import BookingAnalysis from '../../../components/resources/BookingAnalysis';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';
const weeklyUsageSeries = [
  { day: 'Mon', value: 40 },
  { day: 'Tue', value: 60 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 80 },
  { day: 'Fri', value: 70 },
  { day: 'Sat', value: 95 },
  { day: 'Sun', value: 50 },
];

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
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


  const handleGenerateOperationsReport = () => {
    const reportWindow = window.open('', '_blank', 'width=1180,height=900');

    if (!reportWindow) {
      showToast({
        variant: 'error',
        title: 'Popup Blocked',
        message: 'Please allow popups for this site so the operations report can open.',
      });
      return;
    }

    const usageRows = weeklyUsageSeries.map((entry) => `
      <tr>
        <td>${escapeHtml(entry.day)}</td>
        <td>${escapeHtml(entry.value)}%</td>
      </tr>
    `).join('');

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Operations View Report</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              background: #f8fafc;
            }
            .page {
              max-width: 1100px;
              margin: 0 auto;
              background: #ffffff;
              min-height: 100vh;
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: #ffffff;
              padding: 28px 40px;
              display: flex;
              justify-content: space-between;
              gap: 24px;
              align-items: flex-start;
            }
            .brand-title {
              margin: 0 0 6px;
              font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif;
              font-size: 22px;
              letter-spacing: 0.01em;
              font-weight: 800;
            }
            .brand-copy {
              font-size: 13px;
              opacity: 0.9;
            }
            .report-title {
              text-align: right;
            }
            .report-title h1 {
              margin: 0 0 6px;
              font-size: 24px;
              font-weight: 800;
            }
            .report-title p {
              margin: 0;
              font-size: 13px;
              opacity: 0.9;
            }
            .content {
              padding: 32px 40px 40px;
            }
            .section {
              margin-bottom: 30px;
            }
            h2 {
              font-size: 22px;
              margin: 0 0 18px;
              color: #0f172a;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 220px 1fr;
              gap: 10px 18px;
              font-size: 14px;
            }
            .info-label {
              color: #475569;
              font-weight: 700;
            }
            .info-value {
              color: #0f172a;
              font-weight: 600;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px;
            }
            .summary-card {
              border: 1px solid #dbeafe;
              border-radius: 16px;
              padding: 16px 18px;
              background: #eff6ff;
            }
            .summary-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              color: #475569;
              margin-bottom: 8px;
              font-weight: 700;
            }
            .summary-value {
              font-size: 26px;
              font-weight: 800;
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            thead th {
              text-align: left;
              padding: 12px 10px;
              background: #e2f6f0;
              color: #0f766e;
              border-bottom: 1px solid #bfdbd3;
              font-size: 12px;
              letter-spacing: 0.03em;
              text-transform: uppercase;
            }
            tbody td {
              padding: 12px 10px;
              border-bottom: 1px solid #e2e8f0;
            }
            tbody tr:nth-child(even) {
              background: #f8fafc;
            }
            .footer-note {
              margin-top: 16px;
              font-size: 12px;
              color: #64748b;
            }
            @media print {
              body {
                background: #ffffff;
              }
              .page {
                max-width: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div>
                <div class="brand-title">FACILIO HUB</div>
                <div class="brand-copy">Campus operations and facility oversight</div>
              </div>
              <div class="report-title">
                <h1>OPERATIONS VIEW REPORT</h1>
                <p>Manager dashboard overview</p>
              </div>
            </div>
            <div class="content">
              <div class="section">
                <h2>Report Information</h2>
                <div class="info-grid">
                  <div class="info-label">Generated On</div>
                  <div class="info-value">${escapeHtml(new Date().toLocaleString())}</div>
                  <div class="info-label">Generated By</div>
                  <div class="info-value">${escapeHtml(user?.email || user?.name || 'Manager')}</div>
                  <div class="info-label">Report Scope</div>
                  <div class="info-value">Operations dashboard summary and weekly facility usage snapshot</div>
                </div>
              </div>

              <div class="section">
                <h2>Operations Summary</h2>
                <div class="summary-grid">
                  <div class="summary-card">
                    <div class="summary-label">Total Facilities</div>
                    <div class="summary-value">${escapeHtml(stats.facilities)}</div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">Active Bookings</div>
                    <div class="summary-value">${escapeHtml(stats.activeBookings)}</div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">Pending Reports</div>
                    <div class="summary-value">${escapeHtml(stats.reports)}</div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">Maintenance</div>
                    <div class="summary-value">${escapeHtml(stats.repairs)}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>Weekly Facility Usage</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Usage Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${usageRows}
                  </tbody>
                </table>
                <div class="footer-note">
                  The weekly usage snapshot reflects the current dashboard visualization at the time of report generation.
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
    reportWindow.focus();

    setTimeout(() => {
      reportWindow.print();
    }, 300);

    showToast({
      variant: 'success',
      title: 'Report Ready',
      message: 'The operations report opened in a new window. Use the print dialog to save it as a PDF.',
    });
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

      <div style={{
        ...surfaceStyle,
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#dbeafe',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Operations Reports &amp; Analytics
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Current scope: facilities, booking load, maintenance status, and weekly usage trends
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateOperationsReport}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.95rem',
            boxShadow: '0 14px 28px rgba(59, 130, 246, 0.24)'
          }}
        >
          <Download size={18} />
          Generate Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={surfaceStyle}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Weekly facility usage</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingTop: '40px' }}>
            {weeklyUsageSeries.map((entry) => (
              <div key={entry.day} style={{ flex: 1, background: '#3b82f6', height: `${entry.value}%`, borderRadius: '6px 6px 0 0', opacity: 0.8, transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {weeklyUsageSeries.map((entry) => (
              <span key={entry.day}>{entry.day}</span>
            ))}
          </div>
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
