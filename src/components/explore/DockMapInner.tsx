"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PublicDock } from "@/lib/serializers";

interface DockMapInnerProps {
  docks: PublicDock[];
}

// Fallback coordinate mapping for South Florida waterways if dock has no explicit GPS coordinates
function getDockCoordinates(dock: PublicDock, index: number): [number, number] {
  const loc = (dock.location + " " + dock.waterway).toLowerCase();

  // Known default coordinates around coastal waterways
  if (loc.includes("lauderdale") || loc.includes("stranahan") || loc.includes("new river")) {
    const baseLat = 26.118;
    const baseLng = -80.132;
    // Spread markers slightly along the waterway
    return [baseLat + (index * 0.006 - 0.009), baseLng + (index * 0.005 - 0.007)];
  }

  if (loc.includes("miami") || loc.includes("biscayne")) {
    return [25.7617 + index * 0.005, -80.1918 + index * 0.004];
  }

  // General coastal Florida anchor default
  return [26.1224 + index * 0.007, -80.1373 + index * 0.006];
}

export default function DockMapInner({ docks }: DockMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map centered around Fort Lauderdale waterway basin
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.122, -80.135],
        zoom: 13,
        scrollWheelZoom: false,
      });

      // 1. Free OpenStreetMap Base Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // 2. Free OpenSeaMap Seamarks / Marine Buoy Overlay Layer
      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a>',
        maxZoom: 18,
        opacity: 0.85,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds: L.LatLngTuple[] = [];

    // Add markers for all visible docks
    docks.forEach((dock, idx) => {
      const coords = getDockCoordinates(dock, idx);
      bounds.push(coords);

      const priceLabel = dock.pricePerDay > 0 ? `$${dock.pricePerDay}` : "Free";

      // Nautical brand pin icon
      const customPin = L.divIcon({
        className: "anchordrop-map-marker",
        html: `
          <div style="
            background: #0B1F33;
            color: #F5F1E8;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            border: 2px solid #C6A56B;
            box-shadow: 0 4px 10px rgba(11, 31, 51, 0.35);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            white-space: nowrap;
          ">
            <span>⚓</span>
            <span>${priceLabel}</span>
          </div>
        `,
        iconSize: [68, 26],
        iconAnchor: [34, 13],
      });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 200px; padding: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #C6A56B; font-weight: 700; letter-spacing: 0.05em;">
            ${dock.dockType || "Dock Slip"}
          </div>
          <h4 style="margin: 2px 0 6px 0; color: #0B1F33; font-size: 14px; font-weight: 700;">
            ${dock.title}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B;">
            📍 ${dock.location} • ${dock.waterway}
          </p>
          <div style="font-size: 11px; color: #334155; margin-bottom: 8px; background: #F8FAFC; padding: 4px 6px; border-radius: 4px;">
            📏 Up to <strong>${dock.maxLengthFt}ft</strong> LOA • <strong>${dock.minDepthFt}ft</strong> depth
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; color: #0B1F33; font-size: 13px;">
              $${dock.pricePerDay}<span style="font-size: 10px; font-weight: 400; color: #64748B;">/day</span>
            </span>
            <a href="/docks/${dock.id}" style="
              background: #0B1F33;
              color: #F5F1E8;
              text-decoration: none;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              border: 1px solid #C6A56B;
            ">View Slip →</a>
          </div>
        </div>
      `;

      L.marker(coords, { icon: customPin })
        .addTo(map)
        .bindPopup(popupContent);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      // Keep map instance cached across filter updates
    };
  }, [docks]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: "480px",
        width: "100%",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-md)",
        position: "relative",
        zIndex: 1,
      }}
    />
  );
}
