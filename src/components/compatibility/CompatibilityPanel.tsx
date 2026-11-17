"use client";

import React from "react";
import type { CompatibilityResult, ConstraintCheck } from "@/services/compatibility.service";

export interface CompatibilityPanelProps {
  result: CompatibilityResult | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

interface ConstraintRowProps {
  label: string;
  sublabel: string;
  check: ConstraintCheck;
  limitLabel: string;
}

function ConstraintRow({ label, sublabel, check, limitLabel }: ConstraintRowProps) {
  const isPass = check.passes;
  const absDiff = Math.abs(check.diff);
  const diffText = isPass
    ? `+${absDiff} ft clearance`
    : `-${absDiff} ft exceedance`;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr 1fr 90px",
        alignItems: "center",
        padding: "var(--space-3) var(--space-4)",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontSize: "var(--font-size-sm)",
        transition: "background-color 0.2s ease",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, color: "var(--color-navy)" }}>{label}</div>
        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          {sublabel}
        </div>
      </div>

      <div style={{ color: "var(--color-text-primary)" }}>
        <span style={{ fontWeight: 600 }}>{check.vesselValue}</span>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginLeft: "2px" }}>
          ft
        </span>
      </div>

      <div style={{ color: "var(--color-text-secondary)" }}>
        <span style={{ fontWeight: 500 }}>{check.dockLimit}</span>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginLeft: "4px" }}>
          {limitLabel}
        </span>
      </div>

      <div
        style={{
          fontSize: "var(--font-size-xs)",
          fontWeight: 600,
          color: isPass ? "var(--color-success)" : "var(--color-danger)",
        }}
      >
        {diffText}
      </div>

      <div style={{ textAlign: "right" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            backgroundColor: isPass ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            color: isPass ? "var(--color-success)" : "var(--color-danger)",
            border: `1px solid ${isPass ? "var(--color-success-border)" : "var(--color-danger-border)"}`,
          }}
        >
          {isPass ? "✓ Pass" : "✕ Exceeds"}
        </span>
      </div>
    </div>
  );
}

export default function CompatibilityPanel({
  result,
  loading = false,
  error = null,
  className = "",
}: CompatibilityPanelProps) {
  // 1. Loading State
  if (loading) {
    return (
      <div
        className={className}
        style={{
          padding: "var(--space-6)",
          backgroundColor: "var(--color-white)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-3)",
          minHeight: "180px",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-busy="true"
        aria-label="Checking dimensional compatibility"
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--color-border-subtle)",
            borderTopColor: "var(--color-gold)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          Checking vessel and berth compatibility...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div
        className={className}
        role="alert"
        style={{
          padding: "var(--space-4)",
          backgroundColor: "var(--color-danger-bg)",
          border: "1px solid var(--color-danger-border)",
          borderRadius: "8px",
          color: "var(--color-danger)",
          fontSize: "var(--font-size-sm)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>⚠️</span>
        <div>
          <strong>Compatibility Evaluation Error:</strong> {error}
        </div>
      </div>
    );
  }

  // 3. Empty State (No result provided yet)
  if (!result) {
    return (
      <div
        className={className}
        style={{
          padding: "var(--space-6)",
          backgroundColor: "var(--color-cream-soft, #FAF8F4)",
          border: "1px dashed var(--color-border)",
          borderRadius: "8px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-2)" }}>📏</div>
        Select a vessel to evaluate dimensional fit against this berth.
      </div>
    );
  }

  const isCompatible = result.compatible;

  return (
    <section
      className={className}
      aria-label="Vessel Berth Dimensional Compatibility Results"
      style={{
        backgroundColor: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(11, 31, 51, 0.04)",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        animation: "fadeInCompatibility 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeInCompatibility {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Sub-phase 15.5: Overall Status Banner */}
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          backgroundColor: isCompatible
            ? "var(--color-success-bg, #E8F5EF)"
            : "var(--color-danger-bg, #FDECEB)",
          borderBottom: `1px solid ${
            isCompatible
              ? "var(--color-success-border, #A3D8BD)"
              : "var(--color-danger-border, #F6A5A1)"
          }`,
          color: isCompatible
            ? "var(--color-success, #1B7A4E)"
            : "var(--color-danger, #B3261E)",
        }}
      >
        <span
          style={{
            fontSize: "1.3rem",
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {isCompatible ? "✓" : "⚠️"}
        </span>
        <div style={{ fontWeight: 600, fontSize: "var(--font-size-base)" }}>
          {isCompatible
            ? "✓ Preliminary Fit Confirmed: Vessel specifications are within dock operational limits."
            : "⚠️ Dimensional Exceedance: Vessel exceeds one or more dock dimensional parameters."}
        </div>
      </div>

      {/* Sub-phase 15.5: Breakdown Table Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr 1fr 90px",
          padding: "var(--space-2) var(--space-4)",
          backgroundColor: "var(--color-cream)",
          borderBottom: "1px solid var(--color-border-subtle)",
          fontSize: "var(--font-size-xs)",
          fontWeight: 700,
          color: "var(--color-text-secondary)",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        <div>Parameter</div>
        <div>Vessel</div>
        <div>Berth Limit</div>
        <div>Clearance</div>
        <div style={{ textAlign: "right" }}>Status</div>
      </div>

      {/* Sub-phase 15.5: Constraint Rows */}
      <div>
        <ConstraintRow
          label="Length Overall (LOA)"
          sublabel="Bow to stern length"
          check={result.constraints.length}
          limitLabel="max"
        />

        <ConstraintRow
          label="Beam Width"
          sublabel="Widest point measurement"
          check={result.constraints.beam}
          limitLabel="max"
        />

        <ConstraintRow
          label="Low-Tide Draft"
          sublabel="Water depth clearance"
          check={result.constraints.draft}
          limitLabel="min depth"
        />
      </div>

      {/* Sub-phase 15.7: Product safety disclaimer */}
      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
          backgroundColor: "var(--color-cream-soft, #FAF8F4)",
          display: "flex",
          alignItems: "flex-start",
          gap: "var(--space-2)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-secondary)",
          lineHeight: "1.45",
        }}
      >
        <span style={{ fontSize: "0.95rem", lineHeight: 1.2, flexShrink: 0 }} aria-hidden="true">
          ⚓
        </span>
        <div>
          <strong style={{ color: "var(--color-navy)" }}>Advisory: </strong>
          {result.disclaimer}
        </div>
      </div>
    </section>
  );
}
