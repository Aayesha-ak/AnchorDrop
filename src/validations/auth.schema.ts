import { z } from "zod";
import { USER_ROLES } from "@/lib/constants";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  role: z.enum([USER_ROLES.BOATER, USER_ROLES.DOCK_OWNER] as const, {
    message: "Role must be either 'boater' or 'dock_owner'",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
