import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Vessel, IVessel } from "@/models/Vessel";
import { Booking } from "@/models/Booking";
import { BOOKING_STATUSES } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { CreateVesselInput, UpdateVesselInput } from "@/validations/vessel.schema";

export class ForbiddenError extends AppError {
  public override name = "ForbiddenError";

  constructor(message = "Forbidden: You do not have permission to access this vessel") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  public override name = "ConflictError";

  constructor(message = "Cannot delete vessel with active or pending bookings") {
    super(message, 409);
  }
}

export class NotFoundError extends AppError {
  public override name = "NotFoundError";

  constructor(message = "Vessel not found") {
    super(message, 404);
  }
}

/**
 * Returns all vessels owned by this user
 */
export async function getVesselsByUserId(userId: string): Promise<IVessel[]> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier format", 400);
  }
  return Vessel.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
}

/**
 * Returns vessel, throws ForbiddenError if userId does not match
 */
export async function getVesselById(id: string, userId: string): Promise<IVessel> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid vessel identifier format", 400);
  }
  const vessel = await Vessel.findById(id);
  if (!vessel) {
    throw new NotFoundError("Vessel not found");
  }
  if (vessel.userId.toString() !== userId.toString()) {
    throw new ForbiddenError("Forbidden: You do not have permission to access this vessel");
  }
  return vessel;
}

/**
 * Creates and saves new vessel
 */
export async function createVessel(
  data: CreateVesselInput,
  userId: string
): Promise<IVessel> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier format", 400);
  }
  const vessel = new Vessel({
    userId: new mongoose.Types.ObjectId(userId),
    name: data.name.trim(),
    type: data.type.trim(),
    lengthFt: Number(data.lengthFt),
    beamFt: Number(data.beamFt),
    draftFt: Number(data.draftFt),
    registration: data.registration.trim(),
  });
  await vessel.save();
  return vessel;
}

/**
 * Enforces ownership, updates vessel
 */
export async function updateVessel(
  id: string,
  data: UpdateVesselInput,
  userId: string
): Promise<IVessel> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid vessel identifier format", 400);
  }
  const vessel = await Vessel.findById(id);
  if (!vessel) {
    throw new NotFoundError("Vessel not found");
  }
  if (vessel.userId.toString() !== userId.toString()) {
    throw new ForbiddenError("Forbidden: You do not have permission to modify this vessel");
  }

  if (data.name !== undefined) vessel.name = data.name.trim();
  if (data.type !== undefined) vessel.type = data.type.trim();
  if (data.lengthFt !== undefined) vessel.lengthFt = Number(data.lengthFt);
  if (data.beamFt !== undefined) vessel.beamFt = Number(data.beamFt);
  if (data.draftFt !== undefined) vessel.draftFt = Number(data.draftFt);
  if (data.registration !== undefined) vessel.registration = data.registration.trim();

  await vessel.save();
  return vessel;
}

/**
 * Enforces ownership, checks Booking model: if there is any active booking (pending or accepted)
 * for this vessel, throws ConflictError("Cannot delete vessel with active or pending bookings"), else deletes.
 */
export async function deleteVessel(
  id: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid vessel identifier format", 400);
  }
  const vessel = await Vessel.findById(id);
  if (!vessel) {
    throw new NotFoundError("Vessel not found");
  }
  if (vessel.userId.toString() !== userId.toString()) {
    throw new ForbiddenError("Forbidden: You do not have permission to delete this vessel");
  }

  const activeBooking = await Booking.findOne({
    vesselId: vessel._id,
    status: { $in: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.ACCEPTED] },
  });

  if (activeBooking) {
    throw new ConflictError("Cannot delete vessel with active or pending bookings");
  }

  await Vessel.findByIdAndDelete(vessel._id);
  return { success: true, message: "Vessel removed" };
}
