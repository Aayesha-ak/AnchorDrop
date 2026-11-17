"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";
import AuthModal from "@/components/auth/AuthModal";

export default function Header() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const handleOpenAuth = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const dashboardPath = user?.role === USER_ROLES.DOCK_OWNER ? "/owner" : "/boater";
  const dashboardLabel = user?.role === USER_ROLES.DOCK_OWNER ? "Owner Hub" : "Boater Hub";

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: isScrolled ? "rgba(245, 241, 232, 0.95)" : "var(--color-cream)",
          backdropFilter: isScrolled ? "blur(8px)" : "none",
          borderBottom: isScrolled ? "1px solid var(--color-border)" : "1px solid transparent",
          transition: "all var(--motion-duration-normal) var(--motion-ease-out)",
          boxShadow: isScrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div
          className="container"
          style={{
            height: "var(--header-height)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Nav Items */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "var(--space-8)",
            }}
            className="desktop-nav"
          >
            <Link
              href="/#explore"
              style={{
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-navy)",
              }}
            >
              Explore Docks
            </Link>
            <Link
              href="/#how-it-works"
              style={{
                fontSize: "var(--font-size-base)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-navy)",
              }}
            >
              How It Works
            </Link>
            {user && (
              <Link
                href={dashboardPath}
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-navy)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                }}
              >
                <span>{dashboardLabel}</span>
              </Link>
            )}
          </nav>

          {/* Desktop Session-Aware Action Group (Sub-phase 9.3) */}
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
            className="desktop-actions"
          >
            {!loading && user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <Link
                  href={dashboardPath}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "var(--color-white)",
                    border: "1px solid var(--color-border)",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--color-navy)",
                      color: "var(--color-gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 600,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-navy)" }}>
                    {user.name}
                  </span>
                  <span className={`badge ${user.role === USER_ROLES.DOCK_OWNER ? "badge-info" : "badge-accepted"}`}>
                    {user.role === USER_ROLES.DOCK_OWNER ? "Owner" : "Boater"}
                  </span>
                </Link>

                <Link href={dashboardPath} className="btn btn-primary" style={{ padding: "0.45rem 1rem" }}>
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ padding: "0.45rem 0.85rem" }}
                >
                  Sign Out
                </button>
              </div>
            ) : !loading ? (
              <>
                <button
                  onClick={() => handleOpenAuth("login")}
                  className="btn btn-outline"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth("register")}
                  className="btn btn-primary"
                  style={{ padding: "0.5rem 1.25rem" }}
                >
                  List Your Berth
                </button>
              </>
            ) : null}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              color: "var(--color-navy)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Drawer Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              top: "var(--header-height)",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(11, 31, 51, 0.4)",
              zIndex: 98,
            }}
          />
        )}

        {/* Mobile Navigation Drawer */}
        <div
          style={{
            position: "fixed",
            top: "var(--header-height)",
            right: 0,
            bottom: 0,
            width: "min(320px, 85vw)",
            backgroundColor: "var(--color-cream)",
            borderLeft: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-modal)",
            transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform var(--motion-duration-normal) var(--motion-ease-out)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            padding: "var(--space-6)",
            gap: "var(--space-4)",
          }}
        >
          {user && (
            <div
              style={{
                paddingBottom: "var(--space-3)",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
              }}
            >
              <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                {user.email}
              </span>
              <span
                className={`badge ${user.role === USER_ROLES.DOCK_OWNER ? "badge-info" : "badge-accepted"}`}
                style={{ width: "fit-content", marginTop: "var(--space-1)" }}
              >
                {user.role === USER_ROLES.DOCK_OWNER ? "Dock Owner" : "Boater"}
              </span>
            </div>
          )}

          <Link
            href="/#explore"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-medium)",
              padding: "var(--space-2) 0",
              borderBottom: "1px solid var(--color-border-subtle)",
            }}
          >
            Explore Docks
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-medium)",
              padding: "var(--space-2) 0",
              borderBottom: "1px solid var(--color-border-subtle)",
            }}
          >
            How It Works
          </Link>

          {user && (
            <Link
              href={dashboardPath}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-gold)",
                padding: "var(--space-2) 0",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              {dashboardLabel}
            </Link>
          )}

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {user ? (
              <button onClick={handleLogout} className="btn btn-outline" style={{ width: "100%" }}>
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleOpenAuth("login")}
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth("register")}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  List Your Berth
                </button>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          @media (min-width: 768px) {
            .desktop-nav {
              display: flex !important;
            }
            .desktop-actions {
              display: flex !important;
            }
            .mobile-toggle {
              display: none !important;
            }
          }
        `}</style>
      </header>

      {/* Reusable Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
