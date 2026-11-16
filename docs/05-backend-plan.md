# AnchorDrop — Backend Implementation Plan

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Backend plan — modules, services, file responsibilities, and implementation order  
**Stack:** Next.js App Router (Route Handlers) + TypeScript + MongoDB + Mongoose  
**Style:** Planning only — **no application code** in this document  
**Related docs:**  
[Problem](./01-problem-statement-and-solution.md) ·  
[Features](./02-features-and-solutions.md) ·  
[Technical Start](./03-technical-start.md) ·  
[Solution Approach](./04-solution-approach.md) ·  
[Diagrams](./diagrams/)

---

## 1. Purpose of This Document

This document is the **complete backend plan** for AnchorDrop. It explains:

- Where backend responsibility lives inside the Next.js app  
- How features are split into **modules and services**  
- What each planned file/folder is for  
- What each API area must do  
- What rules the backend must enforce  
- In what order the backend should be implemented  

It does **not** contain source code. Folder/file names are **planned targets**, not a claim that they already exist.

> Frontend page/component structure will be a separate document.  
> A combined full-repo structure document can follow after both are ready.

---

## 2. Backend Role in AnchorDrop

The backend is the **system of record and rule engine** for the marketplace.

| Backend must | Backend must not (v1) |
| :--- | :--- |
| Authenticate users and enforce roles | Process real payments |
| Persist users, vessels, docks, bookings | Call maps / tides / SMS APIs |
| Run vessel–berth compatibility checks | Expose private arrival instructions publicly |
| Own booking status transitions | Depend on a second Express/SQLite server |
| Filter and search dock inventory | Replace navigational charts or safety advice |
| Unlock arrival data only after accept | Require native mobile backends |

**Architectural choice:** Backend = Next.js **Route Handlers** + **lib services** + **Mongoose models** + **MongoDB**. One app, one database.

---

## 3. Backend Layer Model

Think of the backend as four layers. Requests move top → bottom; responses bottom → top.

```text
1. Transport Layer        API route files (HTTP method, path, status codes)
2. Guard & Validation     Auth session, role checks, ownership, Zod input checks
3. Domain Services        Business logic (auth, docks, vessels, bookings, compatibility)
4. Persistence Layer      Mongoose models + MongoDB connection + indexes
```

### Layer responsibilities

| Layer | Owns | Does not own |
| :--- | :--- | :--- |
| Transport | URL shape, HTTP verbs, wiring request → service | Business rules |
| Guard & Validation | “Who is this?” “Is input valid?” “Are they allowed?” | How fit is calculated |
| Domain Services | Compatibility, booking lifecycle, private-field policy | HTML/CSS rendering |
| Persistence | Collections, schemas, indexes, queries | UI copy / brand layout |

---

## 4. Planned Backend Folder & File Map

All paths are relative to the future application root (Next.js project).

```text
src/
├── app/
│   └── api/                          ← Transport layer (Route Handlers)
│       ├── auth/
│       │   ├── register/route        ← Create account
│       │   ├── login/route           ← Authenticate + set session
│       │   ├── logout/route          ← Clear session
│       │   └── me/route              ← Current user profile
│       ├── vessels/
│       │   ├── route                 ← List / create (boater)
│       │   └── [id]/route            ← Update / delete one vessel
│       ├── docks/
│       │   ├── route                 ← Public list+filters / owner create
│       │   └── [id]/route            ← Public detail / owner update / delete
│       └── bookings/
│           ├── route                 ← Create booking request
│           ├── check-compatibility/route
│           ├── boater/route          ← Boater trip list (+ unlock rules)
│           ├── owner/route           ← Owner requests / arrivals feed
│           └── [id]/
│               ├── status/route      ← Accept / reject / complete
│               └── delay/route       ← Boater delay report
│
├── models/                           ← Persistence schemas
│   ├── User
│   ├── Vessel
│   ├── Dock
│   └── Booking
│
├── services/                         ← Domain services (feature modules)
│   ├── auth.service
│   ├── user.service
│   ├── vessel.service
│   ├── dock.service
│   ├── booking.service
│   ├── compatibility.service
│   └── arrival.service               ← Private instruction unlock policy
│
├── lib/                              ← Shared backend utilities
│   ├── db                            ← Mongo connection singleton
│   ├── auth                          ← Session/JWT read/write helpers
│   ├── password                      ← Hash + verify helpers
│   ├── errors                        ← Standard error shapes
│   ├── serializers                   ← Public vs private field stripping
│   └── constants                     ← Roles, statuses, limits
│
├── validations/                      ← Input schemas (Zod plans)
│   ├── auth.schema
│   ├── vessel.schema
│   ├── dock.schema
│   └── booking.schema
│
└── middleware (app-level or helpers) ← Route protection patterns for APIs/pages

scripts/
├── seed                              ← Demo users, vessels, docks, bookings
└── (optional) reset-db               ← Controlled local reset for demos

.env.local.example                    ← MONGODB_URI, AUTH_SECRET, app URL
```

### File purpose cheat-sheet

| Planned unit | Purpose |
| :--- | :--- |
| `app/api/**/route` | HTTP entry points only; call services; return JSON |
| `models/*` | Document shape, indexes, basic field constraints |
| `services/*` | Feature logic and orchestration |
| `lib/db` | Connect once; reuse across requests |
| `lib/auth` | Issue/read session; attach current user |
| `lib/password` | bcrypt hash/verify only |
| `lib/serializers` | Remove `arrivalInstructions` / `passwordHash` from unsafe responses |
| `lib/errors` | Consistent `{ error, details? }` responses |
| `validations/*` | Request body/query contracts before services run |
| `scripts/seed` | Deterministic demo dataset for walkthroughs |

---

## 5. Feature → Module Division

Features are divided into **backend modules**. Each module has a clear owner service and related routes.

### 5.1 Module catalog

| Module | Feature area | Primary service | Related routes | Depends on |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Module** | Register, login, logout, me | `auth.service` | `/api/auth/*` | User model, password, session |
| **User Module** | Role identity, profile reads | `user.service` | used by auth/me | User model |
| **Vessel Module** | Boater vessel CRUD | `vessel.service` | `/api/vessels` | Auth (boater), Vessel model |
| **Dock Module** | Listing CRUD + public search | `dock.service` | `/api/docks` | Auth (owner for writes), Dock model, serializers |
| **Compatibility Module** | Length/beam/draft fit | `compatibility.service` | `/api/bookings/check-compatibility` | Vessel + Dock reads |
| **Booking Module** | Request, lists, status changes | `booking.service` | `/api/bookings/*` | Auth, Vessel, Dock, Compatibility |
| **Arrival Module** | Private instruction policy | `arrival.service` | used inside booking reads | Booking status + Dock private fields |
| **Delay Module** | ETA + note updates | inside `booking.service` | `/api/bookings/:id/delay` | Booking ownership (boater) |
| **Seed Module** | Demo data bootstrap | `scripts/seed` | CLI only | All models |

### 5.2 Why divide this way

- **Auth** stays isolated so security changes do not spill into listing logic  
- **Dock** separates public browse from owner management  
- **Compatibility** is a dedicated module so fit rules are never duplicated in booking and UI adapters  
- **Arrival** is explicit so private-field policy is not accidental  
- **Booking** orchestrates the shared lifecycle between both roles  

---

## 6. Module Plans (What Each Must Contain)

### 6.1 Auth Module

**Problems solved:** Identity, roles, trusted access to dashboards/APIs.

**Must provide**

- Register with name, email, password, role (`boater` | `dock_owner`)  
- Login with email/password  
- Logout / session clear  
- Current user (`me`) without password hash  
- Rejection of duplicate emails  

**Rules**

- Passwords stored only as hashes  
- Role required and validated at registration  
- Invalid credentials return generic auth failure (no user enumeration detail beyond standard practice)

**Outputs consumed by:** all protected modules  

---

### 6.2 Vessel Module

**Problems solved:** Structured vessel specs for fit and owner review.

**Must provide**

- List vessels for current boater only  
- Create vessel (name, type, length, beam, draft, registration)  
- Update own vessel  
- Delete own vessel  

**Rules**

- Only role `boater` (or dual-capable account if later allowed) mutates vessels  
- Ownership check on update/delete  
- Numeric dimensions validated as positive numbers  

**Outputs consumed by:** Compatibility, Booking  

---

### 6.3 Dock Module

**Problems solved:** Publish vacant berths; power Explore search.

**Must provide**

- Public list with filters (location/waterway, dock type, max length, min depth, max price, active only)  
- Public detail **without** private arrival instructions  
- Owner create listing  
- Owner update listing (including private arrival notes)  
- Owner delete / deactivate listing  
- Owner list “my berths” (may be same list endpoint with auth context, or filter by owner)

**Rules**

- Write operations require `dock_owner` + ownership of that dock  
- Public serializers must strip `arrivalInstructions`  
- Search should use planned indexes for common filters  

**Outputs consumed by:** Public marketplace, Compatibility, Booking  

---

### 6.4 Compatibility Module

**Problems solved:** Unsuitable requests; ambiguous dimensional fit.

**Must provide**

- Compare one vessel against one dock  
- Return per-constraint results (length, beam, draft) + overall flag  
- Be callable standalone (check endpoint) and internally (before booking create)

**Rules**

- Single source of truth for formulas  
- Preliminary check only — no tide/live weather dependency in v1  
- Fail closed on missing dimensions  

**Outputs consumed by:** Booking create, boater UI via API  

---

### 6.5 Booking Module

**Problems solved:** Informal reservations; no shared status.

**Must provide**

- Create booking request (boater + vessel + dock + dates + special requests) → `pending`  
- Boater booking list with status  
- Owner booking/request list with boater + vessel summary  
- Status transitions: accept, reject, complete  
- Delay update: ETA + note by boater  

**Rules**

- Create only by authenticated boater for own vessel  
- Re-run compatibility on create  
- Accept/reject/complete only by dock owner of that booking’s dock  
- Delay only by boater of that booking  
- Disallow illegal transitions (example: rejected → accepted without a defined reopen policy — v1 keep transitions strict)

**Planned status machine**

```text
pending  → accepted
pending  → rejected
accepted → completed
(rejected and completed are terminal in v1 unless product later adds reopen)
```

**Outputs consumed by:** both dashboards, Arrival module  

---

### 6.6 Arrival Module (policy module)

**Problems solved:** Sensitive arrival data shared too early or inconsistently.

**Must provide**

- Decision: whether arrival instructions may be attached to a response  
- Safe merge of dock private fields into boater booking payloads when allowed  

**Rules**

- Allow only if booking `status === accepted` (and optionally `completed` if product wants history — decide in implementation; default recommend: accepted + completed)  
- Requester must be the booking’s boater  
- Never attach on public dock endpoints  
- Never attach on owner public-facing serializers by accident  

**Outputs consumed by:** `GET /api/bookings/boater`  

---

### 6.7 Seed Module

**Problems solved:** Empty database; slow demos.

**Must provide**

- Demo boater (Captain Alex) + vessels  
- Demo marina owner (Marina Del Sol) + multiple docks  
- Demo private host (Sarah Jenkins) + one dock  
- Sample bookings across statuses  
- Idempotent or documented re-seed behavior  

**Rules**

- Uses same password hashing path as Auth  
- Uses same models as production paths  
- Documented demo credentials match product docs  

---

## 7. API Surface Plan (By Area)

### 7.1 Auth API

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Create user |
| POST | `/api/auth/login` | Public | Start session |
| POST | `/api/auth/logout` | Authenticated | End session |
| GET | `/api/auth/me` | Authenticated | Current user |

### 7.2 Vessels API

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| GET | `/api/vessels` | Boater | List my vessels |
| POST | `/api/vessels` | Boater | Create vessel |
| PUT | `/api/vessels/:id` | Boater + owner | Update vessel |
| DELETE | `/api/vessels/:id` | Boater + owner | Delete vessel |

### 7.3 Docks API

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| GET | `/api/docks` | Public | Search/filter listings |
| GET | `/api/docks/:id` | Public | Detail (public fields) |
| POST | `/api/docks` | Owner | Create berth |
| PUT | `/api/docks/:id` | Owner + owner | Update berth |
| DELETE | `/api/docks/:id` | Owner + owner | Remove/deactivate berth |

### 7.4 Bookings & Compatibility API

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| POST | `/api/bookings/check-compatibility` | Authenticated (typically boater) | Fit check |
| POST | `/api/bookings` | Boater | Create request |
| GET | `/api/bookings/boater` | Boater | Trips + conditional arrival info |
| GET | `/api/bookings/owner` | Owner | Requests / arrivals feed |
| PATCH | `/api/bookings/:id/status` | Owner | Accept / reject / complete |
| PATCH | `/api/bookings/:id/delay` | Boater | Report delay |

---

## 8. Data Persistence Plan

### 8.1 Collections

| Collection | Module owner | Notes |
| :--- | :--- | :--- |
| `users` | Auth / User | Unique email; role enum; passwordHash |
| `vessels` | Vessel | Indexed by `userId` |
| `docks` | Dock | Public fields + private `arrivalInstructions` |
| `bookings` | Booking | Links boater, owner, dock, vessel; status + delay fields |

### 8.2 Cross-collection rules

- Bookings store both `boaterId` and `ownerId` for fast role queries  
- Deleting a vessel/dock with active bookings needs a policy (v1 recommendation: prevent delete while `pending`/`accepted` exist, or soft-deactivate docks)  
- Indexes planned for email uniqueness and common dock/booking queries  

### 8.3 Sensitive fields inventory

| Field | Collection | Public API? | When visible |
| :--- | :--- | :---: | :--- |
| `passwordHash` | users | Never | Never |
| `arrivalInstructions` | docks | No | Boater booking payload after accept (via Arrival policy) |
| `delayNote` / `delayEta` | bookings | Role-scoped | Boater (own) + Owner (own bookings) |

---

## 9. Cross-Cutting Backend Concerns

### 9.1 Authentication & authorization checklist

- [ ] Session/JWT present on protected routes  
- [ ] Role matches module requirements  
- [ ] Ownership matches resource id  
- [ ] Demo accounts use same auth path as real users  

### 9.2 Validation checklist

- [ ] Register/login bodies validated  
- [ ] Vessel dimensions validated  
- [ ] Dock dimensions, depth, price validated  
- [ ] Booking dates validated (end ≥ start)  
- [ ] Status patch only allows allowed enum values  
- [ ] Delay payload requires ETA (and optional note)

### 9.3 Error & response consistency

Plan standard categories:

- `400` validation errors  
- `401` unauthenticated  
- `403` forbidden (wrong role/owner)  
- `404` missing resource  
- `409` conflict (duplicate email, illegal status transition, delete blocked)  
- `500` unexpected server failure  

### 9.4 Serialization policy

Centralize in serializers/lib:

- Strip password hashes always  
- Strip arrival instructions on public dock responses always  
- Attach arrival instructions only through Arrival module decisions  

---

## 10. Backend Implementation Order

Aligns with solution approach vertical slices.

| Step | Build | Backend modules involved | Done when |
| :---: | :--- | :--- | :--- |
| B0 | DB connection + env + constants | `lib/db`, env example | App can connect to MongoDB |
| B1 | User model + Auth routes/services | Auth, User, password, validations | Register/login/me/logout work |
| B2 | Dock model + Dock routes/services + public serializer | Dock, serializers | Owner CRUD + public Explore query work |
| B3 | Vessel model + Vessel routes/services | Vessel | Boater CRUD works |
| B4 | Compatibility service + check route | Compatibility | Fit results correct for pass/fail cases |
| B5 | Booking create + boater/owner lists | Booking | Pending requests visible both sides |
| B6 | Status transitions | Booking | Accept/reject/complete enforced |
| B7 | Arrival unlock on boater list/detail | Arrival + Booking | Instructions appear only when allowed |
| B8 | Delay route + owner arrivals fields | Booking | Delay ETA/note stored and returned to owner |
| B9 | Seed script | Seed | Demo walkthrough possible cold-start |
| B10 | Backend verification checklist / tests | All | Critical paths confirmed |

---

## 11. Backend Verification Plan (No Code)

For each area, verify behavior — not UI polish.

| Area | Verify |
| :--- | :--- |
| Auth | Wrong password fails; role returned; logout clears access |
| Vessels | User A cannot edit User B vessel |
| Docks | Public GET never includes arrival instructions |
| Docks | Owner can update own dock; not another owner’s |
| Compatibility | Known pass case passes; each failing dimension fails overall |
| Booking create | Incompatible vessel rejected or blocked by policy |
| Status | Only owner can accept; boater cannot self-accept |
| Arrival | Pending hides instructions; accepted shows to that boater only |
| Delay | Only booking boater can patch delay; owner can read it |
| Seed | Demo emails/passwords match documentation |

---

## 12. Explicit Non-Goals for Backend v1

Do **not** plan backend modules yet for:

- Payment / payout services  
- Email/SMS notification workers  
- Map geocoding services  
- Live tide/weather integrations  
- File-upload CDN pipelines (URLs/static assets are enough)  
- Admin superuser console  
- Separate microservice deployment per domain  

These can be added later as new modules without rewriting the core booking loop.

---

## 13. Handoff to Frontend (What Backend Will Expose)

When the frontend plan is written, it should assume these backend capabilities exist:

1. Auth session and role  
2. Public dock search/detail (safe fields)  
3. Boater vessel CRUD  
4. Compatibility check response with per-constraint flags  
5. Booking create + trip list with conditional arrival block  
6. Owner request list + status actions  
7. Delay update reflected on owner arrivals feed  

Frontend should not re-implement compatibility math or private-field policy.

---

## 14. Summary

| Topic | Plan |
| :--- | :--- |
| Backend home | Next.js `app/api` + `services` + `models` + `lib` |
| Feature split | Auth, Vessel, Dock, Compatibility, Booking, Arrival, Seed |
| Core rule engine | Compatibility + status machine + arrival unlock |
| Data store | MongoDB collections: users, vessels, docks, bookings |
| External APIs | None required for v1 |
| Build style | Vertical slices B0→B10 until demo walkthrough works |
| This doc | Structure & responsibilities only — no code |

---

## Related Documents

- [01 — Problem Statement](./01-problem-statement-and-solution.md)  
- [02 — Features](./02-features-and-solutions.md)  
- [03 — Technical Start](./03-technical-start.md)  
- [04 — Solution Approach](./04-solution-approach.md)  
- [06 — Frontend Plan](./06-frontend-plan.md)  
- [07 — Combined Project Structure](./07-combined-project-structure.md)  
- [08 — Master Plan](./08-master-plan.md)  
- [Diagrams](./diagrams/)  

**Next:** Frontend ✅ [06](./06-frontend-plan.md) · Combined structure ✅ [07](./07-combined-project-structure.md) · Master plan ✅ [08](./08-master-plan.md).

---

© 2026 AnchorDrop. All rights reserved.
