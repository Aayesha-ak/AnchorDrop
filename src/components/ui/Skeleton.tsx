"use client";

import React from "react";

export type SkeletonVariant = "card" | "text" | "table" | "avatar";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  lines?: number;
  rows?: number;
  cols?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const baseShimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, rgba(11, 31, 51, 0.06) 0%, rgba(11, 31, 51, 0.13) 50%, rgba(11, 31, 51, 0.06) 100%)",
  backgroundSize: "200% 100%",
  animation: "skeletonShimmer 1.8s ease-in-out infinite",
};

export default function Skeleton({
  variant = "text",
  count = 1,
  lines = 3,
  rows = 4,
  cols = 4,
  width,
  height,
  className = "",
  style,
}: SkeletonProps) {
  const items = Array.from({ length: Math.max(1, count) });

  const renderSingle = (key: number) => {
    switch (variant) {
      case "avatar":
        return (
          <div
            key={key}
            className={`skeleton-avatar ${className}`}
            style={{
              width: width || height || "48px",
              height: height || width || "48px",
              borderRadius: "var(--radius-pill, 9999px)",
              ...baseShimmerStyle,
              ...style,
            }}
          />
        );

      case "card":
        return (
          <div
            key={key}
            className={`skeleton-card surface-slip-card ${className}`}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "var(--radius-lg, 12px)",
              overflow: "hidden",
              border: "1px solid var(--color-border-subtle, rgba(11, 31, 51, 0.08))",
              padding: "var(--space-4, 16px)",
              backgroundColor: "var(--color-white, #FFFFFF)",
              width: width || "100%",
              height: height,
              ...style,
            }}
          >
            {/* Image Placeholder */}
            <div
              style={{
                width: "100%",
                height: "160px",
                borderRadius: "var(--radius-md, 8px)",
                marginBottom: "var(--space-3, 12px)",
                ...baseShimmerStyle,
              }}
            />

            {/* Title & Badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-2, 8px)",
              }}
            >
              <div
                style={{
                  width: "60%",
                  height: "20px",
                  borderRadius: "var(--radius-sm, 4px)",
                  ...baseShimmerStyle,
                }}
              />
              <div
                style={{
                  width: "25%",
                  height: "18px",
                  borderRadius: "var(--radius-pill, 9999px)",
                  ...baseShimmerStyle,
                }}
              />
            </div>

            {/* Subtitle / Details */}
            <div
              style={{
                width: "40%",
                height: "14px",
                borderRadius: "var(--radius-sm, 4px)",
                marginBottom: "var(--space-4, 16px)",
                ...baseShimmerStyle,
              }}
            />

            {/* Card Action footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "auto",
                paddingTop: "var(--space-2, 8px)",
              }}
            >
              <div
                style={{
                  width: "35%",
                  height: "22px",
                  borderRadius: "var(--radius-sm, 4px)",
                  ...baseShimmerStyle,
                }}
              />
              <div
                style={{
                  width: "30%",
                  height: "32px",
                  borderRadius: "var(--radius-md, 6px)",
                  ...baseShimmerStyle,
                }}
              />
            </div>
          </div>
        );

      case "table":
        return (
          <div
            key={key}
            className={`skeleton-table ${className}`}
            style={{
              width: width || "100%",
              borderRadius: "var(--radius-md, 8px)",
              border: "1px solid var(--color-border-subtle, rgba(11, 31, 51, 0.08))",
              overflow: "hidden",
              backgroundColor: "var(--color-white, #FFFFFF)",
              ...style,
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: "var(--space-3, 12px)",
                padding: "var(--space-3, 12px) var(--space-4, 16px)",
                backgroundColor: "var(--color-cream-soft, #FAF8F4)",
                borderBottom: "1px solid var(--color-border-subtle, rgba(11, 31, 51, 0.08))",
              }}
            >
              {Array.from({ length: cols }).map((_, colIdx) => (
                <div
                  key={`th-${colIdx}`}
                  style={{
                    height: "14px",
                    width: "70%",
                    borderRadius: "var(--radius-sm, 4px)",
                    ...baseShimmerStyle,
                  }}
                />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <div
                key={`tr-${rowIdx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: "var(--space-3, 12px)",
                  padding: "var(--space-3, 12px) var(--space-4, 16px)",
                  borderBottom:
                    rowIdx === rows - 1
                      ? "none"
                      : "1px solid var(--color-border-subtle, rgba(11, 31, 51, 0.04))",
                }}
              >
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <div
                    key={`td-${rowIdx}-${colIdx}`}
                    style={{
                      height: "16px",
                      width: colIdx === 0 ? "85%" : colIdx === cols - 1 ? "40%" : "60%",
                      borderRadius: "var(--radius-sm, 4px)",
                      ...baseShimmerStyle,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        );

      case "text":
      default:
        return (
          <div
            key={key}
            className={`skeleton-text ${className}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2, 8px)",
              width: width || "100%",
              height: height,
              ...style,
            }}
          >
            {Array.from({ length: lines }).map((_, lineIdx) => {
              const lineWidth =
                lines === 1
                  ? "100%"
                  : lineIdx === lines - 1
                  ? "60%"
                  : lineIdx === 0
                  ? "100%"
                  : "88%";

              return (
                <div
                  key={`line-${lineIdx}`}
                  style={{
                    height: "16px",
                    width: lineWidth,
                    borderRadius: "var(--radius-sm, 4px)",
                    ...baseShimmerStyle,
                  }}
                />
              );
            })}
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {count === 1 ? (
        renderSingle(0)
      ) : variant === "card" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "var(--space-4, 16px)",
            width: "100%",
          }}
        >
          {items.map((_, i) => renderSingle(i))}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4, 16px)",
            width: "100%",
          }}
        >
          {items.map((_, i) => renderSingle(i))}
        </div>
      )}
    </>
  );
}
