"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BerthForm from "@/components/owner/BerthForm";

export default function NewBerthPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect back to inventory with query param or standard route
    router.push("/owner/berths?created=true");
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/owner/berths"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-navy)",
            fontWeight: 500,
          }}
        >
          <span>←</span>
          <span>Back to My Berths</span>
        </Link>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <span style={{ fontSize: "1.5rem" }}>⚓</span>
          <h1 style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-navy)", margin: 0 }}>
            List a New Berth
          </h1>
        </div>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)", margin: 0 }}>
          Publish a marina berth, residential slip, or mooring with dimensional limits, depth clearances, and private arrival gate codes.
        </p>
      </div>

      {/* Form Container */}
      <BerthForm onSuccess={handleSuccess} />
    </div>
  );
}
