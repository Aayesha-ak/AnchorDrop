"use client";

import { useState } from "react";

export interface FilterState {
  search: string;
  location: string;
  dockType: string;
  maxLength: string;
  minDepth: string;
  maxPrice: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  totalResults: number;
  loading?: boolean;
}

export default function FilterBar({
  filters,
  onChange,
  onClear,
  totalResults,
  loading = false,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.location) ||
    Boolean(filters.dockType) ||
    Boolean(filters.maxLength) ||
    Boolean(filters.minDepth) ||
    Boolean(filters.maxPrice);

  const handleChange = (field: keyof FilterState, val: string) => {
    onChange({
      ...filters,
      [field]: val,
    });
  };

  return (
    <div
      className="surface-slip-card"
      style={{
        padding: "var(--space-6)",
        marginBottom: "var(--space-8)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Top Search Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-3)",
          alignItems: "flex-end",
          marginBottom: showAdvanced ? "var(--space-4)" : 0,
        }}
      >
        {/* Keyword Search */}
        <div>
          <label
            htmlFor="filter-search"
            style={{
              display: "block",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-navy)",
              marginBottom: "var(--space-1)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Search Berths
          </label>
          <input
            id="filter-search"
            type="text"
            placeholder="Marina name, waterway, city..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            style={{ fontSize: "var(--font-size-sm)" }}
          />
        </div>

        {/* Location Filter */}
        <div>
          <label
            htmlFor="filter-location"
            style={{
              display: "block",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-navy)",
              marginBottom: "var(--space-1)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Location / Waterway
          </label>
          <input
            id="filter-location"
            type="text"
            placeholder="e.g. Fort Lauderdale, Biscayne"
            value={filters.location}
            onChange={(e) => handleChange("location", e.target.value)}
            style={{ fontSize: "var(--font-size-sm)" }}
          />
        </div>

        {/* Dock Type Select */}
        <div>
          <label
            htmlFor="filter-type"
            style={{
              display: "block",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--color-navy)",
              marginBottom: "var(--space-1)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Berth Type
          </label>
          <select
            id="filter-type"
            value={filters.dockType}
            onChange={(e) => handleChange("dockType", e.target.value)}
            style={{ fontSize: "var(--font-size-sm)" }}
          >
            <option value="">All Berth Types</option>
            <option value="Private Slip">Private Residential Slip</option>
            <option value="Marina Berth">Commercial Marina Berth</option>
            <option value="T-Head">T-Head / End Tie</option>
            <option value="Mooring">Mooring Ball</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-outline"
            style={{
              flex: 1,
              padding: "var(--space-3)",
              fontSize: "var(--font-size-xs)",
              borderColor: showAdvanced ? "var(--color-gold)" : "var(--color-border)",
              color: showAdvanced ? "var(--color-gold)" : "var(--color-navy)",
            }}
          >
            {showAdvanced ? "▲ Fewer Filters" : "▼ Dims & Depth"}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="btn btn-outline"
              style={{
                padding: "var(--space-3) var(--space-4)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
              }}
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Advanced Dimensional Filters (Sub-phase 13.1) */}
      {showAdvanced && (
        <div
          style={{
            paddingTop: "var(--space-4)",
            borderTop: "1px dashed var(--color-border-subtle)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          <div>
            <label
              htmlFor="filter-length"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-navy)",
                marginBottom: "var(--space-1)",
              }}
            >
              Vessel Length (Min. ft allowed)
            </label>
            <input
              id="filter-length"
              type="number"
              min="1"
              max="500"
              placeholder="e.g. 42"
              value={filters.maxLength}
              onChange={(e) => handleChange("maxLength", e.target.value)}
              style={{ fontSize: "var(--font-size-sm)" }}
            />
          </div>

          <div>
            <label
              htmlFor="filter-depth"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-navy)",
                marginBottom: "var(--space-1)",
              }}
            >
              Water Depth (Min. low-tide ft)
            </label>
            <input
              id="filter-depth"
              type="number"
              min="1"
              max="50"
              placeholder="e.g. 6"
              value={filters.minDepth}
              onChange={(e) => handleChange("minDepth", e.target.value)}
              style={{ fontSize: "var(--font-size-sm)" }}
            />
          </div>

          <div>
            <label
              htmlFor="filter-price"
              style={{
                display: "block",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-navy)",
                marginBottom: "var(--space-1)",
              }}
            >
              Max Daily Rate ($)
            </label>
            <input
              id="filter-price"
              type="number"
              min="0"
              placeholder="e.g. 150"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              style={{ fontSize: "var(--font-size-sm)" }}
            />
          </div>
        </div>
      )}

      {/* Results Count & Status Indicator */}
      <div
        style={{
          marginTop: "var(--space-4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-secondary)",
          borderTop: "1px solid var(--color-border-subtle)",
          paddingTop: "var(--space-3)",
        }}
      >
        <span>
          {loading ? (
            "Scanning coastal berths..."
          ) : (
            <>
              Showing <strong>{totalResults}</strong> available berth{totalResults === 1 ? "" : "s"}
            </>
          )}
        </span>
        {hasActiveFilters && (
          <span style={{ color: "var(--color-gold)", fontStyle: "italic" }}>
            Filters applied
          </span>
        )}
      </div>
    </div>
  );
}
