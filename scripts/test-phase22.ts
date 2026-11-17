import assert from "assert";
import fs from "fs";
import path from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Import components and context
import { ToastProvider, useToast, ToastContext } from "../src/context/ToastContext";
import ToastContainer, { ToastItemComponent } from "../src/components/ui/Toast";
import type { ToastItem, ToastType } from "../src/context/ToastContext";
import ConfirmDialog from "../src/components/ui/ConfirmDialog";
import Skeleton from "../src/components/ui/Skeleton";
import EmptyState from "../src/components/ui/EmptyState";
import RootError from "../src/app/error";
import GlobalError from "../src/app/global-error";
import Forbidden from "../src/app/forbidden";

async function runPhase22Tests() {
  console.log("⚓ Running Phase 22 Feedback System, Empty/Error/Loading Polish Verification...");

  // 1. Verify ToastContext exports and types
  console.log("\n  [1/8] Verifying ToastContext & useToast...");
  assert.ok(ToastProvider, "ToastProvider must be exported");
  assert.ok(useToast, "useToast hook must be exported");
  assert.ok(ToastContext, "ToastContext must be exported");

  // Verify ToastProvider renders without crashing
  const dummyChild = React.createElement("div", { id: "test-child" }, "Harbor Content");
  const providerMarkup = renderToStaticMarkup(React.createElement(ToastProvider, null, dummyChild));
  assert.ok(providerMarkup.includes("Harbor Content"), "ToastProvider renders children in static tree");
  console.log("  ✓ ToastProvider & ToastContext successfully verified");

  // 2. Verify Toast UI Components (ToastContainer & ToastItemComponent)
  console.log("\n  [2/8] Verifying Toast UI Components...");
  assert.ok(ToastContainer, "ToastContainer must be exported");
  assert.ok(ToastItemComponent, "ToastItemComponent must be exported");

  const sampleToastItems: ToastItem[] = [
    { id: "t1", message: "Vessel registered successfully!", type: "success", duration: 4000, createdAt: Date.now() },
    { id: "t2", message: "Failed to reserve dock slip.", type: "error", duration: 4000, createdAt: Date.now() },
    { id: "t3", message: "Mooring line draft is near harbor limit.", type: "warning", duration: 4000, createdAt: Date.now() },
    { id: "t4", message: "Dock amenities updated.", type: "info", duration: 4000, createdAt: Date.now() },
  ];

  let dismissedId = "";
  const handleDismiss = (id: string) => {
    dismissedId = id;
  };

  // Test empty container
  const emptyContainerMarkup = renderToStaticMarkup(
    React.createElement(ToastContainer, { toasts: [], onDismiss: handleDismiss })
  );
  assert.strictEqual(emptyContainerMarkup, "", "ToastContainer returns empty markup when toasts array is empty");

  // Test populated container
  const populatedContainerMarkup = renderToStaticMarkup(
    React.createElement(ToastContainer, { toasts: sampleToastItems, onDismiss: handleDismiss })
  );
  assert.ok(populatedContainerMarkup.includes("Vessel registered successfully!"), "ToastContainer renders success message");
  assert.ok(populatedContainerMarkup.includes("Failed to reserve dock slip."), "ToastContainer renders error message");
  assert.ok(populatedContainerMarkup.includes("Mooring line draft is near harbor limit."), "ToastContainer renders warning message");
  assert.ok(populatedContainerMarkup.includes("Dock amenities updated."), "ToastContainer renders info message");

  // Test each toast item variant individually
  for (const t of sampleToastItems) {
    const itemMarkup = renderToStaticMarkup(
      React.createElement(ToastItemComponent, { toast: t, onDismiss: handleDismiss })
    );
    assert.ok(itemMarkup.includes(t.message), `ToastItemComponent renders message for ${t.type}`);
    assert.ok(itemMarkup.includes('role="status"'), `ToastItemComponent has role status for ${t.type}`);
  }
  console.log("  ✓ Toast UI Components (success, error, warning, info) verified");

  // 3. Verify ConfirmDialog Component
  console.log("\n  [3/8] Verifying ConfirmDialog Component...");
  assert.ok(ConfirmDialog, "ConfirmDialog must be exported");

  let confirmed = false;
  let cancelled = false;

  const onConfirm = () => {
    confirmed = true;
  };
  const onCancel = () => {
    cancelled = true;
  };

  // Test closed state
  const closedMarkup = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      isOpen: false,
      title: "Delete Vessel",
      message: "Are you sure you want to delete this vessel?",
      onConfirm,
      onCancel,
    })
  );
  assert.strictEqual(closedMarkup, "", "ConfirmDialog must return empty markup when isOpen is false");

  // Test open standard confirm dialog
  const openMarkup = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      isOpen: true,
      title: "Approve Reservation",
      message: "Confirm guest arrival at Pier 4?",
      confirmText: "Approve",
      cancelText: "Dismiss",
      isDestructive: false,
      onConfirm,
      onCancel,
    })
  );
  assert.ok(openMarkup.includes("Approve Reservation"), "ConfirmDialog renders title");
  assert.ok(openMarkup.includes("Confirm guest arrival at Pier 4?"), "ConfirmDialog renders message");
  assert.ok(openMarkup.includes("Approve"), "ConfirmDialog renders confirmText");
  assert.ok(openMarkup.includes("Dismiss"), "ConfirmDialog renders cancelText");
  assert.ok(openMarkup.includes('role="dialog"'), "ConfirmDialog includes role=dialog");

  // Test destructive confirm dialog
  const destructiveMarkup = renderToStaticMarkup(
    React.createElement(ConfirmDialog, {
      isOpen: true,
      title: "Delete Dock Slip",
      message: "This will permanently remove Berth A-12.",
      confirmText: "Delete Slip",
      isDestructive: true,
      onConfirm,
      onCancel,
    })
  );
  assert.ok(destructiveMarkup.includes("Delete Dock Slip"), "Destructive ConfirmDialog renders title");
  assert.ok(destructiveMarkup.includes("Delete Slip"), "Destructive ConfirmDialog renders confirmText");
  console.log("  ✓ ConfirmDialog standard & destructive variants verified");

  // 4. Verify Skeleton Component
  console.log("\n  [4/8] Verifying Skeleton Component...");
  assert.ok(Skeleton, "Skeleton must be exported");

  // Test text variant
  const textMarkup = renderToStaticMarkup(React.createElement(Skeleton, { variant: "text", lines: 3 }));
  assert.ok(textMarkup.includes("skeleton-text"), "Skeleton text variant renders");

  // Test avatar variant
  const avatarMarkup = renderToStaticMarkup(
    React.createElement(Skeleton, { variant: "avatar", width: 64, height: 64 })
  );
  assert.ok(avatarMarkup.includes("skeleton-avatar"), "Skeleton avatar variant renders");

  // Test card variant
  const cardMarkup = renderToStaticMarkup(React.createElement(Skeleton, { variant: "card", count: 3 }));
  assert.ok(cardMarkup.includes("skeleton-card"), "Skeleton card variant renders");

  // Test table variant
  const tableMarkup = renderToStaticMarkup(React.createElement(Skeleton, { variant: "table", rows: 5, cols: 4 }));
  assert.ok(tableMarkup.includes("skeleton-table"), "Skeleton table variant renders with rows and cols");
  console.log("  ✓ Skeleton all 4 variants (text, avatar, card, table) verified");

  // 5. Verify EmptyState Component
  console.log("\n  [5/8] Verifying EmptyState Component...");
  assert.ok(EmptyState, "EmptyState must be exported");

  const icons: Array<"anchor" | "boat" | "dock" | "compass" | "calendar" | "search"> = [
    "anchor",
    "boat",
    "dock",
    "compass",
    "calendar",
    "search",
  ];

  for (const ic of icons) {
    const emptyMarkup = renderToStaticMarkup(
      React.createElement(EmptyState, {
        title: `No ${ic}s Found`,
        message: `There are currently no ${ic} items recorded in the ship log.`,
        icon: ic,
        actionText: "Create One",
        actionHref: "/create",
      })
    );
    assert.ok(emptyMarkup.includes(`No ${ic}s Found`), `EmptyState renders title for icon ${ic}`);
    assert.ok(emptyMarkup.includes("Create One"), `EmptyState renders action link for icon ${ic}`);
  }

  // Test button callback action
  const emptyButtonMarkup = renderToStaticMarkup(
    React.createElement(EmptyState, {
      title: "No Vessels Registered",
      message: "Register your first craft to start requesting docking slips.",
      icon: "boat",
      actionText: "Add Vessel",
      onAction: () => {},
      secondaryActionText: "Browse Harbor",
      secondaryActionHref: "/explore",
    })
  );
  assert.ok(emptyButtonMarkup.includes("No Vessels Registered"), "EmptyState renders title");
  assert.ok(emptyButtonMarkup.includes("Add Vessel"), "EmptyState renders button text");
  assert.ok(emptyButtonMarkup.includes("Browse Harbor"), "EmptyState renders secondary link text");
  console.log("  ✓ EmptyState maritime icons & action buttons verified");

  // 6. Verify error.tsx
  console.log("\n  [6/8] Verifying Root Error Boundary (src/app/error.tsx)...");
  assert.ok(RootError, "RootError component must be exported");

  const mockError = new Error("Navigational beacon unreachable") as Error & { digest?: string };
  mockError.digest = "NAV_BEACON_ERR_4091";

  const rootErrorMarkup = renderToStaticMarkup(
    React.createElement(RootError, {
      error: mockError,
      reset: () => {},
    })
  );
  assert.ok(rootErrorMarkup.includes("Unexpected Navigation Disturbance"), "RootError renders navigation disturbance title");
  assert.ok(rootErrorMarkup.includes("NAV_BEACON_ERR_4091"), "RootError displays error digest");
  assert.ok(rootErrorMarkup.includes("Chart Course Again"), "RootError displays reset button");
  assert.ok(rootErrorMarkup.includes("Return to Safe Harbor"), "RootError displays safe harbor link");
  console.log("  ✓ Root error boundary verified");

  // 7. Verify global-error.tsx and forbidden.tsx
  console.log("\n  [7/8] Verifying Global Error & 403 Forbidden Pages...");
  assert.ok(GlobalError, "GlobalError component must be exported");

  const catastrophicError = new Error("Fatal core failure");
  const globalErrorMarkup = renderToStaticMarkup(
    React.createElement(GlobalError, {
      error: catastrophicError,
      reset: () => {},
    })
  );
  assert.ok(globalErrorMarkup.includes("<html"), "GlobalError renders html tag");
  assert.ok(globalErrorMarkup.includes("<body"), "GlobalError renders body tag");
  assert.ok(globalErrorMarkup.includes("Severe Maritime Disturbance"), "GlobalError renders disturbance title");
  assert.ok(globalErrorMarkup.includes("Re-engage Navigational Systems"), "GlobalError renders reset button");

  assert.ok(Forbidden, "Forbidden page component must be exported");
  const forbiddenMarkup = renderToStaticMarkup(React.createElement(Forbidden));
  assert.ok(forbiddenMarkup.includes("403 — Restricted Anchorage"), "Forbidden page renders 403 title");
  assert.ok(forbiddenMarkup.includes("Return to Safe Harbor"), "Forbidden page renders return link");
  assert.ok(forbiddenMarkup.includes("Sign In with Authorized Role"), "Forbidden page renders sign in link");
  console.log("  ✓ Global error boundary and 403 Forbidden page verified");

  // 8. Verify layout.tsx integration
  console.log("\n  [8/8] Verifying layout.tsx ToastProvider wiring...");
  const layoutPath = path.join(__dirname, "../src/app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  assert.ok(
    layoutContent.includes("ToastProvider"),
    "layout.tsx must import and wrap children in ToastProvider"
  );
  assert.ok(
    layoutContent.includes("<ToastProvider>") && layoutContent.includes("</ToastProvider>"),
    "layout.tsx must have opening and closing <ToastProvider> tags"
  );
  console.log("  ✓ layout.tsx ToastProvider integration confirmed");

  console.log("\n⚓ All Phase 22 tests passed successfully! [8/8 SUITES OK]\n");
}

runPhase22Tests().catch((err) => {
  console.error("❌ Phase 22 verification failed:", err);
  process.exit(1);
});
