import {
  School, LayoutDashboard, Layers, CalendarDays, Ticket, Bell, LogOut, UserPlus
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  // Safe fallback if not fully loaded yet to prevent flashes
  const currentUser = user || { name: 'Guest', role: 'ROLE_USER' };

  // Define menus conditionally based on role to satisfy the '4 Dashboards' requirement
  const getMenuItems = () => {
    if (currentUser.role === 'ROLE_ADMIN') {
      return [
        { id: 'admin', label: 'Admin Panel', icon: <LayoutDashboard size={20} />, exact: true },
        { id: 'admin/manage-resources', label: 'Manage Resources', icon: <Layers size={20} /> },
        { id: 'admin/registration-requests', label: 'New Registration Requests', icon: <UserPlus size={20} /> },
        { id: 'notifications', label: 'System Logs', icon: <Bell size={20} /> },
      ];
    }
    if (currentUser.role === 'ROLE_MANAGER') {
      return [
        { id: 'manager', label: 'Operations View', icon: <LayoutDashboard size={20} />, exact: true },
        { id: 'resources', label: 'Facilities Catalog', icon: <Layers size={20} /> },
        { id: 'bookings', label: 'Review Bookings', icon: <CalendarDays size={20} /> },
        { id: 'tickets', label: 'Review Tickets', icon: <Ticket size={20} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
      ];
    }
    if (currentUser.role === 'ROLE_TECHNICIAN') {
      return [
        { id: 'tech', label: 'Job Queue', icon: <LayoutDashboard size={20} />, exact: true },
        { id: 'tickets', label: 'Incident Tickets', icon: <Ticket size={20} /> },
      ];
    }
    // Default: ROLE_STUDENT
    return [
      { id: 'student', label: 'My Portal', icon: <LayoutDashboard size={20} />, exact: true },
      { id: 'resources', label: 'Browse Resources', icon: <Layers size={20} /> },
      { id: 'bookings', label: 'My Bookings', icon: <CalendarDays size={20} /> },
      { id: 'tickets', label: 'Report Issue', icon: <Ticket size={20} /> },
      { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-alt)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <School size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1rem' }}>Facilio Hub</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.role.replace('ROLE_', '')} PORTAL</div>
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
                padding: '14px 16px',
                width: '100%',
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                color: isActive ? 'var(--sidebar-active-text)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: isActive ? '600' : '500',
                boxShadow: isActive ? '0 12px 24px rgba(37, 99, 235, 0.14)' : 'none',
                transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                textDecoration: 'none'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={logout}
            title="Logout"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              textAlign: 'left',
              transition: 'color 0.2s ease'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Topbar */}
        <div style={{ background: 'var(--bg-color)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>Welcome back, {currentUser.name.split(' ')[0]}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date().toLocaleDateString()}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ThemeToggle />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '1rem' }}>
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#dcfce7', color: '#22c55e', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                  {currentUser.role.replace('ROLE_', '')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
