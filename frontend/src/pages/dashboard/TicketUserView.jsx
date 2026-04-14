import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/ticketService';
import CreateTicketForm from '../../components/tickets/CreateTicketForm';
import TicketDetailsModal from '../../components/tickets/TicketDetailsModal';
import TicketManagerView from './TicketManagerView';
import TicketTechnicianView from './TicketTechnicianView';

export default function TicketUserView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('view');
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getMyTickets();
      setMyTickets(data || []);
    } catch (e) {
      console.error("Failed to fetch user tickets");
    }
  };

  useEffect(() => {
    if (activeTab === 'view' && user) {
        fetchTickets();
    }
  }, [activeTab, user]);

  if (user?.role === 'ROLE_MANAGER') {
    return <TicketManagerView />;
  }

  if (user?.role === 'ROLE_TECHNICIAN') {
    return <TicketTechnicianView />;
  }



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
        background: 'var(--bg-card)', padding: activeTab === 'create' ? '0' : '24px', borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minHeight: '300px'
      }}>
        {activeTab === 'view' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myTickets.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No tickets found</p>
                    <p style={{ fontSize: '0.875rem' }}>You haven't submitted any tickets yet.</p>
                </div>
            ) : (
                myTickets.map(ticket => (
                    <div 
                        key={ticket.id} 
                        onClick={() => setSelectedTicket(ticket)}
                        style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{ticket.category} - {ticket.locationText}</div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Submitted on {new Date(ticket.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem' }}>{ticket.status}</span>
                            <span style={{ padding: '4px 8px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.75rem' }}>{ticket.priority}</span>
                        </div>
                    </div>
                ))
            )}
          </div>
        ) : (
          <CreateTicketForm onSuccess={() => {
              setActiveTab('view');
              fetchTickets();
          }} />
        )}
      </div>
      
      {/* Modal Overlay for details */}
      {selectedTicket && (
          <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  );
}
