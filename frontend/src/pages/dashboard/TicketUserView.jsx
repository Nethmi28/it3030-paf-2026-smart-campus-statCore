import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/ticketService';
import CreateTicketForm from '../../components/tickets/CreateTicketForm';
import TicketDetailsCard from '../../components/tickets/TicketDetailsCard';
import { Ticket, Clock, CheckCircle, XCircle, AlertCircle, Plus, Filter, X } from 'lucide-react';

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

  // Set default view mode based on role
  useEffect(() => {
    if (isTechnician) {
      setViewMode('assigned');
    } else if (isStudent) {
      setViewMode('my');
    } else if (isAdminOrManager) {
      setViewMode('my');
    }
  }, [user]);

  // Apply local filters for ALL roles
  const applyLocalFilters = (tickets) => {
    let filtered = [...tickets];

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    if (filters.category) {
      filtered = filtered.filter(t =>
        t.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    return filtered;
  };

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
      // Fetch ALL tickets without filters (client-side filtering will handle it)
      const data = await ticketService.getAllTickets('', '', '');
      setAllTickets(data || []);
    } catch (e) {
      console.error("Failed to fetch all tickets", e);
    }
  };

  // Initial fetch and when view mode changes
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
  }, [activeTab, viewMode]);

  const getDisplayTickets = () => {
    let tickets;
    if (viewMode === 'my') tickets = myTickets;
    else if (viewMode === 'assigned') tickets = assignedTickets;
    else tickets = allTickets;

    // Apply local filters for ALL roles when filters are active
    if (hasActiveFilters) {
      return applyLocalFilters(tickets);
    }
    return tickets;
  };

  const hasActiveFilters = filters.status || filters.priority || filters.category;

  const resetFilters = () => {
    setFilters({ status: '', priority: '', category: '' });
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
            background: 'var(--ticket-summary-bg)',
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
        {/* View Mode Tabs - Role Specific */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          {isStudent && (
            <button
              onClick={() => {
                setViewMode('my');
                setFilters({ status: '', priority: '', category: '' });
              }}
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
          )}

          {isTechnician && (
            <button
              onClick={() => {
                setViewMode('assigned');
                setFilters({ status: '', priority: '', category: '' });
              }}
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
            <>

              <button
                onClick={() => {
                  setViewMode('all');
                  setFilters({ status: '', priority: '', category: '' });
                }}
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
            </>
          )}
        </div>

        {/* Right side buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: `1px solid ${hasActiveFilters ? '#3b82f6' : 'var(--border-color)'}`,
              background: hasActiveFilters ? '#eff6ff' : 'var(--bg-card)',
              color: hasActiveFilters ? '#3b82f6' : 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span style={{
                background: '#3b82f6',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '0.7rem'
              }}>
                Active
              </span>
            )}
          </button>

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

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {filters.status && (
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
              Status: {filters.status}
            </span>
          )}
          {filters.priority && (
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
              Priority: {filters.priority}
            </span>
          )}
          {filters.category && (
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
              Category: {filters.category}
            </span>
          )}
          <button
            onClick={resetFilters}
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Filters Panel - Same for ALL roles */}
      {showFilters && activeTab === 'view' && (
        <div style={{
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Filter Tickets
            </h4>
            <button
              onClick={() => setShowFilters(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Close
            </button>
          </div>

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
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-alt)', color: 'var(--text-primary)' }}
              >
                <option value="">All Categories</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="IT_EQUIPMENT">IT / Equipment</option>
                <option value="CLEANING">Cleaning</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button
              onClick={() => setShowFilters(false)}
              style={{ padding: '8px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
            >
              Done
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

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {getDisplayTickets().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <Ticket size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No tickets found</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    {hasActiveFilters ? 'Try clearing your filters to see more tickets.' :
                      (isStudent ? 'Click "Create Ticket" to report an issue.' :
                        isTechnician ? 'No tickets have been assigned to you yet.' :
                          'No tickets have been submitted yet.')}
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
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {ticket.category}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ticket.locationText || 'No location'} • {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: statusConfig.bg,
                          color: statusConfig.text,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      <div>
                        <span style={{
                          display: 'inline-flex',
                          padding: '4px 10px',
                          background: priorityConfig.bg,
                          color: priorityConfig.text,
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {priorityConfig.label}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {ticket.assignedToName || 'Unassigned'}
                      </div>

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