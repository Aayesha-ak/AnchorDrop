"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BerthForm, { BerthFormData } from "@/components/owner/BerthForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBerthPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [dock, setDock] = useState<Partial<BerthFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDock() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/docks/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.message || "Failed to load dock listing");
        }

        if (isMounted) {
          const d = data.dock;
          setDock({
            id: d.id || d._id,
            title: d.title,
            location: d.location,
            waterway: d.waterway,
            dockType: d.dockType,
            photoUrl: d.photos && d.photos.length > 0 ? d.photos[0] : "/images/hero-marina.jpeg",
            maxLengthFt: d.maxLengthFt,
            maxBeamFt: d.maxBeamFt,
            minDepthFt: d.minDepthFt,
            pricePerDay: d.pricePerDay,
            amenities: d.amenities || [],
            availabilityNotes: d.availabilityNotes || "",
            arrivalInstructions: d.arrivalInstructions || "",
            isActive: d.isActive !== undefined ? d.isActive : true,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error loading listing");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchDock();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSuccess = () => {
    router.push("/owner/berths?updated=true");
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
          <span style={{ fontSize: "1.5rem" }}>✏️</span>
          <h1 style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-navy)", margin: 0 }}>
            Edit Berth Listing
          </h1>
        </div>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)", margin: 0 }}>
          Update clearance dimensions, pricing, amenities, or revise encrypted arrival directions.
        </p>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div
          className="surface-slip-card"
          style={{
            padding: "var(--space-12)",
            textAlign: "center",
            color: "var(--color-text-secondary)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: "2rem",
              height: "2rem",
              border: "3px solid var(--color-gold)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginBottom: "var(--space-4)",
            }}
          />
          <p style={{ margin: 0 }}>Loading berth specifications...</p>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}

      {error && !loading && (
        <div
          className="surface-slip-card"
          style={{
            padding: "var(--space-8)",
            textAlign: "center",
            borderColor: "var(--color-danger-border)",
            backgroundColor: "var(--color-danger-bg)",
          }}
        >
          <span style={{ fontSize: "2rem", display: "block", marginBottom: "var(--space-2)" }}>⚠️</span>
          <h2 style={{ fontSize: "var(--font-size-xl)", color: "var(--color-danger)", marginBottom: "var(--space-2)" }}>
            Unable to load berth listing
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            {error}
          </p>
          <Link href="/owner/berths" className="btn btn-navy">
            Return to Inventory
          </Link>
        </div>
      )}

      {/* Form Container */}
      {!loading && !error && dock && (
        <BerthForm
          initialData={dock}
          isEdit={true}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
