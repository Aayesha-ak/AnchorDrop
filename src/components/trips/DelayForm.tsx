"use client";

import React, { useState, useEffect } from "react";

export interface DelayFormProps {
  bookingId: string;
  initialEta?: string | Date | null;
  initialNote?: string;
  onSuccess?: (updatedBooking?: unknown) => void;
  onCancel?: () => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  triggerLabel?: string;
}

function toDatetimeLocal(val?: string | Date | null): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
}

export function DelayForm({
  bookingId,
  initialEta,
  initialNote = "",
  onSuccess,
  onCancel,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  triggerLabel,
}: DelayFormProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const [eta, setEta] = useState<string>(() => toDatetimeLocal(initialEta));
  const [note, setNote] = useState<string>(initialNote);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialEta) {
      setEta(toDatetimeLocal(initialEta));
    }
  }, [initialEta]);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
    }
  }, [initialNote]);

  const handleToggle = () => {
    if (controlledIsOpen === undefined) {
      setInternalOpen(!internalOpen);
    }
    if (isExpanded && onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eta) {
      setErrorMessage("Please specify your new estimated arrival date and time.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/delay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delayEta: new Date(eta).toISOString(),
          delayNote: note.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to report arrival delay");
      }

      setSuccessMessage("Arrival delay reported successfully! The dock host has been alerted.");
      if (onSuccess) {
        onSuccess(data.booking);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Collapsed trigger button (when not controlled by parent)
  if (!isExpanded && controlledIsOpen === undefined) {
    const defaultLabel = initialEta ? "⚠️ Update Reported Delay" : "⏱️ Report Arrival Delay";
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="btn btn-outline"
        style={{
          borderColor: "var(--color-warning)",
          color: "var(--color-warning)",
          backgroundColor: "var(--color-warning-bg)",
          fontSize: "var(--font-size-xs)",
          padding: "0.45rem 0.9rem",
        }}
      >
        {triggerLabel || defaultLabel}
      </button>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--color-white)",
        border: "1px solid var(--color-warning-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-sm)",
        marginTop: "var(--space-4)",
      }}
      role="region"
      aria-label="Report Arrival Delay"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--space-4)",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "1.25rem" }}>⏱️</span>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "var(--font-size-base)",
                fontFamily: "var(--font-serif)",
                color: "var(--color-navy)",
              }}
            >
              Report Arrival Delay
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-secondary)",
              }}
            >
              Keep your dock host informed of weather, tide, bridge, or navigation changes.
            </p>
          </div>
        </div>

        {controlledIsOpen === undefined && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Close delay form"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              color: "var(--color-text-muted)",
              padding: "0.2rem",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Success notification */}
      {successMessage && (
        <div
          style={{
            backgroundColor: "var(--color-success-bg)",
            border: "1px solid var(--color-success-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--color-success)",
            fontSize: "var(--font-size-sm)",
          }}
          role="status"
        >
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            color: "var(--color-danger)",
            fontSize: "var(--font-size-sm)",
          }}
          role="alert"
        >
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "var(--space-4)" }}>
          <label
            htmlFor={`delay-eta-${bookingId}`}
            style={{
              display: "block",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-navy)",
              marginBottom: "var(--space-1)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            New Estimated Arrival Time (Local) *
          </label>
          <input
            id={`delay-eta-${bookingId}`}
            type="datetime-local"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            required
            disabled={submitting}
            style={{
              width: "100%",
              padding: "var(--space-2) var(--space-3)",
              fontSize: "var(--font-size-sm)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-white)",
            }}
          />
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-1)",
            }}
          >
            <label
              htmlFor={`delay-note-${bookingId}`}
              style={{
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-navy)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Delay Reason / Navigation Notes
            </label>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: note.length > 280 ? "var(--color-warning)" : "var(--color-text-muted)",
              }}
            >
              {note.length}/300
            </span>
          </div>
          <textarea
            id={`delay-note-${bookingId}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            rows={3}
            disabled={submitting}
            placeholder="e.g., Delayed by heavy current / low tide; waiting on 16:30 railway bridge opening."
            style={{
              width: "100%",
              padding: "var(--space-2) var(--space-3)",
              fontSize: "var(--font-size-sm)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-white)",
              resize: "vertical",
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          {controlledIsOpen === undefined && (
            <button
              type="button"
              onClick={handleToggle}
              disabled={submitting}
              className="btn btn-outline"
              style={{ fontSize: "var(--font-size-xs)", padding: "0.45rem 1rem" }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ fontSize: "var(--font-size-xs)", padding: "0.45rem 1.2rem" }}
          >
            {submitting ? "Submitting..." : initialEta ? "Update Delay" : "Report Delay"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DelayForm;
