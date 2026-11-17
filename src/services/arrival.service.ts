import { BOOKING_STATUSES, BookingStatus } from "@/lib/constants";
import { IBooking } from "@/models/Booking";
import { IDock } from "@/models/Dock";
import { SafeBooking, serializeBooking } from "@/lib/serializers";

/**
 * AnchorDrop Arrival Policy Service
 *
 * Rules:
 * 1. Private arrival instructions (gate codes, slip IDs, VHF radio channels)
 *    are UNLOCKED ONLY when a booking status is 'accepted' or 'completed'.
 * 2. The requester must be the assigned boater on the reservation (or the host/dock owner).
 * 3. Pending or rejected reservations NEVER expose arrival instructions.
 * 4. Public dock endpoints NEVER expose arrival instructions under any circumstances.
 */

export interface ArrivalUnlockDecision {
  isUnlocked: boolean;
  reason?: string;
  instructions?: string | null;
}

/**
 * Checks whether arrival instructions can be unlocked for a given booking and user.
 * Sub-phase 10.3: Implement arrival.service decision helper (when unlock is allowed).
 */
export function canUnlockArrivalInstructions(
  booking: Pick<IBooking, "status" | "boaterId" | "ownerId"> | { status: BookingStatus | string; boaterId: unknown; ownerId: unknown },
  requestingUserId: string
): boolean {
  if (!booking || !requestingUserId) {
    return false;
  }

  const boaterId = booking.boaterId ? String(booking.boaterId) : "";
  const ownerId = booking.ownerId ? String(booking.ownerId) : "";

  // User must be either the boater who booked or the dock owner who hosts
  const isParticipant = requestingUserId === boaterId || requestingUserId === ownerId;
  if (!isParticipant) {
    return false;
  }

  // Allowed only for accepted or completed bookings
  const isStatusAllowed =
    booking.status === BOOKING_STATUSES.ACCEPTED ||
    booking.status === BOOKING_STATUSES.COMPLETED;

  return isStatusAllowed;
}

/**
 * Returns the unlock decision along with the instructions if permitted.
 */
export function getArrivalUnlockDecision(
  booking: Pick<IBooking, "status" | "boaterId" | "ownerId"> | { status: BookingStatus | string; boaterId: unknown; ownerId: unknown },
  dock: Pick<IDock, "arrivalInstructions"> | { arrivalInstructions?: string },
  requestingUserId: string
): ArrivalUnlockDecision {
  const boaterId = booking.boaterId ? String(booking.boaterId) : "";
  const ownerId = booking.ownerId ? String(booking.ownerId) : "";

  if (requestingUserId !== boaterId && requestingUserId !== ownerId) {
    return {
      isUnlocked: false,
      reason: "You are not an authorized participant for this reservation.",
      instructions: null,
    };
  }

  if (booking.status === BOOKING_STATUSES.PENDING) {
    return {
      isUnlocked: false,
      reason: "Arrival instructions remain locked until the dock owner accepts your reservation request.",
      instructions: null,
    };
  }

  if (booking.status === BOOKING_STATUSES.REJECTED) {
    return {
      isUnlocked: false,
      reason: "Reservation request was declined. Arrival instructions are unavailable.",
      instructions: null,
    };
  }

  if (booking.status === BOOKING_STATUSES.ACCEPTED || booking.status === BOOKING_STATUSES.COMPLETED) {
    return {
      isUnlocked: true,
      instructions: dock?.arrivalInstructions || "",
    };
  }

  return {
    isUnlocked: false,
    reason: `Arrival instructions are locked for status: ${booking.status}.`,
    instructions: null,
  };
}

/**
 * Securely transforms a booking with dock private details merged conditionally.
 */
export function formatBookingWithArrivalPolicy(
  booking: IBooking | Record<string, unknown>,
  dock: IDock | Record<string, unknown>,
  requestingUserId: string
): SafeBooking {
  const status = String(booking.status || "");
  const boaterId = (booking as { boaterId?: unknown }).boaterId ? String((booking as { boaterId?: unknown }).boaterId) : "";
  const ownerId = (booking as { ownerId?: unknown }).ownerId ? String((booking as { ownerId?: unknown }).ownerId) : "";

  const isAllowed = canUnlockArrivalInstructions(
    { status, boaterId, ownerId },
    requestingUserId
  );

  const instructions = isAllowed
    ? String((dock as { arrivalInstructions?: string })?.arrivalInstructions || "")
    : null;

  return serializeBooking(booking as IBooking, { arrivalInstructions: instructions });
}
