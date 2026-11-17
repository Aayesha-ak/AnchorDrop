"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreateDockInput } from "@/validations/dock.schema";

const PRESET_DOCK_TYPES = [
  "Marina Berth",
  "Private Residential Slip",
  "Mooring",
  "T-Head Slip",
  "Commercial Basin",
];

const PRESET_AMENITIES = [
  "Power 30A",
  "Power 50A",
  "Fresh Water",
  "Wi-Fi",
  "Pump-out",
  "Security Gate",
  "Restrooms",
  "Fuel Dock",
];

export interface BerthFormData {
  id?: string;
  _id?: string;
  title: string;
  location: string;
  waterway: string;
  dockType: string;
  photoUrl: string;
  maxLengthFt: number | string;
  maxBeamFt: number | string;
  minDepthFt: number | string;
  pricePerDay: number | string;
  amenities: string[];
  availabilityNotes: string;
  arrivalInstructions: string;
  isActive: boolean;
}

export interface BerthFormProps {
  initialData?: Partial<BerthFormData> & {
    photos?: string[];
  };
  isEdit?: boolean;
  onSuccess?: (dock: unknown) => void;
}

export default function BerthForm({
  initialData,
  isEdit = false,
  onSuccess,
}: BerthFormProps) {
  const router = useRouter();

  // Initial values setup
  const [formData, setFormData] = useState<BerthFormData>({
    id: initialData?.id || initialData?._id || "",
    title: initialData?.title || "",
    location: initialData?.location || "",
    waterway: initialData?.waterway || "",
    dockType: initialData?.dockType || PRESET_DOCK_TYPES[0],
    photoUrl:
      initialData?.photoUrl ||
      (initialData?.photos && initialData.photos.length > 0
        ? initialData.photos[0]
        : "/images/hero-marina.jpeg"),
    maxLengthFt: initialData?.maxLengthFt !== undefined ? initialData.maxLengthFt : "",
    maxBeamFt: initialData?.maxBeamFt !== undefined ? initialData.maxBeamFt : "",
    minDepthFt: initialData?.minDepthFt !== undefined ? initialData.minDepthFt : "",
    pricePerDay: initialData?.pricePerDay !== undefined ? initialData.pricePerDay : "",
    amenities: initialData?.amenities || [],
    availabilityNotes:
      initialData?.availabilityNotes ||
      "Available for temporary and overnight reservations. Advance booking required.",
    arrivalInstructions: initialData?.arrivalInstructions || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [customDockType, setCustomDockType] = useState(
    initialData?.dockType && !PRESET_DOCK_TYPES.includes(initialData.dockType)
      ? initialData.dockType
      : ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Field change handler
  const handleChange = (
    field: keyof BerthFormData,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  // Toggle amenity tag
  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      const nextAmenities = exists
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: nextAmenities };
    });
  };

  // Validate form client-side
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const title = formData.title.trim();
    if (!title || title.length < 3) {
      errs.title = "Title must be at least 3 characters long";
    } else if (title.length > 120) {
      errs.title = "Title cannot exceed 120 characters";
    }

    const location = formData.location.trim();
    if (!location || location.length < 2) {
      errs.location = "Location is required (e.g. Fort Lauderdale, FL)";
    } else if (location.length > 120) {
      errs.location = "Location cannot exceed 120 characters";
    }

    const waterway = formData.waterway.trim();
    if (!waterway || waterway.length < 2) {
      errs.waterway = "Waterway is required (e.g. Biscayne Bay)";
    } else if (waterway.length > 120) {
      errs.waterway = "Waterway cannot exceed 120 characters";
    }

    const activeDockType =
      formData.dockType === "Other"
        ? customDockType.trim()
        : formData.dockType.trim();
    if (!activeDockType || activeDockType.length < 2) {
      errs.dockType = "Dock type is required";
    }

    const maxLen = Number(formData.maxLengthFt);
    if (!formData.maxLengthFt || isNaN(maxLen) || maxLen <= 0) {
      errs.maxLengthFt = "Maximum length must be greater than 0 feet";
    } else if (maxLen > 1000) {
      errs.maxLengthFt = "Maximum length cannot exceed 1000 feet";
    }

    const maxBm = Number(formData.maxBeamFt);
    if (!formData.maxBeamFt || isNaN(maxBm) || maxBm <= 0) {
      errs.maxBeamFt = "Maximum beam must be greater than 0 feet";
    } else if (maxBm > 200) {
      errs.maxBeamFt = "Maximum beam cannot exceed 200 feet";
    }

    const minDp = Number(formData.minDepthFt);
    if (!formData.minDepthFt || isNaN(minDp) || minDp <= 0) {
      errs.minDepthFt = "Minimum depth at low tide must be greater than 0 feet";
    } else if (minDp > 200) {
      errs.minDepthFt = "Minimum depth cannot exceed 200 feet";
    }

    const price = Number(formData.pricePerDay);
    if (formData.pricePerDay === "" || isNaN(price) || price < 0) {
      errs.pricePerDay = "Daily price cannot be negative";
    }

    if (formData.availabilityNotes && formData.availabilityNotes.length > 300) {
      errs.availabilityNotes = "Availability notes cannot exceed 300 characters";
    }

    if (formData.arrivalInstructions && formData.arrivalInstructions.length > 1000) {
      errs.arrivalInstructions =
        "Arrival instructions cannot exceed 1000 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      const resolvedDockType =
        formData.dockType === "Other"
          ? customDockType.trim()
          : formData.dockType.trim();

      const payload: CreateDockInput = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        waterway: formData.waterway.trim(),
        dockType: resolvedDockType,
        photos: formData.photoUrl.trim()
          ? [formData.photoUrl.trim()]
          : ["/images/hero-marina.jpeg"],
        maxLengthFt: Number(formData.maxLengthFt),
        maxBeamFt: Number(formData.maxBeamFt),
        minDepthFt: Number(formData.minDepthFt),
        pricePerDay: Number(formData.pricePerDay),
        amenities: formData.amenities,
        availabilityNotes: formData.availabilityNotes.trim(),
        arrivalInstructions: formData.arrivalInstructions.trim(),
        isActive: formData.isActive,
      };

      const url = isEdit
        ? `/api/docks/${formData.id}`
        : "/api/docks";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to save berth listing");
      }

      if (onSuccess) {
        onSuccess(data.dock);
      } else {
        router.push("/owner/berths");
      }
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Server Error Alert */}
      {serverError && (
        <div
          style={{
            backgroundColor: "var(--color-danger-bg)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <span style={{ fontSize: "1.25rem" }}>⚠️</span>
          <div>
            <strong>Error saving berth:</strong> {serverError}
          </div>
        </div>
      )}

      {/* SECTION 1: Basics */}
      <section
        className="surface-slip-card"
        style={{ padding: "var(--space-6)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "var(--space-3)" }}>
          <span style={{ fontSize: "1.25rem" }}>⚓</span>
          <h2 style={{ fontSize: "var(--font-size-xl)", margin: 0 }}>Basic Berth Details</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          {/* Title */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              htmlFor="berth-title"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Berth Listing Title <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="berth-title"
              type="text"
              placeholder="e.g. Deepwater Marina Slip 42 or Las Olas Private Slip"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              style={{
                borderColor: errors.title ? "var(--color-danger)" : undefined,
              }}
            />
            {errors.title && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.title}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="berth-location"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              City & State / Region <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="berth-location"
              type="text"
              placeholder="e.g. Fort Lauderdale, FL"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              style={{
                borderColor: errors.location ? "var(--color-danger)" : undefined,
              }}
            />
            {errors.location && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.location}
              </p>
            )}
          </div>

          {/* Waterway */}
          <div>
            <label
              htmlFor="berth-waterway"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Waterway / Basin <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              id="berth-waterway"
              type="text"
              placeholder="e.g. Intracoastal Waterway or New River"
              value={formData.waterway}
              onChange={(e) => handleChange("waterway", e.target.value)}
              style={{
                borderColor: errors.waterway ? "var(--color-danger)" : undefined,
              }}
            />
            {errors.waterway && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.waterway}
              </p>
            )}
          </div>

          {/* Dock Type */}
          <div>
            <label
              htmlFor="berth-docktype"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Berth Classification <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <select
              id="berth-docktype"
              value={
                PRESET_DOCK_TYPES.includes(formData.dockType)
                  ? formData.dockType
                  : "Other"
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === "Other") {
                  handleChange("dockType", "Other");
                } else {
                  handleChange("dockType", val);
                }
              }}
            >
              {PRESET_DOCK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="Other">Other (Custom Classification)</option>
            </select>

            {formData.dockType === "Other" && (
              <input
                type="text"
                placeholder="Enter custom berth classification"
                value={customDockType}
                onChange={(e) => setCustomDockType(e.target.value)}
                style={{
                  marginTop: "var(--space-2)",
                  borderColor: errors.dockType ? "var(--color-danger)" : undefined,
                }}
              />
            )}
            {errors.dockType && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.dockType}
              </p>
            )}
          </div>

          {/* Photo URL */}
          <div>
            <label
              htmlFor="berth-photo"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Photo Image URL
            </label>
            <input
              id="berth-photo"
              type="text"
              placeholder="/images/hero-marina.jpeg"
              value={formData.photoUrl}
              onChange={(e) => handleChange("photoUrl", e.target.value)}
            />
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Provide an image path or URL. Defaults to high-resolution marina imagery.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Dimensions & Clearance */}
      <section
        className="surface-slip-card"
        style={{ padding: "var(--space-6)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "var(--space-3)" }}>
          <span style={{ fontSize: "1.25rem" }}>📏</span>
          <div>
            <h2 style={{ fontSize: "var(--font-size-xl)", margin: 0 }}>Vessel Dimensions & Clearance</h2>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
              Physical limits evaluated automatically against captain vessel profiles during booking verification.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
          {/* Max Length */}
          <div>
            <label
              htmlFor="berth-maxlen"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Max Length Overall (LOA) <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="berth-maxlen"
                type="number"
                min="1"
                max="1000"
                step="any"
                placeholder="e.g. 65"
                value={formData.maxLengthFt}
                onChange={(e) => handleChange("maxLengthFt", e.target.value)}
                style={{
                  paddingRight: "2.5rem",
                  borderColor: errors.maxLengthFt ? "var(--color-danger)" : undefined,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "var(--space-3)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  pointerEvents: "none",
                }}
              >
                ft
              </span>
            </div>
            {errors.maxLengthFt && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.maxLengthFt}
              </p>
            )}
          </div>

          {/* Max Beam */}
          <div>
            <label
              htmlFor="berth-maxbeam"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Max Beam (Width) <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="berth-maxbeam"
                type="number"
                min="1"
                max="200"
                step="any"
                placeholder="e.g. 20"
                value={formData.maxBeamFt}
                onChange={(e) => handleChange("maxBeamFt", e.target.value)}
                style={{
                  paddingRight: "2.5rem",
                  borderColor: errors.maxBeamFt ? "var(--color-danger)" : undefined,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "var(--space-3)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  pointerEvents: "none",
                }}
              >
                ft
              </span>
            </div>
            {errors.maxBeamFt && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.maxBeamFt}
              </p>
            )}
          </div>

          {/* Min Depth */}
          <div>
            <label
              htmlFor="berth-mindepth"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Min Depth at Low Tide (MLW) <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="berth-mindepth"
                type="number"
                min="0.5"
                max="200"
                step="any"
                placeholder="e.g. 8"
                value={formData.minDepthFt}
                onChange={(e) => handleChange("minDepthFt", e.target.value)}
                style={{
                  paddingRight: "2.5rem",
                  borderColor: errors.minDepthFt ? "var(--color-danger)" : undefined,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "var(--space-3)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  pointerEvents: "none",
                }}
              >
                ft
              </span>
            </div>
            {errors.minDepthFt && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.minDepthFt}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: Pricing & Availability */}
      <section
        className="surface-slip-card"
        style={{ padding: "var(--space-6)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "var(--space-3)" }}>
          <span style={{ fontSize: "1.25rem" }}>💵</span>
          <h2 style={{ fontSize: "var(--font-size-xl)", margin: 0 }}>Pricing & Listing Status</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
          {/* Price Per Day */}
          <div>
            <label
              htmlFor="berth-price"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Daily Docking Rate (USD) <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "var(--space-3)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                $
              </span>
              <input
                id="berth-price"
                type="number"
                min="0"
                step="any"
                placeholder="95"
                value={formData.pricePerDay}
                onChange={(e) => handleChange("pricePerDay", e.target.value)}
                style={{
                  paddingLeft: "2rem",
                  borderColor: errors.pricePerDay ? "var(--color-danger)" : undefined,
                }}
              />
            </div>
            {errors.pricePerDay && (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
                {errors.pricePerDay}
              </p>
            )}
          </div>

          {/* Active Status Toggle */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}>
              Marketplace Visibility
            </span>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                cursor: "pointer",
                padding: "var(--space-3) 0",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
                style={{ width: "1.2rem", height: "1.2rem", cursor: "pointer" }}
              />
              <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500 }}>
                {formData.isActive ? "Listing is Active (Visible to Boaters)" : "Listing is Inactive / Unlisted"}
              </span>
            </label>
          </div>

          {/* Public Availability Notes */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              htmlFor="berth-notes"
              style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
            >
              Public Availability & Booking Policies
            </label>
            <textarea
              id="berth-notes"
              rows={2}
              maxLength={300}
              placeholder="e.g. 24h advance reservation required. Check-in between 12:00 and 19:00. No commercial fishing vessels."
              value={formData.availabilityNotes}
              onChange={(e) => handleChange("availabilityNotes", e.target.value)}
              style={{
                borderColor: errors.availabilityNotes ? "var(--color-danger)" : undefined,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-1)" }}>
              {errors.availabilityNotes ? (
                <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)" }}>
                  {errors.availabilityNotes}
                </p>
              ) : <div />}
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {formData.availabilityNotes.length}/300 characters
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Amenities */}
      <section
        className="surface-slip-card"
        style={{ padding: "var(--space-6)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "var(--space-3)" }}>
          <span style={{ fontSize: "1.25rem" }}>🔌</span>
          <div>
            <h2 style={{ fontSize: "var(--font-size-xl)", margin: 0 }}>Slip Amenities & Shore Services</h2>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
              Select all utilities and facilities available to arriving vessels at this berth.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {PRESET_AMENITIES.map((amenity) => {
            const isSelected = formData.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 500,
                  cursor: "pointer",
                  border: isSelected
                    ? "1px solid var(--color-gold)"
                    : "1px solid var(--color-border)",
                  backgroundColor: isSelected
                    ? "var(--color-gold-muted)"
                    : "var(--color-white)",
                  color: isSelected
                    ? "var(--color-navy)"
                    : "var(--color-text-secondary)",
                  transition: "all var(--motion-duration-fast)",
                }}
              >
                <span>{isSelected ? "✓" : "+"}</span>
                <span>{amenity}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: Private Arrival Instructions (Security Protected) */}
      <section
        className="surface-slip-card"
        style={{
          padding: "var(--space-6)",
          border: "2px solid var(--color-gold)",
          backgroundColor: "#FAF9F5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <span style={{ fontSize: "1.35rem" }}>🔒</span>
          <h2 style={{ fontSize: "var(--font-size-xl)", margin: 0, color: "var(--color-navy)" }}>
            Private Arrival Instructions
          </h2>
          <span className="badge badge-accepted" style={{ fontSize: "var(--font-size-xs)" }}>
            Encrypted Storage
          </span>
        </div>

        {/* Security Callout Box */}
        <div
          style={{
            backgroundColor: "rgba(198, 165, 107, 0.15)",
            borderLeft: "4px solid var(--color-gold)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-4)",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-navy)",
              fontWeight: 500,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            🔒 <em>Protected Host Information: Gate combinations, exact slip number, and VHF channel are encrypted and only revealed to boaters whose reservations you accept.</em>
          </p>
        </div>

        <div>
          <label
            htmlFor="berth-arrival"
            style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-1)" }}
          >
            Arrival & Gate Security Instructions
          </label>
          <textarea
            id="berth-arrival"
            rows={4}
            maxLength={1000}
            placeholder="e.g. Hail dockmaster on VHF 68 when entering marina basin. Slip #42 on Pier B. Pedestrian security gate code is #4829. Shore power hookup breaker #14."
            value={formData.arrivalInstructions}
            onChange={(e) => handleChange("arrivalInstructions", e.target.value)}
            style={{
              borderColor: errors.arrivalInstructions ? "var(--color-danger)" : undefined,
              backgroundColor: "var(--color-white)",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-1)" }}>
            {errors.arrivalInstructions ? (
              <p style={{ color: "var(--color-danger)", fontSize: "var(--font-size-xs)" }}>
                {errors.arrivalInstructions}
              </p>
            ) : <div />}
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {formData.arrivalInstructions.length}/1000 characters
            </span>
          </div>
        </div>
      </section>

      {/* Form Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "var(--space-4)",
          paddingTop: "var(--space-2)",
        }}
      >
        <Link
          href="/owner/berths"
          className="btn btn-outline"
          style={{ minWidth: "120px" }}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
          style={{
            minWidth: "180px",
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: "1rem",
                  height: "1rem",
                  border: "2px solid var(--color-navy)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  marginRight: "var(--space-2)",
                }}
              />
              Saving Berth...
            </>
          ) : isEdit ? (
            "Update Berth Listing"
          ) : (
            "Publish Berth Listing"
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </form>
  );
}
