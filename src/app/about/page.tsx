import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", maxWidth: "860px" }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-6)" }}>
        <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gold)", fontWeight: 600 }}>
          About AnchorDrop
        </span>
        <h1 style={{ fontSize: "var(--font-size-4xl)", marginTop: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          Your Place on the Water!
        </h1>
        <p style={{ fontStyle: "italic", color: "var(--color-gold)", fontFamily: "var(--font-serif)", fontSize: "var(--font-size-xl)" }}>
          Discover. Dock. Unwind.
        </p>
      </div>

      {/* Main Content */}
      <div className="surface-slip-card" style={{ padding: "var(--space-8)", marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-4)" }}>
          Our Mission
        </h2>
        <p style={{ lineHeight: "1.7", marginBottom: "var(--space-4)" }}>
          AnchorDrop is a two-sided marine marketplace purpose-built to solve one of boating’s most persistent headaches:
          finding, verifying, and securing temporary docking slips.
        </p>
        <p style={{ lineHeight: "1.7", marginBottom: "var(--space-4)" }}>
          We connect boat owners seeking compatible berths with private waterfront property owners and commercial marina operators
          seeking to monetize vacant dock inventory.
        </p>
        <p style={{ lineHeight: "1.7" }}>
          Our mission is to bring transparency, safety, and hospitality to recreational boating. By combining automated dimensional
          compatibility checks (length, beam, and low-tide draft depth) with locked, secure arrival instructions, we eliminate the
          phone tag and uncertainty that previously plagued waterfront travel.
        </p>
      </div>

      {/* Value Pillars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        <div className="surface-slip-card">
          <h3 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
            ⚓ Luxury
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            A calm, refined booking experience tailored for recreational yachting and waterfront communities.
          </p>
        </div>

        <div className="surface-slip-card">
          <h3 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
            🛡️ Trust
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Private host arrival details are unlocked exclusively after owner confirmation.
          </p>
        </div>

        <div className="surface-slip-card">
          <h3 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
            🌊 Adventure
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Travel coastal waterways with confidence knowing your berth is waiting and dimensionally fitted.
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "var(--space-8)" }}>
        <Link href="/#explore" className="btn btn-primary" style={{ marginRight: "var(--space-3)" }}>
          Explore Docks
        </Link>
        <Link href="/" className="btn btn-outline">
          Return Home
        </Link>
      </div>
    </main>
  );
}
