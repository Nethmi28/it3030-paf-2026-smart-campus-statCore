import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/ticketService';
import CreateTicketForm from '../../components/tickets/CreateTicketForm';
import TicketDetailsCard from '../../components/tickets/TicketDetailsCard';

export default function TicketUserView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('view');
  const [myTickets, setMyTickets] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewMode, setViewMode] = useState('my'); // 'my', 'assigned', 'all'
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });

  const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';
  const isTechnician = user?.role === 'ROLE_TECHNICIAN';

  const fetchMyTickets = async () => {
    try {
      const data = await ticketService.getMyTickets();
      setMyTickets(data || []);
    } catch (e) {
      console.error("Failed to fetch user tickets", e);
    }
  };

  const fetchAssignedTickets = async () => {
    try {
      const data = await ticketService.getAssignedToMe();
      setAssignedTickets(data || []);
    } catch (e) {
      console.error("Failed to fetch assigned tickets", e);
    }
  };

  const fetchAllTickets = async () => {
    try {
      const data = await ticketService.getAllTickets(filters.status, filters.priority, filters.category);
      setAllTickets(data || []);
    } catch (e) {
      console.error("Failed to fetch all tickets", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      if (viewMode === 'my') {
        fetchMyTickets();
      } else if (viewMode === 'assigned' && isTechnician) {
        fetchAssignedTickets();
      } else if (viewMode === 'all' && isAdminOrManager) {
        fetchAllTickets();
      }
    }
  }, [activeTab, viewMode, filters]);

  const getDisplayTickets = () => {
    if (viewMode === 'my') return myTickets;
    if (viewMode === 'assigned') return assignedTickets;
    return allTickets;
  };

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': '#e0f2fe',
      'IN_PROGRESS': '#fef3c7',
      'RESOLVED': '#dcfce7',
      'CLOSED': '#f3f4f6',
      'REJECTED': '#fee2e2'
    };
    return colors[status] || '#f3f4f6';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': '#dcfce7',
      'MEDIUM': '#fef3c7',
      'HIGH': '#fee2e2',
      'CRITICAL': '#fecaca'
    };
    return colors[priority] || '#f3f4f6';
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '4px' }}>
            {viewMode === 'my' ? 'My Tickets' : viewMode === 'assigned' ? 'Assigned to Me' : 'All Tickets'}
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track and manage service requests
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* View Mode Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-icon)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('my')}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontWeight: '500', fontSize: '0.875rem',
                background: viewMode === 'my' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'my' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              My Tickets
            </button>
            {isTechnician && (
              <button
                onClick={() => setViewMode('assigned')}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: '500', fontSize: '0.875rem',
                  background: viewMode === 'assigned' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'assigned' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                Assigned to Me
              </button>
            )}
            {isAdminOrManager && (
              <button
                onClick={() => setViewMode('all')}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: '500', fontSize: '0.875rem',
                  background: viewMode === 'all' ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                All Tickets
              </button>
            )}
          </div>

          {/* Create Ticket Button */}
          <div style={{ display: 'flex', background: 'var(--bg-icon)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveTab(activeTab === 'create' ? 'view' : 'create')}
              style={{
                padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontWeight: '500', fontSize: '0.875rem',
                background: activeTab === 'create' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'create' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {activeTab === 'create' ? 'Cancel' : '+ Create Ticket'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters for Admin/Manager View */}
      {viewMode === 'all' && activeTab === 'view' && (
        <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'var(--bg-icon)', borderRadius: '8px' }}>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select 
            value={filters.priority} 
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <input 
            type="text" 
            placeholder="Category" 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
          />
          <button 
            onClick={() => fetchAllTickets()}
            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Apply Filters
          </button>
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)', padding: activeTab === 'create' ? '0' : '24px', borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minHeight: '300px'
      }}>
        {activeTab === 'details' && selectedTicket ? (
          <TicketDetailsCard 
            ticket={selectedTicket} 
            onBack={() => {
              setActiveTab('view');
              setSelectedTicket(null);
              if (viewMode === 'my') fetchMyTickets();
              else if (viewMode === 'assigned') fetchAssignedTickets();
              else fetchAllTickets();
            }}
            onTicketUpdate={() => {
              if (viewMode === 'my') fetchMyTickets();
              else if (viewMode === 'assigned') fetchAssignedTickets();
              else fetchAllTickets();
            }}
          />
        ) : activeTab === 'view' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {getDisplayTickets().length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No tickets found</p>
                <p style={{ fontSize: '0.875rem' }}>Click "Create Ticket" to report an issue.</p>
              </div>
            ) : (
              getDisplayTickets().map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setActiveTab('details');
                  }}
                  style={{ 
                    padding: '16px', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    background: 'var(--bg-card)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      #{ticket.id} - {ticket.category} - {ticket.locationText || 'No location'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Submitted on {new Date(ticket.createdAt).toLocaleDateString()}
                      {ticket.assignedToName && <span> • Assigned to: {ticket.assignedToName}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: getStatusColor(ticket.status), 
                      color: '#0f172a', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {ticket.status}
                    </span>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: getPriorityColor(ticket.priority), 
                      color: '#0f172a', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {ticket.priority}
                    </span>
                    <button style={{ 
                      marginLeft: '8px', 
                      padding: '6px 12px', 
                      background: '#f1f5f9', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: '500', 
                      cursor: 'pointer', 
                      color: '#0f172a' 
                    }}>
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <CreateTicketForm onSuccess={() => {
            setActiveTab('view');
            fetchMyTickets();
          }} />
        )}
      </div>
    </div>
  );
}