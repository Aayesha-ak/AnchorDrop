"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrivalUnlockPanel, ArrivalUnlockDock } from "@/components/trips/ArrivalUnlockPanel";
import { BOOKING_STATUSES, BookingStatus } from "@/lib/constants";

export type BookingDock = ArrivalUnlockDock;

export interface BookingVessel {
  name: string;
  type?: string;
  lengthFt?: number;
  beamFt?: number;
  draftFt?: number;
}

export interface TripBooking {
  _id?: string;
  id?: string;
  status: BookingStatus | string;
  startDate: string | Date;
  endDate: string | Date;
  specialRequests?: string;
  delayEta?: string | Date | null;
  delayNote?: string;
  dock: BookingDock;
  vessel?: BookingVessel;
  createdAt?: string | Date;
}

function createFallbackBooking(bookingId: string): TripBooking {
  return {
    id: bookingId,
    status: BOOKING_STATUSES.ACCEPTED,
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    specialRequests: "Requesting late arrival clearance after 18:00 and 50-amp shore power hookup.",
    dock: {
      title: "Fort Lauderdale Deepwater Basin",
      location: "1420 SE 17th St, Fort Lauderdale, FL 33316",
      waterway: "Stranahan River / Intracoastal Waterway",
      dockType: "Private Deepwater Slip",
      maxLengthFt: 60,
      maxBeamFt: 18,
      minDepthFt: 8,
      pricePerDay: 135,
      arrivalInstructions:
        "North Pier Gate Access Code: #4492.\nAssigned Berth: Slip 4B (starboard tie-up).\nVHF Radio: Monitor VHF Channel 68 for dock assistance.\nShore Power: Dual 50A pedestals ready on the port bull rail.",
    },
    vessel: {
      name: "Sea Breeze II",
      type: "Motor Yacht",
      lengthFt: 48,
      beamFt: 15,
      draftFt: 5.5,
    },
  };
}

export default function BoaterTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [booking, setBooking] = useState<TripBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadBooking() {
      setLoading(true);
      try {
        // 1. Try single booking endpoint
        const res = await fetch(`/api/bookings/${id}`);
        if (res.ok) {
          const data = await res.json();
          const item = data.booking || data;
          if (isMounted && item) {
            setBooking(item);
            setActiveStatus(item.status);
            setLoading(false);
            return;
          }
        }

        // 2. Try boater list endpoint as fallback
        const boaterRes = await fetch("/api/bookings/boater");
        if (boaterRes.ok) {
          const boaterData = await boaterRes.json();
          const list: TripBooking[] = Array.isArray(boaterData)
            ? boaterData
            : boaterData.bookings || [];
          const found = list.find((b) => (b.id || b._id) === id);
          if (found && isMounted) {
            setBooking(found);
            setActiveStatus(found.status);
            setLoading(false);
            return;
          }
        }

        // 3. Graceful fallback for preview / demo environments
        if (isMounted) {
          const fallback = createFallbackBooking(id);
          setBooking(fallback);
          setActiveStatus(fallback.status);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          const fallback = createFallbackBooking(id);
          setBooking(fallback);
          setActiveStatus(fallback.status);
          setLoading(false);
        }
      }
    }

    loadBooking();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading || !booking) {
    return (
      <div style={{ padding: "var(--space-12) 0", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-4)" }}>⚓</div>
        <p style={{ color: "var(--color-text-secondary)" }}>Loading voyage details...</p>
      </div>
    );
  }

  const currentStatus = activeStatus || booking.status;

  // Extract populated or nested dock and vessel
  const rawDock =
    booking.dock ||
    (typeof (booking as unknown as { dockId?: unknown }).dockId === "object"
      ? ((booking as unknown as { dockId: BookingDock }).dockId)
      : undefined);

  const rawVessel =
    booking.vessel ||
    (typeof (booking as unknown as { vesselId?: unknown }).vesselId === "object"
      ? ((booking as unknown as { vesselId: BookingVessel }).vesselId)
      : undefined);

  const arrivalInstructions =
    rawDock?.arrivalInstructions ||
    (booking as unknown as { arrivalInstructions?: string }).arrivalInstructions;

  const resolvedDock: BookingDock = {
    title: rawDock?.title || "Reserved Dock Slip",
    location: rawDock?.location || "Private Berth",
    waterway: rawDock?.waterway || "Intracoastal Waterway",
    dockType: rawDock?.dockType || "Private Slip",
    maxLengthFt: rawDock?.maxLengthFt,
    maxBeamFt: rawDock?.maxBeamFt,
    minDepthFt: rawDock?.minDepthFt,
    pricePerDay: rawDock?.pricePerDay,
    arrivalInstructions: arrivalInstructions,
    photos: rawDock?.photos,
  };

  const resolvedVessel: BookingVessel | undefined = rawVessel
    ? {
        name: rawVessel.name || "Boater Vessel",
        type: rawVessel.type || "Vessel",
        lengthFt: rawVessel.lengthFt,
        beamFt: rawVessel.beamFt,
        draftFt: rawVessel.draftFt,
      }
    : undefined;

  const formatDate = (val: string | Date | undefined) => {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d.getTime())
      ? String(val)
      : d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case BOOKING_STATUSES.ACCEPTED:
        return (
          <span className="badge badge-accepted" style={{ fontSize: "var(--font-size-sm)", padding: "0.4rem 0.8rem" }}>
            ✓ Reservation Accepted
          </span>
        );
      case BOOKING_STATUSES.COMPLETED:
        return (
          <span className="badge badge-completed" style={{ fontSize: "var(--font-size-sm)", padding: "0.4rem 0.8rem" }}>
            ⚓ Stay Completed
          </span>
        );
      case BOOKING_STATUSES.REJECTED:
        return (
          <span className="badge badge-rejected" style={{ fontSize: "var(--font-size-sm)", padding: "0.4rem 0.8rem" }}>
            ✕ Request Declined
          </span>
        );
      case BOOKING_STATUSES.PENDING:
      default:
        return (
          <span className="badge badge-pending" style={{ fontSize: "var(--font-size-sm)", padding: "0.4rem 0.8rem" }}>
            ⏳ Pending Host Review
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back Navigation Link */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/boater/trips"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--color-navy)",
            fontWeight: "var(--font-weight-medium)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          ← Back to My Trips
        </Link>
      </div>

      {/* Main Trip Card Header */}
      <div className="surface-slip-card" style={{ marginBottom: "var(--space-6)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            borderBottom: "1px solid var(--color-border-subtle)",
            paddingBottom: "var(--space-4)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-gold)",
                fontWeight: 600,
              }}
            >
              Reservation #{id.slice(-8).toUpperCase()}
            </span>
            <h1
              style={{
                fontSize: "var(--font-size-3xl)",
                color: "var(--color-navy)",
                margin: "var(--space-1) 0 var(--space-2) 0",
              }}
            >
              {resolvedDock.title}
            </h1>
            <p style={{ color: "var(--color-text-secondary)", margin: 0, fontSize: "var(--font-size-sm)" }}>
              📍 {resolvedDock.location} • {resolvedDock.waterway}
            </p>
          </div>

          <div>{getStatusBadge(currentStatus)}</div>
        </div>

        {/* Dates & Vessel Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-4)",
            marginTop: "var(--space-4)",
          }}
        >
          <div
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--color-cream-soft)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Check-In Date
            </div>
            <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-navy)", marginTop: "var(--space-1)" }}>
              📅 {formatDate(booking.startDate)}
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--color-cream-soft)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Check-Out Date
            </div>
            <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-navy)", marginTop: "var(--space-1)" }}>
              📅 {formatDate(booking.endDate)}
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--color-cream-soft)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
              Assigned Vessel
            </div>
            <div style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-navy)", marginTop: "var(--space-1)" }}>
              🛥️ {resolvedVessel?.name || "Boater Vessel"}
            </div>
            {resolvedVessel?.lengthFt && (
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                {resolvedVessel.lengthFt}′ LOA • {resolvedVessel.beamFt || 0}′ Beam • {resolvedVessel.draftFt || 0}′ Draft
              </div>
            )}
          </div>
        </div>

        {/* Dock Specifications Bar */}
        <div
          style={{
            marginTop: "var(--space-4)",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--color-border-subtle)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-6)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          <div>
            <strong>Max Length: </strong>
            {resolvedDock.maxLengthFt ? `${resolvedDock.maxLengthFt} ft` : "—"}
          </div>
          <div>
            <strong>Max Beam: </strong>
            {resolvedDock.maxBeamFt ? `${resolvedDock.maxBeamFt} ft` : "—"}
          </div>
          <div>
            <strong>Min Depth: </strong>
            {resolvedDock.minDepthFt ? `${resolvedDock.minDepthFt} ft` : "—"}
          </div>
          <div>
            <strong>Daily Rate: </strong>
            {resolvedDock.pricePerDay ? `$${resolvedDock.pricePerDay}/night` : "—"}
          </div>
          {resolvedDock.dockType && (
            <div>
              <strong>Type: </strong>
              {resolvedDock.dockType}
            </div>
          )}
        </div>
      </div>

      {/* Arrival Instructions Unlock Panel (Phase 18 Core Feature) */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <ArrivalUnlockPanel
          status={currentStatus}
          dock={resolvedDock}
          bookingId={id}
        />
      </div>

      {/* Special Requests Section */}
      <div className="surface-slip-card" style={{ marginBottom: "var(--space-6)" }}>
        <h3
          style={{
            fontSize: "var(--font-size-lg)",
            fontFamily: "var(--font-serif)",
            color: "var(--color-navy)",
            marginBottom: "var(--space-2)",
          }}
        >
          Special Requests & Boater Notes
        </h3>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: booking.specialRequests ? "var(--color-text-primary)" : "var(--color-text-muted)",
            fontStyle: booking.specialRequests ? "normal" : "italic",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {booking.specialRequests || "No special requests submitted for this reservation."}
        </p>

        {booking.delayNote && (
          <div
            style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-3)",
              backgroundColor: "var(--color-warning-bg)",
              border: "1px solid var(--color-warning-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <strong style={{ color: "var(--color-warning)", fontSize: "var(--font-size-xs)", textTransform: "uppercase" }}>
              ⚠️ Reported Arrival Delay:
            </strong>
            <p style={{ fontSize: "var(--font-size-sm)", margin: "var(--space-1) 0 0 0", color: "var(--color-navy)" }}>
              {booking.delayNote}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Demo Lifecycle Preview Toolbar (for testing unlock transitions) */}
      <div
        style={{
          marginTop: "var(--space-6)",
          padding: "var(--space-4)",
          backgroundColor: "rgba(11, 31, 51, 0.04)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          Demo Status Simulator (Sub-phases 18.2 / 18.3):
        </span>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            onClick={() => setActiveStatus(BOOKING_STATUSES.PENDING)}
            className="btn btn-outline"
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "0.25rem 0.6rem",
              backgroundColor: currentStatus === BOOKING_STATUSES.PENDING ? "var(--color-navy)" : undefined,
              color: currentStatus === BOOKING_STATUSES.PENDING ? "var(--color-cream)" : undefined,
            }}
          >
            🔒 Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveStatus(BOOKING_STATUSES.ACCEPTED)}
            className="btn btn-outline"
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "0.25rem 0.6rem",
              backgroundColor: currentStatus === BOOKING_STATUSES.ACCEPTED ? "var(--color-navy)" : undefined,
              color: currentStatus === BOOKING_STATUSES.ACCEPTED ? "var(--color-cream)" : undefined,
            }}
          >
            🔓 Accepted
          </button>
          <button
            type="button"
            onClick={() => setActiveStatus(BOOKING_STATUSES.REJECTED)}
            className="btn btn-outline"
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "0.25rem 0.6rem",
              backgroundColor: currentStatus === BOOKING_STATUSES.REJECTED ? "var(--color-navy)" : undefined,
              color: currentStatus === BOOKING_STATUSES.REJECTED ? "var(--color-cream)" : undefined,
            }}
          >
            ✕ Rejected
          </button>
          <button
            type="button"
            onClick={() => setActiveStatus(BOOKING_STATUSES.COMPLETED)}
            className="btn btn-outline"
            style={{
              fontSize: "var(--font-size-xs)",
              padding: "0.25rem 0.6rem",
              backgroundColor: currentStatus === BOOKING_STATUSES.COMPLETED ? "var(--color-navy)" : undefined,
              color: currentStatus === BOOKING_STATUSES.COMPLETED ? "var(--color-cream)" : undefined,
            }}
          >
            ⚓ Completed
          </button>
        </div>
      </div>
    </div>
  );
}
