# AnchorDrop — Solution Approach

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Solution approach — how we will design, build, and deliver the working product  
**Scope:** Web portal only  
**Stack commitment:** Next.js (App Router) + TypeScript + MongoDB  
**Related docs:**  
[Problem & Solution](./01-problem-statement-and-solution.md) ·  
[Features](./02-features-and-solutions.md) ·  
[Technical Start](./03-technical-start.md) ·  
[Backend Plan](./05-backend-plan.md) ·  
[Diagrams](./diagrams/)

---

## 1. Purpose of This Document

This document answers one question:

> **How will we approach the solution so AnchorDrop becomes a working, demonstrable two-sided docking marketplace — and what output will we have when we are done?**

It is **not** a folder-structure spec (that comes next, on request).  
It is the **delivery approach**: principles, solution shape, phased plan, verification path, and definition of done.

---

## 2. Solution Statement (What We Will Provide)

We will provide a **single responsive web portal** that connects boaters and dock owners through one shared system.

### 2.1 The solution in one paragraph

AnchorDrop will be a Next.js web application backed by MongoDB where dock owners publish berths with dimensions, pricing, and private arrival notes; boaters register vessels, search and filter docks, run a preliminary length/beam/draft compatibility check, and submit booking requests; owners accept or reject those requests; accepted bookings unlock arrival instructions to the boater; and delay reports keep owners informed — all with role-based auth, persistent data, seeded demo accounts, and a premium navy/gold brand experience.

### 2.2 What “solved” means

| Problem today | Solution we provide |
| :--- | :--- |
| Discovery is scattered | One public **Explore Docks** marketplace with filters |
| Fit is unclear | **Vessel profiles** + **compatibility engine** |
| Process is informal | Shared **booking lifecycle** (`pending` → `accepted` / `rejected` → `completed`) |
| Arrival info is ad-hoc | **Unlock private instructions only after accept** |
| Hosts lack reach / tools | **Owner dashboard** for listings, requests, arrivals |
| No system of record | **MongoDB** + authenticated **API routes** inside Next.js |

---

## 3. Guiding Principles (How We Will Approach Everything)

| # | Principle | Practical meaning |
| :---: | :--- | :--- |
| 1 | **Close the two-sided loop first** | Prefer a thin end-to-end booking path over many unfinished screens |
| 2 | **One stack, one app** | Next.js UI + API together; MongoDB as the only database for v1 |
| 3 | **Web portal only** | Responsive browser experience; no native apps in this phase |
| 4 | **Server owns the rules** | Compatibility, ownership, status transitions, and private-field unlock happen on the server |
| 5 | **Brand is part of the product** | Navy / gold / cream + Georgia headings on every major surface |
| 6 | **Demoable at every phase** | Seed data + demo logins so stakeholders can click the story |
| 7 | **No mandatory external APIs** | Maps, payments, email, SMS stay optional until the core loop works |
| 8 | **Preliminary fit ≠ safety** | Compatibility is dimensional only; UI copy must say so |

These principles stop scope drift (payments, maps, mobile apps) from blocking the real solution.

---

## 4. Solution Shape (What We Are Building Toward)

### 4.1 Three user surfaces, one backend of record

```text
┌─────────────────────────────────────────────────────────┐
│                 AnchorDrop Web Portal                    │
│                                                         │
│  [ Public Marketplace ]  [ Boater Hub ]  [ Owner Hub ]  │
│         │                      │               │        │
│         └──────────┬───────────┴───────────────┘        │
│                    ▼                                    │
│         Next.js API (auth, docks, vessels, bookings)    │
│                    ▼                                    │
│              MongoDB (anchordrop)                       │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Solution pillars (delivery focus)

| Pillar | What we implement | Output users feel |
| :--- | :--- | :--- |
| **A. Discovery** | Homepage + Explore filters + dock cards/details | “I can find and compare berths in one place.” |
| **B. Fit** | Vessel CRUD + compatibility checks | “I know if my boat likely fits before I request.” |
| **C. Coordination** | Dual dashboards + shared booking statuses | “Both sides see the same request state.” |
| **D. Trust** | Private arrival unlock after accept | “Hosts stay safe; boaters get clear arrival info.” |
| **E. Operations** | Delay ETA + owner arrivals view | “Late arrivals don’t disappear into text messages.” |
| **F. Foundation** | Auth, MongoDB models, seed, validation | “The demo survives refresh and restart.” |

### 4.3 The booking journey is the north star

Every phase of work should move us closer to this complete path:

1. Boater registers and adds a vessel  
2. Boater searches docks  
3. Platform shows relevant listings  
4. Boater checks compatibility  
5. Boater submits a request  
6. Owner reviews vessel + dates  
7. Owner accepts or rejects  
8. Status syncs for both users  
9. On accept → boater sees arrival instructions  
10. Optional delay report → owner alert  
11. Booking marked completed  

If a task does not help this journey, it is secondary.

---

## 5. Approach Strategy — Build in Vertical Slices

We will **not** build “all frontend then all backend.”  
We will deliver **vertical slices**: a thin piece of UI + API + data that proves one part of the solution.

```text
Slice 1  Identity          → register/login/roles work
Slice 2  Supply            → owner lists a dock → appears in Explore
Slice 3  Vessel + Fit      → boater adds vessel → compatibility result
Slice 4  Request Loop      → request → accept/reject → shared status
Slice 5  Arrival + Delay   → unlock instructions → delay alert
Slice 6  Polish + Prove     → How It Works, demo buttons, tests, brand QA
```

### Why this approach

- Always have something runnable to show  
- Catch auth/data mistakes early  
- Keep boater and owner experiences connected (not two disconnected apps)  
- Make “solution attained” measurable after each slice  

---

## 6. Phased Solution Plan

### Phase 0 — Foundation Setup

**Goal:** Project can run locally with DB connectivity and brand baseline.

| Work | Outcome |
| :--- | :--- |
| Scaffold Next.js + TypeScript | `npm run dev` opens the portal shell |
| Connect MongoDB (local or Atlas) | App reads/writes without crashes |
| Global layout, tokens, nav shell | Brand colors/fonts present |
| Env example + gitignore for secrets | Safe local config |

**Exit criteria:** Blank-but-branded app loads; Mongo connection succeeds.

---

### Phase 1 — Identity Solution

**Goal:** Two roles can exist securely in the system.

| Work | Outcome |
| :--- | :--- |
| User model + bcrypt hashing | Passwords never stored plain |
| Register / login / logout / me | Session or JWT cookie works |
| Role guards for `/boater` and `/owner` | Wrong role cannot access other hub |
| Seed three demo accounts | 1-click demo path ready |

**Exit criteria:** Boater and owner can log in separately and land on the correct area.

---

### Phase 2 — Supply & Discovery Solution

**Goal:** Vacant berths become searchable marketplace inventory.

| Work | Outcome |
| :--- | :--- |
| Dock model + owner CRUD | Hosts can add/edit/delete berths |
| Public Explore + filters | Guests/boaters can search by location, length, depth, price |
| Public detail without private fields | Arrival instructions never leak publicly |
| Seed sample docks | Marketplace not empty |

**Exit criteria:** A seeded marina slip appears in Explore and opens with dimensions/amenities/price.

---

### Phase 3 — Vessel & Compatibility Solution

**Goal:** Dimensional fit becomes a first-class product behavior.

| Work | Outcome |
| :--- | :--- |
| Vessel CRUD for boaters | Specs stored once, reused often |
| Shared `compatibility` module | Single rule set for UI + API |
| Check endpoint + UI indicator | Clear compatible / not compatible reasons |
| Server re-check on booking create | Client cannot bypass unfit requests silently |

**Exit criteria:** 42×13×4 vs 50/15/6 shows compatible; a failing constraint shows why.

---

### Phase 4 — Shared Booking Solution

**Goal:** Informal enquiries become a tracked reservation workflow.

| Work | Outcome |
| :--- | :--- |
| Create booking (`pending`) | Boater request is persisted |
| Owner request center | Vessel + boater + dates visible |
| Accept / reject | Status syncs both sides |
| Boater trip list | Pending / accepted / rejected visible |

**Exit criteria:** Accepting a request updates both dashboards without email/chat.

---

### Phase 5 — Trust & Operations Solution

**Goal:** Confirmation unlocks private ops data; delays stay in-system.

| Work | Outcome |
| :--- | :--- |
| Arrival unlock on `accepted` | Gate/slip/VHF visible only then |
| Delay PATCH from boater | ETA + note stored on booking |
| Owner arrivals / delay alerts | Host sees today’s changes |
| Complete status | Lifecycle can close |

**Exit criteria:** Pending hides instructions; accepted shows them; delay appears for owner.

---

### Phase 6 — Experience Proof & Hardening

**Goal:** The product feels like a premium marketplace and can be verified.

| Work | Outcome |
| :--- | :--- |
| How It Works dual-audience section | Roles are understandable |
| Demo credential autofill | Stakeholder walkthrough in minutes |
| Responsive pass + brand QA | Mobile/desktop usable; palette consistent |
| Automated verification script/tests | Core flows don’t regress |
| Docs alignment | Problem → features → tech → this approach stay consistent |

**Exit criteria:** A full demo walkthrough works from cold start using seed data; tests for critical paths pass.

---

## 7. How We Will Attain the Proper Output

### 7.1 Target output (deliverable)

A locally runnable web portal where:

1. Anyone can browse and filter docks  
2. A boater can manage vessels, check fit, request, track, unlock arrival info, report delay  
3. An owner can manage berths, approve/reject, and monitor arrivals/delays  
4. MongoDB holds users, vessels, docks, bookings consistently  
5. Demo accounts prove the story without manual data entry  

### 7.2 Definition of Done (project-level)

The solution approach is **attained** when all of the following are true:

| # | Done check |
| :---: | :--- |
| 1 | `npm install` → configure `MONGODB_URI` → `npm run seed` → `npm run dev` works |
| 2 | Public Explore returns seeded docks with working filters |
| 3 | Boater CRUD vessels; owner CRUD docks (ownership enforced) |
| 4 | Compatibility returns correct pass/fail per length, beam, draft |
| 5 | Booking request creates `pending`; owner can accept/reject |
| 6 | Accepted booking reveals arrival instructions to that boater only |
| 7 | Delay report updates owner arrivals/alerts view |
| 8 | Unauthorized users cannot mutate others’ vessels/docks/bookings |
| 9 | Brand identity is visible on public + dashboard pages |
| 10 | Critical-path verification (manual script or automated tests) passes |

### 7.3 Acceptance walkthrough (demo script)

Use this as the human proof of the solution:

1. Open homepage → read hero + How It Works  
2. Explore docks → apply a filter → open a listing  
3. Demo-login as **Captain Alex** → confirm vessels exist  
4. Run compatibility on a berth → submit a booking (or use seeded pending)  
5. Logout → demo-login as **Marina Del Sol** → accept a pending request  
6. Back as boater → confirm status + arrival instructions  
7. Submit a delay → confirm owner sees ETA/note  
8. Optional: complete booking and confirm final status  

If this walkthrough succeeds, the **solution is delivered** for v1 intent.

---

## 8. Roles & Responsibilities Inside the Solution

| Role in product | What the solution gives them | What we deliberately do not give (v1) |
| :--- | :--- | :--- |
| Guest | Browse, filter, understand product, register | Booking without account |
| Boater | Vessels, search, fit, request, track, arrival, delay | Payments, chart navigation |
| Dock owner | Listings, approvals, arrivals, delay alerts | Full marina PMS / multi-property enterprise tools |
| System | Authz, hashing, validation, private-field rules, persistence | External notification providers |

---

## 9. Risk Approach (Keep the Solution Stable)

| Risk | How we approach it |
| :--- | :--- |
| Building too many features before the loop works | Strict vertical slices; booking journey is the gate |
| Leaking arrival instructions | Public serializers strip private fields; unlock only on `accepted` |
| Inconsistent fit logic | One shared compatibility module used by UI and API |
| Empty demo / broken stakeholder review | Seed script + fixed demo credentials from day one |
| Stack confusion (Express/SQLite vs Next/Mongo) | This approach + technical start supersede older stack notes |
| Scope creep (maps, Stripe, SMS, native apps) | Park as “later enhancements”; not required for v1 done |
| Auth holes | Role + ownership checks on every mutating route |

---

## 10. What Comes After This Document

This file locks **how we approach the solution**.  
Next documentation steps (when you ask for them):

1. **Backend plan document** — ✅ [05 — Backend Plan](./05-backend-plan.md)  
2. **Frontend plan document** — ✅ [06 — Frontend Plan](./06-frontend-plan.md)  
3. **Combined structure document** — ✅ [07 — Combined Project Structure](./07-combined-project-structure.md)  
4. **Master execution plan** — ✅ [08 — Master Plan](./08-master-plan.md)  

For execution, follow:

- Product intent → docs 01 & 02  
- Stack & APIs → doc 03  
- Delivery approach → **this doc (04)**  
- Backend / frontend detail → docs 05 & 06  
- Repo map → doc 07  
- Phase checklist → **doc 08**  
- Visual system maps → `docs/diagrams/`

---

## 11. Summary

| Question | Answer |
| :--- | :--- |
| **What solution?** | A Next.js + MongoDB web marketplace for temporary boat docking |
| **How do we approach it?** | Principles + pillars + vertical slices + phased plan |
| **What proves it works?** | End-to-end booking journey + definition-of-done checklist + demo walkthrough |
| **What do we avoid for now?** | Native apps, payments, maps/SMS dependencies, dual backends |
| **What is the proper output?** | A branded, role-aware, seeded, locally runnable portal that completes discover → fit → request → accept → arrive → delay |

---

## Related Documents

- [01 — Problem Statement & Solution Approach (problem framing)](./01-problem-statement-and-solution.md)  
- [02 — Features & Problem–Solution Mapping](./02-features-and-solutions.md)  
- [03 — Technical Start Document](./03-technical-start.md)  
- [05 — Backend Plan](./05-backend-plan.md)  
- [06 — Frontend Plan](./06-frontend-plan.md)  
- [07 — Combined Project Structure](./07-combined-project-structure.md)  
- [08 — Master Plan](./08-master-plan.md)  
- [Diagrams (PlantUML)](./diagrams/)  

---

© 2026 AnchorDrop. All rights reserved.
