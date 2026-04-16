import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Mail, RefreshCcw, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ||
  'http://localhost:8089';

const cardStyle = {
  background: 'white',
  borderRadius: '18px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 12px 28px -18px rgba(15, 23, 42, 0.28)'
};

const statusStyles = {
  PENDING: { background: '#fef3c7', color: '#92400e' },
  APPROVED: { background: '#dcfce7', color: '#166534' }
};

export default function AdminRegistrationRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(null);

  const loadRequests = async () => {
    if (!user?.token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/account-requests`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Unable to load registration requests right now.');
      }

      const data = await response.json();
      setRequests(data);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load registration requests right now.');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, [user?.token]);

  const handleApprove = async (requestId) => {
    setActiveRequestId(requestId);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/account-requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
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
        throw new Error(payload.message || 'Unable to approve this request right now.');
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status: payload.status }
            : request
        )
      );
      setSuccessMessage(
        `${payload.message} Student login: ${payload.email} | Temporary password: ${payload.temporaryPassword}`
      );
    } catch (approvalError) {
      setError(approvalError.message || 'Unable to approve this request right now.');
    }

    setActiveRequestId(null);
  };

  const pendingCount = requests.filter((request) => request.status === 'PENDING').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>New Registration Requests</h2>
          <p style={{ color: '#64748b', maxWidth: '720px', lineHeight: 1.7 }}>
            New students who do not have website access appear here. Approve a request to create their student account and generate a temporary password.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <div style={{ ...cardStyle, padding: '22px' }}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Pending Requests</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{pendingCount}</div>
        </div>
        <div style={{ ...cardStyle, padding: '22px' }}>
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Approved Requests</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            {requests.filter((request) => request.status === 'APPROVED').length}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ background: '#ecfdf5', color: '#047857', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px', fontWeight: 600, lineHeight: 1.6 }}>
          {successMessage}
        </div>
      )}

        <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus size={20} color="#2563eb" />
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Student Access Queue</div>
        </div>

        {loading ? (
          <div style={{ padding: '24px', color: '#64748b' }}>Loading registration requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '28px 24px', color: '#64748b' }}>No student registration requests have been sent yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px', padding: '20px' }}>
            {requests.map((request) => {
              const statusStyle = statusStyles[request.status] || { background: '#e2e8f0', color: '#334155' };
              const createdAt = request.createdAt
                ? new Date(request.createdAt).toLocaleString()
                : 'Unknown';

              return (
                <div key={request.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{request.fullName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.95rem', marginBottom: '6px' }}>
                        <Mail size={15} />
                        {request.email}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Student ID: <strong style={{ color: '#334155' }}>{request.studentId}</strong> | Faculty: <strong style={{ color: '#334155' }}>{request.faculty}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: statusStyle.background, color: statusStyle.color, padding: '7px 12px', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {request.status === 'APPROVED' ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                        {request.status}
                      </span>

                      {request.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(request.id)}
                          disabled={activeRequestId === request.id}
                          style={{ background: activeRequestId === request.id ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 14px', fontWeight: 700, cursor: activeRequestId === request.id ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <ShieldCheck size={16} />
                          {activeRequestId === request.id ? 'Approving...' : 'Approve Access'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: request.note ? '12px' : 0 }}>
                    Submitted: {createdAt}
                  </div>

                  {request.note && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', color: '#475569', lineHeight: 1.6 }}>
                      {request.note}
                    </div>
                  )}

                  {request.status === 'APPROVED' && (
                    <div style={{ marginTop: '12px', color: '#166534', fontSize: '0.9rem', fontWeight: 600 }}>
                      Temporary login password for this student: {request.studentId}@2026
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
