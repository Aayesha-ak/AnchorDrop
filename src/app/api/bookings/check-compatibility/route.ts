import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, jsonError } from "@/lib/errors";
import {
  checkCompatibility,
  checkVesselDockCompatibility,
} from "@/services/compatibility.service";

/**
 * Validation schema for direct dimensional compatibility check
 */
const dimensionalCompatibilitySchema = z.object({
  vessel: z.object({
    lengthFt: z
      .number({ message: "vessel.lengthFt must be a valid number" })
      .positive("vessel.lengthFt must be greater than 0"),
    beamFt: z
      .number({ message: "vessel.beamFt must be a valid number" })
      .positive("vessel.beamFt must be greater than 0"),
    draftFt: z
      .number({ message: "vessel.draftFt must be a valid number" })
      .positive("vessel.draftFt must be greater than 0"),
  }),
  dock: z.object({
    maxLengthFt: z
      .number({ message: "dock.maxLengthFt must be a valid number" })
      .positive("dock.maxLengthFt must be greater than 0"),
    maxBeamFt: z
      .number({ message: "dock.maxBeamFt must be a valid number" })
      .positive("dock.maxBeamFt must be greater than 0"),
    minDepthFt: z
      .number({ message: "dock.minDepthFt must be a valid number" })
      .positive("dock.minDepthFt must be greater than 0"),
  }),
});

/**
 * Validation schema for database ID-based compatibility check
 */
const entityIdCompatibilitySchema = z.object({
  vesselId: z
    .string({ message: "vesselId must be a valid string" })
    .trim()
    .min(1, "vesselId cannot be empty"),
  dockId: z
    .string({ message: "dockId must be a valid string" })
    .trim()
    .min(1, "dockId cannot be empty"),
});

/**
 * POST /api/bookings/check-compatibility
 * Sub-phase 15.4: Server-owned compatibility check endpoint.
 * Accepts either:
 * 1. Direct dimensions: { vessel: { lengthFt, beamFt, draftFt }, dock: { maxLengthFt, maxBeamFt, minDepthFt } }
 * 2. Record IDs: { vesselId: string, dockId: string }
 *
 * Returns { status: "ok", result: CompatibilityResult }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonError("Request body must be a valid JSON object", 400);
    }

    // Branch 1: Direct dimensional parameters
    if ("vessel" in body || "dock" in body) {
      const parsed = dimensionalCompatibilitySchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(
          "Validation failed for dimensional compatibility check",
          400,
          parsed.error.format()
        );
      }

      const result = checkCompatibility(parsed.data);
      return NextResponse.json({
        status: "ok",
        result,
      });
    }

    // Branch 2: Database entity identifiers
    if ("vesselId" in body || "dockId" in body) {
      const parsed = entityIdCompatibilitySchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(
          "Validation failed for ID-based compatibility check",
          400,
          parsed.error.format()
        );
      }

      const result = await checkVesselDockCompatibility(
        parsed.data.vesselId,
        parsed.data.dockId
      );

      return NextResponse.json({
        status: "ok",
        result,
      });
    }

    return jsonError(
      "Missing required fields. Provide either { vessel, dock } dimensions or { vesselId, dockId } identifiers",
      400
    );
  } catch (err) {
    return handleApiError(err);
  }
}
