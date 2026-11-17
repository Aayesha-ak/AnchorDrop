import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/services/booking.service";
import { canUnlockArrivalInstructions } from "@/services/arrival.service";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/bookings/:id
 * Retrieves details for a specific reservation.
 * Enforces participant authorization (boater or dock owner only).
 * Conditionally unlocks arrivalInstructions only if booking is accepted/completed.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireAuth(req);

    const booking = await getBookingById(id, session.userId);

    // Apply arrival instructions privacy policy
    const isUnlocked = canUnlockArrivalInstructions(
      {
        status: booking.status,
        boaterId: booking.boaterId,
        ownerId: booking.ownerId,
      },
      session.userId
    );

    const bookingRaw = (booking.toObject ? booking.toObject() : booking) as unknown as Record<string, unknown>;
    const bookingObj: Record<string, unknown> = { ...bookingRaw };

    if (bookingObj.dockId && typeof bookingObj.dockId === "object") {
      const dockObj: Record<string, unknown> = { ...(bookingObj.dockId as Record<string, unknown>) };
      if (!isUnlocked) {
        delete dockObj.arrivalInstructions;
      }
      bookingObj.dock = dockObj;
    }

    return NextResponse.json({
      status: "ok",
      booking: bookingObj,
      arrivalUnlocked: isUnlocked,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
