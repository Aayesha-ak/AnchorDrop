import { z } from "zod";
import { BOOKING_STATUSES } from "@/lib/constants";

export const createBookingSchema = z
  .object({
    dockId: z.string().min(1, "Dock ID is required"),
    vesselId: z.string().min(1, "Vessel ID is required"),
    startDate: z.coerce.date({ message: "Invalid start date format" }),
    endDate: z.coerce.date({ message: "Invalid end date format" }),
    specialRequests: z
      .string()
      .trim()
      .max(500, "Special requests cannot exceed 500 characters")
      .optional()
      .default(""),
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(
    [
      BOOKING_STATUSES.ACCEPTED,
      BOOKING_STATUSES.REJECTED,
      BOOKING_STATUSES.COMPLETED,
    ] as const,
    {
      message: "Status must be 'accepted', 'rejected', or 'completed'",
    }
  ),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

export const delayReportSchema = z.object({
  delayEta: z.coerce.date({ message: "Valid updated ETA date/time is required" }),
  delayNote: z
    .string()
    .trim()
    .max(300, "Delay note cannot exceed 300 characters")
    .optional()
    .default(""),
});

export type DelayReportInput = z.infer<typeof delayReportSchema>;

export const compatibilityCheckSchema = z.object({
  vesselId: z.string().optional(),
  dockId: z.string().optional(),
  // Direct dimensions alternative
  vesselLength: z.number().positive().optional(),
  vesselBeam: z.number().positive().optional(),
  vesselDraft: z.number().positive().optional(),
  dockMaxLength: z.number().positive().optional(),
  dockMaxBeam: z.number().positive().optional(),
  dockMinDepth: z.number().positive().optional(),
});

export type CompatibilityCheckInput = z.infer<typeof compatibilityCheckSchema>;
