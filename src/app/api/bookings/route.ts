import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/validations/booking.schema";
import { createBooking } from "@/services/booking.service";
import { requireRole } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { handleApiError, jsonError } from "@/lib/errors";

/**
 * POST /api/bookings
 * Submits a new reservation request for a dock berth by an authenticated boater.
 * Validates vessel dimensional fit, non-host booking rule, and dates.
 * Initial status: "pending"
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(USER_ROLES.BOATER, req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = createBookingSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Invalid booking request data", 400, validation.error.format());
    }

    const booking = await createBooking(validation.data, session.userId);

    return NextResponse.json(
      {
        status: "ok",
        message: "Reservation request submitted",
        booking,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
