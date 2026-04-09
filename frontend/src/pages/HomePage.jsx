import LandingNavbar from '../components/common/LandingNavbar';
import Hero from '../components/common/Hero';
import TrustedBy from '../components/common/TrustedBy';

export default function HomePage() {
  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
      <LandingNavbar />
      <Hero />
      <TrustedBy />
    </div>
  );
}
