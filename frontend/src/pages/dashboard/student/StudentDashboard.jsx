import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Wrench, Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Banner */}
      <div style={{
        backgroundImage: 'linear-gradient(to right, rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.6)), url(/campus-hero.png)',
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
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}! <span role="img" aria-label="wave">👋</span>
        </h2>
        <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '24px' }}>
          Here's an overview of your campus activity.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#1e3a8a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Plus size={18} /> New Booking
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '10px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
            <Wrench size={18} /> Report Issue
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#eff6ff', color: '#3b82f6', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>3</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '6px', fontWeight: '500' }}>Total Bookings</p>
          </div>
        </div>
        
        <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#fffbeb', color: '#d97706', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>1</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '6px', fontWeight: '500' }}>Pending Bookings</p>
          </div>
        </div>
        
        <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#fef2f2', color: '#ef4444', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>1</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '6px', fontWeight: '500' }}>Open Tickets</p>
          </div>
        </div>
        
        <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#f0fdf4', color: '#22c55e', width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', lineHeight: 1 }}>1</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '6px', fontWeight: '500' }}>Resolved Tickets</p>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Recent Bookings List */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>Recent Bookings</h3>
            <button style={{ background: 'none', border: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>Innovation Lab A</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>2026-04-10 • 09:00 - 11:00</p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: '6px', letterSpacing: '0.025em' }}>APPROVED</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>Grand Conference Hall</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>2026-04-12 • 14:00 - 16:00</p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9a3412', background: '#ffedd5', padding: '6px 12px', borderRadius: '6px', letterSpacing: '0.025em' }}>PENDING</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>Sports Complex Gym</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>2026-04-09 • 07:00 - 08:30</p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#991b1b', background: '#fee2e2', padding: '6px 12px', borderRadius: '6px', letterSpacing: '0.025em' }}>REJECTED</span>
            </div>
          </div>
        </div>

        {/* Recent Tickets List */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>Recent Tickets</h3>
            <button style={{ background: 'none', border: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>Broken projector in Lab A</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>Equipment • HIGH</p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9a3412', background: '#ffedd5', padding: '6px 12px', borderRadius: '6px', letterSpacing: '0.025em' }}>IN PROGRESS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>Leaking faucet in restroom</h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>Plumbing • MEDIUM</p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: '6px', letterSpacing: '0.025em' }}>RESOLVED</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

