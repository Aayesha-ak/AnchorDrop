"use client";

import React, { useEffect, useRef, useState, useId } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  // Handle ESC key and focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore on close
    const previousActiveElement = document.activeElement as HTMLElement | null;

    // Focus cancel button by default for safety
    const timeout = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!loading) {
          onCancel();
        }
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElement?.focus?.();
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (err) {
      console.error("[ConfirmDialog] Confirm action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(6, 17, 28, 0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4, 16px)",
        zIndex: 9999,
        animation: "dialogFadeIn 200ms var(--motion-ease-out, ease-out)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <style>{`
        @keyframes dialogFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dialogZoomIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="surface-slip-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "var(--space-6, 24px)",
          backgroundColor: "var(--color-white, #FFFFFF)",
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "var(--shadow-modal, 0 20px 50px rgba(11, 31, 51, 0.28))",
          animation: "dialogZoomIn 200ms var(--motion-ease-out, ease-out)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-4, 16px)" }}>
          {/* Status Icon */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-pill, 9999px)",
              backgroundColor: isDestructive ? "var(--color-danger-bg, #FDECEB)" : "var(--color-warning-bg, #FEF7EA)",
              border: `1px solid ${isDestructive ? "var(--color-danger-border, #F6A5A1)" : "var(--color-warning-border, #F3CF8F)"}`,
              color: isDestructive ? "var(--color-danger, #B3261E)" : "var(--color-warning, #B87304)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isDestructive ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
          </div>

          {/* Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              id={titleId}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--font-size-xl, 1.25rem)",
                fontWeight: "var(--font-weight-semibold, 600)",
                color: "var(--color-navy, #0B1F33)",
                margin: 0,
                marginBottom: "var(--space-2, 8px)",
              }}
            >
              {title}
            </h2>

            <p
              id={descId}
              style={{
                fontSize: "var(--font-size-sm, 0.875rem)",
                color: "var(--color-text-secondary, #4A5B6B)",
                lineHeight: "1.55",
                margin: 0,
              }}
            >
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-3, 12px)",
            marginTop: "var(--space-6, 24px)",
          }}
        >
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "var(--space-2, 8px) var(--space-4, 16px)",
              fontSize: "var(--font-size-sm, 0.875rem)",
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={isDestructive ? "btn" : "btn btn-primary"}
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: "var(--space-2, 8px) var(--space-4, 16px)",
              fontSize: "var(--font-size-sm, 0.875rem)",
              fontWeight: "var(--font-weight-semibold, 600)",
              backgroundColor: isDestructive ? "var(--color-danger, #B3261E)" : undefined,
              color: isDestructive ? "var(--color-white, #FFFFFF)" : undefined,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
