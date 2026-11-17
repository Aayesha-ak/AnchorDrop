"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface VesselData {
  _id: string;
  id?: string;
  name: string;
  type: string;
  lengthFt: number;
  beamFt: number;
  draftFt: number;
  registration: string;
  createdAt?: string;
}

interface FormState {
  name: string;
  type: string;
  lengthFt: string;
  beamFt: string;
  draftFt: string;
  registration: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  type: "Cruiser",
  lengthFt: "",
  beamFt: "",
  draftFt: "",
  registration: "",
};

const COMMON_VESSEL_TYPES = [
  "Cruiser",
  "Sailboat",
  "Motor Yacht",
  "Center Console",
  "Catamaran",
  "Sport Fisherman",
  "Trawler",
  "Bowrider",
  "Pontoon",
];

export default function BoaterVesselsPage() {
  const [vessels, setVessels] = useState<VesselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<VesselData | null>(null);
  const [formValues, setFormValues] = useState<FormState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deletingVessel, setDeletingVessel] = useState<VesselData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  const fetchVessels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vessels");
      const data = await res.json();
      if (res.ok && data.vessels) {
        setVessels(data.vessels);
      } else {
        showToast("error", data.error || "Failed to load vessels");
      }
    } catch {
      showToast("error", "Network error while loading vessels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVessels();
  }, [fetchVessels]);

  const openCreateModal = () => {
    setEditingVessel(null);
    setFormValues(INITIAL_FORM);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (vessel: VesselData) => {
    setEditingVessel(vessel);
    setFormValues({
      name: vessel.name,
      type: vessel.type,
      lengthFt: String(vessel.lengthFt),
      beamFt: String(vessel.beamFt),
      draftFt: String(vessel.draftFt),
      registration: vessel.registration,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingVessel(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formValues.name.trim()) errors.name = "Vessel name is required";
    if (!formValues.type.trim()) errors.type = "Vessel type is required";

    const len = Number(formValues.lengthFt);
    if (!formValues.lengthFt || isNaN(len) || len <= 0) {
      errors.lengthFt = "Length must be greater than 0 ft";
    } else if (len > 500) {
      errors.lengthFt = "Length cannot exceed 500 ft";
    }

    const beam = Number(formValues.beamFt);
    if (!formValues.beamFt || isNaN(beam) || beam <= 0) {
      errors.beamFt = "Beam must be greater than 0 ft";
    } else if (beam > 100) {
      errors.beamFt = "Beam cannot exceed 100 ft";
    }

    const draft = Number(formValues.draftFt);
    if (!formValues.draftFt || isNaN(draft) || draft <= 0) {
      errors.draftFt = "Draft must be greater than 0 ft";
    } else if (draft > 50) {
      errors.draftFt = "Draft cannot exceed 50 ft";
    }

    if (!formValues.registration.trim()) {
      errors.registration = "Registration or documentation number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formValues.name.trim(),
        type: formValues.type.trim(),
        lengthFt: Number(formValues.lengthFt),
        beamFt: Number(formValues.beamFt),
        draftFt: Number(formValues.draftFt),
        registration: formValues.registration.trim(),
      };

      const isEdit = Boolean(editingVessel);
      const vesselId = editingVessel?._id || editingVessel?.id;
      const url = isEdit ? `/api/vessels/${vesselId}` : "/api/vessels";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          "success",
          isEdit ? "Vessel updated successfully" : "Vessel registered successfully"
        );
        closeFormModal();
        await fetchVessels();
      } else {
        showToast("error", data.error || "Failed to save vessel");
      }
    } catch {
      showToast("error", "An unexpected error occurred while saving the vessel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVessel) return;
    setDeleting(true);

    try {
      const vesselId = deletingVessel._id || deletingVessel.id;
      const res = await fetch(`/api/vessels/${vesselId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Vessel removed successfully");
        setDeletingVessel(null);
        await fetchVessels();
      } else {
        showToast("error", data.error || "Cannot delete vessel");
        setDeletingVessel(null);
      }
    } catch {
      showToast("error", "An error occurred while deleting the vessel");
      setDeletingVessel(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Nav Banner / Breadcrumbs */}
      <nav
        aria-label="Boater Breadcrumbs"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        <Link href="/boater" style={{ color: "var(--color-navy)", opacity: 0.7 }}>
          Dashboard
        </Link>
        <span style={{ color: "var(--color-border)" }}>/</span>
        <Link href="/#explore" style={{ color: "var(--color-navy)", opacity: 0.7 }}>
          Explore & Book
        </Link>
        <span style={{ color: "var(--color-border)" }}>/</span>
        <span style={{ color: "var(--color-gold)", fontWeight: 600 }}>My Vessels</span>
        <span style={{ color: "var(--color-border)" }}>/</span>
        <Link href="/boater/trips" style={{ color: "var(--color-navy)", opacity: 0.7 }}>
          My Trips
        </Link>
      </nav>

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--font-size-2xl)", marginBottom: "var(--space-2)" }}>
            My Vessels
          </h2>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "600px" }}>
            Register your boat specifications (LOA, beam, draft) to automatically verify slip
            fit when requesting marina and private dock berths.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <span>+</span> Add New Vessel
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          style={{
            padding: "var(--space-3) var(--space-4)",
            marginBottom: "var(--space-6)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor:
              toast.type === "success" ? "var(--color-success-bg)" : "var(--color-danger-bg)",
            color: toast.type === "success" ? "var(--color-success)" : "var(--color-danger)",
            border: `1px solid ${
              toast.type === "success"
                ? "var(--color-success-border)"
                : "var(--color-danger-border)"
            }`,
            fontSize: "var(--font-size-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
              color: "inherit",
              padding: "0 var(--space-2)",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {[1, 2].map((i) => (
            <div
              key={i}
              className="surface-slip-card"
              style={{ minHeight: "220px", opacity: 0.6 }}
            >
              <div
                style={{
                  height: "24px",
                  width: "50%",
                  backgroundColor: "var(--color-border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "var(--space-4)",
                }}
              />
              <div
                style={{
                  height: "16px",
                  width: "80%",
                  backgroundColor: "var(--color-border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "var(--space-2)",
                }}
              />
              <div
                style={{
                  height: "16px",
                  width: "60%",
                  backgroundColor: "var(--color-border-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && vessels.length === 0 && (
        <div
          className="surface-slip-card"
          style={{
            textAlign: "center",
            padding: "var(--space-12) var(--space-6)",
            maxWidth: "580px",
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "var(--space-3)" }}>🛥️</div>
          <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
            No vessels registered yet
          </h3>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
              marginBottom: "var(--space-6)",
            }}
          >
            No vessels registered yet. Add your boat to check slip compatibility and request berths.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            + Add New Vessel
          </button>
        </div>
      )}

      {/* Vessel Grid */}
      {!loading && vessels.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {vessels.map((vessel) => (
            <div
              key={vessel._id || vessel.id}
              className="surface-slip-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <h3 style={{ fontSize: "var(--font-size-xl)", color: "var(--color-navy)" }}>
                    {vessel.name}
                  </h3>
                  <span className="badge badge-info">{vessel.type}</span>
                </div>

                {/* Specs List */}
                <div
                  style={{
                    backgroundColor: "var(--color-cream)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-4)",
                    marginBottom: "var(--space-6)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingBottom: "var(--space-2)",
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-secondary)" }}>Length (LOA):</span>
                    <strong style={{ color: "var(--color-navy)" }}>{vessel.lengthFt} ft</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "var(--space-2) 0",
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-secondary)" }}>Beam:</span>
                    <strong style={{ color: "var(--color-navy)" }}>{vessel.beamFt} ft</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "var(--space-2) 0",
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-secondary)" }}>Draft:</span>
                    <strong style={{ color: "var(--color-navy)" }}>{vessel.draftFt} ft</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "var(--space-2)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-secondary)" }}>Registration:</span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        color: "var(--color-navy)",
                        fontWeight: 600,
                      }}
                    >
                      {vessel.registration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  borderTop: "1px solid var(--color-border-subtle)",
                  paddingTop: "var(--space-4)",
                }}
              >
                <button
                  onClick={() => openEditModal(vessel)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: "0.4rem 0.8rem", fontSize: "var(--font-size-xs)" }}
                >
                  Edit Specs
                </button>
                <button
                  onClick={() => setDeletingVessel(vessel)}
                  className="btn btn-outline"
                  style={{
                    color: "var(--color-danger)",
                    borderColor: "var(--color-danger-border)",
                    padding: "0.4rem 0.8rem",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(11, 31, 51, 0.65)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
          onClick={closeFormModal}
        >
          <div
            style={{
              backgroundColor: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "var(--shadow-xl)",
              padding: "var(--space-6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              <h3 style={{ fontSize: "var(--font-size-xl)" }}>
                {editingVessel ? "Edit Vessel Profile" : "Register New Vessel"}
              </h3>
              <button
                onClick={closeFormModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-6)",
              }}
            >
              Accurate vessel dimensions ensure safety clearance for berth length, beam width, and
              low-tide water depth.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {/* Vessel Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    marginBottom: "var(--space-1)",
                    color: "var(--color-navy)",
                  }}
                >
                  Vessel Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sea Breeze"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  maxLength={100}
                />
                {formErrors.name && (
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)" }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              {/* Vessel Type */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    marginBottom: "var(--space-1)",
                    color: "var(--color-navy)",
                  }}
                >
                  Vessel Type *
                </label>
                <input
                  type="text"
                  list="vessel-types-list"
                  placeholder="Select or enter vessel type"
                  value={formValues.type}
                  onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
                  maxLength={50}
                />
                <datalist id="vessel-types-list">
                  {COMMON_VESSEL_TYPES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                {formErrors.type && (
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)" }}>
                    {formErrors.type}
                  </span>
                )}
              </div>

              {/* Dimensions (3-col grid) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 600,
                      marginBottom: "var(--space-1)",
                      color: "var(--color-navy)",
                    }}
                  >
                    LOA (ft) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max="500"
                    placeholder="e.g. 42"
                    value={formValues.lengthFt}
                    onChange={(e) => setFormValues({ ...formValues, lengthFt: e.target.value })}
                  />
                  {formErrors.lengthFt && (
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)" }}>
                      {formErrors.lengthFt}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 600,
                      marginBottom: "var(--space-1)",
                      color: "var(--color-navy)",
                    }}
                  >
                    Beam (ft) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    max="100"
                    placeholder="e.g. 13"
                    value={formValues.beamFt}
                    onChange={(e) => setFormValues({ ...formValues, beamFt: e.target.value })}
                  />
                  {formErrors.beamFt && (
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)" }}>
                      {formErrors.beamFt}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 600,
                      marginBottom: "var(--space-1)",
                      color: "var(--color-navy)",
                    }}
                  >
                    Draft (ft) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    max="50"
                    placeholder="e.g. 4"
                    value={formValues.draftFt}
                    onChange={(e) => setFormValues({ ...formValues, draftFt: e.target.value })}
                  />
                  {formErrors.draftFt && (
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)" }}>
                      {formErrors.draftFt}
                    </span>
                  )}
                </div>
              </div>

              {/* Registration */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: 600,
                    marginBottom: "var(--space-1)",
                    color: "var(--color-navy)",
                  }}
                >
                  Registration / Documentation # *
                </label>
                <input
                  type="text"
                  placeholder="e.g. FL-8821-KM or USCG Official #"
                  value={formValues.registration}
                  onChange={(e) => setFormValues({ ...formValues, registration: e.target.value })}
                  maxLength={50}
                />
                {formErrors.registration && (
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)" }}>
                    {formErrors.registration}
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-4)",
                }}
              >
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editingVessel
                    ? "Update Vessel"
                    : "Save Vessel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVessel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(11, 31, 51, 0.65)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
          onClick={() => !deleting && setDeletingVessel(null)}
        >
          <div
            style={{
              backgroundColor: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "var(--shadow-xl)",
              padding: "var(--space-6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "var(--font-size-xl)", marginBottom: "var(--space-2)" }}>
              Remove Vessel Profile
            </h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-4)" }}>
              Are you sure you want to remove <strong>{deletingVessel.name}</strong>? This profile
              will no longer be available for slip compatibility checks.
            </p>

            <div
              style={{
                backgroundColor: "var(--color-warning-bg)",
                border: "1px solid var(--color-warning-border)",
                color: "var(--color-warning)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-xs)",
                marginBottom: "var(--space-6)",
              }}
            >
              ⚠️ <strong>Policy Warning:</strong> Vessels with active or pending berth reservations
              cannot be deleted until those bookings are cancelled or completed.
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "var(--space-3)",
              }}
            >
              <button
                type="button"
                onClick={() => setDeletingVessel(null)}
                className="btn btn-outline"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn"
                style={{
                  backgroundColor: "var(--color-danger)",
                  color: "var(--color-white)",
                }}
                disabled={deleting}
              >
                {deleting ? "Removing..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
