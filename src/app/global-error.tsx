"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AnchorDrop GlobalError Catastrophe]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F1E8",
          color: "#0B1F33",
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid rgba(11, 31, 51, 0.15)",
            boxShadow: "0 20px 50px rgba(11, 31, 51, 0.28)",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          {/* Beacon Warning Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#FDECEB",
              border: "2px solid #F6A5A1",
              color: "#B3261E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <span
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#B3261E",
              fontWeight: 600,
            }}
          >
            Critical Fleet Emergency
          </span>

          <h1
            style={{
              fontSize: "26px",
              marginTop: "8px",
              marginBottom: "12px",
              fontFamily: "Georgia, serif",
              color: "#0B1F33",
            }}
          >
            Severe Maritime Disturbance
          </h1>

          <p
            style={{
              color: "#4A5B6B",
              fontSize: "15px",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            A critical disruption occurred at the root navigation level.
            Emergency harbor protocols have suspended active channel transmissions.
          </p>

          {(error?.message || error?.digest) && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "#FAF8F4",
                border: "1px solid rgba(11, 31, 51, 0.08)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#6B7C8D",
                textAlign: "left",
                fontFamily: "monospace",
                marginBottom: "24px",
                wordBreak: "break-all",
              }}
            >
              {error.digest && <div><strong>Digest:</strong> {error.digest}</div>}
              {error.message && <div><strong>Error:</strong> {error.message}</div>}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: "#C6A56B",
                color: "#0B1F33",
                fontWeight: 600,
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Re-engage Navigational Systems
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              }}
              style={{
                backgroundColor: "transparent",
                color: "#0B1F33",
                fontWeight: 500,
                border: "1px solid rgba(11, 31, 51, 0.25)",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Return to Safe Harbor
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
