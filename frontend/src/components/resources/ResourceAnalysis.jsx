import { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Building2, 
  CheckCircle2, AlertTriangle, TrendingUp,
  Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8089';

export default function ResourceAnalysis() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [user?.token]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Accept': 'application/json' };
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(`${API_BASE}/api/resources/stats`, { headers });
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Crunching campus data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', background: 'var(--bg-card)', borderRadius: '24px', border: '2px dashed #ef4444' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Analytics Error</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button 
          onClick={fetchStats}
          style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Facilities', value: stats.totalResources, icon: <Building2 />, color: '#3b82f6' },
    { title: 'Operational Now', value: stats.availableCount, icon: <CheckCircle2 />, color: '#10b981' },
    { title: 'Under Maintenance', value: stats.maintenanceCount, icon: <AlertTriangle />, color: '#f59e0b' },
    { title: 'Est. Daily Users', value: stats.totalCapacity, icon: <Users />, color: '#6366f1' },
  ];

  const sortedFaculties = Object.entries(stats.facultyDistribution)
    .sort(([, a], [, b]) => b - a);
  const maxFacultyCount = Math.max(...Object.values(stats.facultyDistribution), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card premium-shadow" style={{ 
            padding: '24px', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: `${stat.color}15`, 
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>{stat.title}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        
        {/* Faculty Distribution Chart */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={20} style={{ color: 'var(--accent)' }} />
              Resource Density by Faculty
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedFaculties.map(([faculty, count]) => (
              <div key={faculty} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{faculty}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{count} Spaces</span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'var(--bg-alt)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(count / maxFacultyCount) * 100}%`, 
                    background: 'linear-gradient(90deg, var(--accent) 0%, #3b82f6 100%)',
                    borderRadius: '10px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Type Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Status Breakdown Circle */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', border: '1px solid var(--border-color)', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} />
              Availability Mix
            </h3>
            
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 24px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-alt)" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r="16" fill="none" 
                  stroke="#10b981" strokeWidth="3" 
                  strokeDasharray={`${(stats.availableCount / stats.totalResources) * 100} 100`}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{Math.round((stats.availableCount / stats.totalResources) * 100)}%</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>READY</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-alt)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  Available
                </div>
                <span style={{ fontWeight: '700' }}>{stats.availableCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-alt)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  In Service
                </div>
                <span style={{ fontWeight: '700' }}>{stats.maintenanceCount}</span>
              </div>
            </div>
          </div>

          {/* Capacity Breakdown */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Capacity Grouping</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(stats.capacityGroups).map(([name, count]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', minWidth: '100px' }}>{name}</div>
                   <div style={{ flex: 1, height: '6px', background: 'var(--bg-alt)', borderRadius: '3px' }}>
                     <div style={{ 
                       height: '100%', 
                       width: `${(count / stats.totalResources) * 100}%`, 
                       background: 'var(--accent)',
                       borderRadius: '3px'
                     }}></div>
                   </div>
                   <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
