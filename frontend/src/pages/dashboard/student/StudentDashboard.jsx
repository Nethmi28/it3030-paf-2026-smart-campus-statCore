import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Plus, Wrench } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { bookingService } from '../../../services/bookingService';
import { ticketService } from '../../../services/ticketService';
import { formatBookingRange } from '../../../utils/bookingTime';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, openTickets: 0, resolvedTickets: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.token) return;
      setLoading(true);

      try {
        const [bookings, tickets] = await Promise.all([
          bookingService.getMyBookings(user.token),
          ticketService.getMyTickets(user.token)
        ]);

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((booking) => booking.status === 'PENDING').length,
          openTickets: tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length,
          resolvedTickets: tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length
        });
        setRecentBookings(bookings.slice(0, 3));
        setRecentTickets(tickets.slice(0, 3));
      } catch (err) {
        console.error('Student dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.token]);

  if (loading) {
    return (
      <div style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#1e3a8a' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const panelStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };

  const statCardStyle = {
    background: 'var(--stat-card-bg)',
    border: '1px solid var(--stat-card-border)',
    borderRadius: '16px',
    padding: '22px 24px',
    boxShadow: 'var(--stat-card-shadow)',
    minHeight: '112px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  };

  const statCards = [
    {
      key: 'bookings',
      value: stats.totalBookings,
      label: 'Total Bookings',
      icon: <Calendar size={24} />,
      iconBackground: 'rgba(59, 130, 246, 0.14)',
      iconColor: '#3b82f6',
    },
    {
      key: 'pending',
      value: stats.pendingBookings,
      label: 'Pending Bookings',
      icon: <Clock size={24} />,
      iconBackground: 'rgba(245, 158, 11, 0.14)',
      iconColor: '#d97706',
    },
    {
      key: 'open',
      value: stats.openTickets,
      label: 'Open Tickets',
      icon: <Wrench size={24} />,
      iconBackground: 'rgba(239, 68, 68, 0.14)',
      iconColor: '#ef4444',
    },
    {
      key: 'resolved',
      value: stats.resolvedTickets,
      label: 'Resolved Tickets',
      icon: <CheckCircle size={24} />,
      iconBackground: 'rgba(34, 197, 94, 0.14)',
      iconColor: '#22c55e',
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{
        backgroundImage: 'linear-gradient(to right, rgba(30, 58, 138, 0.88), rgba(30, 58, 138, 0.52)), url(/student-dashboard-hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '16px',
        padding: '48px 40px',
        color: 'white',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '8px' }}>
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}!
        </h2>
        <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '24px' }}>
          Here&apos;s an overview of your campus activity.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard/bookings', { state: { action: 'create' } })}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.92)', color: '#1e3a8a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <Plus size={18} /> New Booking
          </button>
          <button
            onClick={() => navigate('/dashboard/tickets')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.12)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
          >
            <Wrench size={18} /> Report Issue
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {statCards.map((card) => (
          <div key={card.key} style={statCardStyle}>
            <div style={{ background: card.iconBackground, color: card.iconColor, width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '6px' }}>{card.label}</p>
              <h3 style={{ fontSize: '1.95rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Recent Bookings</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {recentBookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>No recent bookings</p>
            ) : recentBookings.map((booking) => (
              <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)' }}>{booking.resourceName}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>{booking.bookingDate} | {formatBookingRange(booking.startTime, booking.endTime)}</p>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: booking.status === 'APPROVED' ? '#166534' : booking.status === 'REJECTED' ? '#991b1b' : '#9a3412',
                  background: booking.status === 'APPROVED' ? '#dcfce7' : booking.status === 'REJECTED' ? '#fee2e2' : '#ffedd5',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  letterSpacing: '0.025em'
                }}>
                  {booking.status === 'APPROVED' ? 'ACCEPTED' : booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Recent Tickets</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {recentTickets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>No recent tickets</p>
            ) : recentTickets.map((ticket) => (
              <div key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)' }}>{ticket.category}: {ticket.description.substring(0, 30)}...</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>{ticket.priority} Priority</p>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? '#166534' : '#9a3412',
                  background: ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? '#dcfce7' : '#ffedd5',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  letterSpacing: '0.025em'
                }}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
