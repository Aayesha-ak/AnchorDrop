"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { BOOKING_STATUSES, BookingStatus } from "@/lib/constants";

interface PopulatedBoater {
  _id: string;
  name: string;
  email: string;
}

interface PopulatedDock {
  _id: string;
  title: string;
  location: string;
  waterway: string;
  maxLengthFt?: number;
  maxBeamFt?: number;
  minDepthFt?: number;
  pricePerDay?: number;
}

interface PopulatedVessel {
  _id: string;
  name: string;
  type: string;
  lengthFt: number;
  beamFt: number;
  draftFt: number;
  registration?: string;
}

interface OwnerBooking {
  _id: string;
  id?: string;
  boaterId?: PopulatedBoater | null;
  dockId?: PopulatedDock | null;
  vesselId?: PopulatedVessel | null;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  specialRequests?: string;
  delayEta?: string | null;
  delayNote?: string;
  createdAt: string;
}

type TabType = "pending" | "accepted" | "history";

interface ToastNotification {
  message: string;
  type: "success" | "error" | "info";
}

export default function OwnerRequestsPage() {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Decline confirmation dialog state
  const [declineTarget, setDeclineTarget] = useState<OwnerBooking | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<ToastNotification | null>(null);

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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bookings/owner");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load booking requests");
      }

      setBookings(data.requests || data.bookings || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const counts = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let history = 0;

    for (const b of bookings) {
      if (b.status === BOOKING_STATUSES.PENDING) {
        pending++;
      } else if (b.status === BOOKING_STATUSES.ACCEPTED) {
        accepted++;
      } else if (
        b.status === BOOKING_STATUSES.COMPLETED ||
        b.status === BOOKING_STATUSES.REJECTED
      ) {
        history++;
      }
    }

    return { pending, accepted, history };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === "pending") {
      return bookings.filter((b) => b.status === BOOKING_STATUSES.PENDING);
    }
    if (activeTab === "accepted") {
      return bookings.filter((b) => b.status === BOOKING_STATUSES.ACCEPTED);
    }
    return bookings.filter(
      (b) =>
        b.status === BOOKING_STATUSES.COMPLETED ||
        b.status === BOOKING_STATUSES.REJECTED
    );
  }, [bookings, activeTab]);

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: "accepted" | "rejected" | "completed"
  ) => {
    try {
      setActionInProgress(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to update status to ${newStatus}`);
      }

      // Update in local state
      setBookings((prev) =>
        prev.map((b) =>
          (b._id === bookingId || b.id === bookingId)
            ? { ...b, status: newStatus }
            : b
        )
      );

      if (newStatus === "accepted") {
        showToast("Reservation request accepted. Boater now has access to arrival instructions.", "success");
      } else if (newStatus === "rejected") {
        showToast("Reservation request declined.", "info");
      } else if (newStatus === "completed") {
        showToast("Stay marked as completed.", "success");
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error updating request", "error");
    } finally {
      setActionInProgress(null);
      setDeclineTarget(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BOOKING_STATUSES.PENDING:
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "var(--font-size-xs)",
              fontWeight: 600,
              backgroundColor: "#FEF3C7",
              color: "#B45309",
              border: "1px solid #FCD34D",
              textTransform: "capitalize",
            }}
          >
            ⏳ Pending Review
          </span>
        );
      case BOOKING_STATUSES.ACCEPTED:
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "var(--font-size-xs)",
              fontWeight: 600,
              backgroundColor: "#D1FAE5",
              color: "#065F46",
              border: "1px solid #6EE7B7",
              textTransform: "capitalize",
            }}
          >
            ✓ Confirmed Berth
          </span>
        );
      case BOOKING_STATUSES.REJECTED:
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "var(--font-size-xs)",
              fontWeight: 600,
              backgroundColor: "#FFE4E6",
              color: "#9F1239",
              border: "1px solid #FDA4AF",
              textTransform: "capitalize",
            }}
          >
            ✕ Declined
          </span>
        );
      case BOOKING_STATUSES.COMPLETED:
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "var(--font-size-xs)",
              fontWeight: 600,
              backgroundColor: "#F1F5F9",
              color: "#475569",
              border: "1px solid #CBD5E1",
              textTransform: "capitalize",
            }}
          >
            ⚓ Completed
          </span>
        );
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
          <span style={{ fontSize: "1.25rem" }}>📥</span>
          <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-gold)" }}>
            Harbor Host Desk
          </span>
        </div>
        <h1 style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
          Berth Requests & Bookings
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "680px" }}>
          Review incoming reservation inquiries with full vessel dimensional specifications (LOA, beam, draft). Accept to release secure dock arrival codes.
        </p>
      </div>

      {/* Tabs / Filters Bar */}
      <div
        role="tablist"
        aria-label="Filter bookings by state"
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-8)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <button
          role="tab"
          aria-selected={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--font-size-sm)",
            fontWeight: activeTab === "pending" ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
            backgroundColor: activeTab === "pending" ? "var(--color-navy)" : "var(--color-white)",
            color: activeTab === "pending" ? "var(--color-cream)" : "var(--color-text-secondary)",
            border: activeTab === "pending" ? "1px solid var(--color-navy)" : "1px solid var(--color-border)",
            cursor: "pointer",
            boxShadow: activeTab === "pending" ? "var(--shadow-sm)" : "none",
            transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
          }}
        >
          <span>Pending Review</span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "0.1rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: activeTab === "pending" ? "var(--color-gold)" : "rgba(11, 31, 51, 0.08)",
              color: activeTab === "pending" ? "var(--color-navy)" : "var(--color-text-secondary)",
              fontWeight: 700,
            }}
          >
            {counts.pending}
          </span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "accepted"}
          onClick={() => setActiveTab("accepted")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--font-size-sm)",
            fontWeight: activeTab === "accepted" ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
            backgroundColor: activeTab === "accepted" ? "var(--color-navy)" : "var(--color-white)",
            color: activeTab === "accepted" ? "var(--color-cream)" : "var(--color-text-secondary)",
            border: activeTab === "accepted" ? "1px solid var(--color-navy)" : "1px solid var(--color-border)",
            cursor: "pointer",
            boxShadow: activeTab === "accepted" ? "var(--shadow-sm)" : "none",
            transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
          }}
        >
          <span>Accepted</span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "0.1rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: activeTab === "accepted" ? "rgba(198, 165, 107, 0.3)" : "rgba(11, 31, 51, 0.08)",
              color: activeTab === "accepted" ? "var(--color-gold-hover)" : "var(--color-text-secondary)",
            }}
          >
            {counts.accepted}
          </span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--font-size-sm)",
            fontWeight: activeTab === "history" ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
            backgroundColor: activeTab === "history" ? "var(--color-navy)" : "var(--color-white)",
            color: activeTab === "history" ? "var(--color-cream)" : "var(--color-text-secondary)",
            border: activeTab === "history" ? "1px solid var(--color-navy)" : "1px solid var(--color-border)",
            cursor: "pointer",
            boxShadow: activeTab === "history" ? "var(--shadow-sm)" : "none",
            transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
          }}
        >
          <span>History</span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "0.1rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: activeTab === "history" ? "rgba(198, 165, 107, 0.3)" : "rgba(11, 31, 51, 0.08)",
              color: activeTab === "history" ? "var(--color-gold-hover)" : "var(--color-text-secondary)",
            }}
          >
            {counts.history}
          </span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            padding: "var(--space-4)",
            marginBottom: "var(--space-6)",
            backgroundColor: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-danger)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={fetchBookings}
            className="btn btn-outline"
            style={{ fontSize: "var(--font-size-xs)", padding: "0.25rem 0.75rem" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-16) 0",
            color: "var(--color-text-secondary)",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ fontSize: "2rem" }}>⚓</div>
          <p>Retrieving host reservation requests...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div
          className="surface-slip-card"
          style={{
            textAlign: "center",
            padding: "var(--space-12) var(--space-6)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-3)" }}>
            {activeTab === "pending" ? "✨" : "📋"}
          </div>
          <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)", color: "var(--color-navy)" }}>
            {activeTab === "pending"
              ? "All Clear! No Pending Requests"
              : activeTab === "accepted"
              ? "No Active Confirmed Bookings"
              : "No Reservation History Yet"}
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--font-size-sm)" }}>
            {activeTab === "pending"
              ? "You have reviewed all incoming reservation requests. New requests from verified boaters will appear here."
              : activeTab === "accepted"
              ? "There are currently no accepted bookings scheduled for your berths."
              : "Completed and declined reservation logs will be preserved here."}
          </p>
          <Link href="/owner/berths" className="btn btn-navy">
            View My Berth Inventory
          </Link>
        </div>
      ) : (
        /* Requests List */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-4)",
          }}
        >
          {filteredBookings.map((booking) => {
            const bookingId = booking._id || booking.id || "";
            const boater = booking.boaterId;
            const dock = booking.dockId;
            const vessel = booking.vesselId;
            const isPending = booking.status === BOOKING_STATUSES.PENDING;
            const isAccepted = booking.status === BOOKING_STATUSES.ACCEPTED;
            const isWorking = actionInProgress === bookingId;

            return (
              <div
                key={bookingId}
                className="surface-slip-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                  padding: "var(--space-6)",
                  borderLeft: isPending ? "4px solid var(--color-gold)" : undefined,
                }}
              >
                {/* Header Row: Boater info & Status badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <span style={{ fontSize: "1.25rem" }}>🧑‍✈️</span>
                      <h2
                        style={{
                          fontSize: "var(--font-size-lg)",
                          color: "var(--color-navy)",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {boater?.name || "Boater"}
                      </h2>
                    </div>
                    {boater?.email && (
                      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        {boater.email}
                      </p>
                    )}
                  </div>

                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                {/* Specs and Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  {/* Requested Berth */}
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "var(--font-size-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-text-muted)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Requested Dock Berth
                    </span>
                    <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--color-navy)", display: "block" }}>
                      ⚓ {dock?.title || "Dock Berth"}
                    </strong>
                    {dock?.location && (
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                        📍 {dock.location}
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "var(--font-size-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-text-muted)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Check-in — Check-out
                    </span>
                    <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--color-navy)", display: "block" }}>
                      📅 {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                    </strong>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      Requested {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  {/* Vessel Specs */}
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "var(--font-size-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-text-muted)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Vessel Specifications
                    </span>
                    <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--color-navy)", display: "block" }}>
                      🛥️ {vessel?.name || "Vessel"} {vessel?.type ? `(${vessel.type})` : ""}
                    </strong>
                    {vessel && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.25rem",
                          fontSize: "var(--font-size-xs)",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--color-white)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-primary)",
                          fontWeight: 500,
                        }}
                      >
                        LOA: {vessel.lengthFt}′ | Beam: {vessel.beamFt}′ | Draft: {vessel.draftFt}′
                      </span>
                    )}
                  </div>
                </div>

                {/* Special Requests or Notes */}
                {booking.specialRequests && (
                  <div
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      backgroundColor: "var(--color-white)",
                      borderRadius: "var(--radius-sm)",
                      borderLeft: "3px solid var(--color-gold)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-text-secondary)",
                      fontStyle: "italic",
                    }}
                  >
                    <span style={{ fontStyle: "normal", fontWeight: 600, color: "var(--color-navy)" }}>
                      Boater Note:{" "}
                    </span>
                    &ldquo;{booking.specialRequests}&rdquo;
                  </div>
                )}

                {/* Delay Notice (if boater reported delay) */}
                {booking.delayEta && (
                  <div
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      backgroundColor: "var(--color-warning-bg)",
                      border: "1px solid var(--color-warning-border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-warning)",
                    }}
                  >
                    <strong>⚠️ Boater Reported Arrival Delay:</strong> Updated ETA is{" "}
                    {new Date(booking.delayEta).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {booking.delayNote ? ` ("${booking.delayNote}")` : ""}
                  </div>
                )}

                {/* Actions Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                    paddingTop: "var(--space-2)",
                    borderTop: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Booking Ref: <code style={{ fontSize: "0.7rem" }}>{bookingId.slice(-8)}</code>
                  </span>

                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {isPending && (
                      <>
                        <button
                          disabled={isWorking}
                          onClick={() => setDeclineTarget(booking)}
                          className="btn btn-outline"
                          style={{
                            fontSize: "var(--font-size-xs)",
                            padding: "0.45rem 1rem",
                            color: "var(--color-danger)",
                            borderColor: "var(--color-danger-border)",
                          }}
                        >
                          ✕ Decline
                        </button>
                        <button
                          disabled={isWorking}
                          onClick={() => handleUpdateStatus(bookingId, "accepted")}
                          className="btn btn-primary"
                          style={{
                            fontSize: "var(--font-size-xs)",
                            padding: "0.45rem 1.25rem",
                          }}
                        >
                          {isWorking ? "Accepting..." : "✓ Accept Request"}
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button
                        disabled={isWorking}
                        onClick={() => handleUpdateStatus(bookingId, "completed")}
                        className="btn btn-navy"
                        style={{
                          fontSize: "var(--font-size-xs)",
                          padding: "0.45rem 1rem",
                        }}
                      >
                        {isWorking ? "Marking Completed..." : "Mark as Completed"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Confirmation Dialog Modal */}
      {declineTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="decline-dialog-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(11, 31, 51, 0.65)",
            backdropFilter: "blur(4px)",
            padding: "var(--space-4)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeclineTarget(null);
          }}
        >
          <div
            className="surface-slip-card"
            style={{
              width: "100%",
              maxWidth: "440px",
              boxShadow: "var(--shadow-modal)",
              padding: "var(--space-6)",
            }}
          >
            <h3
              id="decline-dialog-title"
              style={{
                fontSize: "var(--font-size-xl)",
                color: "var(--color-navy)",
                marginBottom: "var(--space-2)",
              }}
            >
              Decline Reservation Request?
            </h3>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-4)",
              }}
            >
              Are you sure you want to decline the reservation from{" "}
              <strong>{declineTarget.boaterId?.name || "the boater"}</strong> for{" "}
              <strong>{declineTarget.dockId?.title || "this berth"}</strong>?
            </p>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-danger)",
                backgroundColor: "var(--color-danger-bg)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "var(--space-6)",
              }}
            >
              ⚠️ This will mark the booking as declined. The boater will be notified and arrival instructions will remain locked.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
              <button
                type="button"
                onClick={() => setDeclineTarget(null)}
                className="btn btn-outline"
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionInProgress !== null}
                onClick={() =>
                  handleUpdateStatus(declineTarget._id || declineTarget.id || "", "rejected")
                }
                style={{
                  backgroundColor: "var(--color-danger)",
                  color: "var(--color-white)",
                  fontSize: "var(--font-size-sm)",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {actionInProgress ? "Declining..." : "Yes, Decline Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "var(--space-6)",
            right: "var(--space-6)",
            zIndex: 1100,
            maxWidth: "420px",
            padding: "var(--space-4) var(--space-6)",
            borderRadius: "var(--radius-md)",
            backgroundColor:
              toast.type === "success"
                ? "var(--color-navy)"
                : toast.type === "error"
                ? "var(--color-danger)"
                : "var(--color-navy-light)",
            color: "var(--color-white)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            animation: "slideInUp 0.25s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
            <span style={{ fontSize: "var(--font-size-sm)" }}>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "1.1rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
