import { NextRequest, NextResponse } from "next/server";
import { updateDockSchema } from "@/validations/dock.schema";
import { getDockById, updateDock, deleteDock } from "@/services/dock.service";
import { getSessionUser, requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError, jsonError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/docks/:id
 * Public dock detail. Safe fields only for public visitors.
 * If accessed by the verified owner, includes private arrivalInstructions.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getSessionUser(req);

    const dock = await getDockById(id, session?.userId);

    return NextResponse.json({
      status: "ok",
      dock,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * PUT /api/docks/:id
 * Owner update for a dock berth listing (including arrival instructions).
 * Enforces dock ownership.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireRole(USER_ROLES.DOCK_OWNER, req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = updateDockSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    const updated = await updateDock(id, validation.data, session.userId);

    return NextResponse.json({
      status: "ok",
      message: "Dock listing updated successfully",
      dock: updated,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/docks/:id
 * Owner delete/deactivate for a dock berth listing.
 * Enforces dock ownership and checks delete policy against active reservations.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireRole(USER_ROLES.DOCK_OWNER, req);

    const result = await deleteDock(id, session.userId);

    return NextResponse.json({
      status: "ok",
      message: result.message,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
