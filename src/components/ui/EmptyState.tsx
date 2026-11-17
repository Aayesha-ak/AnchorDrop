"use client";

import React from "react";
import Link from "next/link";

export type EmptyStateIcon = "anchor" | "boat" | "dock" | "compass" | "calendar" | "search";

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: EmptyStateIcon | React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function renderMaritimeIcon(icon: EmptyStateIcon | React.ReactNode) {
  if (React.isValidElement(icon)) {
    return icon;
  }

  switch (icon) {
    case "boat":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Sail / Mast */}
          <path d="M12 2v13" />
          <path d="M12 3l7 8h-7" />
          <path d="M5 11l7-8v8H5" />
          {/* Hull */}
          <path d="M3 17l2 4h14l2-4H3z" />
        </svg>
      );
    case "dock":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Pier decking */}
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="2" y1="14" x2="22" y2="14" />
          {/* Pilings */}
          <line x1="6" y1="6" x2="6" y2="20" />
          <line x1="12" y1="6" x2="12" y2="20" />
          <line x1="18" y1="6" x2="18" y2="20" />
        </svg>
      );
    case "compass":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );
    case "calendar":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
        </svg>
      );
    case "search":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <path d="M11 8a3 3 0 0 0-3 3" />
        </svg>
      );
    case "anchor":
    default:
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="8" x2="12" y2="21" />
          <line x1="8" y1="11" x2="16" y2="11" />
          <path d="M5 14a7 7 0 0 0 14 0" />
        </svg>
      );
  }
}

export default function EmptyState({
  title,
  message,
  icon = "anchor",
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  secondaryActionHref,
  onSecondaryAction,
  className = "",
  style,
}: EmptyStateProps) {
  return (
    <div
      className={`surface-slip-card ${className}`}
      style={{
        textAlign: "center",
        padding: "var(--space-12, 48px) var(--space-6, 24px)",
        maxWidth: "520px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-white, #FFFFFF)",
        border: "1px dashed var(--color-gold-border, rgba(198, 165, 107, 0.35))",
        borderRadius: "var(--radius-lg, 12px)",
        boxShadow: "var(--shadow-sm, 0 1px 3px rgba(11, 31, 51, 0.08))",
        ...style,
      }}
    >
      {/* Maritime Icon Badge */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "var(--radius-pill, 9999px)",
          backgroundColor: "var(--color-gold-muted, rgba(198, 165, 107, 0.18))",
          border: "2px solid var(--color-gold, #C6A56B)",
          color: "var(--color-gold, #C6A56B)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4, 16px)",
          flexShrink: 0,
        }}
      >
        {renderMaritimeIcon(icon)}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--font-size-2xl, 1.5rem)",
          color: "var(--color-navy, #0B1F33)",
          fontWeight: "var(--font-weight-regular, 400)",
          marginBottom: "var(--space-2, 8px)",
        }}
      >
        {title}
      </h3>

      {/* Descriptive Message */}
      <p
        style={{
          color: "var(--color-text-secondary, #4A5B6B)",
          fontSize: "var(--font-size-base, 1rem)",
          lineHeight: "1.6",
          maxWidth: "420px",
          marginBottom: actionText || secondaryActionText ? "var(--space-6, 24px)" : 0,
        }}
      >
        {message}
      </p>

      {/* Action Buttons */}
      {(actionText || secondaryActionText) && (
        <div
          style={{
            display: "flex",
            gap: "var(--space-3, 12px)",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {actionText && (
            actionHref ? (
              <Link href={actionHref} className="btn btn-primary">
                {actionText}
              </Link>
            ) : (
              <button type="button" onClick={onAction} className="btn btn-primary">
                {actionText}
              </button>
            )
          )}

          {secondaryActionText && (
            secondaryActionHref ? (
              <Link href={secondaryActionHref} className="btn btn-outline">
                {secondaryActionText}
              </Link>
            ) : (
              <button type="button" onClick={onSecondaryAction} className="btn btn-outline">
                {secondaryActionText}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
