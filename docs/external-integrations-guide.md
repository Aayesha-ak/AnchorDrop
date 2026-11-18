# AnchorDrop — External Integrations & Production API Guide
> **From Local Prototype & Simulation to Scaled Maritime Production**

---

## 1. Executive Summary: The v1 "Local-First" Architecture

During Phase 1 through Phase 25 of AnchorDrop's development, the system was intentionally built on a **zero-external-dependency, local-first architecture**. This allowed full end-to-end execution of the marketplace lifecycle without blocking development on paid third-party business keys, sandbox approvals, or external service downtime.

To make this possible, several production-grade features currently use **in-app simulations, embedded engines, or local fallbacks**:

```mermaid
flowchart TD
    subgraph v1_Built ["v1 Current Engine (Local / Self-Contained)"]
        DB_V1["MongoDB / Embedded Memory Server"]
        AUTH_V1["JWT + bcryptjs (HttpOnly Cookies)"]
        MAPS_V1["Text Search + City/Waterway Regex"]
        PAY_V1["Calculated Rates (Zero Gateway)"]
        NOTIF_V1["In-App Operational Dashboards + Badges"]
        TIDE_V1["Host Static Low-Tide Depth + Disclaimer"]
        STORAGE_V1["Local Public Asset Paths (/images)"]
    end

    subgraph v2_External ["v2 Production Integrations (Third-Party Services)"]
        DB_V2["MongoDB Atlas (Cloud Cluster)"]
        AUTH_V2["OAuth 2.0 (Google / Apple Sign-In)"]
        MAPS_V2["Mapbox GL JS / Google Maps Platform"]
        PAY_V2["Stripe Connect (Escrow & Host Payouts)"]
        NOTIF_V2["Resend (Email) + Twilio (SMS Alerting)"]
        TIDE_V2["NOAA CO-OPS API (Live Water Levels)"]
        STORAGE_V2["UploadThing / Cloudflare R2 (S3 CDN)"]
    end

    DB_V1 -.->|Migrate URI| DB_V2
    AUTH_V1 -.->|Add Providers| AUTH_V2
    MAPS_V1 -.->|Add Geocoding & Tiles| MAPS_V2
    PAY_V1 -.->|Add Payment Intents| PAY_V2
    NOTIF_V1 -.->|Add Webhook Triggers| NOTIF_V2
    TIDE_V1 -.->|Query Station Predictions| TIDE_V2
    STORAGE_V1 -.->|Direct Presigned Uploads| STORAGE_V2
```

---

## 2. Complete Inventory of Mocked / Simulated Features

| # | System Area | What v1 Does (Current Simulation / Mock) | What Production v2 Needs | Priority |
| :--- | :--- | :--- | :--- | :---: |
| **1** | **Payments & Escrow** | Calculates total rate (`days * pricePerDay`) in memory; creates booking directly as `pending` with $0 captured. | **Stripe Connect** (Auth-and-capture escrow on request, payout to host on check-in/completion). | **High** |
| **2** | **Map & Discovery** | Text filtering by city, region, and waterway regex (`/api/docks?location=...`); card grid list. | **Mapbox GL JS** or **Google Maps Platform** (Interactive cluster pins, nautical nautical chart overlays). | **High** |
| **3** | **Tides & Depths** | Checks vessel draft vs. host-entered `minDepthFt` (mean low water) with embedded legal disclaimer. | **NOAA CO-OPS API** (Free live tide predictions at station coordinates to compute actual tide clearance). | **Medium** |
| **4** | **Notifications** | Real-time state visible only when users visit `/owner/arrivals` or `/boater/trips`. | **Resend** (Transactional emails) + **Twilio** (SMS text alerts for day-of arrival delays). | **Medium** |
| **5** | **Media & Photos** | Uses local seed assets (`/images/hero-marina.jpeg`) or manually pasted URLs. | **UploadThing** or **Cloudflare R2** (Direct browser-to-S3 photo uploads for berths and vessels). | **Medium** |
| **6** | **Social Login** | Custom email/password credentials with seeded 1-click accounts (`boater@anchordrop.com`). | **Google / Apple OAuth** (1-click mobile-friendly authentication for recreational boaters). | **Low** |
| **7** | **Database Tier** | Connects to local port 27017, falling back to embedded `MongoMemoryServer`. | **MongoDB Atlas M0/M10** (Managed high-availability cloud database with automated backups). | **High** |

---

## 3. Step-by-Step Acquisition & Implementation Guide

### 3.1 Payment Processing & Host Payouts (Stripe Connect)

#### Why it's needed
In a two-sided berth marketplace, boaters should not pay hosts with cash on the dock. Stripe Connect holds funds in escrow when a boater submits a request, captures the payment only when the dock host clicks **"Accept"**, and automatically transfers the host's 85–90% payout upon stay completion while retaining a platform take-rate (10–15%).

#### Where to get it
1. Register at [stripe.com](https://stripe.com).
2. Navigate to **Stripe Connect** settings and select **Express Accounts** (fastest onboarding for private dock hosts).

#### Environment variables needed
```bash
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### Implementation Blueprint
1. Install SDK: `npm install stripe @stripe/stripe-js`
2. **Boater Request Flow (`/api/bookings`):** Create a Stripe `PaymentIntent` with `capture_method: "manual"`. Save `paymentIntentId` on the `Booking` document.
3. **Host Acceptance Flow (`/api/bookings/:id/status`):** When status transitions to `accepted`, call `stripe.paymentIntents.capture(booking.paymentIntentId)`.
4. **Host Onboarding (`/api/owner/payout-setup`):** Generate Stripe Express onboarding links (`stripe.accountLinks.create`) for dock owners to connect their bank accounts.

---

### 3.2 Interactive Maritime Maps & Geocoding (Mapbox GL JS)

#### Why it's needed
Boaters navigate by water, not just street addresses. An interactive map allows zooming into inlets, canals, and bays with nautical visual depth cues.

#### Where to get it
1. Register at [mapbox.com](https://www.mapbox.com).
2. Generate a default public token under **Account > Access Tokens**.
3. (Optional) Browse OpenSeaMap or NOAA ENC chart layers to overlay buoys and channels.

#### Environment variables needed
```bash
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1Ijo..."
```

#### Implementation Blueprint
1. Install SDK: `npm install mapbox-gl @types/mapbox-gl`
2. **Schema Update:** Add GeoJSON coordinates to [src/models/Dock.ts](file:///D:/AnchorDrop/src/models/Dock.ts):
   ```typescript
   locationGeo: {
     type: { type: String, default: "Point" },
     coordinates: [Number], // [longitude, latitude]
   }
   ```
3. **Component:** Build a `<DockMap />` component on [src/app/explore/page.tsx](file:///D:/AnchorDrop/src/app/explore/page.tsx) rendering custom nautical anchor pins with price badges that open preview popups.

---

### 3.3 Live Marine Tides & Water Elevation (NOAA CO-OPS API)

#### Why it's needed
AnchorDrop's primary safety value proposition is preventing vessel groundings. While host-entered `minDepthFt` provides baseline low-tide depth, actual water clearance fluctuates significantly with spring/neap tides and storms.

#### Where to get it (100% Free — Zero API Key Required!)
* **Provider:** National Oceanic and Atmospheric Administration (NOAA) Center for Operational Oceanographic Products and Services (CO-OPS).
* **Endpoint:** `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter`
* **Documentation:** [tidesandcurrents.noaa.gov/api/](https://tidesandcurrents.noaa.gov/api/)

#### How it works without keys
NOAA's API is a completely open public US government service:
```http
GET https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?
  begin_date=20261118&
  end_date=20261119&
  station=8722956&
  product=predictions&
  datum=MLLW&
  units=english&
  time_zone=lst_ldt&
  format=json
```
*(Station `8722956` is Port Everglades / Fort Lauderdale, FL).*

#### Implementation Blueprint
In [src/services/compatibility.service.ts](file:///D:/AnchorDrop/src/services/compatibility.service.ts), enrich the compatibility result:
```typescript
export async function getLiveTideClearance(stationId: string, arrivalDate: Date, draftFt: number, baseDepthFt: number) {
  const dateStr = arrivalDate.toISOString().slice(0, 10).replace(/-/g, "");
  const res = await fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&end_date=${dateStr}&station=${stationId}&product=predictions&datum=MLLW&units=english&time_zone=gmt&format=json`);
  const data = await res.json();
  const predictedTide = Number(data.predictions?.[0]?.v || 0);
  const actualWaterDepth = baseDepthFt + predictedTide;
  return {
    actualWaterDepth,
    underKeelClearance: actualWaterDepth - draftFt,
    tideVariationFt: predictedTide,
  };
}
```

---

### 3.4 Transactional Email Notifications (Resend)

#### Why it's needed
Recreational boaters are often out on the water and away from the app. They require immediate email confirmation when:
1. A booking request is received (to host).
2. A booking is accepted with arrival instructions unlocked (to boater).
3. A travel delay is posted with an updated ETA (to host).

#### Where to get it
1. Register at [resend.com](https://resend.com).
2. Add and verify your custom sending domain (e.g., `notifications.anchordrop.com`) by adding 3 DNS records (DKIM, SPF, MX).
3. Generate an API Key with "Sending access".

#### Environment variables needed
```bash
RESEND_API_KEY="re_123456789..."
NOTIFICATION_FROM_EMAIL="AnchorDrop Docking <berths@anchordrop.com>"
```

#### Implementation Blueprint
1. Install SDK: `npm install resend @react-email/components`
2. Create reusable email templates:
   * `BookingRequestedEmail`
   * `ArrivalUnlockedEmail` (delivering gate code, slip number, VHF radio channel)
   * `DelayAlertEmail`
3. Trigger in existing route handlers:
   * [src/app/api/bookings/route.ts](file:///D:/AnchorDrop/src/app/api/bookings/route.ts#L28) -> Notify Host.
   * [src/app/api/bookings/[id]/status/route.ts](file:///D:/AnchorDrop/src/app/api/bookings/[id]/status/route.ts#L32) -> Notify Boater.
   * [src/app/api/bookings/[id]/delay/route.ts](file:///D:/AnchorDrop/src/app/api/bookings/[id]/delay/route.ts#L58) -> Notify Host.

---

### 3.5 Day-of Delay Alerts via SMS (Twilio Messaging)

#### Why it's needed
Dock masters and private waterfront hosts do not monitor email while on the docks. When a boater runs into headwinds or adverse tides and clicks **"Report Delay"** in the app, an urgent SMS alert ensures the slip is held.

#### Where to get it
1. Register at [twilio.com](https://twilio.com).
2. Provision an SMS-capable phone number or alphanumeric Sender ID.
3. Retrieve Account SID and Auth Token from the Twilio Console.

#### Environment variables needed
```bash
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="7a8b..."
TWILIO_PHONE_NUMBER="+18005550199"
```

#### Implementation Blueprint
1. Install SDK: `npm install twilio`
2. In [src/app/api/bookings/[id]/delay/route.ts](file:///D:/AnchorDrop/src/app/api/bookings/[id]/delay/route.ts):
   ```typescript
   import twilio from "twilio";
   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

   await client.messages.create({
     to: hostPhoneNumber,
     from: process.env.TWILIO_PHONE_NUMBER,
     body: `⚓ AnchorDrop Alert: Captain ${boater.name} is delayed arriving at ${dock.title}. Updated ETA: ${newEta}. Note: "${note}"`,
   });
   ```

---

### 3.6 Media & Photo Storage (UploadThing or Cloudflare R2)

#### Why it's needed
Currently, hosts enter photo URLs or rely on demo pictures. In production, hosts want to take photos of their slip, bull rails, power pedestals, and water access directly from their phone.

#### Where to get it
* **Option A (Easiest for Next.js):** [uploadthing.com](https://uploadthing.com) — built specifically for Next.js App Router with server-side validation components.
* **Option B (Lowest Cost at Scale):** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) — zero egress fees, full AWS S3 API compatibility.

#### Environment variables needed (UploadThing)
```bash
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="app_..."
```

#### Implementation Blueprint
1. Install SDK: `npm install uploadthing @uploadthing/react`
2. Create `/api/uploadthing/route.ts` file router with 4MB image restrictions.
3. Drop `<UploadButton />` directly into [src/components/owner/BerthForm.tsx](file:///D:/AnchorDrop/src/components/owner/BerthForm.tsx) and vessel creation modals.

---

### 3.7 Managed Production Database (MongoDB Atlas)

#### Why it's needed
The embedded `MongoMemoryServer` resets its database whenever the Node process stops. A permanent cloud cluster is required for persistence across deploys.

#### Where to get it
1. Register at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Deploy a free **M0 Sandbox cluster** (512MB storage, free forever) or **Serverless / M10** cluster in AWS `us-east-1` (near Vercel hosting).
3. Under **Database Access**, create a user with read/write permissions.
4. Under **Network Access**, allow IP `0.0.0.0/0` (with strong password) or link to your Vercel deployment IP range.

#### Environment variable needed
```bash
MONGODB_URI="mongodb+srv://anchordrop_app:<password>@cluster0.abcde.mongodb.net/anchordrop?retryWrites=true&w=majority"
```
*(AnchorDrop's [src/lib/db.ts](file:///D:/AnchorDrop/src/lib/db.ts) automatically recognizes `mongodb+srv://` connection strings and disables local memory fallback).*

---

## 4. Master Environment Blueprint (`.env.production.example`)

Copy these variables into your deployment environment (e.g. Vercel / Railway / AWS):

```bash
# ==============================================================================
# ⚓ ANCHORDROP PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================

# Core Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://anchordrop.com"
AUTH_SECRET="generate-a-strong-random-64-character-hex-string-for-jwt"

# 1. Database Tier (MongoDB Atlas)
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/anchordrop?retryWrites=true&w=majority"

# 2. Payments & Host Escrow (Stripe Connect)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# 3. Geospatial Mapping (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1Ijo..."

# 4. Transactional Communications (Resend)
RESEND_API_KEY="re_..."
NOTIFICATION_FROM_EMAIL="AnchorDrop <berths@anchordrop.com>"

# 5. Urgent SMS Dispatch (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# 6. Cloud Media Storage (UploadThing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# 7. NOAA CO-OPS Tides API
# No API key required! Open public US government endpoints.
```

---

## 5. Recommended Phase 2 Rollout Sequence

To maximize value without destabilizing the verified core marketplace loop, roll out external services in this priority order:

1. **Step 1: MongoDB Atlas** (15 mins) — Replace local storage with a cloud database URI so data persists across server restarts.
2. **Step 2: Resend Email** (1 hour) — Send real confirmation emails when hosts accept requests, containing the unlocked arrival instructions.
3. **Step 3: NOAA Tides** (2 hours) — Connect NOAA's free prediction API into the existing [src/services/compatibility.service.ts](file:///D:/AnchorDrop/src/services/compatibility.service.ts) to provide real water depth estimates for coastal slips.
4. **Step 4: UploadThing** (2 hours) — Allow photo uploads on [BerthForm.tsx](file:///D:/AnchorDrop/src/components/owner/BerthForm.tsx) instead of typing URLs.
5. **Step 5: Stripe Connect** (1–2 days) — Add escrow holding and automatic host payouts.
6. **Step 6: Mapbox & Twilio** (1–2 days) — Add interactive pin maps on `/explore` and SMS text dispatch for late arrivals.
