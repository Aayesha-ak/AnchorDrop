"use client";

import { DEMO_ACCOUNTS, USER_ROLES, UserRole } from "@/lib/constants";

interface DemoButtonsProps {
  onSelect: (email: string, password: string, role?: UserRole) => void;
}

export default function DemoButtons({ onSelect }: DemoButtonsProps) {
  const commonPassword = "password123";

  return (
    <div
      style={{
        marginTop: "var(--space-4)",
        paddingTop: "var(--space-4)",
        borderTop: "1px dashed var(--color-border)",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "var(--space-2)",
          textAlign: "center",
        }}
      >
        — 1-Click Quick Demo Accounts —
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "var(--space-2)",
        }}
      >
        <button
          type="button"
          onClick={() =>
            onSelect(DEMO_ACCOUNTS.BOATER.email, commonPassword, USER_ROLES.BOATER)
          }
          className="btn btn-outline"
          style={{
            fontSize: "var(--font-size-xs)",
            padding: "0.4rem 0.6rem",
            justifyContent: "space-between",
            borderColor: "var(--color-border)",
          }}
        >
          <span>⚓ <strong>Captain Alex</strong> (Boater)</span>
          <span style={{ color: "var(--color-gold)", fontSize: "0.7rem" }}>2 vessels · trips</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onSelect(
              DEMO_ACCOUNTS.MARINA_OWNER.email,
              commonPassword,
              USER_ROLES.DOCK_OWNER
            )
          }
          className="btn btn-outline"
          style={{
            fontSize: "var(--font-size-xs)",
            padding: "0.4rem 0.6rem",
            justifyContent: "space-between",
            borderColor: "var(--color-border)",
          }}
        >
          <span>🏢 <strong>Marina Del Sol</strong> (Owner)</span>
          <span style={{ color: "var(--color-gold)", fontSize: "0.7rem" }}>3 berths · requests</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onSelect(
              DEMO_ACCOUNTS.PRIVATE_HOST.email,
              commonPassword,
              USER_ROLES.DOCK_OWNER
            )
          }
          className="btn btn-outline"
          style={{
            fontSize: "var(--font-size-xs)",
            padding: "0.4rem 0.6rem",
            justifyContent: "space-between",
            borderColor: "var(--color-border)",
          }}
        >
          <span>🏡 <strong>Sarah Jenkins</strong> (Host)</span>
          <span style={{ color: "var(--color-gold)", fontSize: "0.7rem" }}>1 slip · FL Harbor</span>
        </button>
      </div>
    </div>
  );
}
