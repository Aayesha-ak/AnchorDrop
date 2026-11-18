/**
 * AnchorDrop Feature Flags & Environment Toggles
 * Easily toggled via environment variables (true / false or mode strings)
 */

export const FEATURES = {
  /**
   * Interactive Maps Toggle
   * Set NEXT_PUBLIC_ENABLE_MAPS=true in .env.local to enable interactive OpenStreetMap
   * (Zero API keys required - uses free OpenStreetMap & OpenSeaMap nautical tiles).
   */
  ENABLE_MAPS: process.env.NEXT_PUBLIC_ENABLE_MAPS === "true",

  /**
   * Payment Mode
   * "dockside": Pay upon arrival / Cash at Berth (Direct settlement with dock host, $0 fees).
   * "stripe": Online card authorization and automated host payouts (requires Stripe keys).
   */
  PAYMENT_MODE: (process.env.NEXT_PUBLIC_PAYMENT_MODE || "dockside") as "dockside" | "stripe",

  /**
   * External Notifications Toggle
   * Set ENABLE_EXTERNAL_NOTIFICATIONS=true when external SMS (Twilio) or Email (Resend)
   * API keys are supplied. Otherwise runs on in-app alerts and live status dashboards.
   */
  ENABLE_EXTERNAL_NOTIFICATIONS: process.env.ENABLE_EXTERNAL_NOTIFICATIONS === "true",
};

export default FEATURES;
