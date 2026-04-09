export default function TrustedBy() {
  return (
    <div style={{ padding: '4rem 5%', textAlign: 'center', background: 'var(--bg-color)', transition: 'background-color 0.3s', borderTop: '1px solid var(--border-color)' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '2.5rem', transition: 'color 0.3s' }}>Trusted by all university faculties</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', opacity: 0.8, fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-muted)', alignItems: 'center', transition: 'color 0.3s' }}>
        <span style={{ fontSize: '1.4rem' }}>Computing</span>
        <span style={{ fontSize: '1.4rem' }}>Engineering</span>
        <span style={{ fontSize: '1.4rem' }}>Business</span>
        <span style={{ fontSize: '1.4rem' }}>Humanities</span>
        <span style={{ fontSize: '1.4rem' }}>Library Services</span>
      </div>
    </div>
  );
}
