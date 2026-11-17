import ExploreSection from "@/components/explore/ExploreSection";

export const metadata = {
  title: "Explore Docks & Berths | AnchorDrop",
  description: "Search and compare temporary and overnight boat slips with automated dimensional compatibility checks.",
};

export default function ExplorePage() {
  return (
    <main
      className="container"
      style={{
        paddingTop: "var(--space-10)",
        paddingBottom: "var(--space-16)",
      }}
    >
      <div style={{ marginBottom: "var(--space-8)" }}>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--color-gold)",
            fontWeight: 600,
          }}
        >
          Waterfront Catalog
        </span>
        <h1
          style={{
            fontSize: "var(--font-size-3xl)",
            marginTop: "var(--space-1)",
            marginBottom: "var(--space-2)",
          }}
        >
          Explore Docking Berths
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
          Find private slips and marina berths with verified dimensional clearances.
          Compare length, beam, and low-tide depth before requesting a reservation.
        </p>
      </div>

      <ExploreSection />
    </main>
  );
}
