export default function HomePage() {
  return (
    <main className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-12)" }}>
      {/* Brand Header */}
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--font-size-5xl)", marginBottom: "var(--space-2)" }}>
          AnchorDrop
        </h1>
        <p style={{ fontSize: "var(--font-size-2xl)", color: "var(--color-gold)", fontFamily: "var(--font-serif)", fontStyle: "italic", marginBottom: "var(--space-2)" }}>
          Your Place on the Water!
        </p>
        <p style={{ fontSize: "var(--font-size-lg)", color: "var(--color-text-secondary)" }}>
          Discover. Dock. Unwind.
        </p>
      </header>

      {/* Surface Patterns Showcase */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        {/* Harbor Night */}
        <div className="surface-harbor-night" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ marginBottom: "var(--space-2)" }}>Harbor Night Surface</h3>
          <p style={{ marginBottom: "var(--space-4)" }}>
            Used for hero overlays, footer, and high-trust maritime headers.
          </p>
          <button className="btn btn-primary">Champagne Gold CTA</button>
        </div>

        {/* Day Deck / Slip Card */}
        <div className="surface-slip-card">
          <h3 style={{ marginBottom: "var(--space-2)" }}>Slip Card Surface</h3>
          <p style={{ marginBottom: "var(--space-4)" }}>
            Clean elevated cards on cream canvas for dock listings, vessels, and booking requests.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button className="btn btn-navy">Navy Action</button>
            <button className="btn btn-outline">Outline Action</button>
          </div>
        </div>
      </section>

      {/* Status Badges Showcase */}
      <section className="surface-slip-card" style={{ marginBottom: "var(--space-8)" }}>
        <h3 style={{ marginBottom: "var(--space-4)" }}>Booking Lifecycle Status Badges</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <span className="badge badge-pending">● Pending</span>
          <span className="badge badge-accepted">✓ Accepted</span>
          <span className="badge badge-rejected">✕ Rejected</span>
          <span className="badge badge-completed">⚐ Completed</span>
          <span className="badge badge-compatible">✓ Compatible</span>
          <span className="badge badge-incompatible">✕ Incompatible</span>
        </div>
      </section>
    </main>
  );
}
