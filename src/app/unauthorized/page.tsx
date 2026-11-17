"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const required = searchParams.get("required");
  const { user } = useAuth();

  const requiredLabel =
    required === USER_ROLES.DOCK_OWNER ? "Dock Owner" : "Boater";

  const userDashboard =
    user?.role === USER_ROLES.DOCK_OWNER ? "/owner" : "/boater";
  const userRoleLabel =
    user?.role === USER_ROLES.DOCK_OWNER ? "Dock Owner" : "Boater";

  return (
    <div
      className="surface-slip-card"
      style={{
        maxWidth: "520px",
        textAlign: "center",
        padding: "var(--space-12) var(--space-8)",
        margin: "auto",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "var(--radius-pill)",
          backgroundColor: "var(--color-warning-bg)",
          color: "var(--color-warning)",
          border: "2px solid var(--color-warning-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          margin: "0 auto var(--space-4)",
        }}
      >
        🔒
      </div>

      <h1 style={{ fontSize: "var(--font-size-3xl)", marginBottom: "var(--space-2)" }}>
        Restricted Area
      </h1>

      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
        This section is reserved exclusively for registered <strong>{requiredLabel}</strong> accounts.
        {user && (
          <span style={{ display: "block", marginTop: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>
            You are currently signed in as <strong>{user.name}</strong> ({userRoleLabel}).
          </span>
        )}
      </p>

      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
        {user ? (
          <Link href={userDashboard} className="btn btn-primary">
            Go to My {userRoleLabel} Dashboard
          </Link>
        ) : (
          <Link href="/login" className="btn btn-primary">
            Sign In with Required Role
          </Link>
        )}
        <Link href="/" className="btn btn-outline">
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <main
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - var(--header-height) - 100px)",
        paddingTop: "var(--space-8)",
        paddingBottom: "var(--space-8)",
      }}
    >
      <Suspense fallback={<div>Loading authorization details...</div>}>
        <UnauthorizedContent />
      </Suspense>
    </main>
  );
}
