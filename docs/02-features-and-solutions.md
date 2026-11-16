# AnchorDrop — Features & Problem–Solution Mapping

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Feature inventory mapped to problems and solution outcomes  
**Depends on:** [01 — Problem Statement & Solution Approach](./01-problem-statement-and-solution.md)  
**Purpose:** Define *what* the product includes and *how each feature* resolves the docking marketplace problems

---

## 1. How to Read This Document

Every feature below is described in four parts:

| Part | Meaning |
| :--- | :--- |
| **Problem it addresses** | Which user pain or market gap it closes |
| **What it does** | Concrete product behavior |
| **How it solves it** | Why this behavior is the right fix |
| **Acceptance signal** | How we know the feature is working |

Features are grouped by product surface: Public Marketplace, Boater Dashboard, Dock Owner Dashboard, Booking & Compatibility Core, Backend & Data, Authentication & Demo, and Cross-Cutting UX/Brand.

---

## 2. Feature Map at a Glance

| # | Feature area | Primary beneficiary | Main problem closed |
| :---: | :--- | :--- | :--- |
| 1 | Public marketplace & homepage | Both | Discovery is scattered; brand trust is weak |
| 2 | Explore Docks search & filters | Boaters | Hard to find/compare berths |
| 3 | How It Works (dual audience) | Both | Unclear journeys for each role |
| 4 | Auth (register / login / roles) | Both | No shared identity for two-sided flows |
| 5 | Quick-demo credentials | Both (demo) | Slow to prove the loop |
| 6 | Vessel profile CRUD | Boaters | Fit cannot be judged without vessel data |
| 7 | Automated vessel compatibility | Boaters (+ owners) | Unsuitable booking requests |
| 8 | Booking requests | Boaters | Informal, untracked reservations |
| 9 | Trip status tracking | Boaters | No single status of truth |
| 10 | Arrival instructions unlock | Boaters | Sensitive info shared ad-hoc |
| 11 | Arrival delay reporting | Boaters → Owners | Late arrivals surprise hosts |
| 12 | Berth listing CRUD | Owners | No way to advertise vacant slips |
| 13 | Booking request center | Owners | Incoming demand is unorganized |
| 14 | Accept / Reject | Owners | No clear decision workflow |
| 15 | Arrivals & delay alerts | Owners | Weak day-of operations view |
| 16 | REST API + SQLite + hashing | Both | No persistent system of record |
| 17 | Seed data & verification tests | Builders | Hard to demonstrate and regress |

---

## 3. Public Marketplace Features

### 3.1 Responsive Homepage (Hero, Nav, Footer)

**Problem it addresses**  
Without a clear, premium entry point, AnchorDrop looks like a basic form or static brochure. Boaters and hosts need immediate confidence that this is a trustworthy marine marketplace.

**What it does**

- Preserves and elevates the existing hero layout and navigation  
- Shows brand name, headline **“Your Place on the Water!”**, tagline **“Discover. Dock. Unwind.”**, intro copy, and primary CTAs  
- Retains a complete footer (About, Contact, Terms, Privacy, Copyright)  
- Stays responsive across desktop and mobile  

**How it solves it**  
A strong first viewport establishes **Luxury, Trust, and Adventure** before users enter dashboards. Discovery and auth CTAs sit in context of the brand, not as orphaned tools.

**Acceptance signal**  
Landing page loads with brand-forward hero, working nav anchors, and intact footer; styles follow Deep Navy `#0B1F33`, Champagne Gold `#C6A56B`, Warm Hover `#D8BD91`, Cream `#F5F1E8`.

---

### 3.2 Explore Docks — Live Search & Multi-Parameter Filtering

**Problem it addresses**  
Boaters currently contact marinas individually and cannot compare availability, price, facilities, and berth dimensions in one place.

**What it does**

- Public **Explore Docks** section with search controls and berthing cards  
- Filters such as:
  - Location / waterway  
  - Dock type  
  - Maximum vessel length  
  - Minimum depth  
  - Daily price  
- Displays listing summaries suitable for comparison (location, dimensions, depth, price, amenities highlights)  

**How it solves it**  
Centralizes supply into one browsable catalog. Filters encode marine-relevant constraints so boaters shortlist berths that are more likely to fit before opening a booking request.

**Acceptance signal**  
Changing filters updates the visible dock set; cards show enough dimensional and price data to decide whether to open details.

---

### 3.3 How It Works — Interactive Dual-Audience Guide

**Problem it addresses**  
Two-sided products fail when each side does not understand their role. Boaters and dock hosts need a clear mental model of the journey.

**What it does**

- Dedicated **How It Works** section explaining:
  - Boater path: register → vessel → search → check fit → request → track → arrive  
  - Dock owner path: register → list berth → review requests → accept/reject → manage arrivals  
- Presents both audiences without forcing a single narrative  

**How it solves it**  
Reduces onboarding confusion and sets expectations for request-based booking (not instant anonymous booking), compatibility checks, and post-acceptance arrival details.

**Acceptance signal**  
A first-time visitor can explain both roles after reading the section; navigation links jump to this content.

---

### 3.4 Authentication Modal (Register / Login) with Roles

**Problem it addresses**  
Without role-aware identity, the platform cannot separate boater tools from owner tools or protect booking and listing actions.

**What it does**

- Modal registration and login  
- Supports **Boater** and **Dock Owner** roles  
- Routes authenticated users toward the correct dashboard experience  
- Works with session/token-based auth backed by hashed passwords  

**How it solves it**  
Creates the shared identity layer required for a two-sided marketplace: who owns vessels, who owns docks, who may accept a booking, and who may see private arrival instructions.

**Acceptance signal**  
Registration creates a role-tagged user; login opens the correct dashboard; unauthorized listing/booking actions are rejected by the API.

---

### 3.5 One-Click Quick-Demo Credentials

**Problem it addresses**  
Stakeholders and testers waste time recreating data before they can experience the two-sided loop.

**What it does**

- Sign In modal includes 1-click demo autofill for seeded accounts, for example:

| Role | Account | Email | Password | Seeded context |
| :--- | :--- | :--- | :--- | :--- |
| Boater | Captain Alex Morgan | `captain.alex@gmail.com` | `password123` | 2 vessels, active booking |
| Dock Owner | Marina Del Sol | `marina.delsol@gmail.com` | `password123` | 3 slips, pending requests |
| Private Host | Sarah Jenkins | `sarah.harbor@gmail.com` | `password123` | 1 private Fort Lauderdale slip |

**How it solves it**  
Makes the problem–solution story demonstrable in minutes: search, request, accept, unlock arrival info, report delay — using real persistent seed data.

**Acceptance signal**  
Demo buttons fill credentials; login succeeds against seeded DB after `npm run seed`.

---

## 4. Boater Dashboard Features (`boater-dashboard.html`)

### 4.1 Vessel Profile Management (CRUD)

**Problem it addresses**  
Without stored vessel specs, compatibility and owner review cannot happen. Boaters otherwise re-explain dimensions in every enquiry.

**What it does**

- Add, edit, and delete vessels  
- Captures:
  - Vessel name and type  
  - Length Overall (LOA)  
  - Beam  
  - Draft  
  - Registration number / details  

**How it solves it**  
Turns vessel dimensions into reusable structured data used by search fit signals, booking requests, and owner review screens.

**Acceptance signal**  
Boater can create multiple vessels, update specs, delete a vessel, and see them listed consistently after refresh (persistent DB).

---

### 4.2 Automated Vessel Compatibility

**Problem it addresses**  
Unsuitable booking requests waste both sides’ time when a vessel is too long, too wide, or drafts deeper than available depth.

**What it does**

- Real-time (or on-demand) validation against a dock’s:
  - Maximum vessel length  
  - Maximum beam  
  - Minimum / low-tide water depth vs. vessel draft  
- Surfaces a clear compatible / incompatible indication  
- Remains a **preliminary check**, not a navigational safety guarantee  

**Example rule set**

| Check | Pass condition |
| :--- | :--- |
| Length | `vessel.length <= dock.max_length` |
| Beam | `vessel.beam <= dock.max_beam` |
| Draft / depth | `vessel.draft <= dock.min_depth` |

**How it solves it**  
Moves fit from verbal guesswork into product logic. Boaters self-select better berths; owners receive fewer impossible requests.

**Acceptance signal**  
A 42 ft × 13 ft × 4 ft vessel against a 50 / 15 / 6 berth shows compatible; failing any dimension shows incompatible with a clear reason.

---

### 4.3 Booking Requests

**Problem it addresses**  
Reservations today live in phone calls and emails with no standard payload (dates, vessel, special requests).

**What it does**

- Submit a reservation request for a selected berth  
- Includes preferred dates (with date calculations as needed)  
- Allows special requests / notes  
- Ties the request to a specific vessel profile  

**How it solves it**  
Standardizes the ask so owners always receive comparable, complete requests and boaters get a tracked ticket instead of an informal “maybe.”

**Acceptance signal**  
Submitting a request creates a `Pending` booking visible on both boater and owner dashboards.

---

### 4.4 Trip Status Tracking

**Problem it addresses**  
Boaters lack a single place to see whether a request is waiting, confirmed, declined, or finished.

**What it does**

- Tracks booking states in real time (from the shared backend):
  - `Pending`  
  - `Accepted`  
  - `Rejected`  
  - `Completed`  
- Shows status in a **Booking Trips & Status** (or equivalent) tab  

**How it solves it**  
Replaces inbox archaeology with a shared lifecycle. Both parties operate from the same status vocabulary.

**Acceptance signal**  
When an owner accepts/rejects, the boater view updates without needing a separate channel.

---

### 4.5 Arrival Instructions (Secure Unlock)

**Problem it addresses**  
Gate codes, slip numbers, and VHF channels are sensitive. Sharing them too early (or inconsistently) creates security and coordination problems.

**What it does**

- Keeps private arrival notes on the dock/booking record  
- Unlocks them to the boater **only after the booking is Accepted**  
- May include gate codes, slip numbers, VHF radio channels, and similar host instructions  

**How it solves it**  
Builds trust for hosts (private data protected until commitment) and clarity for boaters (one authoritative place for arrival details after confirmation).

**Acceptance signal**  
Pending bookings do not expose private instructions; Accepted bookings do.

---

### 4.6 Arrival Delay Reporting

**Problem it addresses**  
Owners plan for today’s arrivals. Without a structured delay notice, late boats create operational surprise.

**What it does**

- Boater logs a delay notice with updated ETA and optional note  
- Notification appears for the dock owner in arrivals / delay alerts  

**How it solves it**  
Turns last-minute uncertainty into a tracked update inside the same booking system — not a lost text message.

**Acceptance signal**  
After a delay report, the owner’s Arrivals & Delay Alerts view shows the updated ETA and note for that booking.

---

## 5. Dock Owner Dashboard Features (`owner-dashboard.html`)

### 5.1 Berth Listing Management (CRUD)

**Problem it addresses**  
Private hosts and smaller marinas lack an effective way to advertise vacant berths with the details boaters actually need.

**What it does**

- Add, view, edit, and delete dock listings  
- Each listing can include:
  - Location  
  - Photographs  
  - Maximum vessel length and beam  
  - Available / low-tide water depth  
  - Pricing  
  - Amenities and facilities  
  - Availability  
  - Private arrival instructions (not public)  

**How it solves it**  
Converts idle inventory into structured, searchable supply. Dimensions and depth enable compatibility; amenities and photos support comparison; private notes support post-acceptance operations.

**Acceptance signal**  
Owner listings appear in Explore Docks; updates persist; deletes remove the listing from public search and owner inventory views.

---

### 5.2 Booking Request Center

**Problem it addresses**  
Incoming demand without vessel context forces owners to chase details offline.

**What it does**

- Lists incoming reservation requests  
- Shows boater details and vessel specifications alongside requested dates and notes  
- Supports review before any accept/reject action  

**How it solves it**  
Gives owners the information needed to decide: who is coming, what they are docking, and whether the berth is appropriate.

**Acceptance signal**  
A new boater request appears in the owner request center with vessel LOA/beam/draft and booking dates.

---

### 5.3 One-Click Accept / Reject

**Problem it addresses**  
Without a decisive workflow, reservations stall and statuses diverge between parties.

**What it does**

- Owner confirms or rejects a request  
- Status synchronizes immediately for both users  
- Acceptance triggers availability of private arrival instructions to the boater  

**How it solves it**  
Creates a crisp decision point that advances the shared booking lifecycle and unlocks the next operational step (arrival info).

**Acceptance signal**  
Accept → status `Accepted` on both sides + instructions visible to boater; Reject → status `Rejected` and no private unlock.

---

### 5.4 Arrivals & Delay Alerts

**Problem it addresses**  
Day-of operations are hard when owners only have a static “accepted” list and no delay channel.

**What it does**

- Monitors today’s incoming vessels  
- Surfaces boater delay reports (ETA + note) in real time from the backend  

**How it solves it**  
Gives hosts an operational dashboard for who is due and who is running late — closing the last-mile communication gap of temporary docking.

**Acceptance signal**  
Today’s accepted bookings appear under arrivals; delay patches update that view without manual refresh workarounds (or with a clear refresh that pulls latest API state).

---

## 6. Booking & Compatibility Core (Shared System)

These features are not “pages”; they are the **shared contract** between dashboards.

### 6.1 Shared Booking Lifecycle

**Problem it addresses**  
Two-sided markets fail when each side invents its own meaning of “booked.”

**What it does**

- Single booking record linking boater, vessel, dock, dates, status, special requests, delay fields, and arrival visibility rules  
- Status machine: `Pending` → `Accepted` | `Rejected` → (eventually) `Completed`  

**How it solves it**  
One system of record replaces parallel email threads. Every UI reads the same state.

**Acceptance signal**  
API and both dashboards never disagree on a booking’s status for the same id.

---

### 6.2 Compatibility Endpoint / Engine

**Problem it addresses**  
Fit checks must be consistent whether triggered from Explore, booking submit, or dashboards.

**What it does**

- Dedicated check (e.g. `POST /api/bookings/check-compatibility`) comparing vessel and dock dimensions  
- Returns a structured pass/fail (and ideally per-constraint results)  

**How it solves it**  
Keeps marine logic server-side and reusable so the frontend cannot “soft pass” incompatible vessels inconsistently.

**Acceptance signal**  
Automated tests cover length, beam, and draft constraint failures and successes.

---

## 7. Backend, Database & Security Features

### 7.1 Node.js + Express REST API

**Problem it addresses**  
Static HTML alone cannot enforce ownership, persist bookings, or synchronize two dashboards.

**What it does**

- Serves static assets (homepage, CSS, JS, images, dashboards)  
- Exposes JSON REST endpoints for auth, docks, vessels, bookings, compatibility, status, and delays  
- Runs locally on **`http://localhost:8080`** (aligned with `.vscode/launch.json`)  

**Representative endpoint groups**

| Area | Examples |
| :--- | :--- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Docks | `GET /api/docks` (filters), `GET /api/docks/:id`, `POST/PUT/DELETE /api/docks` |
| Vessels | `GET/POST/PUT/DELETE /api/vessels` |
| Bookings | `POST /api/bookings`, boater/owner lists, `PATCH .../status`, `PATCH .../delay`, compatibility check |

**How it solves it**  
Provides the transactional backbone that turns two separate UIs into one marketplace.

**Acceptance signal**  
`npm start` serves the site and APIs; dashboards function only through authenticated API calls for protected actions.

---

### 7.2 SQLite Database (`database/anchordrop.db`)

**Problem it addresses**  
Without a real relational store, demos reset, relationships break, and foreign data integrity is weak.

**What it does**

- Persistent SQLite file with relational tables (users, vessels, docks, bookings)  
- Foreign key constraints and indexes  
- Schema initialization / migration from `schema.sql` via a DB module  
- Seed script for realistic demonstration data  

**How it solves it**  
Gives AnchorDrop durable state suitable for local-first development and credible end-to-end demos — without requiring a hosted database daemon.

**Acceptance signal**  
After seed + restart, demo users, vessels, docks, and bookings remain available.

---

### 7.3 Password Security (bcrypt)

**Problem it addresses**  
Plaintext passwords are unacceptable even in a local marketplace prototype meant to demonstrate trust.

**What it does**

- Salts and hashes passwords with `bcryptjs` (or equivalent) on register  
- Verifies hashes on login  

**How it solves it**  
Supports the Trust brand value at the credential layer and matches expected auth hygiene for any multi-user app.

**Acceptance signal**  
Database stores hashes, not raw passwords; wrong password fails login; correct password succeeds.

---

## 8. Frontend Client Modules (Supporting Features)

**Problem it addresses**  
Without modular client scripts, auth state, API calls, compatibility UI, and dashboard rendering become brittle and duplicated.

**What it does**

- Modular ES6+ scripts such as:
  - `js/api.js` — HTTP helpers and endpoint wrappers  
  - `js/app.js` — homepage marketplace, modal auth, explore rendering  
  - `js/boater.js` — vessel CRUD, booking trips, delays  
  - `js/owner.js` — berth CRUD, request actions, arrivals  
- Vanilla HTML/CSS/JS approach preserving existing `index.html` and `css/style.css`  

**How it solves it**  
Keeps the stack beginner-friendly and aligned with the existing prototype while still supporting a full two-sided product.

**Acceptance signal**  
Each dashboard page loads its scripts; auth token/session state is shared consistently; UI updates after API success/failure.

---

## 9. Verification & Demonstration Features

### 9.1 Seeded Realistic Demo Data

**Problem it addresses**  
Empty databases cannot prove a marketplace.

**What it does**

- Seeds boaters, owners, vessels, premium slips (e.g. Biscayne Bay, Newport Harbor, Fort Lauderdale)  
- Includes bookings across statuses (pending, accepted with instructions, completed)  

**How it solves it**  
Enables immediate storytelling of the problem and the solution in a live UI.

**Acceptance signal**  
`npm run seed` populates `anchordrop.db`; demo logins work as documented.

---

### 9.2 Automated Verification Script (`npm test`)

**Problem it addresses**  
Manual clicking alone cannot reliably prove the critical paths.

**What it does**  
Verifies at least:

1. Registration, authentication, and role authorization  
2. Vessel CRUD  
3. Dock listing CRUD  
4. Compatibility engine (length, beam, draft)  
5. Booking create → owner accept → arrival instruction delivery  
6. Arrival delay notification flow  

**How it solves it**  
Protects the solution’s core claims: identity, inventory, fit, booking lifecycle, and operational delay handling.

**Acceptance signal**  
`npm test` passes on a seeded or test-prepared database.

---

## 10. Feature → Problem Traceability Matrix

| User problem | Features that close it |
| :--- | :--- |
| Discovery is fragmented across marinas/hosts | Explore Docks, public listings API, seeded inventory, homepage CTAs |
| Hard to compare price, amenities, dimensions | Listing cards/details, filters, owner listing CRUD fields |
| Unclear whether the vessel fits | Vessel CRUD, compatibility engine, dimensional fields on docks |
| No structured reservation process | Booking requests, shared status model, dual dashboards |
| Owners lack vessel context before saying yes | Request center with vessel specs, compatibility prior to request |
| Arrival details shared insecurely / inconsistently | Private arrival notes + unlock only on `Accepted` |
| Late arrivals surprise hosts | Delay reporting + owner arrivals/delay alerts |
| Idle private berths generate no income / reach | Owner listings on public marketplace |
| No trust / premium feel | Brand-forward homepage, palette/typography, clear How It Works, bcrypt auth |
| Demo cannot prove the loop | Quick-demo accounts, seed data, verification tests |

---

## 11. Suggested Dashboard Information Architecture

### Boater tabs (target UX)

1. **Explore & Book** — search, filters, compatibility, request  
2. **My Vessels** — vessel CRUD  
3. **Booking Trips & Status** — lifecycle, arrival instructions, delay reporting  

### Owner tabs (target UX)

1. **My Berths & Pricing** — listing CRUD  
2. **Booking Requests & Approvals** — review + accept/reject  
3. **Arrivals & Delay Alerts** — today’s operations  

This IA maps 1:1 to the feature groups above and keeps each section to one job.

---

## 12. Implementation Priority (Feature Build Order)

Use this order so each release still tells a coherent problem→solution story:

| Priority | Features | Why this order |
| :---: | :--- | :--- |
| P0 | Schema, seed, auth, static serving | Identity and persistence foundation |
| P1 | Dock CRUD + Explore filters | Supply becomes discoverable |
| P2 | Vessel CRUD + compatibility | Fit problem becomes solvable |
| P3 | Booking request + owner accept/reject + status sync | Two-sided loop closes |
| P4 | Arrival unlock + delay alerts | Operational trust layer |
| P5 | How It Works polish, demo buttons, tests | Demonstrability and regression safety |

---

## 13. Future Enhancements (Not Required to Solve the Core Problem)

These can improve AnchorDrop later but are **not** required to close the primary problem statement:

- Payments, deposits, and payouts  
- Reviews and host/boater reputation  
- Messaging threads inside the app  
- Calendar-level availability blocking  
- Map-based discovery  
- Multi-slip marina operator tooling  
- Notifications via email/SMS  
- Richer photo galleries and media CDN  

Document them as enhancements so the core marketplace does not expand before the booking loop is solid.

---

## 14. Summary

AnchorDrop’s features are not a random checklist. Each one exists to close a specific gap in temporary docking:

- **Marketplace features** fix discovery and comparison  
- **Vessel + compatibility features** fix unsuitable fit  
- **Dual dashboards + booking lifecycle** fix process and coordination  
- **Arrival unlock + delays** fix trust and day-of operations  
- **API + SQLite + seed + tests** make the solution real, persistent, and demonstrable  

Together they deliver the product vision: a premium, trustworthy marine marketplace where boaters and dock owners can **discover, dock, and unwind** through one organized system.

---

## Related Documents

- [01 — Problem Statement & Solution Approach](./01-problem-statement-and-solution.md)  
- [03 — Technical Start Document](./03-technical-start.md) — Next.js + MongoDB stack and implementation boundaries  
- [04 — Solution Approach](./04-solution-approach.md) — phased delivery, vertical slices, and done criteria  
- [07 — Combined Project Structure](./07-combined-project-structure.md) — full repo map  
- [08 — Master Plan](./08-master-plan.md) — 25-phase execution checklist  
- [Diagrams (PlantUML)](./diagrams/) — visual system maps for features and flows  

---

© 2026 AnchorDrop. All rights reserved.
