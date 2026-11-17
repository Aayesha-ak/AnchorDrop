"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import DemoButtons from "./DemoButtons";
import { USER_ROLES } from "@/lib/constants";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (onSuccess) {
        onSuccess();
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else if (user.role === USER_ROLES.DOCK_OWNER) {
        router.push("/owner");
      } else {
        router.push("/boater");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
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

      <div>
        <label
          htmlFor="login-email"
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
          id="login-email"
          type="email"
          required
          placeholder="captain@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            marginBottom: "var(--space-1)",
            color: "var(--color-navy)",
          }}
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
        style={{ width: "100%", padding: "var(--space-3) var(--space-4)", marginTop: "var(--space-2)" }}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      {/* 1-Click Demo Credentials */}
      <DemoButtons onSelect={handleDemoSelect} />
    </form>
  );
}
