import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCheck,
  ClipboardList,
  Loader2,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
  UserCog,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

const cardStyle = {
  background: 'white',
  borderRadius: '20px',
  border: '1px solid #dbe7f3',
  boxShadow: '0 18px 38px -30px rgba(15, 23, 42, 0.35)'
};

const roleConfig = {
  ROLE_ADMIN: {
    eyebrow: 'Admin Notification Center',
    title: 'Monitor access requests, role updates, and operational alerts.',
    description:
      'This view combines authentication events with platform activity that matters to campus administrators.',
    scopeLabel: 'Auth + Oversight',
    scopeIcon: <ShieldCheck size={20} />,
    scopeAccent: '#7c3aed'
  },
  ROLE_MANAGER: {
    eyebrow: 'Operations Notifications',
    title: 'Track booking requests, ticket activity, and comment updates.',
    description:
      'Managers see workflow changes that need operational attention across bookings and maintenance.',
    scopeLabel: 'Operations Flow',
    scopeIcon: <Briefcase size={20} />,
    scopeAccent: '#059669'
  },
  ROLE_TECHNICIAN: {
    eyebrow: 'Work Alerts',
    title: 'Stay updated on assigned tickets and new maintenance comments.',
    description:
      'Technicians get direct alerts for ticket assignment, status changes, and comments on active jobs.',
    scopeLabel: 'Assigned Work',
    scopeIcon: <Wrench size={20} />,
    scopeAccent: '#d97706'
  },
  ROLE_STUDENT: {
    eyebrow: 'My Notifications',
    title: 'Follow your booking decisions, ticket progress, and ticket comments.',
    description:
      'Students receive personal updates for approvals, rejections, ticket progress, and conversation activity.',
    scopeLabel: 'My Activity',
    scopeIcon: <Bell size={20} />,
    scopeAccent: '#2563eb'
  }
};

const typeAccent = {
  'Access Request': '#2563eb',
  'Role Change': '#059669',
  Security: '#7c3aed',
  Booking: '#0f766e',
  Ticket: '#c2410c',
  Comment: '#1d4ed8'
};

const priorityAccent = {
  High: '#dc2626',
  Medium: '#d97706',
  Low: '#2563eb'
};

const typeIcon = {
  'Access Request': <ShieldCheck size={20} />,
  'Role Change': <UserCog size={20} />,
  Security: <ShieldCheck size={20} />,
  Booking: <ClipboardList size={20} />,
  Ticket: <Wrench size={20} />,
  Comment: <MessageSquare size={20} />
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Unavailable';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString();
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [readState, setReadState] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const currentRoleConfig = roleConfig[user?.role] || roleConfig.ROLE_STUDENT;

  const loadNotifications = async (showFullLoader = false) => {
    if (!user?.token) {
      return;
    }

    if (showFullLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError('');

    try {
      const [notificationsData, unreadPayload] = await Promise.all([
        notificationService.getMyNotifications(user.token),
        notificationService.getUnreadCount(user.token)
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadPayload.unreadCount ?? 0);
      setSelectedId((currentSelectedId) => {
        if (notificationsData.some((entry) => entry.id === currentSelectedId)) {
          return currentSelectedId;
        }
        return notificationsData[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(loadError.message || 'Failed to fetch notifications');
      setNotifications([]);
      setUnreadCount(0);
      setSelectedId(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications(true);
  }, [user?.token]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        notification.title.toLowerCase().includes(normalizedSearch) ||
        notification.message.toLowerCase().includes(normalizedSearch);
      const matchesReadState =
        readState === 'ALL' ||
        (readState === 'UNREAD' && !notification.read) ||
        (readState === 'READ' && notification.read);
      const matchesType = typeFilter === 'ALL' || notification.type === typeFilter;

      return matchesSearch && matchesReadState && matchesType;
    });
  }, [notifications, readState, searchTerm, typeFilter]);

  const selectedNotification =
    filteredNotifications.find((notification) => notification.id === selectedId) ||
    filteredNotifications[0] ||
    null;

  const availableTypes = useMemo(() => {
    return [...new Set(notifications.map((notification) => notification.type))];
  }, [notifications]);

  const handleRefresh = async () => {
    await loadNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.token || unreadCount === 0) {
      return;
    }

    try {
      await notificationService.markAllAsRead(user.token);
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true
        }))
      );
      setUnreadCount(0);
    } catch (markError) {
      setError(markError.message || 'Failed to mark all notifications as read');
    }
  };

  const handleSelect = async (notification) => {
    setSelectedId(notification.id);

    if (notification.read || !user?.token) {
      return;
    }

    try {
      await notificationService.markAsRead(user.token, notification.id);
      setNotifications((current) =>
        current.map((entry) =>
          entry.id === notification.id
            ? { ...entry, read: true }
            : entry
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (markError) {
      setError(markError.message || 'Failed to mark the notification as read');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#0f766e' }} />
        <p style={{ color: '#64748b' }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1320px', margin: '0 auto', display: 'grid', gap: '24px' }}>
      <section
        style={{
          ...cardStyle,
          padding: '34px 36px',
          background:
            'radial-gradient(circle at top left, rgba(16, 185, 129, 0.12), transparent 28%), linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '24px',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ maxWidth: '820px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0f766e',
                fontWeight: 800,
                letterSpacing: '0.12em',
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                marginBottom: '14px'
              }}
            >
              <Bell size={16} />
              {currentRoleConfig.eyebrow}
            </div>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '12px' }}>
              {currentRoleConfig.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '760px' }}>
              {currentRoleConfig.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '14px 20px',
                background: '#e6f3f2',
                color: '#155e75',
                fontWeight: 700,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <RefreshCcw size={17} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '14px 20px',
                background: unreadCount === 0 ? '#cbd5e1' : '#0f766e',
                color: 'white',
                fontWeight: 700,
                cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <CheckCheck size={17} />
              Mark All As Read
            </button>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        {[
          { label: 'Total Notifications', value: notifications.length, icon: <Bell size={20} />, accent: '#2563eb' },
          { label: 'Unread Notifications', value: unreadCount, icon: <AlertTriangle size={20} />, accent: '#dc2626' },
          { label: 'My Role', value: user?.role?.replace('ROLE_', '') || 'USER', icon: <ShieldCheck size={20} />, accent: '#059669' },
          {
            label: 'Primary Scope',
            value: currentRoleConfig.scopeLabel,
            icon: currentRoleConfig.scopeIcon,
            accent: currentRoleConfig.scopeAccent
          }
        ].map((item) => (
          <div key={item.label} style={{ ...cardStyle, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '15px',
                  background: `${item.accent}14`,
                  color: item.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 900 }}>
                  {item.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 16px', borderRadius: '14px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 420px)', gap: '24px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ ...cardStyle, padding: '22px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(180px, 0.5fr) minmax(180px, 0.6fr)',
                gap: '16px'
              }}
            >
              <label style={{ display: 'grid', gap: '8px' }}>
                <span style={{ color: '#475569', fontWeight: 700 }}>Search</span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title or message"
                  style={{
                    height: '52px',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    padding: '0 16px',
                    fontSize: '0.96rem',
                    outline: 'none'
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span style={{ color: '#475569', fontWeight: 700 }}>Read State</span>
                <select
                  value={readState}
                  onChange={(event) => setReadState(event.target.value)}
                  style={{
                    height: '52px',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    padding: '0 14px',
                    fontSize: '0.96rem',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="UNREAD">Unread</option>
                  <option value="READ">Read</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span style={{ color: '#475569', fontWeight: 700 }}>Type</span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  style={{
                    height: '52px',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    padding: '0 14px',
                    fontSize: '0.96rem',
                    outline: 'none',
                    background: 'white'
                  }}
                >
                  <option value="ALL">All Types</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                  Notifications
                </h3>
                <p style={{ color: '#64748b' }}>{filteredNotifications.length} notification(s) visible</p>
              </div>
            </div>

            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  minHeight: '240px',
                  borderRadius: '18px',
                  border: '1px dashed #cbd5e1',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  color: '#64748b',
                  padding: '30px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', marginBottom: '8px' }}>
                    No notifications found
                  </div>
                  <div>Try adjusting the filters or wait for a new booking, ticket, or access update.</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {filteredNotifications.map((notification) => {
                  const accent = typeAccent[notification.type] || '#64748b';
                  const isSelected = selectedNotification?.id === notification.id;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleSelect(notification)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: '18px',
                        border: isSelected ? `1px solid ${accent}` : '1px solid #e2e8f0',
                        padding: '18px 20px',
                        background: isSelected ? `${accent}0d` : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '999px',
                              background: notification.read ? '#cbd5e1' : accent,
                              flexShrink: 0
                            }}
                          />
                          <div
                            style={{
                              color: '#0f172a',
                              fontWeight: 800,
                              fontSize: '1rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {notification.title}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: '999px',
                            background: `${priorityAccent[notification.priority] || '#64748b'}15`,
                            color: priorityAccent[notification.priority] || '#64748b',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            flexShrink: 0
                          }}
                        >
                          {notification.priority}
                        </div>
                      </div>

                      <div style={{ color: '#475569', lineHeight: 1.6, marginBottom: '12px' }}>{notification.message}</div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: '999px',
                            background: `${accent}12`,
                            color: accent,
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          {notification.type}
                        </span>
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: '999px',
                            background: '#f8fafc',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside style={{ ...cardStyle, padding: '24px', alignSelf: 'start', position: 'sticky', top: '24px' }}>
          {selectedNotification ? (
            <div style={{ display: 'grid', gap: '18px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: `${typeAccent[selectedNotification.type] || '#64748b'}14`,
                  color: typeAccent[selectedNotification.type] || '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {typeIcon[selectedNotification.type] || <Bell size={20} />}
              </div>

              <div>
                <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  Notification Details
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, marginBottom: '10px' }}>
                  {selectedNotification.title}
                </h3>
                <p style={{ color: '#475569', lineHeight: 1.8 }}>{selectedNotification.message}</p>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  ['Type', selectedNotification.type],
                  ['Priority', selectedNotification.priority],
                  ['Audience', selectedNotification.audience],
                  ['Source', selectedNotification.source],
                  ['Created', formatDateTime(selectedNotification.createdAt)],
                  ['Read Status', selectedNotification.read ? 'Read' : 'Unread']
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '16px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <span style={{ color: '#64748b', fontWeight: 700 }}>{label}</span>
                    <span style={{ color: '#0f172a', fontWeight: 800, textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ minHeight: '260px', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#64748b' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Select a notification
                </div>
                <div>Choose any row to inspect the details panel.</div>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
