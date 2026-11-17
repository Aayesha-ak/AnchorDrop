import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", maxWidth: "860px" }}>
      <div style={{ marginBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-6)" }}>
        <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-gold)", fontWeight: 600 }}>
          Data Protection
        </span>
        <h1 style={{ fontSize: "var(--font-size-4xl)", marginTop: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Last updated: January 2026 · Transparent Data Practices
        </p>
      </div>

      <div className="surface-slip-card" style={{ padding: "var(--space-8)", lineHeight: "1.7", marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          1. Information We Collect
        </h2>
        <p style={{ marginBottom: "var(--space-3)" }}>
          AnchorDrop collects only the information necessary to facilitate two-sided marine docking reservations:
        </p>
        <ul style={{ paddingLeft: "var(--space-6)", marginBottom: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <li>
            <strong>Account Credentials:</strong> Name, verified email address, role, and salted password hashes (never stored in plaintext).
          </li>
          <li>
            <strong>Vessel Specifications:</strong> Boat name, vessel type, LOA (length), beam width, draft depth, and official registration number.
          </li>
          <li>
            <strong>Berth Listings:</strong> Location, waterway, photos, dimensional boundaries, low-tide depth, pricing, and private access instructions.
          </li>
          <li>
            <strong>Booking Records:</strong> Check-in and check-out dates, reservation statuses, ETA delay reports, and operational notes.
          </li>
        </ul>

        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          2. How We Protect Sensitive Arrival Data
        </h2>
        <p style={{ marginBottom: "var(--space-4)" }}>
          We enforce a strict server-side serialization policy: private arrival instructions (gate passcodes, slip assignments, and VHF channels)
          are completely excluded from all public listings, search indexes, and unconfirmed bookings.
          They are unlocked to a boater strictly when a reservation is accepted by the dock owner.
        </p>

        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          3. Use and Disclosure of Data
        </h2>
        <p style={{ marginBottom: "var(--space-4)" }}>
          We use your data solely to operate and improve the AnchorDrop marketplace.
          We do not sell personal data or vessel records to data brokers or third-party advertisers.
        </p>

        <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-3)" }}>
          4. Contact Our Privacy Team
        </h2>
        <p>
          For data access or deletion requests, please contact our privacy compliance team at{" "}
          <a href="mailto:privacy@anchordrop.com" style={{ color: "var(--color-gold)", fontWeight: 600 }}>
            privacy@anchordrop.com
          </a>.
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
