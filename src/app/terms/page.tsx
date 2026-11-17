import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", maxWidth: "860px" }}>
      <div style={{ marginBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-6)" }}>
        <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gold)", fontWeight: 600 }}>
          Legal & Governance
        </span>
        <h1 style={{ fontSize: "var(--font-size-4xl)", marginTop: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          Terms of Service
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Last updated: January 2026 · AnchorDrop Marketplace Rules
        </p>
      </div>

      <div className="surface-slip-card" style={{ padding: "var(--space-8)", lineHeight: "1.7", marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          1. Platform Overview
        </h2>
        <p style={{ marginBottom: "var(--space-4)" }}>
          By accessing or using AnchorDrop, you agree to use the platform responsibly, provide accurate information,
          and adhere to all maritime, local, and state waterways regulations. AnchorDrop connects recreational boaters with
          private dock hosts and marina operators.
        </p>

        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          2. User Obligations & Accuracy
        </h2>
        <ul style={{ paddingLeft: "var(--space-6)", marginBottom: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <li>
            <strong>Registration:</strong> All users must provide genuine contact details, vessel specifications, and legal registration numbers.
          </li>
          <li>
            <strong>Dock Owners:</strong> Hosts are strictly responsible for maintaining accurate berth specifications, including maximum length,
            beam allowance, minimum low-tide depth, facilities, and current pricing.
          </li>
          <li>
            <strong>Boaters:</strong> Vessel operators must verify docking suitability and confirm prevailing local tidal and weather conditions prior to arrival.
          </li>
          <li>
            <strong>Reservation Lifecycle:</strong> Booking requests, acceptances, cancellations, and delay notifications must be submitted through the AnchorDrop platform.
          </li>
        </ul>

        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          3. Limitation of Navigational Liability
        </h2>
        <div style={{ backgroundColor: "var(--color-warning-bg)", border: "1px solid var(--color-warning-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <p style={{ color: "var(--color-warning)", fontWeight: 600, fontSize: "var(--font-size-sm)", marginBottom: "var(--space-1)" }}>
            ⚠️ Important Maritime Fit Disclaimer
          </p>
          <p style={{ color: "var(--color-text-primary)", fontSize: "var(--font-size-sm)" }}>
            AnchorDrop’s compatibility check is a <strong>preliminary dimensional fit indicator</strong> based on user-provided vessel and dock measurements.
            It does not replace nautical charts, local tide tables, pilotage, or prudent seamanship. The captain remains solely responsible for the safe operation and navigation of the vessel.
          </p>
        </div>

        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          4. Security of Arrival Instructions
        </h2>
        <p>
          Private arrival credentials, gate passcodes, slip markers, and VHF channels are private property of the host.
          Boaters agree never to share or disclose these access credentials to unauthorized parties.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/" className="btn btn-outline">
          Return Home
        </Link>
      </div>
    </main>
  );
}
