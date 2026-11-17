export const USER_ROLES = {
  BOATER: "boater",
  DOCK_OWNER: "dock_owner",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const BOOKING_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  COMPLETED: "completed",
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export const AUTH_COOKIE_NAME = "anchordrop_session";

export const JWT_EXPIRES_IN = "7d";

// Standard brand and copy constants
export const APP_METADATA = {
  NAME: "AnchorDrop",
  HEADLINE: "Your Place on the Water!",
  TAGLINE: "Discover. Dock. Unwind.",
};

// Seeded demo accounts
export const DEMO_ACCOUNTS = {
  BOATER: {
    name: "Captain Alex Morgan",
    email: "captain.alex@gmail.com",
    role: USER_ROLES.BOATER,
  },
  MARINA_OWNER: {
    name: "Marina Del Sol",
    email: "marina.delsol@gmail.com",
    role: USER_ROLES.DOCK_OWNER,
  },
  PRIVATE_HOST: {
    name: "Sarah Jenkins",
    email: "sarah.harbor@gmail.com",
    role: USER_ROLES.DOCK_OWNER,
  },
};
