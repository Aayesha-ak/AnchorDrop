import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError } from "@/lib/errors";
import { getBoaterBookings } from "@/services/booking-lifecycle.service";
import { canUnlockArrivalInstructions } from "@/services/arrival.service";

/**
 * GET /api/bookings/boater
 * Retrieves all reservations belonging to the authenticated boater.
 * Enforces arrival instructions privacy: unlocked ONLY for accepted/completed bookings.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(USER_ROLES.BOATER, req);
    const rawBookings = await getBoaterBookings(session.userId);

    const bookings = rawBookings.map((b) => {
      const bObj = (b.toObject ? b.toObject() : b) as unknown as Record<string, unknown>;
      const isUnlocked = canUnlockArrivalInstructions(
        {
          status: b.status,
          boaterId: b.boaterId,
          ownerId: b.ownerId,
        },
        session.userId
      );

      if (bObj.dockId && typeof bObj.dockId === "object") {
        const dockObj = { ...(bObj.dockId as Record<string, unknown>) };
        if (!isUnlocked) {
          delete dockObj.arrivalInstructions;
        }
        bObj.dockId = dockObj;
        bObj.dock = dockObj;
      }
      return bObj;
    });

    return NextResponse.json({
      status: "ok",
      bookings,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
