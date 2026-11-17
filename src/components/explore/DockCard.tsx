import Link from "next/link";
import Image from "next/image";
import { PublicDock } from "@/lib/serializers";

interface DockCardProps {
  dock: PublicDock;
}

export default function DockCard({ dock }: DockCardProps) {
  const thumbnail =
    dock.photos && dock.photos.length > 0
      ? dock.photos[0]
      : "/images/hero-marina.jpeg";

  return (
    <div
      className="surface-slip-card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Listing Photo */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "190px",
          backgroundColor: "var(--color-navy-dark)",
        }}
      >
        <Image
          src={thumbnail}
          alt={dock.title}
          fill
          sizes="(max-width: 768px) 100vw, 360px"
          style={{ objectFit: "cover" }}
          priority={false}
        />

        {/* Dock Type Badge Overlay */}
        <span
          style={{
            position: "absolute",
            top: "var(--space-3)",
            left: "var(--space-3)",
            backgroundColor: "rgba(11, 31, 51, 0.85)",
            backdropFilter: "blur(4px)",
            color: "var(--color-gold)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            padding: "0.25rem 0.6rem",
            borderRadius: "var(--radius-pill)",
            border: "1px solid rgba(198, 165, 107, 0.4)",
          }}
        >
          {dock.dockType || "Berth"}
        </span>

        {/* Price Tag Overlay */}
        <span
          style={{
            position: "absolute",
            bottom: "var(--space-3)",
            right: "var(--space-3)",
            backgroundColor: "var(--color-navy)",
            color: "var(--color-cream)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 700,
            padding: "0.3rem 0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-gold)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          ${dock.pricePerDay}
          <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 400, color: "rgba(245, 241, 232, 0.7)" }}>
            /day
          </span>
        </span>
      </div>

      {/* Card Content Body */}
      <div
        style={{
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: "var(--font-size-lg)",
            fontFamily: "var(--font-serif)",
            marginBottom: "var(--space-1)",
            lineHeight: "1.3",
          }}
        >
          <Link href={`/docks/${dock.id}`} style={{ color: "var(--color-navy)" }}>
            {dock.title}
          </Link>
        </h3>

        {/* Location / Waterway */}
        <p
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            marginBottom: "var(--space-4)",
          }}
        >
          <span>📍</span>
          <span>
            {dock.location} · <em>{dock.waterway}</em>
          </span>
        </p>

        {/* Dimensional Specifications Pills (Crucial for Boater compatibility) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "var(--space-2)",
            backgroundColor: "var(--color-cream-soft)",
            padding: "var(--space-2) var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border-subtle)",
            marginBottom: "var(--space-4)",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Max LOA
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
              {dock.maxLengthFt}&prime;
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--color-border-subtle)", borderRight: "1px solid var(--color-border-subtle)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Max Beam
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
              {dock.maxBeamFt}&prime;
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Min Depth
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
              {dock.minDepthFt}&prime;
            </div>
          </div>
        </div>

        {/* Amenities Preview */}
        {dock.amenities && dock.amenities.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-1)",
              marginBottom: "var(--space-5)",
            }}
          >
            {dock.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "0.7rem",
                  backgroundColor: "rgba(11, 31, 51, 0.04)",
                  color: "var(--color-navy)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                ✓ {amenity}
              </span>
            ))}
            {dock.amenities.length > 3 && (
              <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", padding: "0.15rem 0.25rem" }}>
                +{dock.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Card CTA */}
        <div style={{ marginTop: "auto" }}>
          <Link
            href={`/docks/${dock.id}`}
            className="btn btn-outline"
            style={{ width: "100%", fontSize: "var(--font-size-xs)", padding: "0.5rem" }}
          >
            View Berth Details & Fit
          </Link>
        </div>
      </div>
    </div>
  );
}
