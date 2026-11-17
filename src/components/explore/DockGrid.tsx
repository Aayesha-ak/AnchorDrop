import { PublicDock } from "@/lib/serializers";
import DockCard from "./DockCard";

interface DockGridProps {
  docks: PublicDock[];
  loading?: boolean;
  onClearFilters?: () => void;
}

export default function DockGrid({
  docks,
  loading = false,
  onClearFilters,
}: DockGridProps) {
  // Loading Skeletons (Sub-phase 13.8)
  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="surface-slip-card"
            style={{
              padding: 0,
              overflow: "hidden",
              minHeight: "360px",
              opacity: 0.65,
              animation: "skeletonPulse 1.5s ease-in-out infinite",
            }}
          >
            <div style={{ height: "190px", backgroundColor: "var(--color-cream-dark)" }} />
            <div style={{ padding: "var(--space-5)" }}>
              <div
                style={{
                  height: "22px",
                  backgroundColor: "var(--color-cream-dark)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "var(--space-2)",
                  width: "80%",
                }}
              />
              <div
                style={{
                  height: "14px",
                  backgroundColor: "var(--color-cream-dark)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "var(--space-4)",
                  width: "50%",
                }}
              />
              <div
                style={{
                  height: "44px",
                  backgroundColor: "var(--color-cream-soft)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "var(--space-4)",
                }}
              />
              <div
                style={{
                  height: "36px",
                  backgroundColor: "var(--color-cream-dark)",
                  borderRadius: "var(--radius-md)",
                }}
              />
            </div>
          </div>
        ))}

        <style jsx>{`
          @keyframes skeletonPulse {
            0% { opacity: 0.5; }
            50% { opacity: 0.85; }
            100% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // Empty State (Sub-phase 13.3)
  if (docks.length === 0) {
    return (
      <div
        className="surface-slip-card"
        style={{
          textAlign: "center",
          padding: "var(--space-12) var(--space-6)",
          maxWidth: "580px",
          margin: "var(--space-8) auto",
          border: "1px dashed var(--color-border)",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>⚓</div>
        <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
          No Matching Berths Found
        </h3>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", lineHeight: "1.6", marginBottom: "var(--space-6)" }}>
          We couldn&apos;t find any docking berths matching your exact filter criteria.
          Try increasing the allowed maximum length, reducing the minimum depth clearance, or clearing your location search.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="btn btn-primary"
            style={{ padding: "var(--space-3) var(--space-6)" }}
          >
            Clear All Filters & Show All Berths
          </button>
        )}
      </div>
    );
  }

  // Soft results transition & staggered grid (Sub-phase 13.4)
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
        gap: "var(--space-6)",
        animation: "gridFadeIn var(--motion-duration-smooth) var(--motion-ease-out)",
      }}
    >
      {docks.map((dock) => (
        <DockCard key={dock.id} dock={dock} />
      ))}

      <style jsx>{`
        @keyframes gridFadeIn {
          from {
            opacity: 0.2;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
