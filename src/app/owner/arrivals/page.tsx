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

interface OwnerArrivalBooking {
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

type ArrivalsFilter = "today" | "delayed" | "upcoming" | "all";

function formatDateTime(dateStr?: string | Date | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isToday(dateStr?: string | Date | null): boolean {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;
  const now = new Date();
  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  );
}

export default function OwnerArrivalsPage() {
  const [bookings, setBookings] = useState<OwnerArrivalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ArrivalsFilter>("all");

  const fetchArrivals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bookings/owner");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load owner bookings");
      }

      const allBookings: OwnerArrivalBooking[] = data.requests || data.bookings || [];
      // Filter for accepted bookings only (arrivals pipeline)
      const acceptedBookings = allBookings.filter(
        (b) => b.status === BOOKING_STATUSES.ACCEPTED
      );
      setBookings(acceptedBookings);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load arrivals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
  }, []);

  // Separate delayed bookings for high-priority alert banner
  const delayedBookings = useMemo(() => {
    return bookings.filter(
      (b) => Boolean(b.delayEta) || (Boolean(b.delayNote) && b.delayNote!.trim().length > 0)
    );
  }, [bookings]);

  const counts = useMemo(() => {
    const todayCount = bookings.filter((b) => isToday(b.delayEta || b.startDate)).length;
    const delayedCount = delayedBookings.length;
    const upcomingCount = bookings.filter((b) => {
      const arrival = new Date(b.delayEta || b.startDate);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return arrival >= todayStart;
    }).length;

    return {
      today: todayCount,
      delayed: delayedCount,
      upcoming: upcomingCount,
      all: bookings.length,
    };
  }, [bookings, delayedBookings]);

  // Filtered list
  const filteredBookings = useMemo(() => {
    if (activeFilter === "today") {
      return bookings.filter((b) => isToday(b.delayEta || b.startDate));
    }
    if (activeFilter === "delayed") {
      return delayedBookings;
    }
    if (activeFilter === "upcoming") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return bookings.filter((b) => {
        const arrival = new Date(b.delayEta || b.startDate);
        return arrival >= todayStart;
      });
    }
    return bookings;
  }, [bookings, delayedBookings, activeFilter]);

  return (
    <div>
      {/* Soft Attention Pulse Animation Style */}
      <style>{`
        @keyframes softPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(184, 115, 4, 0.45);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(184, 115, 4, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(184, 115, 4, 0);
          }
        }
        .pulse-delay {
          animation: softPulse 2.5s infinite;
        }
      `}</style>

      {/* Header section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-1)",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>⚓</span>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-gold)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              Day-of Berth Operations
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-navy)",
              fontSize: "var(--font-size-2xl)",
              margin: 0,
            }}
          >
            Scheduled Arrivals & Delay Monitoring
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-secondary)",
              marginTop: "var(--space-1)",
              marginBottom: 0,
            }}
          >
            Track real-time boater arrival windows, tidal/weather delays, and slip preparation.
          </p>
        </div>

        <button
          onClick={fetchArrivals}
          disabled={loading}
          className="btn btn-outline"
          style={{ fontSize: "var(--font-size-xs)", padding: "0.45rem 1rem" }}
        >
          {loading ? "Refreshing..." : "↻ Refresh Arrivals"}
        </button>
      </div>

      {/* High-visibility Delay Alert Banner (Sub-phase 19.5 & 19.6) */}
      {delayedBookings.length > 0 && (
        <div
          className="pulse-delay"
          style={{
            backgroundColor: "var(--color-warning-bg)",
            border: "1px solid var(--color-warning-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
            marginBottom: "var(--space-6)",
          }}
          role="alert"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginBottom: "var(--space-3)",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>⚠️</span>
            <h3
              style={{
                margin: 0,
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-warning)",
                fontFamily: "var(--font-sans)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Active Delay Alerts ({delayedBookings.length} Vessel{delayedBookings.length > 1 ? "s" : ""} Reported Delay)
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {delayedBookings.map((b) => {
              const bId = b._id || b.id || "";
              return (
                <div
                  key={`delay-alert-${bId}`}
                  style={{
                    backgroundColor: "var(--color-white)",
                    border: "1px solid var(--color-warning-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3) var(--space-4)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <strong style={{ color: "var(--color-navy)", fontSize: "var(--font-size-sm)" }}>
                        {b.vesselId?.name || "Vessel"}
                      </strong>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                        ({b.boaterId?.name || "Boater"})
                      </span>
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          backgroundColor: "var(--color-warning-bg)",
                          color: "var(--color-warning)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "var(--radius-pill)",
                          border: "1px solid var(--color-warning-border)",
                          fontWeight: "var(--font-weight-medium)",
                        }}
                      >
                        Updated ETA: {formatDateTime(b.delayEta)}
                      </span>
                    </div>

                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                      <span>Berth: <strong>{b.dockId?.title || "Assigned Berth"}</strong></span>
                      <span style={{ margin: "0 var(--space-2)" }}>•</span>
                      <span>Original Arrival: {formatDateTime(b.startDate)}</span>
                    </div>

                    {b.delayNote && (
                      <p
                        style={{
                          margin: "var(--space-1) 0 0 0",
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-navy)",
                          fontStyle: "italic",
                        }}
                      >
                        &ldquo;{b.delayNote}&rdquo;
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                    {b.boaterId?.email && (
                      <a
                        href={`mailto:${b.boaterId.email}?subject=AnchorDrop%20Arrival%20Update%20-%20${encodeURIComponent(b.dockId?.title || "Berth")}`}
                        className="btn btn-outline"
                        style={{ fontSize: "var(--font-size-xs)", padding: "0.35rem 0.75rem" }}
                      >
                        ✉️ Contact Boater
                      </a>
                    )}
                    <Link
                      href={`/owner/requests`}
                      className="btn btn-navy"
                      style={{ fontSize: "var(--font-size-xs)", padding: "0.35rem 0.75rem" }}
                    >
                      View Booking Context →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
          borderBottom: "1px solid var(--color-border-subtle)",
          paddingBottom: "var(--space-2)",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          style={{
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: activeFilter === "all" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
            backgroundColor: activeFilter === "all" ? "var(--color-navy)" : "transparent",
            color: activeFilter === "all" ? "var(--color-cream)" : "var(--color-navy)",
          }}
        >
          All Confirmed ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("today")}
          style={{
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: activeFilter === "today" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
            backgroundColor: activeFilter === "today" ? "var(--color-navy)" : "transparent",
            color: activeFilter === "today" ? "var(--color-cream)" : "var(--color-navy)",
          }}
        >
          Today&apos;s Arrivals ({counts.today})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("delayed")}
          style={{
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: activeFilter === "delayed" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
            backgroundColor: activeFilter === "delayed" ? "var(--color-warning)" : "transparent",
            color: activeFilter === "delayed" ? "var(--color-white)" : "var(--color-warning)",
            border: activeFilter === "delayed" ? "none" : "1px solid var(--color-warning-border)",
          }}
        >
          ⚠️ Delayed Arrivals ({counts.delayed})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("upcoming")}
          style={{
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: activeFilter === "upcoming" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
            backgroundColor: activeFilter === "upcoming" ? "var(--color-navy)" : "transparent",
            color: activeFilter === "upcoming" ? "var(--color-cream)" : "var(--color-navy)",
          }}
        >
          Upcoming ({counts.upcoming})
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            backgroundColor: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            marginBottom: "var(--space-6)",
            color: "var(--color-danger)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && bookings.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-12) 0",
            color: "var(--color-text-secondary)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>⚓</div>
          <p>Loading scheduled vessel arrivals...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredBookings.length === 0 && (
        <div
          className="surface-slip-card"
          style={{
            textAlign: "center",
            padding: "var(--space-12) var(--space-6)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>⛵</div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-navy)",
              marginBottom: "var(--space-2)",
            }}
          >
            {activeFilter === "today"
              ? "No Arrivals Scheduled for Today"
              : activeFilter === "delayed"
              ? "No Reported Delays"
              : "No Confirmed Arrivals Found"}
          </h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
            {activeFilter === "today"
              ? "All your slips are either clear or occupied with ongoing reservations today. Check upcoming arrivals for future dates."
              : activeFilter === "delayed"
              ? "All vessels are currently running on their scheduled itinerary with zero reported delays."
              : "You do not have any accepted reservations with arrivals matching this filter."}
          </p>
          <div style={{ marginTop: "var(--space-4)", display: "flex", justifyContent: "center", gap: "var(--space-3)" }}>
            {activeFilter !== "all" && (
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className="btn btn-navy"
                style={{ fontSize: "var(--font-size-xs)" }}
              >
                View All Confirmed Bookings
              </button>
            )}
            <Link
              href="/owner/requests"
              className="btn btn-outline"
              style={{ fontSize: "var(--font-size-xs)" }}
            >
              Open Requests & Approvals
            </Link>
          </div>
        </div>
      )}

      {/* Arrivals list */}
      {!loading && filteredBookings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {filteredBookings.map((booking) => {
            const bookingId = booking._id || booking.id || "";
            const isDelayed = Boolean(booking.delayEta) || (Boolean(booking.delayNote) && booking.delayNote!.trim().length > 0);
            const arrivalToday = isToday(booking.delayEta || booking.startDate);

            return (
              <div
                key={bookingId}
                className={`surface-slip-card ${isDelayed ? "pulse-delay" : ""}`}
                style={{
                  border: isDelayed
                    ? "1px solid var(--color-warning-border)"
                    : arrivalToday
                    ? "1px solid var(--color-gold-border)"
                    : "1px solid var(--color-border-subtle)",
                }}
              >
                {/* Top Row: Vessel & Status Badges */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "var(--font-size-lg)",
                          color: "var(--color-navy)",
                        }}
                      >
                        {booking.vesselId?.name || "Vessel"}
                      </h3>
                      {booking.vesselId?.type && (
                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                          ({booking.vesselId.type})
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginTop: "var(--space-1)" }}>
                      Berth: <strong>{booking.dockId?.title || "Dock Berth"}</strong> — {booking.dockId?.waterway || booking.dockId?.location || ""}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
                    {isDelayed && (
                      <span
                        className="badge badge-pending"
                        style={{
                          backgroundColor: "var(--color-warning-bg)",
                          color: "var(--color-warning)",
                          borderColor: "var(--color-warning-border)",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        ⚠️ DELAYED ARRIVAL
                      </span>
                    )}

                    {arrivalToday && (
                      <span
                        className="badge badge-accepted"
                        style={{
                          backgroundColor: "var(--color-info-bg)",
                          color: "var(--color-info)",
                          borderColor: "var(--color-info-border)",
                        }}
                      >
                        🗓️ Today&apos;s Arrival
                      </span>
                    )}

                    <span className="badge badge-accepted">
                      Confirmed
                    </span>
                  </div>
                </div>

                {/* Delay Alert Callout if present */}
                {isDelayed && (
                  <div
                    style={{
                      backgroundColor: "var(--color-warning-bg)",
                      border: "1px solid var(--color-warning-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-3) var(--space-4)",
                      marginBottom: "var(--space-4)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      <strong style={{ color: "var(--color-warning)", fontSize: "var(--font-size-xs)", textTransform: "uppercase" }}>
                        ⚠️ Arrival Schedule Update:
                      </strong>
                      <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-navy)" }}>
                        Original scheduled arrival: <s>{formatDateTime(booking.startDate)}</s> →{" "}
                        <strong style={{ color: "var(--color-warning)" }}>
                          New ETA: {formatDateTime(booking.delayEta)}
                        </strong>
                      </span>
                    </div>
                    {booking.delayNote && (
                      <div style={{ marginTop: "var(--space-2)", fontSize: "var(--font-size-xs)", color: "var(--color-navy)" }}>
                        <strong>Navigation Note from Boater: </strong>
                        <span>&ldquo;{booking.delayNote}&rdquo;</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "var(--space-4)",
                    padding: "var(--space-3) 0",
                    borderTop: "1px solid var(--color-border-subtle)",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  {/* Arrival & Departure Window */}
                  <div>
                    <span style={{ display: "block", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>
                      Scheduled Window
                    </span>
                    <strong style={{ color: "var(--color-navy)", display: "block" }}>
                      Arrival: {formatDate(booking.startDate)}
                    </strong>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Departure: {formatDate(booking.endDate)}
                    </span>
                  </div>

                  {/* Boater Contact */}
                  <div>
                    <span style={{ display: "block", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>
                      Boater Contact
                    </span>
                    <strong style={{ color: "var(--color-navy)", display: "block" }}>
                      {booking.boaterId?.name || "Unknown Boater"}
                    </strong>
                    {booking.boaterId?.email ? (
                      <a
                        href={`mailto:${booking.boaterId.email}`}
                        style={{ color: "var(--color-navy)", textDecoration: "underline" }}
                      >
                        {booking.boaterId.email}
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>No email on file</span>
                    )}
                  </div>

                  {/* Vessel Dimensions */}
                  <div>
                    <span style={{ display: "block", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>
                      Vessel Dimensions
                    </span>
                    <strong style={{ color: "var(--color-navy)", display: "block" }}>
                      {booking.vesselId?.lengthFt || "—"}′ LOA × {booking.vesselId?.beamFt || "—"}′ Beam
                    </strong>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Draft: {booking.vesselId?.draftFt || "—"}′ | Reg: {booking.vesselId?.registration || "—"}
                    </span>
                  </div>
                </div>

                {/* Special Requests (if any) */}
                {booking.specialRequests && (
                  <div style={{ marginTop: "var(--space-3)", fontSize: "var(--font-size-xs)" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Special Requests: </span>
                    <span style={{ color: "var(--color-navy)" }}>{booking.specialRequests}</span>
                  </div>
                )}

                {/* Action Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                    marginTop: "var(--space-3)",
                  }}
                >
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Booking ID: <code style={{ fontSize: "0.75rem" }}>{bookingId}</code>
                  </span>

                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    {booking.boaterId?.email && (
                      <a
                        href={`mailto:${booking.boaterId.email}?subject=AnchorDrop%20Berth%20Arrival%20-%20${encodeURIComponent(booking.dockId?.title || "Reservation")}`}
                        className="btn btn-outline"
                        style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
                      >
                        ✉️ Message Boater
                      </a>
                    )}
                    <Link
                      href="/owner/requests"
                      className="btn btn-navy"
                      style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 0.8rem" }}
                    >
                      View Booking Context →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
