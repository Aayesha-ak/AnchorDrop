"use client";

import { useState, useEffect, useRef } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Handle ESC key to close modal (Sub-phase 9.8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="surface-slip-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          position: "relative",
          boxShadow: "var(--shadow-modal)",
          padding: "var(--space-8)",
          outline: "none",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "var(--space-4)",
            right: "var(--space-4)",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-navy)",
            borderRadius: "var(--radius-pill)",
            fontSize: "1.25rem",
          }}
        >
          ✕
        </button>

        {/* Modal Header & Tabs */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <h2
            id="auth-modal-title"
            style={{
              fontSize: "var(--font-size-3xl)",
              marginBottom: "var(--space-1)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Anchor<span style={{ color: "var(--color-gold)" }}>Drop</span>
          </h2>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            {tab === "login"
              ? "Welcome back to your place on the water"
              : "Create an account to join the docking marketplace"}
          </p>

          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--color-border)",
              marginTop: "var(--space-4)",
            }}
          >
            <button
              onClick={() => setTab("login")}
              style={{
                flex: 1,
                padding: "var(--space-3)",
                fontSize: "var(--font-size-sm)",
                fontWeight: tab === "login" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                color: tab === "login" ? "var(--color-navy)" : "var(--color-text-muted)",
                borderBottom: tab === "login" ? "2px solid var(--color-gold)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              style={{
                flex: 1,
                padding: "var(--space-3)",
                fontSize: "var(--font-size-sm)",
                fontWeight: tab === "register" ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                color: tab === "register" ? "var(--color-navy)" : "var(--color-text-muted)",
                borderBottom: tab === "register" ? "2px solid var(--color-gold)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Forms */}
        {tab === "login" ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <RegisterForm onSuccess={onClose} />
        )}
      </div>
    </div>
  );
}
