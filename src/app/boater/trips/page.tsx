"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { BOOKING_STATUSES, BookingStatus } from "@/lib/constants";

interface PopulatedDock {
  _id: string;
  title: string;
  location: string;
  waterway: string;
  pricePerDay?: number;
  photos?: string[];
}

interface PopulatedVessel {
  _id: string;
  name: string;
  type: string;
  lengthFt: number;
  beamFt: number;
  draftFt: number;
}

interface BoaterBooking {
  _id: string;
  id?: string;
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

type FilterValue = "all" | BookingStatus;

export default function BoaterTripsPage() {
  const [bookings, setBookings] = useState<BoaterBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bookings/boater");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load bookings");
      }

      setBookings(data.bookings || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while loading trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = {
      all: bookings.length,
      [BOOKING_STATUSES.PENDING]: 0,
      [BOOKING_STATUSES.ACCEPTED]: 0,
      [BOOKING_STATUSES.COMPLETED]: 0,
      [BOOKING_STATUSES.REJECTED]: 0,
    };
    for (const b of bookings) {
      if (b.status && c[b.status] !== undefined) {
        c[b.status]++;
      }
    }
    return c;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  }, [bookings, activeFilter]);

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
            ⏳ Pending Host Review
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
            ✓ Accepted & Unlocked
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
            ⚓ Completed Stay
          </span>
        );
      default:
        return (
          <span className="badge badge-info">
            {status}
          </span>
        );
    }
  };

  const filterOptions: { label: string; value: FilterValue }[] = [
    { label: "All Reservations", value: "all" },
    { label: "Pending", value: BOOKING_STATUSES.PENDING },
    { label: "Accepted", value: BOOKING_STATUSES.ACCEPTED },
    { label: "Completed", value: BOOKING_STATUSES.COMPLETED },
    { label: "Rejected", value: BOOKING_STATUSES.REJECTED },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
          <span style={{ fontSize: "1.25rem" }}>🧭</span>
          <span style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-gold)" }}>
            Voyages & Dock Reservations
          </span>
        </div>
        <h1 style={{ fontSize: "var(--font-size-3xl)", color: "var(--color-navy)", marginBottom: "var(--space-2)" }}>
          My Trips
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "680px" }}>
          Monitor your dock reservation status, view confirmed check-in schedules, and access private arrival instructions once your berth is accepted.
        </p>
      </div>

      {/* Filter Chips Bar */}
      <div
        role="tablist"
        aria-label="Filter bookings by status"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          marginBottom: "var(--space-8)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        {filterOptions.map((opt) => {
          const isActive = activeFilter === opt.value;
          const count = counts[opt.value];
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(opt.value)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--font-size-sm)",
                fontWeight: isActive ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
                backgroundColor: isActive ? "var(--color-navy)" : "var(--color-white)",
                color: isActive ? "var(--color-cream)" : "var(--color-text-secondary)",
                border: isActive
                  ? "1px solid var(--color-navy)"
                  : "1px solid var(--color-border)",
                cursor: "pointer",
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
                transition: "all var(--motion-duration-fast) var(--motion-ease-out)",
              }}
            >
              <span>{opt.label}</span>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  padding: "0.1rem 0.45rem",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: isActive ? "rgba(198, 165, 107, 0.3)" : "rgba(11, 31, 51, 0.08)",
                  color: isActive ? "var(--color-gold-hover)" : "var(--color-text-secondary)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
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
          <p>Loading your voyage records...</p>
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
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-3)" }}>⚓</div>
          <h2 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)", color: "var(--color-navy)" }}>
            {activeFilter === "all" ? "No Reservations Yet" : `No ${activeFilter} reservations`}
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--font-size-sm)" }}>
            {activeFilter === "all"
              ? "You haven't requested any dock slips yet. Explore verified berths along your waterway fitted with full dimensional clearance."
              : `You have no trips currently under the '${activeFilter}' status. Adjust your filter or explore new berths.`}
          </p>
          <Link href="/#explore" className="btn btn-primary">
            Explore Available Berths
          </Link>
        </div>
      ) : (
        /* Bookings List Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-4)",
          }}
        >
          {filteredBookings.map((booking) => {
            const bookingId = booking._id || booking.id || "";
            const dock = booking.dockId;
            const vessel = booking.vesselId;

            return (
              <div
                key={bookingId}
                className="surface-slip-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                  padding: "var(--space-6)",
                }}
              >
                {/* Header row: Dock title & Status badge */}
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
                    <h2
                      style={{
                        fontSize: "var(--font-size-xl)",
                        color: "var(--color-navy)",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      {dock?.title || "Dock Berth"}
                    </h2>
                    <p
                      style={{
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <span>📍</span>
                      <span>
                        {dock?.location || "Coastal Waterway"}
                        {dock?.waterway ? ` • ${dock.waterway}` : ""}
                      </span>
                    </p>
                  </div>
                  <div>{getStatusBadge(booking.status)}</div>
                </div>

                {/* Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--color-cream-soft)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  {/* Reservation Dates */}
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
                    <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--color-navy)" }}>
                      {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
                    </strong>
                  </div>

                  {/* Vessel Information */}
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
                      Vessel
                    </span>
                    <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--color-navy)" }}>
                      {vessel?.name ? `🛥️ ${vessel.name}` : "Vessel profile"}
                    </strong>
                    {vessel && (
                      <span
                        style={{
                          display: "block",
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {vessel.lengthFt}′ LOA • {vessel.beamFt}′ Beam • {vessel.draftFt}′ Draft ({vessel.type})
                      </span>
                    )}
                  </div>

                  {/* Special Requests or Delay Notice */}
                  {booking.delayEta && (
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "var(--font-size-xs)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--color-warning)",
                          marginBottom: "var(--space-1)",
                        }}
                      >
                        Updated Arrival ETA
                      </span>
                      <strong style={{ fontSize: "var(--font-size-sm)", color: "var(--color-warning)" }}>
                        {new Date(booking.delayEta).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Footer Action row */}
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
                    Booked on {formatDate(booking.createdAt)}
                  </span>
                  <Link
                    href={`/boater/trips/${bookingId}`}
                    className="btn btn-navy"
                    style={{ fontSize: "var(--font-size-xs)", padding: "0.45rem 1rem" }}
                  >
                    View Trip Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
