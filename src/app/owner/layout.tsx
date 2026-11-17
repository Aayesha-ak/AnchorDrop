"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/owner");
      } else if (user.role !== USER_ROLES.DOCK_OWNER) {
        router.push(`/unauthorized?required=${USER_ROLES.DOCK_OWNER}`);
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== USER_ROLES.DOCK_OWNER) {
    return (
      <div
        className="container"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ fontSize: "2rem" }}>🏡</div>
        <p style={{ color: "var(--color-text-secondary)" }}>Verifying dock owner authorization...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-cream)", minHeight: "calc(100vh - var(--header-height))" }}>
      {/* Owner Dashboard Sub-Header */}
      <div
        style={{
          backgroundColor: "var(--color-navy)",
          color: "var(--color-cream)",
          padding: "var(--space-6) 0",
          borderBottom: "1px solid rgba(198, 165, 107, 0.3)",
        }}
      >
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
              <span style={{ fontSize: "1.25rem" }}>🏡</span>
              <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-gold)" }}>
                Host & Marina Command Center
              </span>
            </div>
            <h1 style={{ color: "var(--color-cream)", fontSize: "var(--font-size-2xl)" }}>
              {user.name}
            </h1>
          </div>

          {/* Quick Sub-Nav */}
          <nav style={{ display: "flex", gap: "var(--space-2)" }}>
            <Link
              href="/owner/berths"
              className="btn btn-outline-gold"
              style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
            >
              My Berths
            </Link>
            <Link
              href="/owner/requests"
              className="btn btn-outline-gold"
              style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
            >
              Requests & Approvals
            </Link>
            <Link
              href="/owner/arrivals"
              className="btn btn-outline-gold"
              style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
            >
              Arrivals & Delays
            </Link>
          </nav>
        </div>
      </div>

      <main className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
        {children}
      </main>
    </div>
  );
}
