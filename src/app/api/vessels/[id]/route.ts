import { NextRequest, NextResponse } from "next/server";
import { updateVesselSchema } from "@/validations/vessel.schema";
import { getVesselById, updateVessel, deleteVessel } from "@/services/vessel.service";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError, jsonError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/vessels/[id]
 * Retrieves details for a specific vessel owned by the authenticated boater.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireRole(USER_ROLES.BOATER, req);

    const vessel = await getVesselById(id, session.userId);

    return NextResponse.json({
      status: "ok",
      vessel,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/vessels/[id]
 * Updates an existing vessel profile owned by the authenticated boater.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireRole(USER_ROLES.BOATER, req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = updateVesselSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    const updated = await updateVessel(id, validation.data, session.userId);

    return NextResponse.json({
      status: "ok",
      vessel: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/vessels/[id]
 * Removes a vessel profile owned by the authenticated boater if no active bookings exist.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireRole(USER_ROLES.BOATER, req);

    const result = await deleteVessel(id, session.userId);

    return NextResponse.json({
      status: "ok",
      message: result.message,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
