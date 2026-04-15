import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardPathForRole } from '../../utils/campusAuth';

export default function Unauthorized() {
  const { user } = useAuth();
  const returnPath = user ? getDashboardPathForRole(user.role) : '/login';
  const returnLabel = user ? 'Go back to my dashboard' : 'Go to login';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(15,23,42,0.08)', textAlign: 'center', maxWidth: '420px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Access denied</h1>
        <p style={{ color: '#475569', marginBottom: '20px' }}>
          Your account is signed in, but you don&apos;t have permission to view this page.
        </p>
        <Link to={returnPath} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0ea5e9', color: 'white', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
          {returnLabel}
        </Link>
      </div>
    </div>
  );
}
