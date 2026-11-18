"use client";

import dynamic from "next/dynamic";
import { PublicDock } from "@/lib/serializers";

interface DockMapProps {
  docks: PublicDock[];
}

const DynamicDockMapInner = dynamic(() => import("./DockMapInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "480px",
        width: "100%",
        backgroundColor: "var(--color-cream-soft)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-secondary)",
        gap: "var(--space-2)",
      }}
    >
      <div style={{ fontSize: "2.5rem" }}>🗺️</div>
      <p style={{ fontWeight: 600 }}>Loading Waterway Navigation Chart...</p>
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
        Fetching OpenStreetMap & OpenSeaMap marine tiles
      </span>
    </div>
  ),
});

export default function DockMap({ docks }: DockMapProps) {
  return <DynamicDockMapInner docks={docks} />;
}
