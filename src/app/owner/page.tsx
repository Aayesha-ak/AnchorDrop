"use client";

import Link from "next/link";
export default function OwnerDashboardPage() {

  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h2 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-2)" }}>
          Harbor Operations Overview
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Manage your docking berths, review reservation requests with full vessel specifications, and monitor today&apos;s arrivals.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {/* My Berths Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>⚓</div>
          <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Berth Inventory
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Publish and manage slips with dimensional limits, low-tide depth, pricing, amenities, and secure arrival codes.
          </p>
          <Link href="/owner/berths" className="btn btn-primary" style={{ width: "100%" }}>
            Manage Berths
          </Link>
        </div>

        {/* Requests & Approvals Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>📥</div>
          <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Incoming Requests
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Review pending requests with vessel specifications (LOA, beam, draft) and one-click accept or reject decisions.
          </p>
          <Link href="/owner/requests" className="btn btn-navy" style={{ width: "100%" }}>
            Review Requests
          </Link>
        </div>

        {/* Arrivals & Delay Alerts Card */}
        <div className="surface-slip-card">
          <div style={{ fontSize: "1.75rem", marginBottom: "var(--space-2)" }}>🚢</div>
          <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            Arrivals & Delays
          </h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            Day-of operations board tracking today&apos;s confirmed boaters and live ETA delay notifications.
          </p>
          <Link href="/owner/arrivals" className="btn btn-outline" style={{ width: "100%" }}>
            Arrivals Monitor
          </Link>
        </div>
      </div>
    </div>
  );
}
