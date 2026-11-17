"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { OwnerDock } from "@/lib/serializers";

interface ToastNotification {
  message: string;
  type: "success" | "error" | "info";
}

export default function OwnerBerthsPage() {
  const [docks, setDocks] = useState<OwnerDock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<OwnerDock | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load owner berths
  const fetchBerths = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/docks?mine=true");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to load berths");
      }

      startTransition(() => {
        setDocks(data.docks || []);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading berth listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerths();
  }, []);

  // Quick toggle active / inactive status
  const toggleActiveStatus = async (dock: OwnerDock) => {
    try {
      const dockId = dock.id || (dock as unknown as { _id?: string })._id;
      const nextStatus = !dock.isActive;
      const res = await fetch(`/api/docks/${dockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to update status");
      }

      // Update state locally
      setDocks((prev) =>
        prev.map((d) => {
          const id = d.id || (d as unknown as { _id?: string })._id;
          return id === dockId ? { ...d, isActive: nextStatus } : d;
        })
      );

      showToast(
        `Listing "${dock.title}" is now ${nextStatus ? "Active in Explore" : "Unlisted / Inactive"}.`,
        "success"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to toggle status",
        "error"
      );
    }
  };

  // Perform deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const dockId = deleteTarget.id || (deleteTarget as unknown as { _id?: string })._id;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/docks/${dockId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        // If conflict (409) or other policy error
        throw new Error(data.error || data.message || "Cannot delete listing");
      }

      // Remove from state
      setDocks((prev) =>
        prev.filter((d) => {
          const id = d.id || (d as unknown as { _id?: string })._id;
          return id !== dockId;
        })
      );

      showToast(`Berth "${deleteTarget.title}" was successfully deleted.`, "success");
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: "var(--space-6)",
            right: "var(--space-6)",
            zIndex: 9999,
            padding: "var(--space-3) var(--space-6)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            backgroundColor:
              toast.type === "success"
                ? "var(--color-navy)"
                : toast.type === "error"
                ? "var(--color-danger)"
                : "var(--color-info)",
            color: "var(--color-white)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            border: "1px solid var(--color-gold)",
          }}
        >
          <span>
            {toast.type === "success" ? "✓" : toast.type === "error" ? "⚠️" : "ℹ️"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
            <span style={{ fontSize: "1.5rem" }}>⚓</span>
            <h1 style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-navy)", margin: 0 }}>
              Berth Inventory
            </h1>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-base)", margin: 0 }}>
            Manage your slips, configure dimensional clearances, set pricing, and maintain encrypted arrival codes.
          </p>
        </div>

        <Link
          href="/owner/berths/new"
          className="btn btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-6)",
            fontSize: "var(--font-size-base)",
          }}
        >
          <span>+</span>
          <span>Add New Berth</span>
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="surface-slip-card"
              style={{
                height: "380px",
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                animation: "pulse 1.5s infinite",
              }}
            >
              <div style={{ height: "180px", backgroundColor: "rgba(11, 31, 51, 0.08)" }} />
              <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <div style={{ height: "20px", width: "70%", backgroundColor: "rgba(11, 31, 51, 0.08)", borderRadius: "var(--radius-sm)" }} />
                <div style={{ height: "14px", width: "45%", backgroundColor: "rgba(11, 31, 51, 0.08)", borderRadius: "var(--radius-sm)" }} />
                <div style={{ height: "40px", backgroundColor: "rgba(11, 31, 51, 0.05)", borderRadius: "var(--radius-sm)", marginTop: "var(--space-2)" }} />
              </div>
            </div>
          ))}
          <style jsx>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      )}

      {/* Error State */}
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
            Unable to load your berth inventory
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
            {error}
          </p>
          <button onClick={fetchBerths} className="btn btn-navy">
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State (Sub-phase 20.7) */}
      {!loading && !error && docks.length === 0 && (
        <div
          className="surface-slip-card"
          style={{
            padding: "var(--space-12) var(--space-6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "680px",
            margin: "var(--space-4) auto",
            border: "2px dashed var(--color-border-strong)",
          }}
        >
          <div
            style={{
              fontSize: "3.5rem",
              marginBottom: "var(--space-4)",
              color: "var(--color-gold)",
            }}
          >
            ⚓
          </div>
          <h2
            style={{
              fontSize: "var(--font-size-2xl)",
              color: "var(--color-navy)",
              marginBottom: "var(--space-2)",
            }}
          >
            No Berths Listed Yet
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-text-secondary)",
              maxWidth: "520px",
              lineHeight: 1.6,
              marginBottom: "var(--space-6)",
            }}
          >
            Start welcoming captains to your marina, private residential slip, or mooring field.
            Set dimensional clearances, low-water depth, pricing, and encrypted arrival gate passcodes.
          </p>
          <Link
            href="/owner/berths/new"
            className="btn btn-primary"
            style={{
              padding: "var(--space-3) var(--space-8)",
              fontSize: "var(--font-size-base)",
            }}
          >
            + Add Your First Berth
          </Link>
        </div>
      )}

      {/* Berths Grid */}
      {!loading && !error && docks.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {docks.map((dock) => {
            const dockId = dock.id || (dock as unknown as { _id?: string })._id || "";
            const thumbnail =
              dock.photos && dock.photos.length > 0
                ? dock.photos[0]
                : "/images/hero-marina.jpeg";

            return (
              <div
                key={dockId}
                className="surface-slip-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 0,
                  overflow: "hidden",
                  position: "relative",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
              >
                {/* Photo & Badges Header */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "190px",
                    backgroundColor: "var(--color-navy-dark)",
                  }}
                >
                  <Image
                    src={thumbnail}
                    alt={dock.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    style={{ objectFit: "cover" }}
                    priority={false}
                  />

                  {/* Classification Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: "var(--space-3)",
                      left: "var(--space-3)",
                      backgroundColor: "rgba(11, 31, 51, 0.85)",
                      backdropFilter: "blur(4px)",
                      color: "var(--color-gold)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 600,
                      padding: "0.25rem 0.6rem",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid rgba(198, 165, 107, 0.4)",
                    }}
                  >
                    {dock.dockType || "Berth"}
                  </span>

                  {/* Active / Inactive Badge */}
                  <span
                    style={{
                      position: "absolute",
                      top: "var(--space-3)",
                      right: "var(--space-3)",
                    }}
                  >
                    {dock.isActive ? (
                      <span className="badge badge-accepted" style={{ boxShadow: "var(--shadow-sm)" }}>
                        ● Active
                      </span>
                    ) : (
                      <span
                        className="badge badge-pending"
                        style={{
                          backgroundColor: "rgba(11, 31, 51, 0.85)",
                          color: "#E0E0E0",
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        ○ Unlisted
                      </span>
                    )}
                  </span>

                  {/* Price Tag Overlay */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "var(--space-3)",
                      right: "var(--space-3)",
                      backgroundColor: "var(--color-navy)",
                      color: "var(--color-cream)",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: 700,
                      padding: "0.3rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-gold)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    ${dock.pricePerDay}
                    <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 400, color: "rgba(245, 241, 232, 0.7)" }}>
                      /day
                    </span>
                  </span>
                </div>

                {/* Card Content */}
                <div
                  style={{
                    padding: "var(--space-5)",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  {/* Title */}
                  <h3
                    style={{
                      fontSize: "var(--font-size-lg)",
                      fontFamily: "var(--font-serif)",
                      marginBottom: "var(--space-1)",
                      color: "var(--color-navy)",
                    }}
                  >
                    {dock.title}
                  </h3>

                  {/* Location & Waterway */}
                  <p
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    <span>📍</span>
                    <span>{dock.location}</span>
                    <span style={{ color: "var(--color-gold)" }}>•</span>
                    <span>{dock.waterway}</span>
                  </p>

                  {/* Dimensions Box */}
                  <div
                    style={{
                      backgroundColor: "var(--color-cream-soft)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-3)",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "var(--space-2)",
                      textAlign: "center",
                      marginBottom: "var(--space-3)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Max LOA
                      </div>
                      <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
                        {dock.maxLengthFt} ft
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Beam
                      </div>
                      <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
                        {dock.maxBeamFt} ft
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Low Depth
                      </div>
                      <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-navy)" }}>
                        {dock.minDepthFt} ft
                      </div>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  {dock.amenities && dock.amenities.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "var(--space-1)",
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      {dock.amenities.slice(0, 4).map((a) => (
                        <span
                          key={a}
                          style={{
                            fontSize: "0.7rem",
                            backgroundColor: "rgba(11, 31, 51, 0.05)",
                            color: "var(--color-text-secondary)",
                            padding: "0.15rem 0.45rem",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          {a}
                        </span>
                      ))}
                      {dock.amenities.length > 4 && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--color-text-muted)",
                            padding: "0.15rem 0.3rem",
                          }}
                        >
                          +{dock.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Private Arrival Instructions Indicator */}
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      padding: "var(--space-2) var(--space-3)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: dock.arrivalInstructions
                        ? "rgba(198, 165, 107, 0.12)"
                        : "var(--color-warning-bg)",
                      color: dock.arrivalInstructions
                        ? "var(--color-navy)"
                        : "var(--color-warning)",
                      marginBottom: "var(--space-4)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <span>{dock.arrivalInstructions ? "🔒" : "⚠️"}</span>
                    <span style={{ fontWeight: 500 }}>
                      {dock.arrivalInstructions
                        ? "Protected arrival codes configured"
                        : "No private arrival notes set"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-2)",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                      <Link
                        href={`/owner/berths/${dockId}/edit`}
                        className="btn btn-navy"
                        style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-2) var(--space-3)" }}
                      >
                        ✏️ Edit Listing
                      </Link>
                      <Link
                        href={`/docks/${dockId}`}
                        target="_blank"
                        className="btn btn-outline"
                        style={{ fontSize: "var(--font-size-xs)", padding: "var(--space-2) var(--space-3)" }}
                      >
                        👁️ Public View
                      </Link>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                      <button
                        type="button"
                        onClick={() => toggleActiveStatus(dock)}
                        className="btn btn-outline"
                        style={{
                          fontSize: "var(--font-size-xs)",
                          padding: "var(--space-2) var(--space-3)",
                          color: dock.isActive ? "var(--color-text-secondary)" : "var(--color-success)",
                        }}
                      >
                        {dock.isActive ? "⏸️ Deactivate" : "▶️ Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(dock);
                          setDeleteError(null);
                        }}
                        className="btn btn-outline"
                        style={{
                          fontSize: "var(--font-size-xs)",
                          padding: "var(--space-2) var(--space-3)",
                          color: "var(--color-danger)",
                          borderColor: "var(--color-danger-border)",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(11, 31, 51, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
          }}
        >
          <div
            className="surface-slip-card"
            style={{
              maxWidth: "520px",
              width: "100%",
              padding: "var(--space-6)",
              boxShadow: "var(--shadow-modal)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              <span style={{ fontSize: "1.5rem" }}>🗑️</span>
              <h2 style={{ fontSize: "var(--font-size-xl)", margin: 0, color: "var(--color-navy)" }}>
                Delete Berth Listing?
              </h2>
            </div>

            <p style={{ color: "var(--color-text-primary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--space-3)" }}>
              Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong>?
            </p>

            {/* Active Bookings Notice Policy Box */}
            <div
              style={{
                backgroundColor: "var(--color-warning-bg)",
                border: "1px solid var(--color-warning-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3) var(--space-4)",
                marginBottom: "var(--space-4)",
              }}
            >
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
                <span>⚠️</span>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning)", margin: 0, lineHeight: 1.5 }}>
                  <strong>Reservation Protection Policy:</strong> Berths with active or pending reservations cannot be deleted. If you have current bookings, you should <strong>deactivate</strong> the listing instead to prevent new requests.
                </p>
              </div>
            </div>

            {/* Error Message inside modal if 409 conflict or deletion failed */}
            {deleteError && (
              <div
                style={{
                  backgroundColor: "var(--color-danger-bg)",
                  border: "1px solid var(--color-danger-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3) var(--space-4)",
                  color: "var(--color-danger)",
                  fontSize: "var(--font-size-xs)",
                  marginBottom: "var(--space-4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span>🚫</span>
                <span>{deleteError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "var(--space-3)",
                paddingTop: "var(--space-2)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn btn-navy"
                style={{
                  backgroundColor: "var(--color-danger)",
                  borderColor: "var(--color-danger)",
                  color: "var(--color-white)",
                }}
              >
                {isDeleting ? "Deleting Listing..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
