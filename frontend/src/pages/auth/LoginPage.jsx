import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { School, User, Wrench, Building, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiBase = (import.meta.env.VITE_API_BASE?.replace(/\/$/, '')) || 'http://localhost:8089';
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'ROLE_ADMIN') navigate('/dashboard/admin');
      else if (user.role === 'ROLE_MANAGER') navigate('/dashboard/manager');
      else if (user.role === 'ROLE_TECHNICIAN') navigate('/dashboard/tech');
      else navigate('/dashboard/student');
    }
  }, [user, navigate]);

  const handleCreateTestUser = async () => {
    try {
      const res = await fetch(`${apiBase}/api/auth/register-test-user`, { method: 'POST' });
      if (res.ok) alert("Test accounts seeded! You can now log in.");
      else alert("Test accounts may already exist.");
    } catch (err) {
      alert("Failed to reach backend. Is Spring Boot running?");
    }
  }

  const handleQuickLogin = async (email, password) => {
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === 'ROLE_ADMIN') navigate('/dashboard/admin');
      else if (result.role === 'ROLE_MANAGER') navigate('/dashboard/manager');
      else if (result.role === 'ROLE_TECHNICIAN') navigate('/dashboard/tech');
      else navigate('/dashboard/student');
    } else {
      setError('Login failed. Did you click "Setup Backend Dev Admin Account" first to seed the database?');
    }
    setIsLoading(false);
  };

  const loginRoles = [
    { label: "Sign in as a student/staff", email: "cu2354675@fcu.lk", icon: <User size={20} />, color: "#3b82f6", bg: "#eff6ff" },
    { label: "Sign in as a technician", email: "tcsaman@fcu.lk", icon: <Wrench size={20} />, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Sign in as a manager", email: "mghettiarchhi@fcu.lk", icon: <Building size={20} />, color: "#10b981", bg: "#dcfce7" },
    { label: "Sign in as a system admin", email: "test@campus.edu", icon: <ShieldAlert size={20} />, color: "#6366f1", bg: "#e0e7ff" }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '440px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', background: '#3b82f6', color: 'white', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
            <School size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>Welcome Back</h1>
          <p style={{ color: '#64748b' }}>Select your role to access the Campus Hub</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loginRoles.map((role, idx) => (
            <button 
              key={idx}
              onClick={() => handleQuickLogin(role.email, 'password123')}
              disabled={isLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                textAlign: 'left', width: '100%'
              }}
              onMouseEnter={(e) => {
                if(!isLoading) {
                  e.currentTarget.style.borderColor = role.color;
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isLoading) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ background: role.bg, color: role.color, padding: '12px', borderRadius: '10px' }}>
                {role.icon}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>{role.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{role.email}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Development tools</p>
          <button onClick={handleCreateTestUser} style={{ background: '#f1f5f9', border: 'none', color: '#475569', fontSize: '0.875rem', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            Seed Backend Databases (Click First)
          </button>
        </div>

      </div>
    </div>
  );
}
