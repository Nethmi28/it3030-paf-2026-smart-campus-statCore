import { useState } from 'react';

export default function Tickets() {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>My Tickets</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track and manage your service requests</div>
        </div>
        
        {/* Sub-component Navigation (Tabs) */}
        <div style={{ display: 'flex', background: 'var(--bg-icon)', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setActiveTab('view')}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: '500', fontSize: '0.875rem',
              background: activeTab === 'view' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'view' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'view' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            View Tickets
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: '500', fontSize: '0.875rem',
              background: activeTab === 'create' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'create' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'create' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Create Ticket
          </button>
        </div>
      </div>
      
      <div style={{ 
        background: 'var(--bg-card)', padding: '48px', borderRadius: '12px', 
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minHeight: '300px'
      }}>
        {activeTab === 'view' ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>View Tickets Sub-component</p>
            <p style={{ fontSize: '0.875rem' }}>Table of your submitted tickets will appear here.</p>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#3b82f6' }}>Create Ticket Sub-component</p>
            <p style={{ fontSize: '0.875rem' }}>Form to submit a new service ticket will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
