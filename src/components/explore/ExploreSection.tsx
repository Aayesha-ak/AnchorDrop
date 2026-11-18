"use client";

import { useState, useEffect, useCallback } from "react";
import FilterBar, { FilterState } from "./FilterBar";
import DockGrid from "./DockGrid";
import DockMap from "./DockMap";
import { PublicDock } from "@/lib/serializers";
import { FEATURES } from "@/lib/features";

const initialFilters: FilterState = {
  search: "",
  location: "",
  dockType: "",
  maxLength: "",
  minDepth: "",
  maxPrice: "",
};

export default function ExploreSection() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [docks, setDocks] = useState<PublicDock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const fetchDocks = useCallback(async (currentFilters: FilterState) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentFilters.search.trim()) params.append("search", currentFilters.search.trim());
      if (currentFilters.location.trim()) params.append("location", currentFilters.location.trim());
      if (currentFilters.dockType.trim()) params.append("dockType", currentFilters.dockType.trim());
      if (currentFilters.maxLength && Number(currentFilters.maxLength) > 0) {
        params.append("maxLength", currentFilters.maxLength);
      }
      if (currentFilters.minDepth && Number(currentFilters.minDepth) > 0) {
        params.append("minDepth", currentFilters.minDepth);
      }
      if (currentFilters.maxPrice && Number(currentFilters.maxPrice) > 0) {
        params.append("maxPrice", currentFilters.maxPrice);
      }

      const res = await fetch(`/api/docks?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load docking spaces");
      }

      setDocks(data.docks || []);
    } catch (err) {
      console.error("[Explore] Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unable to load docks");
      setDocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when filters change (with small debounce on text input)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocks(filters);
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, fetchDocks]);

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div>
      {/* Search & Filter Controls (Sub-phase 13.1) */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
        totalResults={docks.length}
        loading={loading}
      />

      {/* Error state */}
      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            marginBottom: "var(--space-6)",
            fontSize: "var(--font-size-sm)",
            textAlign: "center",
          }}
        >
          {error}.{" "}
          <button
            onClick={() => fetchDocks(filters)}
            style={{ textDecoration: "underline", fontWeight: 600, color: "var(--color-danger)" }}
          >
            Try reloading
          </button>
        </div>
      )}

      {/* View Toggle Bar (Only active when NEXT_PUBLIC_ENABLE_MAPS=true) */}
      {FEATURES.ENABLE_MAPS && !loading && docks.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            marginBottom: "var(--space-6)",
            paddingBottom: "var(--space-3)",
            borderBottom: "1px solid var(--color-border-subtle)",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Showing <strong>{docks.length}</strong> verified coastal berths
          </div>
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "var(--color-cream-soft)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-pill)",
              padding: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                backgroundColor: viewMode === "grid" ? "var(--color-navy)" : "transparent",
                color: viewMode === "grid" ? "var(--color-cream)" : "var(--color-text-secondary)",
              }}
            >
              📋 Slips Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                backgroundColor: viewMode === "map" ? "var(--color-navy)" : "transparent",
                color: viewMode === "map" ? "var(--color-cream)" : "var(--color-text-secondary)",
              }}
            >
              🗺️ Waterway Map
            </button>
          </div>
        </div>
      )}

      {/* Render Map or Grid based on toggle */}
      {FEATURES.ENABLE_MAPS && viewMode === "map" ? (
        <div style={{ marginBottom: "var(--space-8)" }}>
          <DockMap docks={docks} />
        </div>
      ) : (
        /* Berths Grid Results & Skeletons (Sub-phase 13.2, 13.3, 13.4, 13.8) */
        <DockGrid
          docks={docks}
          loading={loading}
          onClearFilters={handleClearFilters}
        />
      )}
    </div>
  );
}
