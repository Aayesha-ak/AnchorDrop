"use client";

import Link from "next/link";
export default function BoaterDashboardPage() {

  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-2)" }}>
          Voyage Overview
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Discover berths dimensionally fitted for your boat, review pending requests, and access unlocked arrival gate codes.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {/* Explore & Book Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>🌊</div>
          <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Explore & Book Berths
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Search docks with multi-parameter filters and run automated length, beam, and draft compatibility checks.
          </p>
          <Link href="/#explore" className="btn btn-primary" style={{ width: "100%" }}>
            Browse Dock Inventory
          </Link>
        </div>

        {/* My Vessels Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>🛥️</div>
          <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Vessel Profiles
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Manage your boat specifications (LOA, beam, draft) used to verify fit before requesting slips.
          </p>
          <Link href="/boater/vessels" className="btn btn-navy" style={{ width: "100%" }}>
            Manage Vessels
          </Link>
        </div>

        {/* Trips & Status Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>📅</div>
          <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Active Trips & Stays
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Track pending requests, view private arrival instructions after acceptance, and report ETA delays.
          </p>
          <Link href="/boater/trips" className="btn btn-outline" style={{ width: "100%" }}>
            View Trip Statuses
          </Link>
        </div>
      </div>
    </div>
  );
}
