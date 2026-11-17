import { NextRequest, NextResponse } from "next/server";
import { createVesselSchema } from "@/validations/vessel.schema";
import { getVesselsByUserId, createVessel } from "@/services/vessel.service";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError, jsonError } from "@/lib/errors";

/**
 * GET /api/vessels
 * Returns all vessels owned by the authenticated boater.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(USER_ROLES.BOATER, req);
    const vessels = await getVesselsByUserId(session.userId);

    return NextResponse.json({
      status: "ok",
      vessels,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/vessels
 * Creates a new vessel profile for the authenticated boater.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(USER_ROLES.BOATER, req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = createVesselSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    const vessel = await createVessel(validation.data, session.userId);

    return NextResponse.json(
      {
        status: "ok",
        vessel,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
