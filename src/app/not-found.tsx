import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - var(--header-height) - 120px)",
        paddingTop: "var(--space-12)",
        paddingBottom: "var(--space-12)",
      }}
    >
      <div
        className="surface-slip-card"
        style={{
          maxWidth: "520px",
          textAlign: "center",
          padding: "var(--space-12) var(--space-8)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-pill)",
            backgroundColor: "rgba(11, 31, 51, 0.06)",
            border: "2px solid var(--color-gold)",
            color: "var(--color-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            margin: "0 auto var(--space-4)",
          }}
        >
          ⚓
        </div>

        <span
          style={{
            fontSize: "var(--font-size-xs)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--color-gold)",
            fontWeight: 600,
          }}
        >
          AnchorDrop Navigation
        </span>

        <h1
          style={{
            fontSize: "var(--font-size-4xl)",
            marginTop: "var(--space-2)",
            marginBottom: "var(--space-2)",
            fontFamily: "var(--font-serif)",
          }}
        >
          404 — Waters Unknown
        </h1>

        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-base)",
            lineHeight: "1.6",
            marginBottom: "var(--space-8)",
          }}
        >
          The coordinate or dock you are searching for has drifted off chart.
          Chart a new course back to verified berths or return to our homepage.
        </p>

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">
            Return to Safe Harbor
          </Link>
          <Link href="/#explore" className="btn btn-outline">
            Explore Docks
          </Link>
        </div>
      </div>
    </main>
  );
}
