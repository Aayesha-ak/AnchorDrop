import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError, jsonError } from "@/lib/errors";
import { updateBookingStatusSchema } from "@/validations/booking.schema";
import { updateBookingStatus } from "@/services/booking-lifecycle.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/bookings/:id/status
 * Host action to accept, decline (reject), or complete a reservation request.
 * Enforces dock ownership and state machine rules.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireRole(USER_ROLES.DOCK_OWNER, req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = updateBookingStatusSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    const booking = await updateBookingStatus(id, validation.data.status, session.userId);

    return NextResponse.json({
      status: "ok",
      message: `Booking marked as ${validation.data.status}`,
      booking,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
