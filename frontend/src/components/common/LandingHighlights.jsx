import { Building2, CalendarRange, ShieldCheck } from 'lucide-react';

const highlightCards = [
  {
    id: 'facilities',
    eyebrow: 'Facilities',
    title: 'See what spaces are open before your day gets busy.',
    copy: 'Browse lecture halls, labs, auditoriums, sports areas, and equipment from one clear resource catalogue.',
    Icon: Building2,
  },
  {
    id: 'reservations',
    eyebrow: 'Reservations',
    title: 'Request, review, and track bookings without the usual back-and-forth.',
    copy: 'Students can submit requests in minutes while managers get a cleaner approval flow with all the details in one place.',
    Icon: CalendarRange,
  },
  {
    id: 'operations',
    eyebrow: 'Operations',
    title: 'Keep campus services moving with fewer status check messages.',
    copy: 'From issue reporting to facility readiness, the platform keeps requests visible and easier to follow through.',
    Icon: ShieldCheck,
  },
];

export default function LandingHighlights() {
  return (
    <section className="landing-highlights">
      <div className="landing-highlights__inner">
        {highlightCards.map(({ id, eyebrow, title, copy, Icon }) => (
          <article key={id} id={id} className="landing-highlight-card">
            <div className="landing-highlight-card__icon">
              <Icon size={20} />
            </div>
            <div className="landing-highlight-card__eyebrow">{eyebrow}</div>
            <h3 className="landing-highlight-card__title">{title}</h3>
            <p className="landing-highlight-card__copy">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
