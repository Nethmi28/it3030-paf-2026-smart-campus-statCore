import { 
  BarChart3, PieChart, Users, Building2, 
  CheckCircle2, AlertTriangle, TrendingUp, Laptop, 
  MapPin, Clock
} from 'lucide-react';

export default function ResourceAnalysis({ resources }) {
  // 1. Core Stat Calculations
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.status === 'Available').length;
  const maintenanceResources = resources.filter(r => r.status === 'Maintenance').length;
  
  // 2. Faculty Distribution
  const facultyCounts = resources.reduce((acc, r) => {
    acc[r.faculty] = (acc[r.faculty] || 0) + 1;
    return acc;
  }, {});
  
  const sortedFaculties = Object.entries(facultyCounts)
    .sort(([, a], [, b]) => b - a);
  const maxFacultyCount = Math.max(...Object.values(facultyCounts), 1);

  // 3. Type Distribution
  const typeCounts = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  // 4. Capacity Insights
  const capacityGroups = {
    'Small (1-20)': resources.filter(r => r.capacity <= 20).length,
    'Medium (21-100)': resources.filter(r => r.capacity > 20 && r.capacity <= 100).length,
    'Large (100+)': resources.filter(r => r.capacity > 100).length,
  };

  const statCards = [
    { title: 'Total Facilities', value: totalResources, icon: <Building2 />, color: '#3b82f6' },
    { title: 'Operational Now', value: availableResources, icon: <CheckCircle2 />, color: '#10b981' },
    { title: 'Under Maintenance', value: maintenanceResources, icon: <AlertTriangle />, color: '#f59e0b' },
    { title: 'Est. Daily Users', value: resources.reduce((sum, r) => sum + r.capacity, 0), icon: <Users />, color: '#6366f1' },
  ];

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
                  strokeDasharray={`${(availableResources / totalResources) * 100} 100`}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{Math.round((availableResources / totalResources) * 100)}%</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>READY</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-alt)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  Available
                </div>
                <span style={{ fontWeight: '700' }}>{availableResources}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-alt)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  In Service
                </div>
                <span style={{ fontWeight: '700' }}>{maintenanceResources}</span>
              </div>
            </div>
          </div>

          {/* Capacity Breakdown */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px' }}>Capacity Grouping</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(capacityGroups).map(([name, count]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', minWidth: '100px' }}>{name}</div>
                   <div style={{ flex: 1, height: '6px', background: 'var(--bg-alt)', borderRadius: '3px' }}>
                     <div style={{ 
                       height: '100%', 
                       width: `${(count / totalResources) * 100}%`, 
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
