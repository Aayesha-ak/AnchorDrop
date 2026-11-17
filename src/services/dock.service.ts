import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Dock } from "@/models/Dock";
import { checkDockDeletePolicy } from "@/lib/delete-policy";
import {
  PublicDock,
  OwnerDock,
  serializePublicDock,
  serializePublicDocks,
  serializeOwnerDock,
} from "@/lib/serializers";
import {
  CreateDockInput,
  UpdateDockInput,
  DockQueryInput,
} from "@/validations/dock.schema";
import { AppError } from "@/lib/errors";

/**
 * Filter options extending public query schema
 */
export interface DockFindFilters extends DockQueryInput {
  ownerId?: string;
  includeInactive?: boolean;
}

/**
 * Query and filter docks.
 * Sub-phase 11.2: GET /api/docks with filters (location/waterway, type, max length, min depth, max price, active)
 * Enforces privacy: public consumers NEVER receive arrivalInstructions.
 */
export async function listDocks(
  filters: DockFindFilters = {},
  requestingUserId?: string
): Promise<(PublicDock | OwnerDock)[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  // Active status filtering (public only sees active docks)
  if (!filters.includeInactive) {
    query.isActive = true;
  }

  // Filter by owner
  if (filters.ownerId) {
    if (mongoose.Types.ObjectId.isValid(filters.ownerId)) {
      query.ownerId = new mongoose.Types.ObjectId(filters.ownerId);
    } else {
      query.ownerId = filters.ownerId;
    }
  }

  // Free text search across title, location, waterway, dockType
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    query.$or = [
      { title: regex },
      { location: regex },
      { waterway: regex },
      { dockType: regex },
    ];
  }

  // Specific parameter filters
  if (filters.location) {
    query.location = new RegExp(filters.location.trim(), "i");
  }

  if (filters.waterway) {
    query.waterway = new RegExp(filters.waterway.trim(), "i");
  }

  if (filters.dockType) {
    query.dockType = new RegExp(filters.dockType.trim(), "i");
  }

  // Berth capacity filters:
  // Dock maxLengthFt must be >= requested vessel length
  if (filters.maxLength !== undefined && filters.maxLength > 0) {
    query.maxLengthFt = { $gte: Number(filters.maxLength) };
  }

  // Dock minDepthFt (low-tide clearance) must be >= requested draft
  if (filters.minDepth !== undefined && filters.minDepth > 0) {
    query.minDepthFt = { $gte: Number(filters.minDepth) };
  }

  // Daily rate limit
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    query.pricePerDay = { $lte: Number(filters.maxPrice) };
  }

  const docks = await Dock.find(query).sort({ createdAt: -1 });

  // If requester is viewing their own berths explicitly, return OwnerDock with private arrival notes
  if (filters.ownerId && requestingUserId && filters.ownerId === requestingUserId) {
    return docks.map(serializeOwnerDock);
  }

  // Otherwise, strictly serialize as public docks without arrival instructions
  return serializePublicDocks(docks);
}

/**
 * Retrieve a single dock by ID.
 * Sub-phase 11.3: GET /api/docks/:id public detail (safe fields only)
 * Sub-phase 11.7: Owner can read own arrivalInstructions via owner authorization
 */
export async function getDockById(
  id: string,
  requestingUserId?: string
): Promise<PublicDock | OwnerDock> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid dock identifier format", 400);
  }

  const dock = await Dock.findById(id);
  if (!dock) {
    throw new AppError("Dock listing not found", 404);
  }

  // If the requester is the verified owner of this dock, include private arrivalInstructions
  if (requestingUserId && dock.ownerId.toString() === requestingUserId) {
    return serializeOwnerDock(dock);
  }

  // For public visitors and boaters, strictly strip arrivalInstructions
  return serializePublicDock(dock);
}

/**
 * Create a new dock berth listing for a dock owner.
 * Sub-phase 11.4: POST /api/docks owner create
 */
export async function createDock(
  data: CreateDockInput,
  ownerId: string
): Promise<OwnerDock> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new AppError("Invalid owner identifier format", 400);
  }

  const newDock = await Dock.create({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    title: data.title.trim(),
    location: data.location.trim(),
    waterway: data.waterway.trim(),
    dockType: data.dockType.trim(),
    photos: data.photos && data.photos.length > 0 ? data.photos : ["/images/hero-marina.jpeg"],
    maxLengthFt: data.maxLengthFt,
    maxBeamFt: data.maxBeamFt,
    minDepthFt: data.minDepthFt,
    pricePerDay: data.pricePerDay,
    amenities: data.amenities || [],
    availabilityNotes: data.availabilityNotes || "Available for temporary and overnight reservations.",
    arrivalInstructions: data.arrivalInstructions || "",
    isActive: data.isActive !== undefined ? data.isActive : true,
  });

  return serializeOwnerDock(newDock);
}

/**
 * Update an existing dock berth listing.
 * Sub-phase 11.5: PUT /api/docks/:id owner update (ownership enforced)
 * Sub-phase 11.7: Owner can edit own arrivalInstructions
 */
export async function updateDock(
  id: string,
  data: UpdateDockInput,
  ownerId: string
): Promise<OwnerDock> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid dock identifier format", 400);
  }

  const dock = await Dock.findById(id);
  if (!dock) {
    throw new AppError("Dock listing not found", 404);
  }

  // Enforce ownership
  if (dock.ownerId.toString() !== ownerId) {
    throw new AppError("Forbidden: You do not have permission to modify this dock listing", 403);
  }

  // Update provided fields
  if (data.title !== undefined) dock.title = data.title.trim();
  if (data.location !== undefined) dock.location = data.location.trim();
  if (data.waterway !== undefined) dock.waterway = data.waterway.trim();
  if (data.dockType !== undefined) dock.dockType = data.dockType.trim();
  if (data.photos !== undefined) dock.photos = data.photos;
  if (data.maxLengthFt !== undefined) dock.maxLengthFt = data.maxLengthFt;
  if (data.maxBeamFt !== undefined) dock.maxBeamFt = data.maxBeamFt;
  if (data.minDepthFt !== undefined) dock.minDepthFt = data.minDepthFt;
  if (data.pricePerDay !== undefined) dock.pricePerDay = data.pricePerDay;
  if (data.amenities !== undefined) dock.amenities = data.amenities;
  if (data.availabilityNotes !== undefined) dock.availabilityNotes = data.availabilityNotes.trim();
  if (data.arrivalInstructions !== undefined) dock.arrivalInstructions = data.arrivalInstructions.trim();
  if (data.isActive !== undefined) dock.isActive = data.isActive;

  await dock.save();

  return serializeOwnerDock(dock);
}

/**
 * Delete or deactivate a dock berth listing.
 * Sub-phase 11.6: DELETE /api/docks/:id owner delete/deactivate (ownership + booking policy)
 */
export async function deleteDock(
  id: string,
  ownerId: string
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid dock identifier format", 400);
  }

  const dock = await Dock.findById(id);
  if (!dock) {
    throw new AppError("Dock listing not found", 404);
  }

  // Enforce ownership
  if (dock.ownerId.toString() !== ownerId) {
    throw new AppError("Forbidden: You do not have permission to delete this dock listing", 403);
  }

  // Check delete policy against active/pending reservations
  const policyResult = await checkDockDeletePolicy(id);
  if (!policyResult.allowed) {
    throw new AppError(
      policyResult.reason || "Cannot delete listing with active reservations. You may deactivate it instead.",
      409
    );
  }

  await Dock.findByIdAndDelete(id);

  return {
    success: true,
    message: "Dock berth listing removed successfully",
  };
}

/**
 * Retrieve all berths belonging to a specific dock owner (including inactive listings).
 */
export async function getOwnerBerths(ownerId: string): Promise<OwnerDock[]> {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new AppError("Invalid owner identifier format", 400);
  }

  const docks = await Dock.find({ ownerId: new mongoose.Types.ObjectId(ownerId) }).sort({ createdAt: -1 });
  return docks.map(serializeOwnerDock);
}
