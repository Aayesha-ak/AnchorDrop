"use client";

import React, { useState } from "react";
import { BookingStatus, BOOKING_STATUSES } from "@/lib/constants";

export interface ArrivalUnlockDock {
  arrivalInstructions?: string;
  title: string;
  location: string;
  waterway: string;
  dockType?: string;
  maxLengthFt?: number;
  maxBeamFt?: number;
  minDepthFt?: number;
  pricePerDay?: number;
  photos?: string[];
}

export interface ArrivalUnlockPanelProps {
  status: BookingStatus | "cancelled" | string;
  dock: ArrivalUnlockDock;
  bookingId: string;
}

export function ArrivalUnlockPanel({
  status,
  dock,
  bookingId,
}: ArrivalUnlockPanelProps) {
  const [copied, setCopied] = useState(false);

  const isUnlocked =
    status === BOOKING_STATUSES.ACCEPTED ||
    status === BOOKING_STATUSES.COMPLETED;

  const handleCopy = async () => {
    if (!dock?.arrivalInstructions) return;
    try {
      await navigator.clipboard.writeText(dock.arrivalInstructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is unavailable
    }
  };

  // LOCKED STATE (Pending, Rejected, or any non-accepted status)
  if (!isUnlocked) {
    const isRejected = status === BOOKING_STATUSES.REJECTED;

    return (
      <section
        aria-labelledby={`arrival-heading-${bookingId}`}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px dashed var(--color-border-strong)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              lineHeight: 1,
              padding: "var(--space-3)",
              backgroundColor: "var(--color-cream-dark)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            🔒
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "var(--space-2)",
                marginBottom: "var(--space-1)",
              }}
            >
              <h3
                id={`arrival-heading-${bookingId}`}
                style={{
                  fontSize: "var(--font-size-xl)",
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-navy)",
                  margin: 0,
                }}
              >
                Private Arrival Instructions Locked
              </h3>
              <span
                className={isRejected ? "badge badge-rejected" : "badge badge-pending"}
                style={{ textTransform: "capitalize" }}
              >
                {isRejected ? "Request Declined" : "Pending Host Approval"}
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.55,
                marginTop: "var(--space-2)",
                marginBottom: 0,
              }}
            >
              For marina and property security, arrival gate passcodes, lockbox combinations, assigned slip numbers, and VHF radio frequencies remain encrypted until the host officially accepts your reservation request.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // UNLOCKED STATE (Accepted or Completed)
  return (
    <section
      aria-labelledby={`arrival-heading-${bookingId}`}
      className="arrival-unlocked-card"
      style={{
        backgroundColor: "var(--color-white)",
        border: "2px solid var(--color-gold)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        boxShadow: "0 4px 20px rgba(198, 165, 107, 0.18)",
        position: "relative",
        animation: "arrivalPulse 1.2s ease-out 1",
      }}
    >
      <style>{`
        @keyframes arrivalPulse {
          0% {
            transform: scale(0.99);
            box-shadow: 0 0 0 0 rgba(198, 165, 107, 0.6);
          }
          50% {
            transform: scale(1.008);
            box-shadow: 0 0 0 8px rgba(198, 165, 107, 0.2);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(198, 165, 107, 0.18);
          }
        }
      `}</style>

      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div
            style={{
              fontSize: "1.75rem",
              lineHeight: 1,
              padding: "var(--space-2)",
              backgroundColor: "var(--color-success-bg)",
              color: "var(--color-success)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-success-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            🔓
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              <h3
                id={`arrival-heading-${bookingId}`}
                style={{
                  fontSize: "var(--font-size-xl)",
                  fontFamily: "var(--font-serif)",
                  color: "var(--color-navy)",
                  margin: 0,
                }}
              >
                Arrival & Docking Instructions Unlocked
              </h3>
              <span className="badge badge-accepted">
                ✓ Access Granted
              </span>
            </div>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                margin: "var(--space-1) 0 0 0",
              }}
            >
              Private access credentials for {dock?.title || "Reserved Berth"} • {dock?.location || "Private Dock"}
            </p>
          </div>
        </div>

        {dock?.arrivalInstructions && (
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-outline"
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--font-size-xs)",
              borderColor: "var(--color-gold)",
              color: "var(--color-navy)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-1)",
            }}
            aria-label="Copy arrival instructions to clipboard"
          >
            {copied ? "✓ Copied to Clipboard" : "📋 Copy Instructions"}
          </button>
        )}
      </div>

      {/* Main Instructions Callout */}
      <div
        style={{
          backgroundColor: "var(--color-cream-soft)",
          border: "1px solid var(--color-gold-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-5)",
          marginTop: "var(--space-2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            marginBottom: "var(--space-2)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: 700,
              color: "var(--color-gold)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Host Check-in & Security Clearance
          </span>
        </div>

        {dock?.arrivalInstructions ? (
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-primary)",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {dock.arrivalInstructions}
          </div>
        ) : (
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            The host has not entered specific arrival notes yet. Please hail the dockmaster on VHF Channel 16/68 upon waterway approach or message the host.
          </p>
        )}
      </div>

      {/* Navigation & Safety Highlights */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-3)",
          marginTop: "var(--space-4)",
          paddingTop: "var(--space-3)",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
          <strong style={{ color: "var(--color-navy)" }}>Waterway: </strong>
          {dock?.waterway || "Intracoastal Waterway"}
        </div>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
          <strong style={{ color: "var(--color-navy)" }}>VHF Hail: </strong>
          Channel 16 / Channel 68
        </div>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
          <strong style={{ color: "var(--color-navy)" }}>Marina Speed: </strong>
          Idle speed / Strictly No Wake
        </div>
      </div>
    </section>
  );
}

export default ArrivalUnlockPanel;
