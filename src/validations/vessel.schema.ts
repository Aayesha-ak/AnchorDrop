import { z } from "zod";

export const createVesselSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vessel name is required")
    .max(100, "Vessel name cannot exceed 100 characters"),
  type: z
    .string()
    .trim()
    .min(1, "Vessel type is required (e.g. Cruiser, Sailboat, Yacht)")
    .max(50, "Vessel type cannot exceed 50 characters"),
  lengthFt: z
    .number({ message: "Length must be a number" })
    .positive("Length must be greater than 0 feet")
    .max(500, "Length cannot exceed 500 feet"),
  beamFt: z
    .number({ message: "Beam width must be a number" })
    .positive("Beam must be greater than 0 feet")
    .max(100, "Beam cannot exceed 100 feet"),
  draftFt: z
    .number({ message: "Draft depth must be a number" })
    .positive("Draft must be greater than 0 feet")
    .max(50, "Draft cannot exceed 50 feet"),
  registration: z
    .string()
    .trim()
    .min(1, "Vessel registration or documentation number is required")
    .max(50, "Registration cannot exceed 50 characters"),
});

export type CreateVesselInput = z.infer<typeof createVesselSchema>;

export const updateVesselSchema = createVesselSchema.partial();

export type UpdateVesselInput = z.infer<typeof updateVesselSchema>;
