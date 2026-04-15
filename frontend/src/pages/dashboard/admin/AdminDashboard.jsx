import { Users, Server, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const stats = [
    { title: 'Total Users', value: '1,248', icon: <Users size={24} className="text-blue-500" />, color: '#3b82f6' },
    { title: 'Server Health', value: '99.9%', icon: <Server size={24} className="text-emerald-500" />, color: '#10b981' },
    { title: 'Active Sessions', value: '342', icon: <Activity size={24} className="text-violet-500" />, color: '#8b5cf6' },
    { title: 'System Alerts', value: '2', icon: <AlertCircle size={24} className="text-rose-500" />, color: '#f43f5e' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>System Administration</h2>
        <p style={{ color: '#64748b' }}>Manage users, roles, and monitor system health.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px' }}>
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

      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', marginBottom: '24px' }}>Recent Admin Activity</h3>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '500', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '500', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Target</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '500', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#334155' }}>Role Updated</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#334155' }}>John Doe (Student -&gt; Technician)</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#64748b' }}>Just now</td>
              </tr>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#334155' }}>System Backup</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#334155' }}>Database Schema</td>
                <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#64748b' }}>2 hours ago</td>
              </tr>
              <tr>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: '#334155' }}>User Created</td>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: '#334155' }}>Sarah Smith (Manager)</td>
                <td style={{ padding: '16px', fontSize: '0.875rem', color: '#64748b' }}>5 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
