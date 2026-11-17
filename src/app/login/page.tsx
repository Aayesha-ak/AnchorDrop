import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - var(--header-height) - 100px)",
        paddingTop: "var(--space-8)",
        paddingBottom: "var(--space-8)",
      }}
    >
      <div
        className="surface-slip-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <h1 style={{ fontSize: "var(--font-size-3xl)", marginBottom: "var(--space-2)" }}>
            Sign In
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Access your boater or dock owner account
          </p>
        </div>

        <LoginForm />

        <div
          style={{
            textAlign: "center",
            marginTop: "var(--space-6)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--color-border-subtle)",
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-secondary)",
          }}
        >
          Don&apos;t have an account yet?{" "}
          <Link href="/register" style={{ color: "var(--color-gold)", fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
}
