"use client";

import Link from "next/link";

interface HeroProps {
  onListBerthClick?: () => void;
}

export default function Hero({ onListBerthClick }: HeroProps) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "calc(100vh - var(--header-height))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundImage: "url('/images/hero-marina.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        backgroundRepeat: "no-repeat",
        color: "var(--color-cream)",
        overflow: "hidden",
      }}
    >
      {/* Deep Navy Gradient Overlay for high contrast & luxury feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(11, 31, 51, 0.72) 0%, rgba(11, 31, 51, 0.85) 60%, rgba(11, 31, 51, 0.95) 100%)",
          zIndex: 1,
        }}
      />

      {/* Hero Content Container (First Viewport: Brand, Headline, Tagline, Subtitle, CTAs ONLY) */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          paddingTop: "var(--space-12)",
          paddingBottom: "var(--space-12)",
          maxWidth: "860px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: "heroEntrance var(--motion-duration-smooth) var(--motion-ease-out)",
        }}
      >
        {/* Maritime Anchor Icon Accent */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: "rgba(198, 165, 107, 0.15)",
            border: "1px solid var(--color-gold)",
            color: "var(--color-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            marginBottom: "var(--space-4)",
          }}
          aria-hidden="true"
        >
          ⚓
        </div>

        {/* Brand Pre-title */}
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--color-gold)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--space-3)",
          }}
        >
          AnchorDrop
        </span>

        {/* Primary Headline */}
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
            fontWeight: "var(--font-weight-regular)",
            lineHeight: "1.15",
            color: "var(--color-cream)",
            marginBottom: "var(--space-3)",
            textShadow: "0 2px 10px rgba(6, 17, 28, 0.5)",
          }}
        >
          Your Place on the Water!
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            color: "var(--color-gold)",
            marginBottom: "var(--space-4)",
            letterSpacing: "0.02em",
          }}
        >
          Discover. Dock. Unwind.
        </p>

        {/* Concise Value Proposition Support Line */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "rgba(245, 241, 232, 0.88)",
            maxWidth: "600px",
            lineHeight: "1.6",
            marginBottom: "var(--space-8)",
          }}
        >
          A simpler way to discover, reserve, and offer temporary boat docking spaces.
          Connecting boaters with compatible slips and marina berths with confidence.
        </p>

        {/* Action Button Group Only (Sub-phase 12.1 & 12.2: strictly no cards or stat chips in first viewport) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            justifyContent: "center",
          }}
        >
          <Link
            href="/#explore"
            className="btn btn-primary"
            style={{
              padding: "var(--space-4) var(--space-8)",
              fontSize: "var(--font-size-base)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            Find a Dock
          </Link>

          {onListBerthClick ? (
            <button
              onClick={onListBerthClick}
              className="btn btn-outline-gold"
              style={{
                padding: "var(--space-4) var(--space-8)",
                fontSize: "var(--font-size-base)",
                backgroundColor: "rgba(11, 31, 51, 0.4)",
              }}
            >
              List Your Berth
            </button>
          ) : (
            <Link
              href="/register?role=dock_owner"
              className="btn btn-outline-gold"
              style={{
                padding: "var(--space-4) var(--space-8)",
                fontSize: "var(--font-size-base)",
                backgroundColor: "rgba(11, 31, 51, 0.4)",
              }}
            >
              List Your Berth
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes heroEntrance {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .container {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
