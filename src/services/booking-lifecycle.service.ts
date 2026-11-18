import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
// Ensure models are registered for mongoose population
import "@/models";
import { Booking } from "@/models";
import { BOOKING_STATUSES, BookingStatus } from "@/lib/constants";
import { AppError } from "@/lib/errors";

export class NotFoundError extends AppError {
  constructor(message: string = "Booking not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden: You are not authorized to modify this booking") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict: Invalid status transition") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Returns all bookings for a boater, populated with dock and vessel details.
 * Sorted by createdAt desc.
 */
export async function getBoaterBookings(boaterId: string) {
  await connectDB();

  const queryBoaterId = mongoose.Types.ObjectId.isValid(boaterId)
    ? new mongoose.Types.ObjectId(boaterId)
    : boaterId;

  return Booking.find({ boaterId: queryBoaterId })
    .populate("dockId")
    .populate("vesselId")
    .sort({ createdAt: -1 });
}

/**
 * Returns all bookings for a dock owner, populated with dock, vessel, and boater details (name, email).
 * Sorted by createdAt desc.
 */
export async function getOwnerBookings(ownerId: string) {
  await connectDB();

  const queryOwnerId = mongoose.Types.ObjectId.isValid(ownerId)
    ? new mongoose.Types.ObjectId(ownerId)
    : ownerId;

  return Booking.find({ ownerId: queryOwnerId })
    .populate("dockId")
    .populate("vesselId")
    .populate("boaterId", "name email")
    .sort({ createdAt: -1 });
}

/**
 * Updates booking status by enforcing strict state machine transitions and owner authorization.
 * Transitions:
 *  - pending -> accepted | rejected
 *  - accepted -> completed
 *  - All others throw ConflictError
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "accepted" | "rejected" | "completed",
  ownerId: string
) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new NotFoundError("Booking not found");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.ownerId.toString() !== ownerId) {
    throw new ForbiddenError("Forbidden: Only the dock owner can update this booking status");
  }

  // Enforce allowed transitions
  if (booking.status === BOOKING_STATUSES.PENDING) {
    if (status !== BOOKING_STATUSES.ACCEPTED && status !== BOOKING_STATUSES.REJECTED) {
      throw new ConflictError(
        `Invalid status transition from 'pending' to '${status}'. Pending bookings can only transition to 'accepted' or 'rejected'.`
      );
    }

    // Overlap prevention on single-slip berths
    if (status === BOOKING_STATUSES.ACCEPTED) {
      const overlapping = await Booking.findOne({
        _id: { $ne: booking._id },
        dockId: booking.dockId,
        status: BOOKING_STATUSES.ACCEPTED,
        startDate: { $lte: booking.endDate },
        endDate: { $gte: booking.startDate },
      });

      if (overlapping) {
        throw new ConflictError(
          "Conflict: This dock berth is already reserved for overlapping dates by another confirmed reservation."
        );
      }
    }
  } else if (booking.status === BOOKING_STATUSES.ACCEPTED) {
    if (status !== BOOKING_STATUSES.COMPLETED) {
      throw new ConflictError(
        `Invalid status transition from 'accepted' to '${status}'. Accepted bookings can only transition to 'completed'.`
      );
    }
  } else {
    throw new ConflictError(
      `Invalid status transition from '${booking.status}' to '${status}'. Bookings in status '${booking.status}' cannot be modified.`
    );
  }

  booking.status = status as BookingStatus;
  await booking.save();

  return booking;
}

/**
 * Allows the assigned boater to cancel their reservation if it is pending.
 */
export async function cancelBoaterBooking(bookingId: string, boaterId: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new NotFoundError("Booking not found");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  if (booking.boaterId.toString() !== boaterId) {
    throw new ForbiddenError("Forbidden: Only the assigned boater can cancel this reservation");
  }

  if (booking.status !== BOOKING_STATUSES.PENDING) {
    throw new ConflictError(
      `Cannot cancel reservation in '${booking.status}' status. Only pending reservations can be cancelled directly by the boater.`
    );
  }

  booking.status = BOOKING_STATUSES.REJECTED;
  await booking.save();

  return booking;
}
