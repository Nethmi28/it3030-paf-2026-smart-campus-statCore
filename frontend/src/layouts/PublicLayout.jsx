import { Outlet } from 'react-router-dom';
import LandingNavbar from '../components/common/LandingNavbar';

export default function PublicLayout() {
  return (
    <div className="public-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-alt)' }}>
      <LandingNavbar />
      <main style={{ flex: 1, marginTop: '80px' }}>
        <Outlet />
      </main>
      
      {/* Optional: Footer can be added here later */}
    </div>
  );
}
