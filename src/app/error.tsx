"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for diagnostic tracing
    console.error("[AnchorDrop RootError]", error);
  }, [error]);

  return (
    <main
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - var(--header-height, 72px) - 120px)",
        paddingTop: "var(--space-12, 48px)",
        paddingBottom: "var(--space-12, 48px)",
      }}
    >
      <div
        className="surface-slip-card"
        style={{
          maxWidth: "540px",
          width: "100%",
          textAlign: "center",
          padding: "var(--space-12, 48px) var(--space-8, 32px)",
          boxShadow: "var(--shadow-lg, 0 10px 28px rgba(11, 31, 51, 0.12))",
          borderRadius: "var(--radius-lg, 12px)",
          backgroundColor: "var(--color-white, #FFFFFF)",
        }}
      >
        {/* Maritime Disturbance Beacon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-pill, 9999px)",
            backgroundColor: "var(--color-danger-bg, #FDECEB)",
            border: "2px solid var(--color-danger-border, #F6A5A1)",
            color: "var(--color-danger, #B3261E)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4, 16px)",
            fontSize: "1.75rem",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>

        <span
          style={{
            fontSize: "var(--font-size-xs, 0.75rem)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--color-danger, #B3261E)",
            fontWeight: "var(--font-weight-semibold, 600)",
          }}
        >
          Maritime Navigation Exception
        </span>

        <h1
          style={{
            fontSize: "var(--font-size-3xl, 1.875rem)",
            marginTop: "var(--space-2, 8px)",
            marginBottom: "var(--space-3, 12px)",
            fontFamily: "var(--font-serif)",
            color: "var(--color-navy, #0B1F33)",
          }}
        >
          Unexpected Navigation Disturbance
        </h1>

        <p
          style={{
            color: "var(--color-text-secondary, #4A5B6B)",
            fontSize: "var(--font-size-base, 1rem)",
            lineHeight: "1.6",
            marginBottom: "var(--space-6, 24px)",
          }}
        >
          Our navigational instruments encountered unexpected turbulence along this waterway.
          Rest assured, your vessel profile and account credentials remain intact.
        </p>

        {/* Technical Digest / Error Details (if available) */}
        {(error?.message || error?.digest) && (
          <div
            style={{
              padding: "var(--space-3, 12px)",
              backgroundColor: "var(--color-cream-soft, #FAF8F4)",
              border: "1px solid var(--color-border-subtle, rgba(11, 31, 51, 0.08))",
              borderRadius: "var(--radius-md, 8px)",
              fontSize: "var(--font-size-xs, 0.75rem)",
              color: "var(--color-text-muted, #6B7C8D)",
              textAlign: "left",
              fontFamily: "monospace",
              marginBottom: "var(--space-6, 24px)",
              wordBreak: "break-all",
            }}
          >
            {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
            {error.message && <div><strong>Notice:</strong> {error.message}</div>}
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "var(--space-3, 12px)", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-primary"
          >
            Chart Course Again
          </button>

          <Link href="/" className="btn btn-outline">
            Return to Safe Harbor
          </Link>
        </div>
      </div>
    </main>
  );
}
