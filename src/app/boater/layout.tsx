"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";

export default function BoaterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/boater");
      } else if (user.role !== USER_ROLES.BOATER) {
        router.push(`/unauthorized?required=${USER_ROLES.BOATER}`);
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== USER_ROLES.BOATER) {
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
        <div style={{ fontSize: "2rem" }}>⚓</div>
        <p style={{ color: "var(--color-text-secondary)" }}>Verifying boater authorization...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-cream)", minHeight: "calc(100vh - var(--header-height))" }}>
      {/* Boater Dashboard Sub-Header */}
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
              <span style={{ fontSize: "1.25rem" }}>⚓</span>
              <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-gold)" }}>
                Boater Command Center
              </span>
            </div>
            <h1 style={{ color: "var(--color-cream)", fontSize: "var(--font-size-2xl)" }}>
              Welcome aboard, {user.name}
            </h1>
          </div>

          {/* Quick Sub-Nav */}
          <nav style={{ display: "flex", gap: "var(--space-2)" }}>
            <Link
              href="/boater"
              className="btn btn-outline-gold"
              style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
            >
              Explore & Book
            </Link>
            <Link
              href="/boater/vessels"
              className="btn btn-outline-gold"
              style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
            >
              My Vessels
            </Link>
            <Link
              href="/boater/trips"
              className="btn btn-outline-gold"
              style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
            >
              Trips & Status
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
