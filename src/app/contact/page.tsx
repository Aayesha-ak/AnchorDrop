import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", maxWidth: "860px" }}>
      <div style={{ marginBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-6)" }}>
        <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gold)", fontWeight: 600 }}>
          Get In Touch
        </span>
        <h1 style={{ fontSize: "var(--font-size-4xl)", marginTop: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          Contact & Support
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-lg)" }}>
          Have a question, need docking assistance, or want to partner with AnchorDrop? We are here to help.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        {/* Support Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>⚓</div>
          <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Boater Inquiries
          </h2>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Need help with vessel profiles, checking berth compatibility, or managing reservation requests?
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
            Email: <a href="mailto:support@anchordrop.com" style={{ color: "var(--color-gold)" }}>support@anchordrop.com</a>
          </p>
        </div>

        {/* Host Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>🏡</div>
          <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Dock Owners & Marinas
          </h2>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Assistance with listing your private slips, setting arrival access instructions, or managing multi-slip operations.
          </p>
          <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
            Email: <a href="mailto:hosts@anchordrop.com" style={{ color: "var(--color-gold)" }}>hosts@anchordrop.com</a>
          </p>
        </div>
      </div>

      {/* Emergency & VHF info */}
      <div className="surface-harbor-night" style={{ borderRadius: "var(--radius-lg)", padding: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        <h3 style={{ color: "var(--color-cream)", fontSize: "var(--font-size-lg)", marginBottom: "var(--space-2)" }}>
          Navigational & Coast Guard Notice
        </h3>
        <p style={{ fontSize: "var(--font-size-sm)", color: "rgba(245, 241, 232, 0.8)", lineHeight: "1.6" }}>
          AnchorDrop provides marketplace booking coordination and dimensional suitability checks.
          For immediate on-water maritime emergencies, contact the local harbor master or U.S. Coast Guard directly on <strong>VHF Channel 16</strong>.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/" className="btn btn-outline">
          Return to Safe Harbor
        </Link>
      </div>
    </main>
  );
}
