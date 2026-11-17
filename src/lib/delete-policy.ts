import mongoose from "mongoose";
import { Booking } from "@/models/Booking";
import { BOOKING_STATUSES } from "@/lib/constants";

/**
 * AnchorDrop Delete Policy
 * Protects integrity between vessels, docks, and active bookings.
 */

export interface DeletePolicyResult {
  allowed: boolean;
  reason?: string;
  activeCount?: number;
}

/**
 * Rule: A vessel cannot be deleted if there are reservations in 'pending' or 'accepted' status.
 */
export async function checkVesselDeletePolicy(
  vesselId: string | mongoose.Types.ObjectId
): Promise<DeletePolicyResult> {
  const activeBookingsCount = await Booking.countDocuments({
    vesselId,
    status: { $in: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.ACCEPTED] },
  });

  if (activeBookingsCount > 0) {
    return {
      allowed: false,
      reason: `Cannot delete vessel with ${activeBookingsCount} active or pending reservation(s). Complete or cancel these trips first.`,
      activeCount: activeBookingsCount,
    };
  }

  return { allowed: true };
}

/**
 * Rule: A dock berth cannot be deleted if there are reservations in 'pending' or 'accepted' status.
 * Dock owners should set isActive: false (deactivate) instead to prevent new bookings while honoring commitments.
 */
export async function checkDockDeletePolicy(
  dockId: string | mongoose.Types.ObjectId
): Promise<DeletePolicyResult> {
  const activeBookingsCount = await Booking.countDocuments({
    dockId,
    status: { $in: [BOOKING_STATUSES.PENDING, BOOKING_STATUSES.ACCEPTED] },
  });

  if (activeBookingsCount > 0) {
    return {
      allowed: false,
      reason: `Cannot delete dock listing with ${activeBookingsCount} active or pending reservation(s). You can deactivate the listing to stop new requests.`,
      activeCount: activeBookingsCount,
    };
  }

  return { allowed: true };
}
