"use client";

import { useState } from "react";
import Link from "next/link";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"boater" | "owner">("boater");

  const boaterSteps = [
    {
      num: "01",
      title: "Profile Your Vessel",
      desc: "Save your boat dimensions once — Length Overall (LOA), beam width, and draft depth — to ensure accurate slip fitting.",
      icon: "🛥️",
    },
    {
      num: "02",
      title: "Discover & Check Fit",
      desc: "Explore public berths with multi-parameter filters. Automated compatibility checks flag length, beam, and depth clearance before you request.",
      icon: "📐",
    },
    {
      num: "03",
      title: "Submit Reservation",
      desc: "Select dates, provide optional arrival notes, and send a reservation request directly to the private host or marina operator.",
      icon: "📅",
    },
    {
      num: "04",
      title: "Unlock Arrival Details",
      desc: "Upon owner acceptance, private arrival access details — gate codes, slip numbers, and VHF radio channels — are unlocked immediately.",
      icon: "🔓",
    },
    {
      num: "05",
      title: "Report Delays in Real Time",
      desc: "Encounter headwinds or tide changes? Submit an updated ETA through your trip tracker so the host is notified without phone tag.",
      icon: "⏱️",
    },
  ];

  const ownerSteps = [
    {
      num: "01",
      title: "List Your Berths",
      desc: "Publish your private residential slip or marina berths with maximum length, beam, minimum low-tide depth, rates, and amenities.",
      icon: "⚓",
    },
    {
      num: "02",
      title: "Set Private Arrival Notes",
      desc: "Store sensitive gate passcodes, lockbox combinations, and VHF channels securely. They are never shown publicly on search results.",
      icon: "🛡️",
    },
    {
      num: "03",
      title: "Review Guest Vessel Specs",
      desc: "Receive incoming booking requests with complete vessel specifications to confirm compatibility before granting slip access.",
      icon: "📋",
    },
    {
      num: "04",
      title: "One-Click Accept or Reject",
      desc: "Accept reservations with a single click. Arrival instructions automatically unlock for the guest only after confirmation.",
      icon: "✓",
    },
    {
      num: "05",
      title: "Arrival Operations & Alerts",
      desc: "Monitor today's expected boaters, view check-in timelines, and receive visual alerts if an incoming boater reports a voyage delay.",
      icon: "🚢",
    },
  ];

  const steps = activeTab === "boater" ? boaterSteps : ownerSteps;

  return (
    <section
      id="how-it-works"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-16)",
        backgroundColor: "var(--color-cream)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto var(--space-8)" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              color: "var(--color-gold)",
              fontSize: "var(--font-size-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: "var(--font-weight-semibold)",
              marginBottom: "var(--space-2)",
            }}
          >
            <span>⚓</span>
            <span>How AnchorDrop Works</span>
          </div>
          <h2 style={{ fontSize: "var(--font-size-3xl)", marginBottom: "var(--space-3)" }}>
            A Seamless Experience on Both Sides of the Berth
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
            Purpose-built marine workflows ensuring compatible fits, transparent pricing, and secure arrival coordination.
          </p>

          {/* Interactive Role Switcher Toggle (Sub-phase 12.4) */}
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "var(--color-white)",
              padding: "4px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
              marginTop: "var(--space-4)",
            }}
          >
            <button
              onClick={() => setActiveTab("boater")}
              style={{
                padding: "var(--space-2) var(--space-6)",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--font-size-sm)",
                fontWeight: activeTab === "boater" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                backgroundColor: activeTab === "boater" ? "var(--color-navy)" : "transparent",
                color: activeTab === "boater" ? "var(--color-cream)" : "var(--color-navy)",
                transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
              }}
            >
              🛥️ For Boaters
            </button>
            <button
              onClick={() => setActiveTab("owner")}
              style={{
                padding: "var(--space-2) var(--space-6)",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--font-size-sm)",
                fontWeight: activeTab === "owner" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                backgroundColor: activeTab === "owner" ? "var(--color-navy)" : "transparent",
                color: activeTab === "owner" ? "var(--color-cream)" : "var(--color-navy)",
                transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
              }}
            >
              🏡 For Dock Owners
            </button>
          </div>
        </div>

        {/* Step Sequence Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-4)",
            marginBottom: "var(--space-12)",
          }}
        >
          {steps.map((step) => (
            <div
              key={step.num}
              className="surface-slip-card"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-3)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--font-size-xl)",
                    color: "var(--color-gold)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  {step.num}
                </span>
                <span style={{ fontSize: "1.75rem" }}>{step.icon}</span>
              </div>
              <h3 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-2)" }}>
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-text-secondary)",
                  lineHeight: "1.5",
                  marginTop: "auto",
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Dynamic CTA Banner */}
        <div
          className="surface-harbor-night"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-8) var(--space-6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-4)",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid rgba(198, 165, 107, 0.3)",
          }}
        >
          <h3 style={{ fontSize: "var(--font-size-2xl)", color: "var(--color-cream)" }}>
            {activeTab === "boater"
              ? "Ready to find your next place on the water?"
              : "Monetize your vacant dock or private slip today"}
          </h3>
          <p style={{ color: "rgba(245, 241, 232, 0.8)", maxWidth: "560px", fontSize: "var(--font-size-sm)" }}>
            {activeTab === "boater"
              ? "Create your vessel profile in minutes and discover verified berths along coastal waterways."
              : "List your berth with custom dimensions, pricing, and automated booking approvals."}
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href={activeTab === "boater" ? "/register?role=boater" : "/register?role=dock_owner"}
              className="btn btn-primary"
            >
              {activeTab === "boater" ? "Register as Boater" : "List Your Berth"}
            </Link>
            <Link href="/login" className="btn btn-outline-gold">
              Try Seeded Demo Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
