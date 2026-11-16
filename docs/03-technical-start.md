# AnchorDrop — Technical Start Document

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Technical stack, architecture decisions, and project start guide  
**Product scope:** **Web portal only** (responsive browser app — no native mobile apps in v1)  
**Recommended stack:** **Next.js (App Router) + MongoDB**  
**Related docs:** [Problem & Solution](./01-problem-statement-and-solution.md) · [Features](./02-features-and-solutions.md) · [Solution Approach](./04-solution-approach.md) · [PlantUML Diagrams](./diagrams/)

---

## 1. Purpose of This Document

This document is the **technical starting point** for building AnchorDrop. It locks:

- What we will build (web portal boundaries)
- Which technologies we will use and why
- How the system is structured (folders, layers, data)
- Whether external APIs are required
- How local development, env vars, and demo data will work
- How the diagrams in `docs/diagrams/` map to the real system

Read this before writing application code so the stack stays consistent and avoidable integration issues are designed out early.

---

## 2. Product Scope (Technical Boundaries)

| In scope (v1) | Out of scope (v1) |
| :--- | :--- |
| Responsive web portal (desktop + mobile browser) | Native iOS / Android apps |
| Public marketplace pages | Real payment gateway / escrow |
| Boater dashboard | Live AIS / nautical chart APIs |
| Dock owner dashboard | SMS/WhatsApp notification providers |
| Auth with roles (boater / dock_owner) | Multi-region CDN complexity |
| Vessel–berth compatibility (length, beam, draft) | Full marina PMS replacement |
| Booking lifecycle + arrival unlock + delay reports | Production multi-tenant SSO |
| MongoDB persistence + seed/demo accounts | Offline-first / PWA as a hard requirement |

**Channel decision:** Web portal only. Mobile users use the same responsive Next.js site.

---

## 3. Architecture Decision — Next.js + MongoDB

### 3.1 Why this stack

Earlier sketches mentioned Express + SQLite + static HTML. For a clean, maintainable marketplace with dashboards and APIs in one codebase, **Next.js + MongoDB** is the preferred start:

| Need | Why Next.js + MongoDB fits |
| :--- | :--- |
| One web codebase | UI pages + API routes in a single project |
| Fast iteration | App Router, Server Components, simple local `npm run dev` |
| Role-based dashboards | Easy route groups: `(public)`, `(boater)`, `(owner)` |
| Flexible listing documents | Dock amenities, photos, arrival notes map naturally to MongoDB documents |
| Beginner-friendly ops | No separate Express server process; Atlas free tier or local MongoDB |
| Type safety path | TypeScript recommended from day one |

### 3.2 High-level architecture (one box view)

```text
Browser (Responsive Web Portal)
        │
        ▼
Next.js App (App Router)
  ├── UI pages (Marketplace, Auth, Boater Dashboard, Owner Dashboard)
  ├── Server Actions / Route Handlers (REST-style API)
  ├── Auth session layer
  └── Data access (MongoDB driver / ODM)
        │
        ▼
MongoDB (collections: users, vessels, docks, bookings)
```

PlantUML source for the full drawing: [`diagrams/01-system-architecture.puml`](./diagrams/01-system-architecture.puml)

---

## 4. Official Technology Stack

### 4.1 Core stack

| Layer | Technology | Version guidance | Role |
| :--- | :--- | :--- | :--- |
| Runtime | **Node.js** | LTS **v20+** or **v22+** | Runs Next.js and tooling |
| Framework | **Next.js** | **15.x** (App Router) | Web UI + API in one app |
| Language | **TypeScript** | 5.x | Safer models for vessels/docks/bookings |
| UI | **React** | 19.x (via Next.js) | Component-based dashboards |
| Styling | **CSS Modules** and/or **Tailwind CSS** *(optional)* | — | Brand palette + responsive layout |
| Database | **MongoDB** | 7.x / Atlas | Persistent document store |
| ODM / client | **Mongoose** *(recommended)* or official MongoDB Node driver | latest stable | Schemas, validation, queries |
| Auth passwords | **bcryptjs** | latest stable | Salted password hashing |
| Session / auth | **NextAuth.js (Auth.js)** *or* custom JWT/session cookies | latest stable | Login, logout, role guards |
| Validation | **Zod** | latest stable | Request/body schema validation |
| Package manager | **npm** | bundled with Node | Install & scripts |

### 4.2 Brand / frontend design tokens (must preserve)

| Token | Value | Use |
| :--- | :--- | :--- |
| Deep Navy | `#0B1F33` | Primary surfaces, nav, trust |
| Champagne Gold | `#C6A56B` | Accents, CTAs, highlights |
| Warm Hover | `#D8BD91` | Interactive hover states |
| Cream | `#F5F1E8` | Page backgrounds, soft panels |
| Headings | Georgia (serif) | Display / section titles |
| UI text | Arial / modern sans-serif | Forms, tables, dashboards |

Existing `index.html` / `css/style.css` are a **visual reference**. The production portal should be rebuilt as Next.js pages/components that keep this language — not a second conflicting design system.

### 4.3 Tooling (recommended)

| Tool | Purpose |
| :--- | :--- |
| ESLint + Next config | Lint React/Next rules |
| Prettier | Consistent formatting |
| dotenv / `.env.local` | Secrets and DB URI (never commit) |
| MongoDB Compass | Inspect local/Atlas data during development |
| PlantUML (local or [plantuml.com](https://www.plantuml.com/plantuml)) | Generate architecture diagrams from `.puml` files |

### 4.4 Host environment

| Item | Guidance |
| :--- | :--- |
| OS | Windows, macOS, or Linux |
| Dev URL | `http://localhost:3000` (Next.js default) |
| DB | Local MongoDB **or** MongoDB Atlas connection string |
| Browser | Latest Chrome / Edge / Firefox / Safari |

> **Note on port 8080:** An older `.vscode/launch.json` may point at `8080` (Express static era). For Next.js, use **3000** unless you explicitly configure `next start -p 8080`. Update launch config when the Next app exists.

---

## 5. External APIs — Required or Not?

### 5.1 Verdict for v1

**No mandatory third-party business APIs** are required to deliver the core AnchorDrop web portal.

Discovery, vessels, docks, compatibility, bookings, arrival unlock, and delay reports can all run **entirely inside** Next.js + MongoDB with seeded demo data.

### 5.2 Optional / later external services

| Service | Required for v1? | When you might add it | Notes |
| :--- | :---: | :--- | :--- |
| **MongoDB Atlas** | Optional | Hosted DB instead of local MongoDB | Still “our database,” not a domain API |
| **Map / geocoding** (e.g. Mapbox, Google Maps) | No | Map-based Explore later | Listings can use city/waterway text first |
| **Cloud image storage** (e.g. Cloudinary, S3) | No | Multi-photo uploads at scale | v1 can store image URLs or local/public assets |
| **Email provider** (Resend, SendGrid) | No | Email notifications later | In-app status is enough for demo |
| **SMS** | No | Arrival alerts later | Out of scope |
| **Payments** (Stripe) | No | Paid bookings later | Explicitly out of v1 |
| **Weather / tides APIs** | No | Enrichment later | Compatibility uses host-entered depth, not live tide APIs |
| **OAuth social login** | No | Convenience later | Email/password + demo accounts first |

### 5.3 Principle

Do not block the marketplace on external keys. Prefer **local-first demoability**: `npm install` → configure `MONGODB_URI` → `npm run seed` → `npm run dev`.

---

## 6. Application Structure (Proposed Next.js Layout)

```text
AnchorDrop/
├── docs/
│   ├── 01-problem-statement-and-solution.md
│   ├── 02-features-and-solutions.md
│   ├── 03-technical-start.md          ← this file
│   └── diagrams/                      ← PlantUML sources
├── public/                            ← static images, favicon
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   ← public homepage / marketplace
│   │   ├── (auth)/                    ← login/register UI if routed
│   │   ├── boater/                    ← boater dashboard routes
│   │   ├── owner/                     ← owner dashboard routes
│   │   └── api/                       ← Route Handlers
│   │       ├── auth/
│   │       ├── vessels/
│   │       ├── docks/
│   │       └── bookings/
│   ├── components/                    ← UI: nav, cards, modals, forms
│   ├── lib/
│   │   ├── db.ts                      ← Mongo connection helper
│   │   ├── auth.ts                    ← session helpers
│   │   ├── compatibility.ts           ← length/beam/draft checks
│   │   └── validations.ts             ← Zod schemas
│   ├── models/                        ← Mongoose models
│   │   ├── User.ts
│   │   ├── Vessel.ts
│   │   ├── Dock.ts
│   │   └── Booking.ts
│   └── styles/                        ← global CSS / brand tokens
├── scripts/
│   └── seed.ts                        ← demo users, docks, bookings
├── .env.local.example
├── package.json
├── tsconfig.json
└── next.config.ts
```

This structure keeps **public marketing**, **role dashboards**, **API**, and **domain models** separated without a second backend repo.

---

## 7. Data Layer — MongoDB Collections

### 7.1 Collections (logical schema)

| Collection | Purpose | Key fields (conceptual) |
| :--- | :--- | :--- |
| `users` | Accounts + roles | name, email, passwordHash, role (`boater` \| `dock_owner`), createdAt |
| `vessels` | Boater vessel profiles | userId, name, type, lengthFt, beamFt, draftFt, registration |
| `docks` | Berth listings | ownerId, title, location, waterway, photos[], maxLengthFt, maxBeamFt, minDepthFt, pricePerDay, amenities[], availability, arrivalInstructions (private) |
| `bookings` | Shared reservation lifecycle | boaterId, ownerId, dockId, vesselId, startDate, endDate, status, specialRequests, delayEta, delayNote, timestamps |

**Statuses:** `pending` → `accepted` | `rejected` → `completed`

### 7.2 Relationships (document references)

```text
User (boater) 1──* Vessel
User (owner)  1──* Dock
Booking *──1 User (boater)
Booking *──1 User (owner)
Booking *──1 Dock
Booking *──1 Vessel
```

PlantUML ER-style diagram: [`diagrams/04-data-model.puml`](./diagrams/04-data-model.puml)

### 7.3 Indexes (plan early to avoid query pain)

| Collection | Suggested indexes |
| :--- | :--- |
| `users` | unique `email` |
| `vessels` | `userId` |
| `docks` | `ownerId`; compound for filters (`location`, `maxLengthFt`, `minDepthFt`, `pricePerDay`) |
| `bookings` | `boaterId`, `ownerId`, `dockId`, `status`, `startDate` |

### 7.4 Compatibility rule (server-side, single source of truth)

Implemented in `lib/compatibility.ts` and reused by API + UI:

```text
compatible =
  vessel.lengthFt  <= dock.maxLengthFt  AND
  vessel.beamFt    <= dock.maxBeamFt    AND
  vessel.draftFt   <= dock.minDepthFt
```

Return per-constraint results so the UI can explain failures. This is a **preliminary dimensional check**, not navigational safety.

---

## 8. API Surface (Route Handlers)

Keep REST-shaped routes under `src/app/api/...` so dashboards stay thin.

### 8.1 Auth

| Method | Path | Purpose |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Create user with role |
| POST | `/api/auth/login` | Authenticate, set session/JWT cookie |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Clear session |

### 8.2 Docks

| Method | Path | Purpose |
| :--- | :--- | :--- |
| GET | `/api/docks` | Public search + filters |
| GET | `/api/docks/:id` | Public details (**strip** private arrival instructions) |
| POST | `/api/docks` | Owner create (auth + role) |
| PUT | `/api/docks/:id` | Owner update (ownership check) |
| DELETE | `/api/docks/:id` | Owner delete (ownership check) |

### 8.3 Vessels

| Method | Path | Purpose |
| :--- | :--- | :--- |
| GET | `/api/vessels` | Current boater’s vessels |
| POST | `/api/vessels` | Create |
| PUT | `/api/vessels/:id` | Update (ownership check) |
| DELETE | `/api/vessels/:id` | Delete (ownership check) |

### 8.4 Bookings & compatibility

| Method | Path | Purpose |
| :--- | :--- | :--- |
| POST | `/api/bookings/check-compatibility` | Dimensional fit check |
| POST | `/api/bookings` | Boater submits request |
| GET | `/api/bookings/boater` | Boater trip list (+ instructions if accepted) |
| GET | `/api/bookings/owner` | Owner request / arrivals list |
| PATCH | `/api/bookings/:id/status` | Owner accept/reject |
| PATCH | `/api/bookings/:id/delay` | Boater reports delay ETA/note |

**Security rules (non-negotiable):**

1. Hash passwords; never store plaintext  
2. Never return `arrivalInstructions` on public dock endpoints  
3. Unlock arrival instructions only when `booking.status === 'accepted'` and requester is the boater  
4. Enforce role + ownership on every mutating route  
5. Validate bodies with Zod before DB writes  

---

## 9. Web Portal Surfaces (Pages)

| Surface | Route idea | Features |
| :--- | :--- | :--- |
| Public homepage | `/` | Hero, Explore Docks, How It Works, auth modal/links, footer |
| Boater dashboard | `/boater` (+ tabs/sections) | Explore & Book, My Vessels, Trips & Status, delay reporting |
| Owner dashboard | `/owner` | My Berths, Requests & Approvals, Arrivals & Delays |
| Auth | `/login` or modal on `/` | Register/login + 1-click demo credentials |

Use cases overview: [`diagrams/02-use-case-diagram.puml`](./diagrams/02-use-case-diagram.puml)  
Booking journey sequence: [`diagrams/03-booking-sequence.puml`](./diagrams/03-booking-sequence.puml)

---

## 10. Auth & Demo Accounts (Technical Plan)

### 10.1 Approach

- Email + password registration  
- Role selected at registration: `boater` or `dock_owner`  
- Session cookie or signed JWT httpOnly cookie  
- Middleware / server checks protect `/boater` and `/owner` routes  

### 10.2 Seeded demo accounts (same product credentials)

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| Boater | Captain Alex Morgan | `captain.alex@gmail.com` | `password123` |
| Dock Owner | Marina Del Sol | `marina.delsol@gmail.com` | `password123` |
| Private Host | Sarah Jenkins | `sarah.harbor@gmail.com` | `password123` |

Seed script should create vessels, docks, and mixed-status bookings so the full loop is demoable without manual setup.

---

## 11. Environment Variables

Create `.env.local` from example (do **not** commit secrets):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/anchordrop
# or Atlas:
# MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/anchordrop?retryWrites=true&w=majority

AUTH_SECRET=replace-with-long-random-string
NEXTAUTH_URL=http://localhost:3000
# If using custom JWT instead of NextAuth, keep AUTH_SECRET for signing
```

**Checklist to avoid system issues:**

- [ ] MongoDB is running (local service) **or** Atlas URI is valid  
- [ ] DB name is consistent (`anchordrop`)  
- [ ] `AUTH_SECRET` is set in every environment that issues sessions  
- [ ] Seed uses the same `MONGODB_URI` as the app  
- [ ] `.env.local` is gitignored  

---

## 12. Local Development Workflow

### Prerequisites

1. Install **Node.js LTS** (v20+ / v22+)  
2. Install **MongoDB Community** locally **or** create a free **MongoDB Atlas** cluster  
3. Clone/open `d:\AnchorDrop`

### Commands (target scripts once the Next app is scaffolded)

```powershell
npm install
npm run seed
npm run dev
```

Open: **`http://localhost:3000`**

### Verification (target)

```powershell
npm test
```

Should cover: auth/roles, vessel CRUD, dock CRUD, compatibility, booking accept + arrival unlock, delay flow.

---

## 13. Quality & Reliability Rules (Avoid System Issues)

| Area | Rule |
| :--- | :--- |
| Single compatibility engine | Only `lib/compatibility.ts` owns fit math |
| Private fields | Strip `arrivalInstructions` in public serializers |
| Idempotent seed | Seed can be re-run safely (upsert by email / clear+reseed documented) |
| Typed models | Mongoose schemas + TypeScript types stay aligned |
| Error shape | APIs return consistent `{ error, details? }` JSON |
| No dual backends | Do not run a parallel Express+SQLite app alongside Next — one stack |
| Brand CSS | Centralize color tokens; do not invent a second palette |
| Web only | No Capacitor/React Native in v1 |
| External APIs | None required; add only with an ADR note in docs later |

---

## 14. Migration Note From Earlier HTML Prototype

| Existing asset | How to treat it |
| :--- | :--- |
| `index.html`, `css/style.css` | Design reference / brand baseline |
| Express + SQLite plan in older notes | **Superseded** by this technical start (Next.js + MongoDB) |
| Feature & problem docs | Still valid product intent — implement with this stack |

When scaffolding begins, prefer a fresh Next.js app in the repo root (or `apps/web` if you later monorepo) and port visual sections into React components.

---

## 15. Diagram Pack (PlantUML)

Generate these yourself by pasting each file into a PlantUML renderer:

| File | Diagram | What it shows |
| :--- | :--- | :--- |
| [`diagrams/01-system-architecture.puml`](./diagrams/01-system-architecture.puml) | System architecture | Browser → Next.js layers → MongoDB |
| [`diagrams/02-use-case-diagram.puml`](./diagrams/02-use-case-diagram.puml) | Use case | Boater & owner capabilities |
| [`diagrams/03-booking-sequence.puml`](./diagrams/03-booking-sequence.puml) | Sequence | Full booking + unlock + delay flow |
| [`diagrams/04-data-model.puml`](./diagrams/04-data-model.puml) | Data model | Collections, fields, relationships |

How to render: see [`diagrams/README.md`](./diagrams/README.md).

---

## 16. Suggested Build Order (Technical)

| Phase | Deliverable |
| :---: | :--- |
| 0 | Scaffold Next.js + TypeScript + brand CSS tokens + Mongo connection |
| 1 | User model, register/login, role middleware, seed users |
| 2 | Dock model + owner CRUD + public Explore filters |
| 3 | Vessel model + boater CRUD + compatibility helper/API |
| 4 | Booking create + owner accept/reject + status sync |
| 5 | Arrival instruction unlock + delay reporting + arrivals UI |
| 6 | How It Works polish, demo login buttons, automated tests |

---

## 17. Stack Summary Card

| Decision | Choice |
| :--- | :--- |
| Product | Two-sided docking marketplace web portal |
| Frontend + Backend | **Next.js (App Router) + TypeScript + React** |
| Database | **MongoDB + Mongoose** |
| Auth | Session/JWT + **bcryptjs** + roles |
| Validation | **Zod** |
| External business APIs | **None required for v1** |
| Maps / payments / email / SMS | Optional later |
| Local URL | `http://localhost:3000` |
| Brand | Navy / Gold / Cream + Georgia headings |

---

## Related Documents

- [01 — Problem Statement & Solution Approach](./01-problem-statement-and-solution.md)  
- [02 — Features & Problem–Solution Mapping](./02-features-and-solutions.md)  
- [04 — Solution Approach](./04-solution-approach.md)  
- [05 — Backend Plan](./05-backend-plan.md)  
- [06 — Frontend Plan](./06-frontend-plan.md)  
- [07 — Combined Project Structure](./07-combined-project-structure.md)  
- [08 — Master Plan](./08-master-plan.md)  
- [Diagrams](./diagrams/)  

---

© 2026 AnchorDrop. All rights reserved.
