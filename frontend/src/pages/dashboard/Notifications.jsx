export default function Notifications() {
  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>Notifications</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>View updates, alerts, and system messages</div>
      </div>
      
      <div style={{ 
        background: 'var(--bg-card)', padding: '48px', borderRadius: '12px', 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Notifications Component</p>
          <p style={{ fontSize: '0.875rem' }}>List of notifications will appear here.</p>
        </div>
      </div>
    </div>
  );
}
