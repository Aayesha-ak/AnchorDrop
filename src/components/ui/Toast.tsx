"use client";

import React, { useEffect, useState } from "react";
import type { ToastItem, ToastType } from "@/context/ToastContext";

interface ToastItemProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function ToastItemComponent({ toast, onDismiss }: ToastItemProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onDismiss(toast.id), 250);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const handleManualDismiss = () => {
    setIsClosing(true);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  const getTheme = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          borderColor: "var(--color-success, #1B7A4E)",
          accentBg: "var(--color-success-bg, #E8F5EF)",
          iconColor: "var(--color-success, #1B7A4E)",
          progressBarColor: "var(--color-success, #1B7A4E)",
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ),
          label: "Success",
        };
      case "error":
        return {
          borderColor: "var(--color-danger, #B3261E)",
          accentBg: "var(--color-danger-bg, #FDECEB)",
          iconColor: "var(--color-danger, #B3261E)",
          progressBarColor: "var(--color-danger, #B3261E)",
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          label: "Error",
        };
      case "warning":
        return {
          borderColor: "var(--color-gold, #C6A56B)",
          accentBg: "var(--color-warning-bg, #FEF7EA)",
          iconColor: "var(--color-warning, #B87304)",
          progressBarColor: "var(--color-gold, #C6A56B)",
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          label: "Warning",
        };
      case "info":
      default:
        return {
          borderColor: "var(--color-navy, #0B1F33)",
          accentBg: "var(--color-info-bg, #EBF4FA)",
          iconColor: "var(--color-info, #1B5E8A)",
          progressBarColor: "var(--color-navy, #0B1F33)",
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ),
          label: "Information",
        };
    }
  };

  const theme = getTheme(toast.type);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        backgroundColor: "var(--color-white, #FFFFFF)",
        color: "var(--color-text-primary, #0B1F33)",
        border: "1px solid var(--color-border-subtle, rgba(11, 31, 51, 0.1))",
        borderLeft: `4px solid ${theme.borderColor}`,
        borderRadius: "var(--radius-md, 8px)",
        boxShadow: "var(--shadow-lg, 0 10px 28px rgba(11, 31, 51, 0.12))",
        pointerEvents: "auto",
        minWidth: "300px",
        maxWidth: "420px",
        overflow: "hidden",
        transition: "all 250ms var(--motion-ease-out, ease-out)",
        opacity: isClosing ? 0 : 1,
        transform: isClosing ? "translateX(100%)" : "translateX(0)",
      }}
    >
      {/* Maritime Status Icon */}
      <div
        style={{
          flexShrink: 0,
          color: theme.iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1px",
        }}
      >
        {theme.icon}
      </div>

      {/* Toast Message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm, 0.875rem)",
            lineHeight: "1.45",
            fontWeight: "var(--font-weight-medium, 500)",
            color: "var(--color-text-primary, #0B1F33)",
            wordBreak: "break-word",
          }}
        >
          {toast.message}
        </p>
      </div>

      {/* Manual Dismiss Button */}
      <button
        type="button"
        onClick={handleManualDismiss}
        aria-label={`Dismiss ${theme.label}`}
        style={{
          flexShrink: 0,
          background: "none",
          border: "none",
          padding: "2px",
          color: "var(--color-text-muted, #6B7C8D)",
          cursor: "pointer",
          borderRadius: "var(--radius-sm, 4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          marginTop: "1px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress Bar (Auto-dismiss countdown) */}
      {toast.duration > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3px",
            backgroundColor: theme.progressBarColor,
            width: "100%",
            animation: `toastCountdown ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          top: "var(--space-6, 24px)",
          right: "var(--space-6, 24px)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3, 12px)",
          pointerEvents: "none",
          maxWidth: "calc(100vw - 32px)",
          animation: "toastSlideIn 250ms var(--motion-ease-out, ease-out)",
        }}
      >
        {toasts.map((toast) => (
          <ToastItemComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}
