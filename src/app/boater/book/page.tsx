"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicDock } from "@/lib/serializers";

interface VesselItem {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  lengthFt: number;
  beamFt: number;
  draftFt: number;
  registration: string;
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dockId = searchParams.get("dockId");

  const [dock, setDock] = useState<PublicDock | null>(null);
  const [vessels, setVessels] = useState<VesselItem[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load dock info and boater's registered vessels
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!dockId) {
        setPageError("No dock berth specified. Please select a dock from the explore marketplace.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setPageError(null);

      try {
        const [dockRes, vesselsRes] = await Promise.all([
          fetch(`/api/docks/${dockId}`),
          fetch("/api/vessels"),
        ]);

        const dockData = await dockRes.json();
        const vesselsData = await vesselsRes.json();

        if (!dockRes.ok) {
          throw new Error(dockData.error || "Failed to load dock listing");
        }

        if (isMounted) {
          setDock(dockData.dock);

          const vesselList: VesselItem[] = vesselsData.vessels || [];
          setVessels(vesselList);

          if (vesselList.length > 0) {
            const firstId = vesselList[0]._id || vesselList[0].id || "";
            setSelectedVesselId(firstId);
          }
        }
      } catch (err) {
        if (isMounted) {
          setPageError(err instanceof Error ? err.message : "Error loading booking details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dockId]);

  // Selected vessel object
  const selectedVessel = useMemo(() => {
    return vessels.find((v) => (v._id || v.id) === selectedVesselId) || null;
  }, [vessels, selectedVesselId]);

  // Compatibility fit checks
  const fitStatus = useMemo(() => {
    if (!selectedVessel || !dock) return null;

    const lengthOk = selectedVessel.lengthFt <= dock.maxLengthFt;
    const beamOk = selectedVessel.beamFt <= dock.maxBeamFt;
    const draftOk = selectedVessel.draftFt <= dock.minDepthFt;
    const isCompatible = lengthOk && beamOk && draftOk;

    return {
      lengthOk,
      beamOk,
      draftOk,
      isCompatible,
    };
  }, [selectedVessel, dock]);

  // Date range and pricing calculation
  const { stayDays, totalPrice, dateError } = useMemo(() => {
    if (!startDate || !endDate) {
      return { stayDays: 0, totalPrice: 0, dateError: null };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { stayDays: 0, totalPrice: 0, dateError: "Invalid date format" };
    }

    if (end < start) {
      return {
        stayDays: 0,
        totalPrice: 0,
        dateError: "Check-out date must be on or after check-in date",
      };
    }

    const diffMs = end.getTime() - start.getTime();
    const daysCalc = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const calculatedDays = daysCalc === 0 ? 1 : daysCalc;
    const rate = dock?.pricePerDay || 0;

    return {
      stayDays: calculatedDays,
      totalPrice: calculatedDays * rate,
      dateError: null,
    };
  }, [startDate, endDate, dock]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!dockId || !selectedVesselId || !startDate || !endDate) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    if (dateError) {
      setSubmitError(dateError);
      return;
    }

    if (fitStatus && !fitStatus.isCompatible) {
      setSubmitError("Selected vessel dimensions exceed dock parameters. Cannot proceed.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dockId,
          vesselId: selectedVesselId,
          startDate,
          endDate,
          specialRequests: specialRequests.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit reservation request");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/boater/trips");
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-6) 0" }}>
        <div style={{ height: "24px", width: "160px", backgroundColor: "#e2e8f0", borderRadius: "4px", marginBottom: "var(--space-6)" }} />
        <div style={{ height: "180px", backgroundColor: "#e2e8f0", borderRadius: "var(--radius-lg)", marginBottom: "var(--space-6)" }} />
        <div style={{ height: "300px", backgroundColor: "#e2e8f0", borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  // Page error view (missing dock or not found)
  if (pageError || !dock) {
    return (
      <div
        className="surface-slip-card"
        style={{
          maxWidth: "600px",
          margin: "var(--space-8) auto",
          textAlign: "center",
          padding: "var(--space-8)",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-3)" }}>⚓</div>
        <h2 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-2)" }}>
          Unable to Load Berth
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)" }}>
          {pageError || "The requested dock berth listing could not be found or is inactive."}
        </p>
        <Link href="/#explore" className="btn btn-primary">
          Browse Available Docks
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Back Link */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link
          href={`/docks/${dock.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-1)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-gold)",
            fontWeight: 500,
          }}
        >
          ← Back to Berth Details
        </Link>
      </div>

      {/* Page Heading */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--font-size-3xl)", marginBottom: "var(--space-2)" }}>
          Request Berth Reservation
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>
          Verify your vessel fit and submit an official berthing request to the dock host.
        </p>
      </div>

      {/* Success Notification Modal / Banner */}
      {success && (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--color-success-bg)",
            border: "1px solid var(--color-success-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-5)",
            marginBottom: "var(--space-6)",
            color: "var(--color-success)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: "1.75rem" }}>🎉</span>
            <div>
              <h3 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-success)", marginBottom: "var(--space-1)" }}>
                Reservation Request Submitted!
              </h3>
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" }}>
                Your request has been delivered with status <strong>Pending Host Review</strong>. Redirecting you to My Trips...
              </p>
            </div>
          </div>
          <div style={{ marginTop: "var(--space-4)" }}>
            <Link href="/boater/trips" className="btn btn-primary" style={{ fontSize: "var(--font-size-xs)", padding: "0.4rem 1rem" }}>
              View My Trips Now →
            </Link>
          </div>
        </div>
      )}

      {/* Inline Submission Error */}
      {submitError && (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            marginBottom: "var(--space-6)",
            color: "var(--color-danger)",
            fontSize: "var(--font-size-sm)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <span>⚠️</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Dock Summary on Right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-6)",
          alignItems: "start",
        }}
      >
        {/* Left Column: Request Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Step 1: Vessel Selection */}
          <div className="surface-slip-card">
            <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span>1.</span> Select Your Vessel
            </h2>

            {vessels.length === 0 ? (
              <div
                style={{
                  backgroundColor: "var(--color-warning-bg)",
                  border: "1px solid var(--color-warning-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-2)" }}>🛥️</div>
                <h4 style={{ fontSize: "var(--font-size-base)", color: "var(--color-warning)", marginBottom: "var(--space-1)" }}>
                  No Registered Vessels Found
                </h4>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
                  Berth reservations require a registered vessel profile to verify length, beam, and draft clearances.
                </p>
                <Link href="/boater/vessels" className="btn btn-navy" style={{ fontSize: "var(--font-size-xs)" }}>
                  Register a Vessel First
                </Link>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="vessel-select"
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Boater Fleet
                </label>
                <select
                  id="vessel-select"
                  value={selectedVesselId}
                  onChange={(e) => setSelectedVesselId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "var(--space-3)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-white)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {vessels.map((v) => {
                    const id = v._id || v.id;
                    return (
                      <option key={id} value={id}>
                        {v.name} ({v.type}) — {v.lengthFt}&prime; LOA, {v.beamFt}&prime; beam, {v.draftFt}&prime; draft
                      </option>
                    );
                  })}
                </select>

                {/* Preliminary Fit Indicator */}
                {selectedVessel && fitStatus && (
                  <div
                    style={{
                      marginTop: "var(--space-4)",
                      padding: "var(--space-4)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: fitStatus.isCompatible
                        ? "var(--color-success-bg)"
                        : "var(--color-danger-bg)",
                      border: `1px solid ${
                        fitStatus.isCompatible
                          ? "var(--color-success-border)"
                          : "var(--color-danger-border)"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        fontWeight: 600,
                        fontSize: "var(--font-size-sm)",
                        color: fitStatus.isCompatible
                          ? "var(--color-success)"
                          : "var(--color-danger)",
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      <span>{fitStatus.isCompatible ? "✓" : "⚠️"}</span>
                      <span>
                        {fitStatus.isCompatible
                          ? "Preliminary Fit Verified: Vessel fits dock parameters"
                          : "Incompatible: Vessel dimensions exceed dock parameters"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "var(--space-2)",
                        fontSize: "var(--font-size-xs)",
                      }}
                    >
                      <div
                        style={{
                          padding: "var(--space-2)",
                          backgroundColor: "rgba(255,255,255,0.7)",
                          borderRadius: "var(--radius-sm)",
                          color: fitStatus.lengthOk ? "var(--color-text-primary)" : "var(--color-danger)",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>Length Overall</div>
                        <div>
                          {selectedVessel.lengthFt}&prime; / Max {dock.maxLengthFt}&prime;{" "}
                          {fitStatus.lengthOk ? "✓" : "✗"}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "var(--space-2)",
                          backgroundColor: "rgba(255,255,255,0.7)",
                          borderRadius: "var(--radius-sm)",
                          color: fitStatus.beamOk ? "var(--color-text-primary)" : "var(--color-danger)",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>Beam Width</div>
                        <div>
                          {selectedVessel.beamFt}&prime; / Max {dock.maxBeamFt}&prime;{" "}
                          {fitStatus.beamOk ? "✓" : "✗"}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "var(--space-2)",
                          backgroundColor: "rgba(255,255,255,0.7)",
                          borderRadius: "var(--radius-sm)",
                          color: fitStatus.draftOk ? "var(--color-text-primary)" : "var(--color-danger)",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>Draft Depth</div>
                        <div>
                          {selectedVessel.draftFt}&prime; / Min {dock.minDepthFt}&prime;{" "}
                          {fitStatus.draftOk ? "✓" : "✗"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Date Range */}
          <div className="surface-slip-card">
            <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span>2.</span> Select Reservation Dates
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div>
                <label
                  htmlFor="start-date"
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Check-in Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "var(--space-2) var(--space-3)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="end-date"
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Check-out Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "var(--space-2) var(--space-3)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </div>
            </div>

            {dateError && (
              <div
                style={{
                  marginTop: "var(--space-3)",
                  color: "var(--color-danger)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                ⚠️ {dateError}
              </div>
            )}
          </div>

          {/* Step 3: Special Requests */}
          <div className="surface-slip-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <h2 style={{ fontSize: "var(--font-size-lg)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span>3.</span> Special Requests & Notes (Optional)
              </h2>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {specialRequests.length}/500
              </span>
            </div>

            <textarea
              id="special-requests"
              value={specialRequests}
              maxLength={500}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g., Shore power 50A connection needed, tender towing assistance, or approximate arrival time window..."
              rows={4}
              style={{
                width: "100%",
                padding: "var(--space-3)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-primary)",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={
                submitting ||
                success ||
                vessels.length === 0 ||
                !selectedVesselId ||
                !startDate ||
                !endDate ||
                !!dateError ||
                (fitStatus ? !fitStatus.isCompatible : false)
              }
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "var(--space-3)",
                fontSize: "var(--font-size-base)",
                fontWeight: 600,
                opacity:
                  submitting ||
                  success ||
                  vessels.length === 0 ||
                  !selectedVesselId ||
                  !startDate ||
                  !endDate ||
                  !!dateError ||
                  (fitStatus ? !fitStatus.isCompatible : false)
                    ? 0.5
                    : 1,
                cursor:
                  submitting ||
                  success ||
                  vessels.length === 0 ||
                  !selectedVesselId ||
                  !startDate ||
                  !endDate ||
                  !!dateError ||
                  (fitStatus ? !fitStatus.isCompatible : false)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting
                ? "Submitting Request..."
                : success
                ? "Request Submitted!"
                : "Submit Reservation Request"}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                marginTop: "var(--space-2)",
              }}
            >
              💵 Pay at Berth / Dockside: No online card is charged now. Settlement occurs directly with host upon arrival.
            </p>
          </div>
        </form>

        {/* Right Column: Dock Summary & Price Breakdown */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Dock Summary Card */}
          <div className="surface-slip-card">
            <div style={{ fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-gold)", marginBottom: "var(--space-1)" }}>
              Selected Berth
            </div>
            <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-1)" }}>
              {dock.title}
            </h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
              📍 {dock.location} • {dock.waterway}
            </p>

            <div
              style={{
                paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--color-border-subtle)",
                marginBottom: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Berth Type:</span>
                <span style={{ fontWeight: 500 }}>{dock.dockType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Max Vessel Length:</span>
                <span style={{ fontWeight: 600 }}>{dock.maxLengthFt}&prime; LOA</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Max Vessel Beam:</span>
                <span style={{ fontWeight: 600 }}>{dock.maxBeamFt}&prime;</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Min Water Depth:</span>
                <span style={{ fontWeight: 600 }}>{dock.minDepthFt}&prime; (low tide)</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div
              style={{
                paddingTop: "var(--space-4)",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-2)" }}>
                <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)" }}>Daily Rate:</span>
                <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-navy)" }}>
                  ${dock.pricePerDay}
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 400, color: "var(--color-text-muted)" }}> / day</span>
                </span>
              </div>

              {stayDays > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-3)", fontSize: "var(--font-size-sm)" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>Duration:</span>
                  <span>{stayDays} day{stayDays > 1 ? "s" : ""}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  paddingTop: "var(--space-3)",
                  borderTop: "1px dashed var(--color-border)",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "var(--font-size-base)" }}>Estimated Total:</span>
                <span style={{ fontWeight: 700, fontSize: "var(--font-size-2xl)", color: "var(--color-gold)" }}>
                  ${totalPrice}
                </span>
              </div>

              {stayDays > 0 && (
                <div style={{ textAlign: "right", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                  ({stayDays} day{stayDays > 1 ? "s" : ""} × ${dock.pricePerDay}/day)
                </div>
              )}

              {/* Dockside Direct Payment Callout */}
              <div
                style={{
                  marginTop: "var(--space-4)",
                  padding: "var(--space-3)",
                  backgroundColor: "var(--color-cream-soft)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border-subtle)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--color-navy)", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.25rem" }}>
                  <span>💵</span> Payment Method: Pay at Berth
                </div>
                <p style={{ color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.4 }}>
                  Direct dockside settlement (cash or direct host payment upon arrival). Zero online card processing fees.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function BookBerthPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-6) 0", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>⚓</div>
          <p style={{ color: "var(--color-text-secondary)" }}>Loading booking interface...</p>
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
