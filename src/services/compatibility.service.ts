import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Vessel } from "@/models/Vessel";
import { Dock } from "@/models/Dock";
import { AppError } from "@/lib/errors";

export interface CompatibilityInput {
  vessel: { lengthFt: number; beamFt: number; draftFt: number };
  dock: { maxLengthFt: number; maxBeamFt: number; minDepthFt: number };
}

export interface ConstraintCheck {
  passes: boolean;
  vesselValue: number;
  dockLimit: number;
  diff: number; // dockLimit - vesselValue (positive means clearance, negative means overflow)
}

export interface CompatibilityResult {
  compatible: boolean;
  constraints: {
    length: ConstraintCheck;
    beam: ConstraintCheck;
    draft: ConstraintCheck;
  };
  disclaimer: string; // "Preliminary dimensional fit check only. Does not account for tide variations, marine currents, weather, or channel hazards."
}

export const COMPATIBILITY_DISCLAIMER =
  "Preliminary dimensional fit check only. Does not account for tide variations, marine currents, weather, or channel hazards.";

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Single source of truth for vessel-to-dock dimensional compatibility matching.
 * Sub-phases 15.1 - 15.3:
 * - Length passes if vessel.lengthFt <= dock.maxLengthFt
 * - Beam passes if vessel.beamFt <= dock.maxBeamFt
 * - Draft passes if vessel.draftFt <= dock.minDepthFt
 * - Overall compatible = length.passes && beam.passes && draft.passes
 */
export function checkCompatibility(input: CompatibilityInput): CompatibilityResult {
  const { vessel, dock } = input;

  const lengthDiff = Math.round((dock.maxLengthFt - vessel.lengthFt) * 100) / 100;
  const beamDiff = Math.round((dock.maxBeamFt - vessel.beamFt) * 100) / 100;
  const draftDiff = Math.round((dock.minDepthFt - vessel.draftFt) * 100) / 100;

  const lengthCheck: ConstraintCheck = {
    passes: vessel.lengthFt <= dock.maxLengthFt,
    vesselValue: vessel.lengthFt,
    dockLimit: dock.maxLengthFt,
    diff: lengthDiff,
  };

  const beamCheck: ConstraintCheck = {
    passes: vessel.beamFt <= dock.maxBeamFt,
    vesselValue: vessel.beamFt,
    dockLimit: dock.maxBeamFt,
    diff: beamDiff,
  };

  const draftCheck: ConstraintCheck = {
    passes: vessel.draftFt <= dock.minDepthFt,
    vesselValue: vessel.draftFt,
    dockLimit: dock.minDepthFt,
    diff: draftDiff,
  };

  const compatible = lengthCheck.passes && beamCheck.passes && draftCheck.passes;

  return {
    compatible,
    constraints: {
      length: lengthCheck,
      beam: beamCheck,
      draft: draftCheck,
    },
    disclaimer: COMPATIBILITY_DISCLAIMER,
  };
}

/**
 * Database helper function for checking vessel-dock compatibility.
 * Sub-phase 15.1:
 * Connects to DB, loads Vessel and Dock, runs checkCompatibility.
 * Throws NotFoundError if vessel or dock is not found.
 */
export async function checkVesselDockCompatibility(
  vesselId: string,
  dockId: string
): Promise<CompatibilityResult> {
  await connectDB();

  if (!vesselId || !mongoose.Types.ObjectId.isValid(vesselId)) {
    throw new NotFoundError(`Vessel not found with ID: ${vesselId}`);
  }

  if (!dockId || !mongoose.Types.ObjectId.isValid(dockId)) {
    throw new NotFoundError(`Dock not found with ID: ${dockId}`);
  }

  const vessel = await Vessel.findById(vesselId);
  if (!vessel) {
    throw new NotFoundError(`Vessel not found with ID: ${vesselId}`);
  }

  const dock = await Dock.findById(dockId);
  if (!dock) {
    throw new NotFoundError(`Dock not found with ID: ${dockId}`);
  }

  return checkCompatibility({
    vessel: {
      lengthFt: vessel.lengthFt,
      beamFt: vessel.beamFt,
      draftFt: vessel.draftFt,
    },
    dock: {
      maxLengthFt: dock.maxLengthFt,
      maxBeamFt: dock.maxBeamFt,
      minDepthFt: dock.minDepthFt,
    },
  });
}
