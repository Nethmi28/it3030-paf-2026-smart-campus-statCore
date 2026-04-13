import { Building, CalendarCheck, FileText, Settings } from 'lucide-react';

export default function ManagerDashboard() {
  const stats = [
    { title: 'Total Facilities', value: '45', icon: <Building size={24} />, color: '#3b82f6' },
    { title: 'Active Bookings', value: '18', icon: <CalendarCheck size={24} />, color: '#10b981' },
    { title: 'Pending Reports', value: '5', icon: <FileText size={24} />, color: '#f59e0b' },
    { title: 'Maintenance', value: '3', icon: <Settings size={24} />, color: '#6366f1' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>Operations & Management</h2>
        <p style={{ color: '#64748b' }}>Oversee facility usage, resource allocation, and operational efficiency.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
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
             <button style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>Review Pending Bookings</button>
             <button style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>Generate Usage Report</button>
             <button style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '500', textAlign: 'left', cursor: 'pointer' }}>Manage Facilities</button>
           </div>
        </div>
      </div>
    </div>
  );
}
