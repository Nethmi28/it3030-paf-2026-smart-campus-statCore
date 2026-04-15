import { useEffect, useState } from 'react';
import { ShieldCheck, Users, UserCog, Wrench, Building2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ||
  'http://localhost:8089';

const ROLE_OPTIONS = [
  { value: 'ROLE_STUDENT', label: 'Student' },
  { value: 'ROLE_TECHNICIAN', label: 'Technician' },
  { value: 'ROLE_MANAGER', label: 'Manager' },
  { value: 'ROLE_ADMIN', label: 'Admin' }
];

const cardStyle = {
  background: 'white',
  borderRadius: '18px',
  padding: '24px',
  boxShadow: '0 12px 28px -18px rgba(15, 23, 42, 0.28)',
  border: '1px solid #e2e8f0'
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [draftRoles, setDraftRoles] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);

  const loadUsers = async () => {
    if (!user?.token) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/admin/users`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Unable to load users for role management right now.');
      }

      const data = await response.json();
      setUsers(data);
      setDraftRoles(
        data.reduce((accumulator, entry) => {
          accumulator[entry.id] = entry.role;
          return accumulator;
        }, {})
      );
    } catch (loadError) {
      setError(loadError.message || 'Unable to load users for role management right now.');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [user?.token]);

  const handleRoleChange = (userId, nextRole) => {
    setSuccessMessage('');
    setDraftRoles((current) => ({
      ...current,
      [userId]: nextRole
    }));
  };

  const handleSaveRole = async (targetUser) => {
    const nextRole = draftRoles[targetUser.id];

    if (!nextRole || nextRole === targetUser.role) {
      return;
    }

    setSavingUserId(targetUser.id);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/admin/users/${targetUser.id}/role`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: nextRole })
      });

      const rawBody = await response.text();
      let payload = {};

      if (rawBody) {
        try {
          payload = JSON.parse(rawBody);
        } catch {
          payload = { message: rawBody };
        }
      }

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to update the user role right now.');
      }

      setUsers((current) =>
        current.map((entry) =>
          entry.id === targetUser.id ? payload : entry
        )
      );
      setDraftRoles((current) => ({
        ...current,
        [targetUser.id]: payload.role
      }));
      setSuccessMessage(`${payload.name} is now assigned as ${payload.role.replace('ROLE_', '')}.`);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update the user role right now.');
    }

    setSavingUserId(null);
  };

  const totalUsers = users.length;
  const technicianCount = users.filter((entry) => entry.role === 'ROLE_TECHNICIAN').length;
  const managerCount = users.filter((entry) => entry.role === 'ROLE_MANAGER').length;
  const adminCount = users.filter((entry) => entry.role === 'ROLE_ADMIN').length;

  const stats = [
    { title: 'Total Users', value: totalUsers, icon: <Users size={22} />, color: '#2563eb' },
    { title: 'Technicians', value: technicianCount, icon: <Wrench size={22} />, color: '#d97706' },
    { title: 'Managers', value: managerCount, icon: <Building2 size={22} />, color: '#059669' },
    { title: 'Admins', value: adminCount, icon: <ShieldCheck size={22} />, color: '#7c3aed' }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>System Administration</h2>
        <p style={{ color: '#64748b', lineHeight: 1.7, maxWidth: '760px' }}>
          The admin can assign and update user roles here, including technician, manager, and admin access.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        {stats.map((stat) => (
          <div key={stat.title} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: `${stat.color}15`, color: stat.color, padding: '14px', borderRadius: '14px', display: 'flex' }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>{stat.title}</div>
                <div style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: 800 }}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ background: '#ecfdf5', color: '#047857', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px', fontWeight: 600 }}>
          {successMessage}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <UserCog size={22} color="#2563eb" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Assign Roles</h3>
        </div>

        {loading ? (
          <div style={{ color: '#64748b' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ color: '#64748b' }}>No users are available for role assignment yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {users.map((entry) => {
              const selectedRole = draftRoles[entry.id] || entry.role;
              const isChanged = selectedRole !== entry.role;
              const isSaving = savingUserId === entry.id;

              return (
                <div
                  key={entry.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(200px, 240px) auto',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>{entry.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '6px' }}>{entry.email}</div>
                    <div style={{ color: '#475569', fontSize: '0.88rem' }}>
                      Current Role: <strong>{entry.role.replace('ROLE_', '')}</strong>
                    </div>
                  </div>

                  <select
                    value={selectedRole}
                    onChange={(event) => handleRoleChange(entry.id, event.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      fontSize: '0.95rem',
                      outline: 'none',
                      background: 'white',
                      color: '#0f172a',
                      fontWeight: 600
                    }}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleSaveRole(entry)}
                    disabled={!isChanged || isSaving}
                    style={{
                      background: !isChanged || isSaving ? '#cbd5e1' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: !isChanged || isSaving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Role'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
