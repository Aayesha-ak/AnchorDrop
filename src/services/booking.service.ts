import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking, IBooking } from "@/models/Booking";
import { Dock } from "@/models/Dock";
import { Vessel } from "@/models/Vessel";
import { User } from "@/models/User";
import { BOOKING_STATUSES, USER_ROLES } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { CreateBookingInput } from "@/validations/booking.schema";
import { checkCompatibility as runCanonicalCompatibility } from "@/services/compatibility.service";

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, details);
    this.name = "BadRequestError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, details);
    this.name = "ConflictError";
  }
}

export interface CompatibilityResult {
  compatible: boolean;
  lengthOk: boolean;
  beamOk: boolean;
  draftOk: boolean;
  reasons: string[];
}

/**
 * Checks dimensional compatibility between a vessel and dock berth.
 * Vessel LOA <= dock.maxLengthFt
 * Vessel Beam <= dock.maxBeamFt
 * Vessel Draft <= dock.minDepthFt
 */
export function checkCompatibility(
  vessel: { lengthFt: number; beamFt: number; draftFt: number },
  dock: { maxLengthFt: number; maxBeamFt: number; minDepthFt: number }
): CompatibilityResult {
  const result = runCanonicalCompatibility({ vessel, dock });
  const reasons: string[] = [];

  if (!result.constraints.length.passes) {
    reasons.push(
      `Vessel length (${vessel.lengthFt}ft) exceeds dock maximum length (${dock.maxLengthFt}ft)`
    );
  }
  if (!result.constraints.beam.passes) {
    reasons.push(
      `Vessel beam (${vessel.beamFt}ft) exceeds dock maximum beam (${dock.maxBeamFt}ft)`
    );
  }
  if (!result.constraints.draft.passes) {
    reasons.push(
      `Vessel draft (${vessel.draftFt}ft) exceeds dock minimum water depth (${dock.minDepthFt}ft)`
    );
  }

  return {
    compatible: result.compatible,
    lengthOk: result.constraints.length.passes,
    beamOk: result.constraints.beam.passes,
    draftOk: result.constraints.draft.passes,
    reasons,
  };
}

export type BookingInput =
  | CreateBookingInput
  | {
      dockId: string;
      vesselId: string;
      startDate: Date | string;
      endDate: Date | string;
      specialRequests?: string;
    };

/**
 * Creates a new reservation request with status "pending".
 * Enforces:
 * - Valid boater identity and boater role
 * - Valid active dock listing
 * - Prevention of self-booking by dock hosts
 * - Vessel ownership verification
 * - Dimensional compatibility check (length, beam, draft)
 * - Date validity (endDate >= startDate)
 */
export async function createBooking(
  input: BookingInput,
  boaterId: string
): Promise<IBooking> {
  await connectDB();

  // Validate boater ID
  if (!mongoose.Types.ObjectId.isValid(boaterId)) {
    throw new BadRequestError("Invalid boater identifier format");
  }

  // Fetch boater and verify role
  const boater = await User.findById(boaterId);
  if (!boater) {
    throw new AppError("Boater user account not found", 404);
  }
  if (boater.role !== USER_ROLES.BOATER) {
    throw new AppError("Only boaters are permitted to create reservations", 403);
  }

  // Validate dock ID and fetch dock
  if (!mongoose.Types.ObjectId.isValid(input.dockId)) {
    throw new BadRequestError("Invalid dock identifier format");
  }

  const dock = await Dock.findById(input.dockId);
  if (!dock) {
    throw new AppError("Dock listing not found", 404);
  }
  if (!dock.isActive) {
    throw new BadRequestError("Dock listing is not currently active for reservations");
  }

  // Prevent hosts from booking their own berths
  if (dock.ownerId.toString() === boaterId.toString()) {
    throw new BadRequestError("Hosts cannot book their own berths");
  }

  // Validate vessel ID and fetch vessel
  if (!mongoose.Types.ObjectId.isValid(input.vesselId)) {
    throw new BadRequestError("Invalid vessel identifier format");
  }

  const vessel = await Vessel.findById(input.vesselId);
  if (!vessel) {
    throw new AppError("Vessel not found", 404);
  }

  // Verify vessel ownership
  if (vessel.userId.toString() !== boaterId.toString()) {
    throw new AppError("Forbidden: You do not own this vessel", 403);
  }

  // Dimensional compatibility check
  const compatibility = checkCompatibility(vessel, dock);
  if (!compatibility.compatible) {
    throw new BadRequestError("Vessel dimensions exceed dock parameters");
  }

  // Validate date range
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new BadRequestError("Invalid date format provided");
  }
  if (endDate < startDate) {
    throw new BadRequestError("End date must be greater than or equal to start date");
  }

  // Create booking with status pending
  const booking = await Booking.create({
    boaterId: boater._id,
    ownerId: dock.ownerId,
    dockId: dock._id,
    vesselId: vessel._id,
    startDate,
    endDate,
    status: BOOKING_STATUSES.PENDING,
    specialRequests: input.specialRequests ? input.specialRequests.trim() : "",
  });

  // Populate references for return
  const populated = await Booking.findById(booking._id)
    .populate("dockId")
    .populate("vesselId");

  return populated || booking;
}

/**
 * Retrieves a single booking by ID with ownership/participant authorization.
 */
export async function getBookingById(bookingId: string, userId: string) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError("Booking not found", 404);
  }

  const booking = await Booking.findById(bookingId)
    .populate("dockId")
    .populate("vesselId")
    .populate("boaterId", "name email");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const boaterIdStr = (booking.boaterId as { _id?: unknown })?._id?.toString() || booking.boaterId?.toString();
  const ownerIdStr = (booking.ownerId as { _id?: unknown })?._id?.toString() || booking.ownerId?.toString();

  if (boaterIdStr !== userId && ownerIdStr !== userId) {
    throw new AppError("Forbidden: You are not authorized to view this booking", 403);
  }

  return booking;
}

export { getBoaterBookings, getOwnerBookings, updateBookingStatus, cancelBoaterBooking } from "./booking-lifecycle.service";

