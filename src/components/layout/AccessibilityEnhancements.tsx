"use client";

import React, { useEffect, useState, useCallback } from "react";

/**
 * --------------------------------------------------------------------------
 * AnchorDrop Accessibility Enhancements
 * Compliant with WCAG 2.1 AA Standards
 * --------------------------------------------------------------------------
 */

// Custom event name for screen reader live announcements
const ANNOUNCE_EVENT = "anchor-drop-aria-announce";

export interface AnnounceDetail {
  message: string;
  priority: "polite" | "assertive";
}

/**
 * Global helper to announce messages to screen reader users asynchronously.
 * Can be called from any client component, form handler, or service callback.
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  if (typeof window === "undefined") return;

  const event = new CustomEvent<AnnounceDetail>(ANNOUNCE_EVENT, {
    detail: { message, priority },
  });
  window.dispatchEvent(event);
}

/**
 * React hook to dispatch live announcements.
 */
export function useAriaAnnouncer() {
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      announceToScreenReader(message, priority);
    },
    []
  );

  return { announce };
}

/**
 * Screen Reader Accessible Skip-To-Content Link
 * Visually hidden until keyboard focus is received.
 */
export function SkipToContent({
  targetId = "main-content",
  label = "Skip to main content",
}: {
  targetId?: string;
  label?: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute("tabIndex", "-1");
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="skip-to-content"
      aria-label={label}
    >
      {label}
    </a>
  );
}

/**
 * ARIA Live Region Announcer Component
 * Houses polite and assertive live regions for async state updates (bookings, filter results, alerts).
 */
export function LiveAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState<string>("");
  const [assertiveMessage, setAssertiveMessage] = useState<string>("");

  useEffect(() => {
    const handleAnnounce = (e: Event) => {
      const customEvent = e as CustomEvent<AnnounceDetail>;
      if (!customEvent.detail?.message) return;

      const { message, priority } = customEvent.detail;
      if (priority === "assertive") {
        setAssertiveMessage(message);
        // Reset after announcement to allow repeating same string
        setTimeout(() => setAssertiveMessage(""), 2000);
      } else {
        setPoliteMessage(message);
        setTimeout(() => setPoliteMessage(""), 2000);
      }
    };

    window.addEventListener(ANNOUNCE_EVENT, handleAnnounce);
    return () => window.removeEventListener(ANNOUNCE_EVENT, handleAnnounce);
  }, []);

  return (
    <>
      <div
        id="aria-live-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        id="aria-live-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </>
  );
}

/**
 * VisuallyHidden Helper
 * Hides content visually while preserving it for assistive technology.
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
  className = "",
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}) {
  return (
    <Component className={`sr-only ${className}`.trim()}>{children}</Component>
  );
}

/**
 * AccessibleIcon Helper
 * Ensures icons are properly announced or hidden depending on purpose.
 * If label is provided, provides an accessible name. Otherwise, marks as aria-hidden.
 */
export interface AccessibleIconProps {
  icon: React.ReactNode;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AccessibleIcon({
  icon,
  label,
  className = "",
  style,
}: AccessibleIconProps) {
  if (!label) {
    return (
      <span aria-hidden="true" className={className} style={style}>
        {icon}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      className={className}
      style={{ display: "inline-flex", alignItems: "center", ...style }}
    >
      <span aria-hidden="true">{icon}</span>
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}

/**
 * StatusIndicator Helper
 * Meets Sub-phase 23.7: "Status not color-only (text + icon)"
 * Combines distinct text, icon, and semantic badge for color-blind accessibility.
 */
export interface StatusIndicatorProps {
  status: "pending" | "accepted" | "rejected" | "completed" | "delayed" | string;
  label?: string;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  className = "",
}: StatusIndicatorProps) {
  const normStatus = status.toLowerCase();

  const getStatusConfig = () => {
    switch (normStatus) {
      case "accepted":
      case "confirmed":
        return {
          badgeClass: "badge-accepted",
          icon: "✓",
          defaultText: "Accepted",
        };
      case "pending":
        return {
          badgeClass: "badge-pending",
          icon: "⏳",
          defaultText: "Pending Review",
        };
      case "rejected":
      case "cancelled":
        return {
          badgeClass: "badge-rejected",
          icon: "✕",
          defaultText: "Declined",
        };
      case "delayed":
        return {
          badgeClass: "badge-pending animate-badge-attention",
          icon: "⚠️",
          defaultText: "Delayed",
        };
      case "completed":
        return {
          badgeClass: "badge-completed",
          icon: "⚓",
          defaultText: "Completed",
        };
      default:
        return {
          badgeClass: "badge-info",
          icon: "ℹ",
          defaultText: status,
        };
    }
  };

  const config = getStatusConfig();
  const displayText = label || config.defaultText;

  return (
    <span
      className={`badge ${config.badgeClass} ${className}`.trim()}
      role="status"
    >
      <AccessibleIcon icon={config.icon} />
      <span>{displayText}</span>
    </span>
  );
}

/**
 * Combined accessibility root wrapper.
 * Recommended to include near top of RootLayout.
 */
export default function AccessibilityEnhancements() {
  return (
    <>
      <SkipToContent />
      <LiveAnnouncer />
    </>
  );
}
