import LandingNavbar from '../components/common/LandingNavbar';
import Hero from '../components/common/Hero';
import LandingHighlights from '../components/common/LandingHighlights';
import TrustedBy from '../components/common/TrustedBy';
import ContactUs from '../components/common/ContactUs';

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <Hero />
      <LandingHighlights />
      <TrustedBy />
      <ContactUs />
    </div>
  );
}
