import { IUser } from "@/models/User";
import { IDock } from "@/models/Dock";
import { IBooking } from "@/models/Booking";

/**
 * Public User Shape (stip passwordHash always)
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export function serializeUser(user: IUser | Record<string, unknown>): SafeUser {
  const rawId = (user as { _id?: unknown; id?: unknown })._id ?? (user as { id?: unknown }).id;
  const id = rawId ? String(rawId) : "";
  return {
    id,
    name: String(user.name || ""),
    email: String(user.email || ""),
    role: String(user.role || ""),
    createdAt: (user.createdAt as Date) || new Date(),
  };
}

/**
 * Public Dock Shape (strips arrivalInstructions always)
 */
export interface PublicDock {
  id: string;
  ownerId: string;
  title: string;
  location: string;
  waterway: string;
  dockType: string;
  photos: string[];
  maxLengthFt: number;
  maxBeamFt: number;
  minDepthFt: number;
  pricePerDay: number;
  amenities: string[];
  availabilityNotes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Owner Dock Shape (includes private arrivalInstructions for the berth owner)
 */
export interface OwnerDock extends PublicDock {
  arrivalInstructions: string;
}

/**
 * Strips arrivalInstructions and sensitive fields from a Dock document for public consumers.
 * Sub-phase 10.2: Strip arrivalInstructions from all public dock responses.
 */
export function serializePublicDock(dock: IDock | Record<string, unknown>): PublicDock {
  const rawId = (dock as { _id?: unknown; id?: unknown })._id ?? (dock as { id?: unknown }).id;
  const id = rawId ? String(rawId) : "";
  const ownerId = dock.ownerId ? String(dock.ownerId) : "";

  return {
    id,
    ownerId,
    title: String(dock.title || ""),
    location: String(dock.location || ""),
    waterway: String(dock.waterway || ""),
    dockType: String(dock.dockType || ""),
    photos: Array.isArray(dock.photos) ? dock.photos.map(String) : [],
    maxLengthFt: Number(dock.maxLengthFt || 0),
    maxBeamFt: Number(dock.maxBeamFt || 0),
    minDepthFt: Number(dock.minDepthFt || 0),
    pricePerDay: Number(dock.pricePerDay || 0),
    amenities: Array.isArray(dock.amenities) ? dock.amenities.map(String) : [],
    availabilityNotes: String(dock.availabilityNotes || ""),
    isActive: Boolean(dock.isActive !== undefined ? dock.isActive : true),
    createdAt: (dock.createdAt as Date) || new Date(),
    updatedAt: (dock.updatedAt as Date) || new Date(),
  };
}

/**
 * Maps an array of dock documents to sanitized public docks.
 */
export function serializePublicDocks(docks: (IDock | Record<string, unknown>)[]): PublicDock[] {
  return docks.map(serializePublicDock);
}

/**
 * Serializes a dock for its verified owner, including the private arrivalInstructions.
 */
export function serializeOwnerDock(dock: IDock | Record<string, unknown>): OwnerDock {
  const publicData = serializePublicDock(dock);
  return {
    ...publicData,
    arrivalInstructions: String(dock.arrivalInstructions || ""),
  };
}

/**
 * Safe Booking Representation
 */
export interface SafeBooking {
  id: string;
  boaterId: string;
  ownerId: string;
  dockId: string;
  vesselId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  specialRequests: string;
  delayEta?: Date | null;
  delayNote?: string;
  arrivalInstructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Serializes a booking, attaching arrival instructions only when explicit authorization is granted.
 */
export function serializeBooking(
  booking: IBooking | Record<string, unknown>,
  options?: { arrivalInstructions?: string | null }
): SafeBooking {
  const rawId = (booking as { _id?: unknown; id?: unknown })._id ?? (booking as { id?: unknown }).id;
  const id = rawId ? String(rawId) : "";
  const boaterId = booking.boaterId ? String(booking.boaterId) : "";
  const ownerId = booking.ownerId ? String(booking.ownerId) : "";
  const dockId = booking.dockId ? String(booking.dockId) : "";
  const vesselId = booking.vesselId ? String(booking.vesselId) : "";

  const safe: SafeBooking = {
    id,
    boaterId,
    ownerId,
    dockId,
    vesselId,
    startDate: (booking.startDate as Date) || new Date(),
    endDate: (booking.endDate as Date) || new Date(),
    status: String(booking.status || "pending"),
    specialRequests: String(booking.specialRequests || ""),
    delayEta: (booking.delayEta as Date) || null,
    delayNote: String(booking.delayNote || ""),
    createdAt: (booking.createdAt as Date) || new Date(),
    updatedAt: (booking.updatedAt as Date) || new Date(),
  };

  if (options && options.arrivalInstructions !== undefined) {
    safe.arrivalInstructions = options.arrivalInstructions;
  }

  return safe;
}
