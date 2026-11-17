"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { PublicDock } from "@/lib/serializers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DockDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [dock, setDock] = useState<PublicDock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDock() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/docks/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Dock berth listing not found");
        }
        if (isMounted) {
          setDock(data.dock);
          if (data.dock?.photos && data.dock.photos.length > 0) {
            setSelectedPhoto(data.dock.photos[0]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load listing");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) {
      loadDock();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }}>
        {/* Back Link Skeleton */}
        <div style={{ height: "1.2rem", width: "120px", backgroundColor: "#e2e8f0", borderRadius: "4px", marginBottom: "var(--space-6)" }} />

        {/* Hero Gallery Skeleton */}
        <div
          style={{
            height: "360px",
            backgroundColor: "#e2e8f0",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-8)",
            animation: "pulse 1.5s infinite ease-in-out",
          }}
        />

        {/* Two-Column Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ height: "2rem", width: "60%", backgroundColor: "#e2e8f0", borderRadius: "4px" }} />
            <div style={{ height: "1.2rem", width: "40%", backgroundColor: "#e2e8f0", borderRadius: "4px" }} />
            <div style={{ height: "120px", backgroundColor: "#e2e8f0", borderRadius: "var(--radius-md)" }} />
          </div>
        </div>
      </main>
    );
  }

  if (error || !dock) {
    return (
      <main className="container" style={{ paddingTop: "var(--space-12)", paddingBottom: "var(--space-16)", textAlign: "center" }}>
        <div
          className="surface-slip-card"
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "var(--space-10) var(--space-6)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>⚓</div>
          <h1 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-2)" }}>
            Berth Listing Not Found
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
            {error || "The requested dock listing may have been deactivated or removed by the host."}
          </p>
          <Link href="/explore" className="btn btn-primary">
            ← Return to Dock Catalog
          </Link>
        </div>
      </main>
    );
  }

  const mainPhoto = selectedPhoto || (dock.photos && dock.photos.length > 0 ? dock.photos[0] : "/images/hero-marina.jpeg");

  return (
    <main
      className="container"
      style={{
        paddingTop: "var(--space-6)",
        paddingBottom: "var(--space-16)",
      }}
    >
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link
          href="/explore"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-1)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ← Back to All Docks & Slips
        </Link>
      </div>

      {/* Header Info */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-2)" }}>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-navy)",
              backgroundColor: "rgba(11, 31, 51, 0.08)",
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-pill)",
              fontWeight: 600,
            }}
          >
            {dock.dockType || "Private Slip"}
          </span>
          <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            📍 {dock.waterway || dock.location}
          </span>
        </div>
        <h1 style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-navy)", marginBottom: "var(--space-1)" }}>
          {dock.title}
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)" }}>
          {dock.location}
        </p>
      </div>

      {/* Gallery Showcase */}
      <section style={{ marginBottom: "var(--space-8)" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "400px",
            maxHeight: "55vh",
            backgroundColor: "var(--color-navy-dark)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <Image
            src={mainPhoto}
            alt={dock.title}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Thumbnail Selector */}
        {dock.photos && dock.photos.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              marginTop: "var(--space-3)",
              overflowX: "auto",
              paddingBottom: "var(--space-1)",
            }}
          >
            {dock.photos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  position: "relative",
                  width: "80px",
                  height: "56px",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  border: selectedPhoto === photo ? "2px solid var(--color-gold)" : "1px solid var(--color-border-subtle)",
                  padding: 0,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={photo}
                  alt={`${dock.title} thumb ${idx + 1}`}
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Two-Column Detail Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-8)",
          alignItems: "start",
        }}
      >
        {/* Left Column: Specifications & Description */}
        <div>
          {/* Key Marine Specs Banner */}
          <div
            className="surface-slip-card"
            style={{
              marginBottom: "var(--space-6)",
              backgroundColor: "var(--color-cream)",
              border: "1px solid var(--color-gold-border)",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-base)", color: "var(--color-navy)", marginBottom: "var(--space-4)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              📐 Dimensional Clearances
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "var(--space-4)",
                textAlign: "center",
              }}
            >
              <div style={{ padding: "var(--space-3)", backgroundColor: "var(--color-white)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
                  Max LOA
                </div>
                <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: "var(--color-navy)", marginTop: "var(--space-1)" }}>
                  {dock.maxLengthFt}&prime;
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Length Overall
                </div>
              </div>

              <div style={{ padding: "var(--space-3)", backgroundColor: "var(--color-white)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
                  Max Beam
                </div>
                <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: "var(--color-navy)", marginTop: "var(--space-1)" }}>
                  {dock.maxBeamFt}&prime;
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Maximum Width
                </div>
              </div>

              <div style={{ padding: "var(--space-3)", backgroundColor: "var(--color-white)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
                  Min Depth
                </div>
                <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: "var(--color-navy)", marginTop: "var(--space-1)" }}>
                  {dock.minDepthFt}&prime;
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  At Mean Low Water
                </div>
              </div>
            </div>
          </div>

          {/* Description & Availability Notes */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2 style={{ fontSize: "var(--font-size-xl)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
              Berth Availability & Notes
            </h2>
            <p style={{ color: "var(--color-text-primary)", lineHeight: "1.7", fontSize: "var(--font-size-base)", whiteSpace: "pre-line" }}>
              {dock.availabilityNotes || "No specific host notes provided for this berth listing."}
            </p>
          </div>

          {/* Amenities & Utilities */}
          {dock.amenities && dock.amenities.length > 0 && (
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h2 style={{ fontSize: "var(--font-size-xl)", color: "var(--color-navy)", marginBottom: "var(--space-3)" }}>
                Dock Amenities & Utilities
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "var(--space-2)",
                }}
              >
                {dock.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      padding: "var(--space-2) var(--space-3)",
                      backgroundColor: "rgba(11, 31, 51, 0.03)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border-subtle)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-navy)",
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ color: "var(--color-gold)", fontWeight: "bold" }}>✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & Arrival Privacy Guarantee Notice (Sub-phase 13.7) */}
          <div
            style={{
              padding: "var(--space-4) var(--space-5)",
              backgroundColor: "#fefcf6",
              border: "1px solid var(--color-gold-border)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
            }}
          >
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🔒</span>
            <div>
              <div style={{ fontWeight: 600, color: "var(--color-navy)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-1)" }}>
                Host Privacy & Protected Arrival Instructions
              </div>
              <p style={{ fontSize: "0.825rem", color: "var(--color-text-secondary)", lineHeight: "1.5", margin: 0 }}>
                For host and property security, exact marina gate passcodes, lockbox combinations, slip numbers, and private docking notes are restricted. They are automatically unlocked in your boater trip itinerary once your reservation request is accepted by the host.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Reservation Action Panel (Sub-phase 13.6) */}
        <div style={{ position: "sticky", top: "calc(var(--header-height) + var(--space-4))" }}>
          <div
            className="surface-slip-card"
            style={{
              border: "1px solid var(--color-gold-border)",
              boxShadow: "var(--shadow-md)",
              padding: "var(--space-6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "var(--space-4)" }}>
              <div>
                <span style={{ fontSize: "var(--font-size-3xl)", fontWeight: 700, color: "var(--color-navy)" }}>
                  ${dock.pricePerDay}
                </span>
                <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", marginLeft: "var(--space-1)" }}>
                  / day
                </span>
              </div>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "#0f766e",
                  backgroundColor: "#ccfbf1",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "var(--radius-pill)",
                  fontWeight: 600,
                }}
              >
                Available for Booking
              </span>
            </div>

            {/* Vessel compatibility summary hint */}
            <div
              style={{
                backgroundColor: "var(--color-cream)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "var(--space-5)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-navy)",
                border: "1px solid rgba(198, 165, 107, 0.3)",
              }}
            >
              ⚓ <strong>Fit Requirement:</strong> Your vessel must measure ≤ <strong>{dock.maxLengthFt}&prime;</strong> LOA, ≤ <strong>{dock.maxBeamFt}&prime;</strong> beam, and draft ≤ <strong>{dock.minDepthFt}&prime;</strong> at low tide.
            </div>

            {/* Auth-Aware CTA Button */}
            {!authLoading && (
              <div>
                {user ? (
                  user.role === "boater" ? (
                    <Link
                      href={`/boater/book?dockId=${dock.id}`}
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        padding: "var(--space-3)",
                        textAlign: "center",
                        fontSize: "var(--font-size-base)",
                        fontWeight: 600,
                      }}
                    >
                      Request to Book Slip
                    </Link>
                  ) : (
                    <div>
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-secondary)",
                          textAlign: "center",
                          marginBottom: "var(--space-2)",
                        }}
                      >
                        Signed in as a Dock Host ({user.email})
                      </div>
                      <Link
                        href={`/owner`}
                        className="btn btn-outline"
                        style={{ width: "100%", textAlign: "center", fontSize: "var(--font-size-sm)" }}
                      >
                        Manage Your Dock Listings
                      </Link>
                    </div>
                  )
                ) : (
                  <div>
                    <Link
                      href={`/login?redirect=/docks/${dock.id}`}
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        padding: "var(--space-3)",
                        textAlign: "center",
                        fontSize: "var(--font-size-base)",
                        fontWeight: 600,
                        marginBottom: "var(--space-2)",
                      }}
                    >
                      Sign In to Request Berth
                    </Link>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textAlign: "center", margin: 0 }}>
                      No credit card required to submit preliminary fit requests.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
