"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES, UserRole } from "@/lib/constants";

interface RegisterFormProps {
  onSuccess?: () => void;
  defaultRole?: UserRole;
}

export default function RegisterForm({
  onSuccess,
  defaultRole = USER_ROLES.BOATER,
}: RegisterFormProps) {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      if (onSuccess) {
        onSuccess();
      }

      if (user.role === USER_ROLES.DOCK_OWNER) {
        router.push("/owner");
      } else {
        router.push("/boater");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {error}
        </div>
      )}

      {/* Role Selector (Sub-phase 9.2) */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-2)",
            color: "var(--color-navy)",
          }}
        >
          I want to register as:
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-2)",
          }}
        >
          <button
            type="button"
            onClick={() => setRole(USER_ROLES.BOATER)}
            style={{
              padding: "var(--space-3)",
              border: `2px solid ${
                role === USER_ROLES.BOATER ? "var(--color-gold)" : "var(--color-border)"
              }`,
              borderRadius: "var(--radius-md)",
              backgroundColor:
                role === USER_ROLES.BOATER ? "var(--color-gold-muted)" : "var(--color-white)",
              color: "var(--color-navy)",
              textAlign: "center",
              fontWeight: role === USER_ROLES.BOATER ? 600 : 400,
            }}
          >
            ⚓ Boater
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
              Find & book slips
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole(USER_ROLES.DOCK_OWNER)}
            style={{
              padding: "var(--space-3)",
              border: `2px solid ${
                role === USER_ROLES.DOCK_OWNER ? "var(--color-gold)" : "var(--color-border)"
              }`,
              borderRadius: "var(--radius-md)",
              backgroundColor:
                role === USER_ROLES.DOCK_OWNER ? "var(--color-gold-muted)" : "var(--color-white)",
              color: "var(--color-navy)",
              textAlign: "center",
              fontWeight: role === USER_ROLES.DOCK_OWNER ? 600 : 400,
            }}
          >
            🏡 Dock Owner
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
              Monetize vacant berths
            </span>
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="reg-name"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-1)",
            color: "var(--color-navy)",
          }}
        >
          Full Name
        </label>
        <input
          id="reg-name"
          type="text"
          required
          placeholder="Captain Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          autoComplete="name"
        />
      </div>

      <div>
        <label
          htmlFor="reg-email"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-1)",
            color: "var(--color-navy)",
          }}
        >
          Email Address
        </label>
        <input
          id="reg-email"
          type="email"
          required
          placeholder="alex@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div>
        <label
          htmlFor="reg-password"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-1)",
            color: "var(--color-navy)",
          }}
        >
          Password (min. 6 characters)
        </label>
        <input
          id="reg-password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
        style={{ width: "100%", padding: "var(--space-3) var(--space-4)", marginTop: "var(--space-2)" }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
