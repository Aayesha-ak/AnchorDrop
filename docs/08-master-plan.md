# AnchorDrop — Master Execution Plan

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Master plan — phased execution checklist for the complete v1 project  
**How to use:** Work **phase by phase**. Check every sub-phase box before moving on.  
**Companion structure map:** [07 — Combined Project Structure](./07-combined-project-structure.md)  
**Source plans merged from:** docs 01–06 + diagrams  

---

## 0. Master Plan Legend

| Mark | Meaning |
| :--- | :--- |
| `[ ]` | Not started |
| `[~]` | In progress (optional manual mark) |
| `[x]` | Done and verified |

**Rules**

1. Do not skip phases that unlock later work (especially Auth → Docks → Vessels → Bookings).  
2. Each phase has a **Phase Exit Gate** — must pass before the next phase.  
3. Prefer vertical slices: UI + API + data for one capability, then move on.  
4. v1 is **web portal only**, **Next.js + MongoDB**, **no mandatory external business APIs**.  
5. Brand must stay: Deep Navy `#0B1F33`, Gold `#C6A56B`, Warm Hover `#D8BD91`, Cream `#F5F1E8`, Georgia headings.

### Locked product outcome

A boater can discover docks, check vessel fit, request a berth, get acceptance, unlock arrival instructions, and report delays; a dock owner can list berths, review requests with vessel specs, accept/reject, and monitor arrivals — all in one branded local web portal with seeded demo accounts.

### Document index used by this master plan

| Doc | Use when |
| :--- | :--- |
| [01 Problem](./01-problem-statement-and-solution.md) | Clarify why a feature exists |
| [02 Features](./02-features-and-solutions.md) | Confirm feature coverage |
| [03 Technical Start](./03-technical-start.md) | Stack / env / API list |
| [04 Solution Approach](./04-solution-approach.md) | Delivery principles |
| [05 Backend Plan](./05-backend-plan.md) | Services / routes / rules |
| [06 Frontend Plan](./06-frontend-plan.md) | Pages / UI / motion |
| [07 Combined Structure](./07-combined-project-structure.md) | Exact folders/files |
| [Diagrams](./diagrams/) | Architecture visuals |

---

## Phase 1 — Project Bootstrap & Tooling

**Goal:** Empty workspace becomes a runnable Next.js TypeScript app skeleton.

### Sub-phases

- [ ] 1.1 Confirm Node.js LTS (v20+ / v22+) installed  
- [ ] 1.2 Scaffold Next.js App Router + TypeScript project in repo root (or agreed app root)  
- [ ] 1.3 Initialize `package.json` scripts: `dev`, `build`, `start`, `seed`, `test` (stubs OK)  
- [ ] 1.4 Add ESLint + Prettier baseline  
- [ ] 1.5 Create `.gitignore` (node_modules, `.env.local`, build output, etc.)  
- [ ] 1.6 Create `.env.local.example` with `MONGODB_URI`, `AUTH_SECRET`, app URL  
- [ ] 1.7 Verify `npm install` and `npm run dev` open a blank app on `http://localhost:3000`  
- [ ] 1.8 Align any old `launch.json` port notes to Next default **3000** (or document intentional override)

**Phase Exit Gate:** Dev server runs cleanly with TypeScript enabled.

---

## Phase 2 — Documentation Freeze Alignment

**Goal:** Execution uses one agreed plan set; older conflicting stack ideas are ignored.

### Sub-phases

- [ ] 2.1 Confirm stack lock: Next.js + MongoDB (not Express + SQLite)  
- [ ] 2.2 Confirm scope lock: web portal only; no payments/maps/SMS required  
- [ ] 2.3 Confirm demo accounts list matches product docs  
- [ ] 2.4 Confirm brand tokens and hero copy locked  
- [ ] 2.5 Keep `docs/` as source of truth during build; update only if decisions change  

**Phase Exit Gate:** Team/builder agrees docs 03–08 are the execution baseline.

---

## Phase 3 — Design Tokens & Global Styles

**Goal:** Visual system exists before feature UI sprawl.

### Sub-phases

- [ ] 3.1 Create `styles/tokens` for colors, typography, spacing, radii, shadows, motion durations  
- [ ] 3.2 Create global base styles (cream canvas, navy text defaults, link/focus styles)  
- [ ] 3.3 Load Georgia for headings + sans for UI  
- [ ] 3.4 Define status color tokens (pending/accepted/rejected/completed/delay)  
- [ ] 3.5 Define Harbor Night / Day Deck / Slip Card surface patterns  
- [ ] 3.6 Add `prefers-reduced-motion` baseline rule  

**Phase Exit Gate:** A sample page can show navy/gold/cream + heading/body styles correctly.

---

## Phase 4 — App Shell, Brand, Public Layout

**Goal:** Every page shares professional chrome.

### Sub-phases

- [ ] 4.1 Build Logo / BrandMark component (**AnchorDrop** visible, brand-first)  
- [ ] 4.2 Build Public Header (Explore, How It Works, Sign In, Register)  
- [ ] 4.3 Build Footer (About, Contact, Terms, Privacy, © 2026)  
- [ ] 4.4 Build root `layout` with providers placeholder  
- [ ] 4.5 Add mobile nav drawer behavior  
- [ ] 4.6 Add scroll behavior plan for nav (transparent over hero → solid)  

**Phase Exit Gate:** Empty routes still look on-brand with header/footer.

---

## Phase 5 — MongoDB Connectivity & Core Lib

**Goal:** Backend foundation can talk to the database safely.

### Sub-phases

- [ ] 5.1 Install MongoDB locally **or** provision Atlas URI  
- [ ] 5.2 Implement `lib/db` connection helper (singleton-safe for Next)  
- [ ] 5.3 Implement `lib/constants` (roles, booking statuses)  
- [ ] 5.4 Implement `lib/errors` standard JSON error shape  
- [ ] 5.5 Implement `lib/password` (hash + verify with bcryptjs)  
- [ ] 5.6 Verify connection with a trivial health check or startup log (dev only)  
- [ ] 5.7 Ensure `.env.local` is present locally and not committed  

**Phase Exit Gate:** App connects to MongoDB without runtime connection errors.

---

## Phase 6 — Data Models & Indexes

**Goal:** All four collections exist with correct fields and indexes.

### Sub-phases

- [ ] 6.1 Create `User` model (name, email unique, passwordHash, role, timestamps)  
- [ ] 6.2 Create `Vessel` model (userId, name, type, lengthFt, beamFt, draftFt, registration)  
- [ ] 6.3 Create `Dock` model (ownerId, public fields, private `arrivalInstructions`, pricing, amenities, dims/depth)  
- [ ] 6.4 Create `Booking` model (boaterId, ownerId, dockId, vesselId, dates, status, specialRequests, delay fields)  
- [ ] 6.5 Add indexes: users.email; vessels.userId; docks.ownerId + filter fields; bookings by role ids/status/dates  
- [ ] 6.6 Document delete policy for vessels/docks with active bookings (block or soft-deactivate)  

**Phase Exit Gate:** Models compile; indexes defined; relationships match diagram `04-data-model`.

---

## Phase 7 — Validation Schemas

**Goal:** Invalid payloads fail before business logic.

### Sub-phases

- [ ] 7.1 Auth schemas (register/login)  
- [ ] 7.2 Vessel schemas (create/update)  
- [ ] 7.3 Dock schemas (create/update + query filters)  
- [ ] 7.4 Booking schemas (create, status patch, delay patch, compatibility request)  
- [ ] 7.5 Confirm date rule: end date ≥ start date  
- [ ] 7.6 Confirm dimension/price/depth positivity rules  

**Phase Exit Gate:** Schemas ready to mount on all mutating/search routes.

---

## Phase 8 — Auth Backend Module

**Goal:** Secure identity and roles exist.

### Sub-phases

- [ ] 8.1 Implement `auth.service` / `user.service`  
- [ ] 8.2 `POST /api/auth/register`  
- [ ] 8.3 `POST /api/auth/login`  
- [ ] 8.4 `POST /api/auth/logout`  
- [ ] 8.5 `GET /api/auth/me`  
- [ ] 8.6 Session/JWT cookie issue + read helpers in `lib/auth`  
- [ ] 8.7 Never return `passwordHash`  
- [ ] 8.8 Duplicate email → conflict error  
- [ ] 8.9 Role must be `boater` or `dock_owner`  

**Phase Exit Gate:** Register/login/me/logout verified via API client or tests.

---

## Phase 9 — Auth Frontend & Route Guards

**Goal:** Users can sign in through UI and are routed by role.

### Sub-phases

- [ ] 9.1 Auth modal and/or `/login` + `/register` pages  
- [ ] 9.2 Role selector on register  
- [ ] 9.3 Session-aware header (Sign In vs Dashboard/Logout)  
- [ ] 9.4 Demo credential buttons (Alex, Marina Del Sol, Sarah) autofill  
- [ ] 9.5 `useAuth` / auth provider wiring  
- [ ] 9.6 Protect `/boater/**` and `/owner/**` layouts (redirect unauthenticated)  
- [ ] 9.7 Wrong-role access shows 403/friendly redirect  
- [ ] 9.8 Modal focus trap + Esc close + accessible labels  

**Phase Exit Gate:** Manual login as each role lands in the correct shell.

---

## Phase 10 — Serializers & Privacy Policy Helpers

**Goal:** Sensitive fields cannot leak through public APIs.

### Sub-phases

- [ ] 10.1 Implement serializers to strip `passwordHash` always  
- [ ] 10.2 Strip `arrivalInstructions` from all public dock responses  
- [ ] 10.3 Implement `arrival.service` decision helper (when unlock is allowed)  
- [ ] 10.4 Add regression checklist item: public dock detail never includes gate/slip/VHF private notes  

**Phase Exit Gate:** Public dock payloads inspected and confirmed clean of private arrival fields.

---

## Phase 11 — Dock Backend (Supply)

**Goal:** Owners can manage berths; public can list/filter them.

### Sub-phases

- [ ] 11.1 Implement `dock.service`  
- [ ] 11.2 `GET /api/docks` with filters (location/waterway, type, max length, min depth, max price, active)  
- [ ] 11.3 `GET /api/docks/:id` public detail (safe fields only)  
- [ ] 11.4 `POST /api/docks` owner create  
- [ ] 11.5 `PUT /api/docks/:id` owner update (ownership enforced)  
- [ ] 11.6 `DELETE /api/docks/:id` owner delete/deactivate (ownership + booking policy)  
- [ ] 11.7 Owner can read/edit own `arrivalInstructions` via owner paths only  

**Phase Exit Gate:** Owner CRUD works; public list/detail works; private fields stay private.

---

## Phase 12 — Marketing Homepage & How It Works

**Goal:** Premium public first impression exists.

### Sub-phases

- [ ] 12.1 Hero: full-bleed image, navy overlay, brand, **Your Place on the Water!**, **Discover. Dock. Unwind.**, one short support line, CTA group only  
- [ ] 12.2 No cards/stat strips/promo chips in first viewport  
- [ ] 12.3 Hero entrance motion (respect reduced motion)  
- [ ] 12.4 How It Works dual-audience section (boater vs owner) with toggle/columns  
- [ ] 12.5 Wire nav anchors/links  
- [ ] 12.6 About / Contact / Terms / Privacy stub pages linked from footer  
- [ ] 12.7 404 branded page  

**Phase Exit Gate:** Homepage passes brand-first viewport test on desktop and mobile.

---

## Phase 13 — Explore UI + Dock Detail UI

**Goal:** Discovery and comparison are usable in the browser.

### Sub-phases

- [ ] 13.1 Explore page/section with FilterBar  
- [ ] 13.2 DockCard / DockGrid results  
- [ ] 13.3 Results count + clear filters + empty state  
- [ ] 13.4 Soft results transition/stagger on filter changes  
- [ ] 13.5 Dock detail page: gallery, specs, depth, amenities, price, availability  
- [ ] 13.6 CTA “Request to book” (auth-aware)  
- [ ] 13.7 Explicit UI note that private arrival info is not public  
- [ ] 13.8 Loading skeletons for list/detail  

**Phase Exit Gate:** Guest can filter docks and open a detail page end-to-end.

---

## Phase 14 — Vessel Backend + Boater Vessels UI

**Goal:** Boaters can maintain vessel profiles used for fit and booking.

### Sub-phases

- [ ] 14.1 Implement `vessel.service`  
- [ ] 14.2 `GET/POST /api/vessels`  
- [ ] 14.3 `PUT/DELETE /api/vessels/:id` with ownership checks  
- [ ] 14.4 Boater dashboard shell (nav: Explore & Book, My Vessels, My Trips)  
- [ ] 14.5 Vessels page list + empty state  
- [ ] 14.6 Vessel create/edit form (name, type, LOA, beam, draft, registration)  
- [ ] 14.7 Delete confirm dialog  
- [ ] 14.8 Toasts for save/delete success/failure  

**Phase Exit Gate:** Boater can add/edit/delete vessels; User A cannot mutate User B vessels.

---

## Phase 15 — Compatibility Engine (Backend + UI)

**Goal:** Dimensional fit is a first-class, server-owned feature.

### Sub-phases

- [ ] 15.1 Implement `compatibility.service` (single source of truth)  
- [ ] 15.2 Rules: length ≤ maxLength; beam ≤ maxBeam; draft ≤ minDepth  
- [ ] 15.3 Return per-constraint booleans + overall `compatible`  
- [ ] 15.4 `POST /api/bookings/check-compatibility`  
- [ ] 15.5 CompatibilityPanel UI with constraint rows  
- [ ] 15.6 Result transition animation  
- [ ] 15.7 Product copy: preliminary check, not navigational safety guarantee  
- [ ] 15.8 Verify known pass case (42/13/4 vs 50/15/6) and fail cases  

**Phase Exit Gate:** API + UI agree on pass/fail; no client-only math as source of truth.

---

## Phase 16 — Booking Create Loop (Backend + Boater Request UI)

**Goal:** Boaters can submit tracked reservation requests.

### Sub-phases

- [ ] 16.1 Implement booking create in `booking.service` → status `pending`  
- [ ] 16.2 Server re-checks compatibility on create  
- [ ] 16.3 `POST /api/bookings`  
- [ ] 16.4 Persist special requests + date range  
- [ ] 16.5 Boater Explore & Book: vessel select + request form  
- [ ] 16.6 Success path links to My Trips  
- [ ] 16.7 Validation errors shown inline  
- [ ] 16.8 Incompatible create blocked (or clearly rejected by policy)  

**Phase Exit Gate:** Creating a booking yields a `pending` record visible to that boater.

---

## Phase 17 — Booking Lists & Status Machine

**Goal:** Shared lifecycle exists for both roles.

### Sub-phases

- [ ] 17.1 `GET /api/bookings/boater`  
- [ ] 17.2 `GET /api/bookings/owner` (includes boater + vessel summary)  
- [ ] 17.3 `PATCH /api/bookings/:id/status` (accept / reject / complete)  
- [ ] 17.4 Enforce owner-only status changes  
- [ ] 17.5 Enforce allowed transitions (`pending→accepted|rejected`, `accepted→completed`)  
- [ ] 17.6 Boater My Trips list + status filter chips + badges/icons  
- [ ] 17.7 Trip detail timeline UI  
- [ ] 17.8 Owner Requests list UI with Accept/Reject + confirm on reject  
- [ ] 17.9 Owner request detail page  
- [ ] 17.10 Toasts + list refresh after status change  

**Phase Exit Gate:** Accept/reject updates both boater and owner views for the same booking id.

---

## Phase 18 — Arrival Instructions Unlock

**Goal:** Private arrival data unlocks only after acceptance.

### Sub-phases

- [ ] 18.1 Arrival policy: include instructions for boater when status is `accepted` (and decided policy for `completed`)  
- [ ] 18.2 Boater trip detail shows **locked** state while pending/rejected  
- [ ] 18.3 Boater trip detail shows **unlocked** panel after accept (gate/slip/VHF etc.)  
- [ ] 18.4 Lock→unlock micro-interaction  
- [ ] 18.5 Confirm public dock endpoints still exclude instructions  
- [ ] 18.6 Confirm another boater cannot read someone else’s unlocked booking  

**Phase Exit Gate:** Security + UX unlock behavior verified manually and/or by tests.

---

## Phase 19 — Delay Reporting & Owner Arrivals

**Goal:** Day-of operations stay inside the platform.

### Sub-phases

- [ ] 19.1 `PATCH /api/bookings/:id/delay` (boater only)  
- [ ] 19.2 Store `delayEta` + `delayNote`  
- [ ] 19.3 Boater DelayForm on accepted trip  
- [ ] 19.4 Owner Arrivals page: today’s accepted bookings  
- [ ] 19.5 Delay alerts panel with visual priority  
- [ ] 19.6 Optional one-time badge attention motion for new delay  
- [ ] 19.7 Owner can open related booking/request context  

**Phase Exit Gate:** Delay submitted by boater appears on owner arrivals without external messaging tools.

---

## Phase 20 — Owner Berths Frontend Completion

**Goal:** Owner inventory UX is complete and branded.

### Sub-phases

- [ ] 20.1 Owner dashboard shell nav (Berths, Requests, Arrivals)  
- [ ] 20.2 Berths list page  
- [ ] 20.3 Create berth page/form sections: basics, dims/depth, pricing, amenities, availability, **private arrival notes**  
- [ ] 20.4 Edit berth flow  
- [ ] 20.5 Delete/deactivate with confirmation  
- [ ] 20.6 Private notes helper copy: shared only after accept  
- [ ] 20.7 Empty state for no berths yet  

**Phase Exit Gate:** Owner can fully manage listings from UI; new berth appears in Explore.

---

## Phase 21 — Seed Data & Demo Walkthrough Readiness

**Goal:** Cold-start demo works for stakeholders.

### Sub-phases

- [ ] 21.1 Implement `scripts/seed` using real hashing + models  
- [ ] 21.2 Seed Captain Alex + 2 vessels + sample booking(s)  
- [ ] 21.3 Seed Marina Del Sol + 3 docks + pending requests  
- [ ] 21.4 Seed Sarah Jenkins + private Fort Lauderdale dock  
- [ ] 21.5 Mix booking statuses (pending, accepted with instructions, completed)  
- [ ] 21.6 Document re-seed behavior (idempotent or reset+seed)  
- [ ] 21.7 Wire demo buttons to exact seeded credentials  
- [ ] 21.8 Run full demo script from [04 Solution Approach](./04-solution-approach.md) walkthrough  

**Phase Exit Gate:** `npm run seed` then demo login completes the marketplace story without manual data entry.

---

## Phase 22 — Feedback System, Empty/Error/Loading Polish

**Goal:** App feels production-grade under real use, not only happy path.

### Sub-phases

- [ ] 22.1 Toast system for success/error across CRUD  
- [ ] 22.2 Confirm dialogs for destructive/reject actions  
- [ ] 22.3 Skeleton loaders on major lists  
- [ ] 22.4 Empty states for vessels, docks, trips, requests, arrivals  
- [ ] 22.5 Inline form validation messages  
- [ ] 22.6 Global error boundary / route error UI  
- [ ] 22.7 403 page for forbidden role access  
- [ ] 22.8 Consistent API error mapping in `api-client`  

**Phase Exit Gate:** Breaking a form or emptying a list still looks intentional and on-brand.

---

## Phase 23 — Motion, Responsive & Accessibility Pass

**Goal:** Professional polish and inclusive usability.

### Sub-phases

- [ ] 23.1 Implement planned motions from frontend plan §4 (hero, nav, modal, tabs, unlock, toast, filter)  
- [ ] 23.2 Verify reduced-motion disables non-essential animation  
- [ ] 23.3 Mobile layout QA: homepage, explore, auth, both dashboards  
- [ ] 23.4 Tablet/desktop QA for grids and side nav  
- [ ] 23.5 Keyboard navigation through modals and forms  
- [ ] 23.6 Visible focus states  
- [ ] 23.7 Status not color-only (text + icon)  
- [ ] 23.8 Contrast check on navy/gold/cream combinations  
- [ ] 23.9 Icon set consistency (one library; no emoji chrome)  
- [ ] 23.10 Image alt text on hero/listing imagery  

**Phase Exit Gate:** Responsive + a11y checklist signed off for v1.

---

## Phase 24 — Automated Verification & Regression Checklist

**Goal:** Critical claims are provable without relying on memory.

### Sub-phases

- [ ] 24.1 Test/script: register/login/role authorization  
- [ ] 24.2 Test/script: vessel CRUD + ownership denial  
- [ ] 24.3 Test/script: dock CRUD + public private-field stripping  
- [ ] 24.4 Test/script: compatibility pass/fail constraints  
- [ ] 24.5 Test/script: booking create → accept → arrival instructions present  
- [ ] 24.6 Test/script: reject path hides instructions  
- [ ] 24.7 Test/script: delay flow owner-visible  
- [ ] 24.8 `npm test` documented in README  
- [ ] 24.9 Manual smoke checklist saved/reused for releases  

**Phase Exit Gate:** Automated verification passes on seeded/test DB; failures are actionable.

---

## Phase 25 — Final Integration, README & Project Closeout

**Goal:** The project is complete, demonstrable, and executable by anyone following docs.

### Sub-phases

- [ ] 25.1 End-to-end integration run: guest explore → boater request → owner accept → unlock → delay → complete  
- [ ] 25.2 Confirm no required external API keys for core demo  
- [ ] 25.3 Write/update root `README.md` (setup, seed, start, demo accounts, stack)  
- [ ] 25.4 Confirm docs cross-links include 07 + 08  
- [ ] 25.5 Confirm folder structure matches [07 Combined Structure](./07-combined-project-structure.md) (or document intentional deltas)  
- [ ] 25.6 Remove dead prototype conflicts (old Express/SQLite assumptions) from active README if present  
- [ ] 25.7 Final brand sweep (no off-token colors; hero brand-first)  
- [ ] 25.8 Mark all prior phase exit gates as passed  
- [ ] 25.9 Stakeholder demo rehearsal completed successfully  
- [ ] 25.10 Tag v1 complete for this master plan scope  

**Phase Exit Gate:** Fresh machine path works: install → env → seed → dev → full demo walkthrough.

---

## Master Traceability Matrix (Nothing Missed)

| Product requirement | Covered in phase(s) |
| :--- | :--- |
| Public marketplace / Explore filters | 12, 13, 11 |
| How It Works dual audience | 12 |
| Auth + roles + demo login | 8, 9, 21 |
| Vessel CRUD | 14 |
| Compatibility engine | 15, 16 |
| Booking request + statuses | 16, 17 |
| Owner berth CRUD | 11, 20 |
| Owner accept/reject | 17 |
| Arrival instructions unlock | 10, 18 |
| Delay reporting + arrivals | 19 |
| MongoDB persistence | 5, 6, 21 |
| Premium brand + motion + responsive | 3, 4, 12, 23 |
| Seed + tests + README | 21, 24, 25 |
| Web-only / no mandatory external APIs | 2, 25 |

---

## Explicitly Parked (Not in These 25 Phases)

Do **not** block v1 completion on:

- Stripe / payments / payouts  
- Mapbox/Google Maps discovery  
- Email/SMS providers  
- Live tide/weather APIs  
- Native mobile apps  
- Cloud image CDN pipelines (beyond URL/static assets)  
- Full admin CMS  
- Websocket realtime infrastructure  

Track these as post-v1 enhancements only.

---

## Suggested Execution Cadence

| Block | Phases | Focus |
| :--- | :--- | :--- |
| Foundation | 1–7 | App, tokens, DB, models, validation |
| Identity | 8–9 | Auth API + UI + guards |
| Supply & story | 10–13 | Privacy, docks, homepage, explore |
| Fit & demand | 14–16 | Vessels, compatibility, booking create |
| Two-sided loop | 17–19 | Status, unlock, delays |
| Owner UX + demo | 20–21 | Berths UI + seed |
| Hardening | 22–25 | Polish, a11y, tests, closeout |

---

## One-Page Daily Standup Prompt

When executing, answer:

1. Which **phase number** are we on?  
2. Which **sub-phase checkboxes** will be completed today?  
3. What is the **exit gate** we are aiming to pass next?  
4. Any scope pressure to pull in parked items? (**Default: no.**)

---

## Related Documents

- [01 — Problem Statement](./01-problem-statement-and-solution.md)  
- [02 — Features](./02-features-and-solutions.md)  
- [03 — Technical Start](./03-technical-start.md)  
- [04 — Solution Approach](./04-solution-approach.md)  
- [05 — Backend Plan](./05-backend-plan.md)  
- [06 — Frontend Plan](./06-frontend-plan.md)  
- [07 — Combined Project Structure](./07-combined-project-structure.md)  
- [Diagrams](./diagrams/)  

---

© 2026 AnchorDrop. All rights reserved.
