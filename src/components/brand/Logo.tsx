import Link from "next/link";

interface LogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
}

export default function Logo({
  variant = "dark",
  size = "md",
  withTagline = false,
}: LogoProps) {
  const isLight = variant === "light";
  const textColor = isLight ? "var(--color-cream)" : "var(--color-navy)";
  const iconSize = size === "sm" ? 24 : size === "lg" ? 38 : 30;
  const fontSize = size === "sm" ? "var(--font-size-lg)" : size === "lg" ? "var(--font-size-3xl)" : "var(--font-size-2xl)";

  return (
    <Link
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        textDecoration: "none",
      }}
      aria-label="AnchorDrop — Home"
    >
      {/* Maritime Brand Anchor Mark */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: iconSize + 10,
          height: iconSize + 10,
          borderRadius: "var(--radius-pill)",
          backgroundColor: isLight ? "rgba(198, 165, 107, 0.15)" : "rgba(11, 31, 51, 0.06)",
          border: "1px solid var(--color-gold)",
          color: "var(--color-gold)",
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized Nautical Anchor */}
          <circle cx="12" cy="5" r="2.5" />
          <line x1="12" y1="7.5" x2="12" y2="21" />
          <line x1="6" y1="11" x2="18" y2="11" />
          <path d="M4 17a8 8 0 0 0 16 0" />
        </svg>
      </span>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: fontSize,
            fontWeight: "var(--font-weight-regular)",
            color: textColor,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          Anchor<span style={{ color: "var(--color-gold)" }}>Drop</span>
        </span>
        {withTagline && (
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: isLight ? "rgba(245, 241, 232, 0.7)" : "var(--color-text-secondary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            Discover. Dock. Unwind.
          </span>
        )}
      </div>
    </Link>
  );
}
