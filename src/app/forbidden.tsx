import React from "react";
import Link from "next/link";

export default function Forbidden() {
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
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
          padding: "var(--space-12, 48px) var(--space-8, 32px)",
          boxShadow: "var(--shadow-lg, 0 10px 28px rgba(11, 31, 51, 0.12))",
          borderRadius: "var(--radius-lg, 12px)",
          backgroundColor: "var(--color-white, #FFFFFF)",
        }}
      >
        {/* Maritime Restricted Access Badge */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-pill, 9999px)",
            backgroundColor: "var(--color-warning-bg, #FEF7EA)",
            border: "2px solid var(--color-warning-border, #F3CF8F)",
            color: "var(--color-warning, #B87304)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto var(--space-4, 16px)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <span
          style={{
            fontSize: "var(--font-size-xs, 0.75rem)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--color-warning, #B87304)",
            fontWeight: "var(--font-weight-semibold, 600)",
          }}
        >
          AnchorDrop Security • Code 403
        </span>

        <h1
          style={{
            fontSize: "var(--font-size-3xl, 1.875rem)",
            marginTop: "var(--space-2, 8px)",
            marginBottom: "var(--space-2, 8px)",
            fontFamily: "var(--font-serif)",
            color: "var(--color-navy, #0B1F33)",
          }}
        >
          403 — Restricted Anchorage
        </h1>

        <p
          style={{
            color: "var(--color-text-secondary, #4A5B6B)",
            fontSize: "var(--font-size-base, 1rem)",
            lineHeight: "1.6",
            marginBottom: "var(--space-8, 32px)",
          }}
        >
          You do not possess the required maritime credentials or permissions to navigate
          this channel or berth. This zone is strictly reserved for authorized manifests.
        </p>

        <div style={{ display: "flex", gap: "var(--space-3, 12px)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            Return to Safe Harbor
          </Link>
          <Link href="/login" className="btn btn-outline">
            Sign In with Authorized Role
          </Link>
        </div>
      </div>
    </main>
  );
}
