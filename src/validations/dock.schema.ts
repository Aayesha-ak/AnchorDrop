import { z } from "zod";

export const createDockSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(120, "Title cannot exceed 120 characters"),
  location: z
    .string()
    .trim()
    .min(2, "Location is required (e.g. Fort Lauderdale, FL)")
    .max(120, "Location cannot exceed 120 characters"),
  waterway: z
    .string()
    .trim()
    .min(2, "Waterway is required (e.g. Biscayne Bay)")
    .max(120, "Waterway cannot exceed 120 characters"),
  dockType: z
    .string()
    .trim()
    .min(2, "Dock type is required (e.g. Private Slip, Marina Berth)")
    .max(60, "Dock type cannot exceed 60 characters"),
  photos: z.array(z.string().trim()).default(["/images/hero-marina.jpeg"]),
  maxLengthFt: z
    .number({ message: "Maximum length must be a number" })
    .positive("Maximum vessel length must be greater than 0 feet")
    .max(1000, "Maximum length cannot exceed 1000 feet"),
  maxBeamFt: z
    .number({ message: "Maximum beam must be a number" })
    .positive("Maximum beam must be greater than 0 feet")
    .max(200, "Maximum beam cannot exceed 200 feet"),
  minDepthFt: z
    .number({ message: "Minimum depth must be a number" })
    .positive("Minimum water depth must be greater than 0 feet")
    .max(200, "Minimum depth cannot exceed 200 feet"),
  pricePerDay: z
    .number({ message: "Daily price must be a number" })
    .min(0, "Daily rate cannot be negative"),
  amenities: z.array(z.string().trim()).default([]),
  availabilityNotes: z
    .string()
    .trim()
    .max(300, "Availability notes cannot exceed 300 characters")
    .default("Available for temporary and overnight reservations."),
  arrivalInstructions: z
    .string()
    .trim()
    .max(1000, "Arrival instructions cannot exceed 1000 characters")
    .default(""),
  isActive: z.boolean().default(true),
});

export type CreateDockInput = z.infer<typeof createDockSchema>;

export const updateDockSchema = createDockSchema.partial();

export type UpdateDockInput = z.infer<typeof updateDockSchema>;

export const dockQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  waterway: z.string().trim().optional(),
  dockType: z.string().trim().optional(),
  maxLength: z.coerce.number().positive().optional(),
  minDepth: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

export type DockQueryInput = z.infer<typeof dockQuerySchema>;
