import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  School,
  User,
  UserPlus,
  Wrench,
  Building,
  ShieldAlert,
  Lock,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { CAMPUS_ACCOUNTS, getDashboardPathForRole } from '../../utils/campusAuth';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [requestForm, setRequestForm] = useState({
    fullName: '',
    email: '',
    studentId: '',
    faculty: '',
    note: ''
  });
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const apiBase = (import.meta.env.VITE_API_BASE?.replace(/\/$/, '')) || 'http://localhost:8089';
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const iconMap = {
    ROLE_STUDENT: <User size={20} />,
    ROLE_TECHNICIAN: <Wrench size={20} />,
    ROLE_MANAGER: <Building size={20} />,
    ROLE_ADMIN: <ShieldAlert size={20} />
  };

  const handleCreateTestUser = async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/register-test-user`, { method: 'POST' });
      if (res.ok) alert("Test accounts seeded! You can now log in.");
      else alert("Test accounts may already exist.");
    } catch (err) {
      alert("Failed to reach backend. Is Spring Boot running?");
    }
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (error) {
      setError('');
    }
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCredentialSelect = (account) => {
    setError('');
    setForm({
      username: account.username,
      password: account.password
    });
  };

  const handleRequestInputChange = (event) => {
    const { name, value } = event.target;
    if (requestError) {
      setRequestError('');
    }
    if (requestSuccess) {
      setRequestSuccess('');
    }
    setRequestForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const username = form.username.trim();
    const password = form.password;

    if (!username || !password) {
      setError('Enter both your campus username or approved email and password before signing in.');
      return;
    }

    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      const fallbackPath = getDashboardPathForRole(result.role);
      const requestedPath = location.state?.from?.pathname;
      const nextPath = requestedPath && requestedPath.startsWith('/dashboard')
        ? requestedPath
        : fallbackPath;

      navigate(nextPath, { replace: true });
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleAccountRequest = async (event) => {
    event.preventDefault();
    setRequestError('');
    setRequestSuccess('');

    const payload = {
      fullName: requestForm.fullName.trim(),
      email: requestForm.email.trim(),
      studentId: requestForm.studentId.trim(),
      faculty: requestForm.faculty.trim(),
      note: requestForm.note.trim()
    };

    if (!payload.fullName || !payload.email || !payload.studentId || !payload.faculty) {
      setRequestError('Please fill in your full name, university email, student ID, and faculty.');
      return;
    }

    setIsRequestLoading(true);

    try {
      const response = await fetch(`${apiBase}/api/auth/account-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || 'Unable to send your account request right now.');
      }

      setRequestSuccess(message || 'Your account request has been sent successfully.');
      setRequestForm({
        fullName: '',
        email: '',
        studentId: '',
        faculty: '',
        note: ''
      });
    } catch (requestSubmissionError) {
      setRequestError(requestSubmissionError.message || 'Unable to send your account request right now.');
    }

    setIsRequestLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 45%, #eef2ff 100%)', padding: '24px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18)', width: '100%', maxWidth: '1020px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px' }}>
        
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#eff6ff', color: '#1d4ed8', padding: '10px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px' }}>
            <School size={18} />
            FACILIO CAMPUS ACCESS
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: '12px' }}>Sign in with your assigned campus credentials</h1>
          <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '28px', maxWidth: '560px' }}>
            Each role now uses a unique username and password pair. This keeps the login flow closer to a real campus portal instead of letting anyone jump into a dashboard with a single click.
          </p>

          <div style={{ display: 'grid', gap: '14px' }}>
            {CAMPUS_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => handleCredentialSelect(account)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '18px 20px',
                  background: account.surface,
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: 'white', color: account.accent, padding: '12px', borderRadius: '14px', display: 'flex', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06)' }}>
                    {iconMap[account.role]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{account.title}</div>
                    <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '10px' }}>{account.subtitle}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem' }}>
                      <span style={{ background: 'white', color: '#334155', padding: '6px 10px', borderRadius: '999px', fontFamily: 'monospace' }}>
                        {account.username}
                      </span>
                      <span style={{ background: 'white', color: '#334155', padding: '6px 10px', borderRadius: '999px', fontFamily: 'monospace' }}>
                        {account.password}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ color: account.accent, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                  Use
                  <ArrowRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', background: '#0f172a', color: 'white', padding: '14px', borderRadius: '16px', marginBottom: '16px' }}>
                <Lock size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Campus Login</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Use your campus username, or sign in with your approved university email and password after the admin grants access.</p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 14px', borderRadius: '12px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontWeight: 600 }}>
                  Username
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    placeholder="e.g. mg.ghettiarchhi or cu1234567@fcu.lk"
                    autoComplete="username"
                    style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px 16px', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontWeight: 600 }}>
                  Password
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px 52px 14px 16px', fontSize: '0.95rem', outline: 'none', background: 'white', width: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#93c5fd' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '18px', padding: '18px', borderRadius: '16px', background: '#ffffff', border: '1px solid #dbeafe' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 800, marginBottom: '6px' }}>
                    <UserPlus size={18} />
                    New Student Access
                  </div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    If you are a new student and still do not have website access, send a request to create your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm((current) => !current);
                    setRequestError('');
                    setRequestSuccess('');
                  }}
                  style={{
                    background: showRequestForm ? '#dbeafe' : '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {showRequestForm ? 'Hide Form' : 'Send Request'}
                </button>
              </div>

              {showRequestForm && (
                <form onSubmit={handleAccountRequest} style={{ marginTop: '18px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {requestError && (
                      <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                        {requestError}
                      </div>
                    )}

                    {requestSuccess && (
                      <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px 14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                        {requestSuccess}
                      </div>
                    )}

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontWeight: 600 }}>
                      Full Name
                      <input
                        name="fullName"
                        value={requestForm.fullName}
                        onChange={handleRequestInputChange}
                        placeholder="Enter your full name"
                        style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontWeight: 600 }}>
                      University Email
                      <input
                        name="email"
                        type="email"
                        value={requestForm.email}
                        onChange={handleRequestInputChange}
                        placeholder="e.g. cu1234567@fcu.lk"
                        style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontWeight: 600 }}>
                      Student ID
                      <input
                        name="studentId"
                        value={requestForm.studentId}
                        onChange={handleRequestInputChange}
                        placeholder="e.g. CU2354675"
                        style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontWeight: 600 }}>
                      Faculty
                      <input
                        name="faculty"
                        value={requestForm.faculty}
                        onChange={handleRequestInputChange}
                        placeholder="e.g. Computing"
                        style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                      />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#334155', fontWeight: 600 }}>
                      Note (Optional)
                      <textarea
                        name="note"
                        value={requestForm.note}
                        onChange={handleRequestInputChange}
                        placeholder="Add any details the admin team should know"
                        rows={3}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: 'white', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isRequestLoading}
                      style={{
                        background: isRequestLoading ? '#93c5fd' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '13px 18px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: isRequestLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isRequestLoading ? 'Sending Request...' : 'Send Request to Create Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Development Setup
            </p>
            <button
              onClick={handleCreateTestUser}
              style={{ background: '#e2e8f0', border: 'none', color: '#334155', fontSize: '0.9rem', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, width: '100%' }}
            >
              Seed Backend Test Accounts
            </button>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '10px', lineHeight: 1.6 }}>
              Run this once if the seeded backend users have not been created yet.
            </p>
            {location.state?.from?.pathname && (
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '10px', lineHeight: 1.6 }}>
                After sign-in, you will be sent back to the page you originally tried to open.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
