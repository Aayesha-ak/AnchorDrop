import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models";
import { requireRole } from "@/lib/auth";
import { USER_ROLES, BOOKING_STATUSES } from "@/lib/constants";
import { AppError, handleApiError, jsonError } from "@/lib/errors";
import { delayReportSchema } from "@/validations/booking.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/bookings/:id/delay
 * Allows the assigned boater to report an arrival delay and navigation note
 * for an accepted reservation.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await requireRole(USER_ROLES.BOATER, req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return jsonError("Request body must be valid JSON", 400);
    }

    const validation = delayReportSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("Validation failed", 400, validation.error.format());
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Booking not found", 404);
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    // Verify requesting boater owns this booking
    if (booking.boaterId.toString() !== session.userId) {
      throw new AppError("Forbidden: Only the assigned boater can report delays for this booking", 403);
    }

    // Delays can only be reported on accepted active bookings
    if (booking.status !== BOOKING_STATUSES.ACCEPTED) {
      throw new AppError(
        `Conflict: Delays can only be reported for accepted bookings. Current status is '${booking.status}'.`,
        409
      );
    }

    booking.delayEta = validation.data.delayEta;
    booking.delayNote = validation.data.delayNote || "";
    await booking.save();

    return NextResponse.json({
      status: "ok",
      message: "Arrival delay reported successfully",
      booking,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
