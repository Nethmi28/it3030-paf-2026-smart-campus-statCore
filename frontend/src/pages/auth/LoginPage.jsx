import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  School,
  UserPlus,
  Home,
  Eye,
  EyeOff
} from 'lucide-react';
import { getDashboardPathForRole } from '../../utils/campusAuth';

const OAUTH_RETURN_PATH_KEY = 'campusOAuthReturnPath';
const POST_LOGIN_RETURN_PATH_KEY = 'campusPostLoginReturnPath';

function isDashboardPath(path) {
  return typeof path === 'string' && path.startsWith('/dashboard');
}

function isRoleAllowedForPath(path, role) {
  if (!isDashboardPath(path)) {
    return false;
  }

  const sharedDashboardPaths = [
    '/dashboard',
    '/dashboard/resources',
    '/dashboard/bookings',
    '/dashboard/tickets',
    '/dashboard/notifications'
  ];

  if (sharedDashboardPaths.includes(path)) {
    return true;
  }

  switch (role) {
    case 'ROLE_ADMIN':
      return path.startsWith('/dashboard/admin');
    case 'ROLE_MANAGER':
      return path.startsWith('/dashboard/manager');
    case 'ROLE_TECHNICIAN':
      return path.startsWith('/dashboard/tech');
    case 'ROLE_STUDENT':
      return path.startsWith('/dashboard/student');
    default:
      return false;
  }
}

function resolveReturnPath(candidatePath, fallbackPath, role) {
  return isRoleAllowedForPath(candidatePath, role) ? candidatePath : fallbackPath;
}

const ROLE_OPTIONS = [
  { value: 'ROLE_STUDENT', label: 'Student', prefix: 'st', exampleId: 'st23707290', exampleEmail: 'st23707290@my.cu.lk' },
  { value: 'ROLE_TECHNICIAN', label: 'Technician', prefix: 'tc', exampleId: 'tc23707290', exampleEmail: 'tc23707290@my.cu.lk' },
  { value: 'ROLE_MANAGER', label: 'Manager', prefix: 'mg', exampleId: 'mg23707290', exampleEmail: 'mg23707290@my.cu.lk' },
  { value: 'ROLE_ADMIN', label: 'Admin', prefix: 'ad', exampleId: 'ad23707290', exampleEmail: 'ad23707290@my.cu.lk' }
];

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [requestForm, setRequestForm] = useState({
    fullName: '',
    requestedRole: 'ROLE_STUDENT',
    email: '',
    googleEmail: '',
    password: '',
    confirmPassword: '',
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
  const googleOAuthEnabled = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === 'true';
  const showDevSetup = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_SETUP === 'true';
  
  const { user, login, completeOAuthLogin, exchangeOAuthCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRoleConfig = ROLE_OPTIONS.find((option) => option.value === requestForm.requestedRole) || ROLE_OPTIONS[0];

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

  useEffect(() => {
    if (user) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const oauthCode = params.get('oauthCode');
    const token = params.get('token');
    const role = params.get('role');
    const name = params.get('name');
    const oauthError = params.get('oauthError');

    if (oauthError) {
      setError(oauthError);
      navigate('/login', { replace: true });
      return;
    }

    if (!oauthCode && (!token || !role || !name)) {
      return;
    }

    let isActive = true;

    const finalizeOAuthLogin = async () => {
      const result = oauthCode
        ? await exchangeOAuthCode(oauthCode)
        : completeOAuthLogin({ token, role, name });

      if (!isActive) {
        return;
      }

      if (result.success) {
        const storedReturnPath = sessionStorage.getItem(OAUTH_RETURN_PATH_KEY);
        const fallbackPath = getDashboardPathForRole(result.role);
        const nextPath = resolveReturnPath(storedReturnPath, fallbackPath, result.role);

        sessionStorage.setItem(POST_LOGIN_RETURN_PATH_KEY, nextPath);
        sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
      } else {
        sessionStorage.removeItem(POST_LOGIN_RETURN_PATH_KEY);
        setError(result.error);
        navigate('/login', { replace: true });
      }
    };

    finalizeOAuthLogin();

    return () => {
      isActive = false;
    };
  }, [location.search, completeOAuthLogin, exchangeOAuthCode, navigate, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const requestedPath = sessionStorage.getItem(POST_LOGIN_RETURN_PATH_KEY) || location.state?.from?.pathname;
    const fallbackPath = getDashboardPathForRole(user.role);
    const nextPath = resolveReturnPath(requestedPath, fallbackPath, user.role);

    sessionStorage.removeItem(POST_LOGIN_RETURN_PATH_KEY);
    sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);

    if (location.pathname !== nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [location.pathname, location.state?.from?.pathname, navigate, user]);

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
      const nextPath = resolveReturnPath(requestedPath, fallbackPath, result.role);

      sessionStorage.setItem(POST_LOGIN_RETURN_PATH_KEY, nextPath);
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
      requestedRole: requestForm.requestedRole,
      email: requestForm.email.trim(),
      googleEmail: requestForm.googleEmail.trim(),
      password: requestForm.password,
      studentId: requestForm.studentId.trim(),
      faculty: requestForm.faculty.trim(),
      note: requestForm.note.trim()
    };

    if (!payload.fullName || !payload.requestedRole || !payload.email || !payload.studentId || !payload.faculty) {
      setRequestError('Please fill in your full name, role, campus email, campus ID, and faculty or unit.');
      return;
    }

    if (!payload.password || payload.password.length < 8) {
      setRequestError('Create a password with at least 8 characters for your new account.');
      return;
    }

    if (payload.password !== requestForm.confirmPassword) {
      setRequestError('The password confirmation does not match.');
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
        requestedRole: 'ROLE_STUDENT',
        email: '',
        googleEmail: '',
        password: '',
        confirmPassword: '',
        studentId: '',
        faculty: '',
        note: ''
      });
    } catch (requestSubmissionError) {
      setRequestError(requestSubmissionError.message || 'Unable to send your account request right now.');
    }

    setIsRequestLoading(false);
  };

  const handleGoogleLogin = () => {
    if (!googleOAuthEnabled) {
      setError('Google sign-in is not enabled for this environment yet.');
      return;
    }

    const returnPath = location.state?.from?.pathname;
    if (isDashboardPath(returnPath)) {
      sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, returnPath);
    } else {
      sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY);
    }

    window.location.href = `${apiBase}/oauth2/authorization/google`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1480px', minHeight: 'calc(100vh - 40px)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', background: '#121a2b', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.12)', boxShadow: '0 30px 60px rgba(2, 6, 23, 0.45)' }}>
        <div style={{ position: 'relative', minHeight: '440px', backgroundImage: "linear-gradient(180deg, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0.56) 100%), url('/campus-hero.png')", backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '999px', background: 'rgba(15, 23, 42, 0.62)', border: '1px solid rgba(255, 255, 255, 0.16)', color: '#f8fafc', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em' }}>
              <School size={18} />
              SMART CAMPUS ACCESS
            </div>
            <div style={{ marginTop: '32px', maxWidth: '480px' }}>
              <h1 style={{ margin: 0, color: '#ffffff', fontSize: 'clamp(2.2rem, 4vw, 4rem)', lineHeight: 1.02, fontWeight: 800 }}>
                One secure portal for campus operations.
              </h1>
              <p style={{ marginTop: '18px', marginBottom: 0, color: 'rgba(226, 232, 240, 0.9)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '430px' }}>
                Sign in with your approved campus account, or use Google after your request is approved.
                Every role uses a campus email in the `prefix+number@my.cu.lk` format, and can optionally link a personal Google email.
              </p>
            </div>
          </div>

        </div>

        <div style={{ background: '#121a2b', padding: '28px clamp(24px, 4vw, 56px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '999px', color: '#e2e8f0', textDecoration: 'none', background: 'rgba(30, 41, 59, 0.88)', border: '1px solid rgba(148, 163, 184, 0.16)', fontWeight: 600 }}>
              <Home size={16} />
              Home
            </Link>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '430px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', color: '#f8fafc', marginBottom: '16px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.18)', border: '1px solid rgba(96, 165, 250, 0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <School size={20} />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                    facilio<span style={{ color: '#94a3b8', fontWeight: 500 }}>/campus</span>
                  </div>
                </div>
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.6rem', fontWeight: 700 }}>Sign in to your account</h2>
              </div>

              {error && (
                <div style={{ background: 'rgba(127, 29, 29, 0.34)', color: '#fecaca', padding: '12px 14px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.9rem', border: '1px solid rgba(248, 113, 113, 0.28)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#e2e8f0', fontWeight: 600 }}>
                    Username or Email
                    <input name="username" value={form.username} onChange={handleInputChange} placeholder="e.g. mg.ghettiarchhi or cu1234567@fcu.lk" autoComplete="username" style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '14px', padding: '16px 18px', fontSize: '0.96rem', outline: 'none', background: '#121a2b', color: '#f8fafc', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }} />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#e2e8f0', fontWeight: 600 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span>Password</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRequestForm(true);
                          setRequestError('');
                          setRequestSuccess('');
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                      >
                        Need access?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleInputChange} placeholder="Enter your password" autoComplete="current-password" style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '14px', padding: '16px 54px 16px 18px', fontSize: '0.96rem', outline: 'none', background: '#121a2b', color: '#f8fafc', width: '100%', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }} />
                      <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>

                  <button type="submit" disabled={isLoading} style={{ background: isLoading ? '#475569' : '#44516b', color: '#f8fafc', border: 'none', borderRadius: '16px', padding: '16px 18px', fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '6px' }}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '22px', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestForm((current) => !current);
                    setRequestError('');
                    setRequestSuccess('');
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#4ade80', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                >
                  Send request
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0 22px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.16)' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.92rem' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.16)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="button" onClick={handleGoogleLogin} style={{ width: '58px', height: '58px', borderRadius: '50%', border: '1px solid rgba(148, 163, 184, 0.18)', background: '#121a2b', color: '#f8fafc', cursor: 'pointer', fontSize: '1.35rem', fontWeight: 700 }} aria-label="Continue with Google" title="Continue with Google">
                  G
                </button>
              </div>

              {!googleOAuthEnabled && (
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '14px', textAlign: 'center', lineHeight: 1.7 }}>
                  Set `VITE_GOOGLE_OAUTH_ENABLED=true` after configuring Google OAuth on the backend.
                </p>
              )}

              <div style={{ marginTop: '28px', padding: '18px', borderRadius: '20px', background: 'rgba(15, 23, 42, 0.62)', border: '1px solid rgba(148, 163, 184, 0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: 700, marginBottom: '6px' }}>
                      <UserPlus size={18} />
                      Campus Account Request
                    </div>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7 }}>
                      New users from every role can request access here, create their own password, and optionally add a separate Google sign-in email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm((current) => !current);
                      setRequestError('');
                      setRequestSuccess('');
                    }}
                    style={{ background: showRequestForm ? '#1d4ed8' : 'rgba(30, 41, 59, 0.96)', color: '#f8fafc', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: '12px', padding: '10px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {showRequestForm ? 'Hide Form' : 'Open Form'}
                  </button>
                </div>

                {showRequestForm && (
                  <form onSubmit={handleAccountRequest} style={{ marginTop: '18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {requestError && (
                        <div style={{ background: 'rgba(127, 29, 29, 0.34)', color: '#fecaca', padding: '12px 14px', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid rgba(248, 113, 113, 0.28)' }}>
                          {requestError}
                        </div>
                      )}

                      {requestSuccess && (
                        <div style={{ background: 'rgba(6, 78, 59, 0.35)', color: '#a7f3d0', padding: '12px 14px', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid rgba(52, 211, 153, 0.24)' }}>
                          {requestSuccess}
                        </div>
                      )}

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Full Name
                        <input name="fullName" value={requestForm.fullName} onChange={handleRequestInputChange} placeholder="Enter your full name" style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }} />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Account Role
                        <select name="requestedRole" value={requestForm.requestedRole} onChange={handleRequestInputChange} style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }}>
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Campus Email
                        <input name="email" type="email" value={requestForm.email} onChange={handleRequestInputChange} placeholder={`e.g. ${selectedRoleConfig.exampleEmail}`} style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }} />
                        <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500, lineHeight: 1.6 }}>
                          Use the campus format for your role: `{selectedRoleConfig.prefix}########@my.cu.lk`.
                        </span>
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Google Sign-In Email (Optional)
                        <input name="googleEmail" type="email" value={requestForm.googleEmail} onChange={handleRequestInputChange} placeholder="e.g. yourname@gmail.com" style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }} />
                        <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500, lineHeight: 1.6 }}>
                          Add this if you plan to sign in with a personal Google account instead of your university email.
                        </span>
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Create Password
                        <input name="password" type="password" value={requestForm.password} onChange={handleRequestInputChange} placeholder="At least 8 characters" style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }} />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Confirm Password
                        <input name="confirmPassword" type="password" value={requestForm.confirmPassword} onChange={handleRequestInputChange} placeholder="Re-enter your password" style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }} />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Campus ID
                        <input name="studentId" value={requestForm.studentId} onChange={handleRequestInputChange} placeholder={`e.g. ${selectedRoleConfig.exampleId}`} style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }} />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Faculty / Unit
                        <input name="faculty" value={requestForm.faculty} onChange={handleRequestInputChange} placeholder="e.g. Computing, Operations, Maintenance" style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc' }} />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1', fontWeight: 600 }}>
                        Note (Optional)
                        <textarea name="note" value={requestForm.note} onChange={handleRequestInputChange} placeholder="Add any details the admin team should know" rows={3} style={{ border: '1px solid rgba(148, 163, 184, 0.18)', borderRadius: '12px', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', background: '#121a2b', color: '#f8fafc', resize: 'vertical', fontFamily: 'inherit' }} />
                      </label>

                      <button type="submit" disabled={isRequestLoading} style={{ background: isRequestLoading ? '#334155' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '13px 18px', fontSize: '0.95rem', fontWeight: 700, cursor: isRequestLoading ? 'not-allowed' : 'pointer' }}>
                        {isRequestLoading ? 'Sending Request...' : 'Send Request to Create Account'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
