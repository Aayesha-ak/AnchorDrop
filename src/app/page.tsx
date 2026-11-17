import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import ExploreSection from "@/components/explore/ExploreSection";

export default function HomePage() {
  return (
    <div>
      {/* 1. Hero: Brand-First Viewport (Sub-phase 12.1, 12.2, 12.3) */}
      <Hero />

      {/* 2. Interactive How It Works Section (Sub-phase 12.4) */}
      <HowItWorks />

      {/* 3. Explore Docks Anchor Section (Sub-phase 12.5) */}
      <section
        id="explore"
        style={{
          paddingTop: "var(--space-16)",
          paddingBottom: "var(--space-16)",
          backgroundColor: "var(--color-white)",
          borderTop: "1px solid var(--color-border-subtle)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto var(--space-8)" }}>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--color-gold)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              Marketplace Supply
            </span>
            <h2 style={{ fontSize: "var(--font-size-3xl)", marginTop: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              Explore Available Docks & Slips
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
              Discover private residential slips and marina berths with verified dimensional clearances along coastal waterways.
            </p>
          </div>

          {/* Live Explore Catalog (Sub-phase 13.1 - 13.4) */}
          <ExploreSection />
        </div>
      </section>

      {/* 4. Maritime Trust & Standards */}
      <section style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", backgroundColor: "var(--color-cream)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto var(--space-8)" }}>
            <h2 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-2)" }}>
              Built for Seamanship & Hospitality
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
              AnchorDrop bridges the gap between recreational boaters and waterfront property owners.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--space-6)",
            }}
          >
            <div className="surface-slip-card">
              <h3 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
                📐 Preliminary Fit Indicators
              </h3>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                Dimensional validation of LOA, beam, and draft vs dock limits reduces wasted requests and unsuitable berthing attempts.
              </p>
            </div>

            <div className="surface-slip-card">
              <h3 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
                🔒 Protected Host Security
              </h3>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                Private gate passcodes and slip numbers stay locked until the host reviews vessel specifications and confirms the reservation.
              </p>
            </div>

            <div className="surface-slip-card">
              <h3 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
                ⏱️ In-App Delay Coordination
              </h3>
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                Late arrivals due to tides or weather are reported directly in-app, instantly updating the host&apos;s arrival dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
