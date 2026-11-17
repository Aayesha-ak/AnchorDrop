import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError } from "@/lib/errors";
import { getBoaterBookings } from "@/services/booking-lifecycle.service";

/**
 * GET /api/bookings/boater
 * Retrieves all reservations belonging to the authenticated boater.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(USER_ROLES.BOATER, req);
    const bookings = await getBoaterBookings(session.userId);

    return NextResponse.json({
      status: "ok",
      bookings,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
