import LandingNavbar from '../components/common/LandingNavbar';
import Hero from '../components/common/Hero';
import LandingHighlights from '../components/common/LandingHighlights';
import TrustedBy from '../components/common/TrustedBy';

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <Hero />
      <LandingHighlights />
      <TrustedBy />
    </div>
  );
}
