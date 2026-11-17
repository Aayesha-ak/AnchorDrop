import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function Footer() {
  return (
    <footer className="surface-harbor-night" style={{ marginTop: "auto", borderTop: "1px solid rgba(198, 165, 107, 0.2)" }}>
      <div className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-8)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-8)",
            marginBottom: "var(--space-12)",
          }}
        >
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Logo variant="light" size="md" withTagline={true} />
            <p style={{ fontSize: "var(--font-size-sm)", color: "rgba(245, 241, 232, 0.75)", maxWidth: "320px", marginTop: "var(--space-2)" }}>
              The premium two-sided marine marketplace connecting boaters with verified, dimensionally compatible docking spaces and private slips.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 style={{ color: "var(--color-gold)", fontSize: "var(--font-size-base)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-4)" }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <li>
                <Link href="/#explore" style={{ fontSize: "var(--font-size-sm)" }}>
                  Explore Docks
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" style={{ fontSize: "var(--font-size-sm)" }}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/register?role=boater" style={{ fontSize: "var(--font-size-sm)" }}>
                  Boater Registration
                </Link>
              </li>
              <li>
                <Link href="/register?role=dock_owner" style={{ fontSize: "var(--font-size-sm)" }}>
                  List a Private Berth
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboards Column */}
          <div>
            <h4 style={{ color: "var(--color-gold)", fontSize: "var(--font-size-base)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-4)" }}>
              Dashboards
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <li>
                <Link href="/boater" style={{ fontSize: "var(--font-size-sm)" }}>
                  Boater Hub
                </Link>
              </li>
              <li>
                <Link href="/owner" style={{ fontSize: "var(--font-size-sm)" }}>
                  Dock Owner Hub
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ fontSize: "var(--font-size-sm)" }}>
                  Quick-Demo Accounts
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div>
            <h4 style={{ color: "var(--color-gold)", fontSize: "var(--font-size-base)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-4)" }}>
              Trust & Legal
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <li>
                <Link href="/about" style={{ fontSize: "var(--font-size-sm)" }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ fontSize: "var(--font-size-sm)" }}>
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ fontSize: "var(--font-size-sm)" }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" style={{ fontSize: "var(--font-size-sm)" }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid rgba(245, 241, 232, 0.12)",
            paddingTop: "var(--space-6)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-4)",
            fontSize: "var(--font-size-xs)",
            color: "rgba(245, 241, 232, 0.6)",
          }}
        >
          <p style={{ margin: 0 }}>
            © 2026 AnchorDrop. All rights reserved. Your Place on the Water!
          </p>
          <p style={{ margin: 0, fontStyle: "italic" }}>
            Preliminary dimensional compatibility checks do not replace navigational safety or maritime charts.
          </p>
        </div>
      </div>
    </footer>
  );
}
