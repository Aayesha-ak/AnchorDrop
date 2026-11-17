"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RegisterForm from "@/components/auth/RegisterForm";
import { USER_ROLES, UserRole } from "@/lib/constants";

function RegisterContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const defaultRole: UserRole =
    roleParam === USER_ROLES.DOCK_OWNER ? USER_ROLES.DOCK_OWNER : USER_ROLES.BOATER;

  return (
    <div
      className="surface-slip-card"
      style={{
        width: "100%",
        maxWidth: "480px",
        padding: "var(--space-8)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--font-size-3xl)", marginBottom: "var(--space-2)" }}>
          Join AnchorDrop
        </h1>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
          {defaultRole === USER_ROLES.DOCK_OWNER
            ? "Monetize your vacant berths and slips"
            : "Discover and reserve temporary docking spaces"}
        </p>
      </div>

      <RegisterForm defaultRole={defaultRole} />

      <div
        style={{
          textAlign: "center",
          marginTop: "var(--space-6)",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid var(--color-border-subtle)",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-secondary)",
        }}
      >
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--color-gold)", fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
      <Suspense fallback={<div>Loading registration...</div>}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}
