import { Wrench, CheckCircle2, Clock, AlertTriangle, Loader2, TrendingUp, BarChart3, Zap, ShieldCheck, Timer, AlertCircle, XCircle, Info } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ticketService } from '../../../services/ticketService';
import { useNavigate } from 'react-router-dom';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (!user?.token) return;
      setLoading(true);
      try {
        const data = await ticketService.getMyTickets(user.token);
        setTickets(data);
      } catch (err) {
        console.error("Technician dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicianData();
  }, [user?.token]);

  // Advanced Analytics Calculations
  const analytics = useMemo(() => {
    const base = {
      resolutionRate: 0,
      high: 0, medium: 0, low: 0,
      topCategory: 'None',
      openCount: 0,
      sla: { excellent: 0, warning: 0, urgent: 0, breached: 0 }
    };

    if (tickets.length === 0) return base;

    const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');
    const openTickets = tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');

    // SLA Logic
    const slaStats = { excellent: 0, warning: 0, urgent: 0, breached: 0 };
    resolvedTickets.forEach(t => {
      if (!t.createdAt || !t.resolvedAt) return;

      const created = new Date(t.createdAt);
      const resolved = new Date(t.resolvedAt);
      const diffHours = (resolved - created) / (1000 * 60 * 60);

      if (diffHours < 24) slaStats.excellent++;
      else if (diffHours < 48) slaStats.warning++;
      else if (diffHours < 72) slaStats.urgent++;
      else slaStats.breached++;
    });

    // Priority distribution for pulse bar (out of 100%)
    const totalOpen = openTickets.length || 1;
    const highCount = openTickets.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length;
    const medCount = openTickets.filter(t => t.priority === 'MEDIUM').length;
    const lowCount = openTickets.filter(t => t.priority === 'LOW').length;

    // Category distribution
    const catMap = {};
    tickets.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + 1;
    });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';

    return {
      resolutionRate: Math.round((resolvedTickets.length / tickets.length) * 100),
      high: (highCount / totalOpen) * 100,
      medium: (medCount / totalOpen) * 100,
      low: (lowCount / totalOpen) * 100,
      topCategory: topCat,
      openCount: openTickets.length,
      sla: slaStats
    };
  }, [tickets]);

  if (loading) {
    return (
      <div style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
        <p style={{ color: '#64748b' }}>Loading Assignments...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Technician Command Center
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Efficiency and workload analysis of your assignments.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="category-highlight-tag">
            <Zap size={14} />
            Focus: {analytics.topCategory}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>

        {/* Efficiency Gauge Card */}
        <div className="analytic-card-premium" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="gauge-container">
            <div className="gauge-body" style={{ '--gauge-percent': `${analytics.resolutionRate}%`, '--gauge-color': '#10b981' }}>
              <div className="gauge-center">
                <span className="gauge-value">{analytics.resolutionRate}%</span>
                <span className="gauge-label">Resolved</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '0.875rem', marginBottom: '8px' }}>
              <TrendingUp size={16} />
              Performance Rate
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Lifetime Efficiency</h4>
            <p style={{ color: '#64748b', fontSize: '0.8125rem', lineHeight: '1.5' }}>
              You've cleared {tickets.length - analytics.openCount} of {tickets.length} total assignments.
            </p>
          </div>
        </div>

        {/* Workload Distribution Card */}
        <div className="analytic-card-premium">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Queue Intensity
              </div>
              <h4 className="queue-intensity-value">{analytics.openCount} Pending Jobs</h4>
            </div>
          </div>

          <div className="pulse-bar-container">
            <div className="pulse-segment pulse-segment-high" style={{ width: `${analytics.high}%` }} title="High Priority" />
            <div className="pulse-segment pulse-segment-medium" style={{ width: `${analytics.medium}%` }} title="Medium Priority" />
            <div className="pulse-segment pulse-segment-low" style={{ width: `${analytics.low}%` }} title="Low Priority" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Critical: {Math.round(analytics.high)}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Standard: {Math.round(analytics.low + analytics.medium)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA PERFORMANCE SECTION */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <ShieldCheck style={{ color: '#6366f1' }} size={24} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Operational SLA Performance</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
          {/* Left Side: SLA Counters + Job Queue Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* SLA Metrics Grid */}
            <div className="sla-stats-grid">
              <div className="sla-status-card sla-status-excellent">
                <div style={{ color: '#22c55e' }}><Timer size={20} /></div>
                <div className="sla-status-value">{analytics.sla.excellent}</div>
                <div className="sla-status-label">Excellent</div>
              </div>
              <div className="sla-status-card sla-status-warning">
                <div style={{ color: '#f59e0b' }}><AlertCircle size={20} /></div>
                <div className="sla-status-value">{analytics.sla.warning}</div>
                <div className="sla-status-label">Warning</div>
              </div>
              <div className="sla-status-card sla-status-urgent">
                <div style={{ color: '#f97316' }}><AlertTriangle size={20} /></div>
                <div className="sla-status-value">{analytics.sla.urgent}</div>
                <div className="sla-status-label">Urgent</div>
              </div>
              <div className="sla-status-card sla-status-breached">
                <div style={{ color: '#ef4444' }}><XCircle size={20} /></div>
                <div className="sla-status-value">{analytics.sla.breached}</div>
                <div className="sla-status-label">Breached</div>
              </div>
            </div>

            {/* NEW: Job Assignment Queue Header Header Card (Moved here to match image) */}
            <div className="job-queue-header-card">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>Job Assignment Queue</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>Prioritized list of your active service requests</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/tickets')}
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                Review All History
              </button>
            </div>
          </div>

          {/* Right Side: SLA Info Card */}
          <div className="sla-info-hub">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} />
                <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>SLA Regulation</span>
              </div>
              <div className="sla-target-badge">72H Target</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="sla-row sla-row-excellent">
                <span className="sla-row-label">Excellent Resolution</span>
                <span className="sla-row-value">&lt; 24 Hours</span>
              </div>
              <div className="sla-row sla-row-warning">
                <span className="sla-row-label">Warning Window</span>
                <span className="sla-row-value">24 - 48 Hours</span>
              </div>
              <div className="sla-row sla-row-urgent">
                <span className="sla-row-label">Urgent Priority</span>
                <span className="sla-row-value">48 - 72 Hours</span>
              </div>
              <div className="sla-row sla-row-breached">
                <span className="sla-row-label">Breached Status</span>
                <span className="sla-row-value">&gt; 72 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '0' }}>
          {tickets.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={32} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p>No tickets assigned to your queue yet.</p>
            </div>
          ) : tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').map((t, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/dashboard/tickets')}
              style={{ padding: '24px 32px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fbfcfd'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '800', color: '#3b82f6', background: '#eff6ff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem' }}>
                    TCK-{t.id}
                  </span>
                  <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{t.category}</span>
                </div>
                <div style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: '1.5', maxWidth: '600px' }}>
                  {t.description.length > 80 ? t.description.substring(0, 80) + '...' : t.description}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#94a3b8' }}>
                    <Clock size={14} />
                    Assigned to you
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>•</div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>From: {t.reportedByName}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '8px', display: 'inline-block',
                    background: t.priority === 'HIGH' ? '#fee2e2' : t.priority === 'MEDIUM' ? '#fef3c7' : '#f1f5f9',
                    color: t.priority === 'HIGH' ? '#ef4444' : t.priority === 'MEDIUM' ? '#d97706' : '#64748b'
                  }}>
                    {t.priority} Priority
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: t.status === 'OPEN' ? '#0ea5e9' : '#10b981' }}>
                    {t.status === 'OPEN' ? 'Newly Assigned' : 'Work in Progress'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

