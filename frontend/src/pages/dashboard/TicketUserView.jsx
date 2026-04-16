import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/ticketService';
import CreateTicketForm from '../../components/tickets/CreateTicketForm';
import TicketDetailsCard from '../../components/tickets/TicketDetailsCard';
import { Ticket, Clock, CheckCircle, XCircle, AlertCircle, Plus, Filter } from 'lucide-react';

export default function TicketUserView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('view');
  const [myTickets, setMyTickets] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewMode, setViewMode] = useState('my');
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
  const [showFilters, setShowFilters] = useState(false);

  const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';
  const isTechnician = user?.role === 'ROLE_TECHNICIAN';
  const isStudent = user?.role === 'ROLE_STUDENT';

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
  }, [activeTab, viewMode, filters.status, filters.priority, filters.category]);

  const getDisplayTickets = () => {
    if (viewMode === 'my') return myTickets;
    if (viewMode === 'assigned') return assignedTickets;
    return allTickets;
  };

  const getStatusConfig = (status) => {
    const configs = {
      'OPEN': { bg: '#e0f2fe', text: '#0369a1', icon: <AlertCircle size={14} />, label: 'Open' },
      'IN_PROGRESS': { bg: '#fef3c7', text: '#b45309', icon: <Clock size={14} />, label: 'In Progress' },
      'RESOLVED': { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={14} />, label: 'Resolved' },
      'CLOSED': { bg: '#f1f5f9', text: '#475569', icon: <XCircle size={14} />, label: 'Closed' },
      'REJECTED': { bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={14} />, label: 'Rejected' }
    };
    return configs[status] || configs['OPEN'];
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      'LOW': { bg: '#dcfce7', text: '#15803d', label: 'Low' },
      'MEDIUM': { bg: '#fef3c7', text: '#b45309', label: 'Medium' },
      'HIGH': { bg: '#fee2e2', text: '#b91c1c', label: 'High' },
      'CRITICAL': { bg: '#fecaca', text: '#991b1b', label: 'Critical' }
    };
    return configs[priority] || configs['MEDIUM'];
  };

  const getStatusCounts = () => {
    const tickets = getDisplayTickets();
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      closed: tickets.filter(t => t.status === 'CLOSED').length,
      rejected: tickets.filter(t => t.status === 'REJECTED').length,
    };
  };

  const counts = getStatusCounts();

  const canCreateTicket = isStudent;

  // Stat Cards Data
  const statCards = [
    { title: 'Total Tickets', value: counts.total, icon: <Ticket size={20} />, color: '#3b82f6', bg: '#eff6ff' },
    { title: 'Open', value: counts.open, icon: <AlertCircle size={20} />, color: '#0ea5e9', bg: '#e0f2fe' },
    { title: 'In Progress', value: counts.inProgress, icon: <Clock size={20} />, color: '#d97706', bg: '#fef3c7' },
    { title: 'Resolved', value: counts.resolved, icon: <CheckCircle size={20} />, color: '#22c55e', bg: '#dcfce7' },
  ];

  return (
    <div style={{ padding: '28px 32px', background: 'var(--bg-alt)', minHeight: '100vh' }}>

      {/* Header Section */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Service Tickets
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isStudent && 'Track and manage your maintenance requests and service tickets'}
          {isTechnician && 'View and update tickets assigned to you'}
          {isAdminOrManager && 'Manage and oversee all support tickets across the campus'}
        </p>
      </div>

      {/* Stats Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {statCards.map((stat, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid var(--border-color)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                {stat.title}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
            </div>
            <div style={{
              background: stat.bg,
              padding: '10px',
              borderRadius: '12px',
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* View Mode Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setViewMode('my')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              background: viewMode === 'my' ? '#3b82f6' : 'transparent',
              color: viewMode === 'my' ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            My Tickets
          </button>
          {isTechnician && (
            <button
              onClick={() => setViewMode('assigned')}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                background: viewMode === 'assigned' ? '#3b82f6' : 'transparent',
                color: viewMode === 'assigned' ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              Assigned to Me
            </button>
          )}
          {isAdminOrManager && (
            <button
              onClick={() => setViewMode('all')}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                background: viewMode === 'all' ? '#3b82f6' : 'transparent',
                color: viewMode === 'all' ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              All Tickets
            </button>
          )}
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Filter Button */}
          {isAdminOrManager && viewMode === 'all' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              <Filter size={16} />
              Filters
            </button>
          )}

          {/* Create Ticket Button */}
          {canCreateTicket && (
            <button
              onClick={() => setActiveTab(activeTab === 'create' ? 'view' : 'create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'create' ? '#ef4444' : '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={16} />
              {activeTab === 'create' ? 'Cancel' : 'Create Ticket'}
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && viewMode === 'all' && activeTab === 'view' && (
        <div style={{
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>STATUS</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-alt)', color: 'var(--text-primary)' }}
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>PRIORITY</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-alt)', color: 'var(--text-primary)' }}
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>CATEGORY</label>
              <input
                type="text"
                placeholder="e.g., Plumbing, Electrical"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-alt)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={() => fetchAllTickets()}
              style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Apply Filters
            </button>
            <button
              onClick={() => { setFilters({ status: '', priority: '', category: '' }); fetchAllTickets(); }}
              style={{ padding: '10px 20px', background: 'var(--bg-alt)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        minHeight: '400px'
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
          <>
            {/* Ticket List Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
              padding: '14px 20px',
              background: 'var(--bg-alt)',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div>Ticket Details</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Assigned To</div>
              <div></div>
            </div>

            {/* Ticket List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {getDisplayTickets().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <Ticket size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No tickets found</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    {isStudent && 'Click "Create Ticket" to report an issue.'}
                    {isTechnician && 'No tickets have been assigned to you yet.'}
                    {isAdminOrManager && 'No tickets have been submitted yet.'}
                  </p>
                </div>
              ) : (
                getDisplayTickets().map((ticket, index) => {
                  const statusConfig = getStatusConfig(ticket.status);
                  const priorityConfig = getPriorityConfig(ticket.priority);

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setActiveTab('details');
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: index !== getDisplayTickets().length - 1 ? '1px solid var(--border-color)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        background: 'var(--bg-card)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-alt)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                    >
                      {/* Ticket Info */}
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          #{ticket.id} - {ticket.category}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ticket.locationText || 'No location'} • {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: statusConfig.bg,
                          color: statusConfig.text,
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Priority Badge */}
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          padding: '4px 10px',
                          background: priorityConfig.bg,
                          color: priorityConfig.text,
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {priorityConfig.label}
                        </span>
                      </div>

                      {/* Assigned To */}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {ticket.assignedToName || 'Unassigned'}
                      </div>

                      {/* Action Button */}
                      <div>
                        <button style={{
                          padding: '6px 14px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}>
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '24px' }}>
            <CreateTicketForm onSuccess={() => {
              setActiveTab('view');
              fetchMyTickets();
            }} />
          </div>
        )}
      </div>
    </div>
  );
}