import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError } from "@/lib/errors";
import { getOwnerBookings } from "@/services/booking-lifecycle.service";

/**
 * GET /api/bookings/owner
 * Retrieves all reservation requests and confirmed bookings for the authenticated dock owner's berths.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(USER_ROLES.DOCK_OWNER, req);
    const bookings = await getOwnerBookings(session.userId);

    return NextResponse.json({
      status: "ok",
      requests: bookings,
      bookings,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
