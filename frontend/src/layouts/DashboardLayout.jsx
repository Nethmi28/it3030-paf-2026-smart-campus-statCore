import { 
  School, LayoutDashboard, Layers, CalendarDays, Ticket, Bell, ChevronDown 
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  const menuItems = [
    { id: '', label: 'Dashboard', icon: <LayoutDashboard size={20} />, exact: true },
    { id: 'resources', label: 'Resources', icon: <Layers size={20} /> },
    { id: 'bookings', label: 'My Bookings', icon: <CalendarDays size={20} /> },
    { id: 'tickets', label: 'My Tickets', icon: <Ticket size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-alt)', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#0f172a', color: '#cbd5e1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <School size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>Facilio Campus</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Smart Operations Hub</div>
          </div>
        </div>

        <div style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map(item => (
            <NavLink 
              key={item.id}
              to={`/dashboard${item.id ? '/' + item.id : ''}`}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                width: '100%',
                background: isActive ? '#1e293b' : 'transparent',
                color: isActive ? 'white' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '500',
                transition: 'background 0.2s',
                textDecoration: 'none'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* Topbar */}
        <div style={{ 
          background: 'var(--bg-color)', 
          padding: '16px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          zIndex: 10
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>Welcome back, Alex</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Thursday, April 9, 2026</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ 
              background: '#dcfce7', color: '#22c55e', padding: '4px 12px', 
              borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600'
            }}>ACTIVE</span>
            
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Bell size={24} />
              <span style={{ 
                position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', 
                color: 'white', fontSize: '0.65rem', width: '16px', height: '16px', 
                borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: 'bold'
              }}>3</span>
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', 
                color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: '600', fontSize: '1rem'
              }}>A</div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Alex Johnson</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>USER</div>
              </div>
              <ChevronDown size={16} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Dynamic Page Content from Router */}
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
