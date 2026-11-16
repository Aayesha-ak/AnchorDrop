# AnchorDrop — Problem Statement & Solution Approach

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Problem statement, market context, and solution approach  
**Product:** AnchorDrop — a two-sided web marketplace for temporary boat docking  
**Audience:** Founders, stakeholders, and implementers defining the product before build

---

## 1. Executive Summary

AnchorDrop is a two-sided web marketplace, conceptually similar to Airbnb, purpose-built for **temporary and overnight boat docking**.

It connects:

| Side | Who they are | What they need |
| :--- | :--- | :--- |
| **Boaters** | People who own or operate boats | Temporary or overnight docking spaces that fit their vessel |
| **Dock Owners** | Private waterfront property owners and marina operators | A way to monetize vacant berths and manage bookings |

The platform is a **centralized marketplace** where boaters can discover, compare, and request suitable docking spaces, and dock owners can publish berths, review vessel details, and accept or reject reservations — with a shared booking lifecycle and private arrival information unlocked only after confirmation.

AnchorDrop’s core differentiator is **vessel–berth compatibility**: matching a vessel’s length, beam, and draft against a berth’s dimensional limits and water depth so unsuitable requests are reduced before they ever reach an owner.

---

## 2. The Exact Idea

### 2.1 What AnchorDrop Is

AnchorDrop is **not** a static directory of marinas, a simple contact form, or a generic listing site. It is a **trustworthy, premium marine marketplace** that brings together:

1. A **public marketplace** for discovering docking spaces  
2. A **boater dashboard** for vessel profiles and reservation management  
3. A **dock owner dashboard** for listings and booking decisions  
4. A **shared booking system** connecting both user groups  
5. A **backend and database** that keep listings, vessels, bookings, and statuses consistent  

The brand should feel like **Luxury, Trust, and Adventure** — deep navy, champagne gold, cream surfaces, and calm, confident UI — so the experience feels closer to a premium hospitality product than a basic booking form.

### 2.2 What AnchorDrop Is Not

- Not a guarantee of navigational safety or harbor authority clearance  
- Not a replacement for charts, pilots, or local maritime judgment  
- Not only a brochure website with phone numbers  
- Not a one-sided marina website that ignores private dock hosts  

Compatibility checks are a **preliminary dimensional fit** (length, beam, draft vs. berth limits and depth). Final responsibility for safe navigation remains with the boater and applicable local rules.

---

## 3. Problem Statement

### 3.1 Problem for Boaters

Finding a suitable docking space is often **inconvenient, fragmented, and uncertain**.

Today, boaters typically must:

1. Contact multiple marinas one by one  
2. Ask separately about **availability**, **pricing**, **facilities**, and **berth dimensions**  
3. Manually judge whether their vessel will fit (length, beam, draft vs. depth)  
4. Wait on emails or phone calls with no shared status trail  
5. Receive arrival details (gate codes, slip numbers, VHF channels) through ad-hoc channels once something is “agreed”

This creates friction:

| Pain | Why it hurts |
| :--- | :--- |
| **Discovery is scattered** | There is no single place to browse and compare temporary berths across private docks and smaller marinas |
| **Comparison is hard** | Prices, amenities, and dimensions live in different formats and conversations |
| **Fit is unclear** | A booking can proceed before anyone confirms the vessel physically fits the berth |
| **Process is informal** | Requests, acceptances, and arrivals are tracked in inboxes and texts, not a system |
| **Arrival info is insecure or late** | Sensitive instructions may be shared too early, too late, or inconsistently |

### 3.2 Problem for Dock Owners & Smaller Marinas

Private waterfront owners and smaller marina operators often have **unused docking capacity** but lack an effective way to:

- Advertise vacant berths to a relevant audience  
- Attract short-stay boaters without building their own booking product  
- Review vessel specifications before committing a slip  
- Organize incoming requests, accept/reject decisions, and arrival timing  

Larger marina systems may exist for established operators, but **private hosts and smaller operators** are underserved. Vacant berths that could generate income remain idle because there is no simple, trustworthy channel to list them and manage guest boaters.

### 3.3 The Two-Sided Gap

| Side | Gap | Consequence |
| :--- | :--- | :--- |
| Boaters | No centralized discovery + fit + booking flow | Time wasted, unsuitable enquiries, uncertain stays |
| Dock owners | No lightweight listing + request + arrival workflow | Idle inventory, lost income, chaotic coordination |
| Market | No shared system of record between both sides | Mismatched expectations and broken communication |

**Core problem (one sentence):**  
Temporary docking demand and vacant berth supply exist, but they are not connected through a single marketplace that supports discovery, dimensional compatibility, reservation workflow, and controlled sharing of arrival instructions.

---

## 4. Who Is Affected

### 4.1 Primary Users

**Boaters**

- Recreational boaters seeking overnight or short-term docking while traveling  
- Vessel owners who need a temporary slip near a destination  
- Operators who must ensure berth dimensions and depth work for their vessel  

**Dock Owners**

- Private waterfront property owners with a usable berth  
- Smaller marina operators with vacant slips to rent short-term  

### 4.2 Secondary Stakeholders (context, not day-one product owners)

- Marinas that may later join as multi-slip operators  
- Guests traveling with the boater (indirect beneficiaries of clearer arrival info)  
- Local communities that benefit from organized, temporary waterfront use  

---

## 5. Why Existing Approaches Fall Short

| Approach | Limitation |
| :--- | :--- |
| Calling marinas one by one | Slow, non-comparable, no shared status |
| Static marina websites | Often incomplete for private docks; weak search/filter across providers |
| Generic classifieds / social posts | Untrusted, no vessel compatibility, no booking lifecycle |
| Spreadsheets / email for hosts | Manual, error-prone, does not scale |
| Generic marketplace clones without marine logic | Ignore length, beam, draft, depth — the fit problem remains |

AnchorDrop’s opportunity is to combine **marketplace liquidity** with **marine-specific constraints** and a **clear booking journey**.

---

## 6. Solution Approach — How We Solve It

### 6.1 Solution Thesis

Build a **local-first, full-stack two-sided marketplace** that:

1. Lets dock owners **list** berths with dimensions, depth, pricing, amenities, availability, and private arrival notes  
2. Lets boaters **register vessels** with length, beam, draft, type, and registration  
3. Lets boaters **search and compare** docks with meaningful filters  
4. Runs a **compatibility check** before or during booking so unfit vessels are flagged early  
5. Runs a **request → accept/reject → unlock arrival info → complete** booking lifecycle  
6. Supports **delay reporting** so owners see updated ETAs for today’s arrivals  
7. Presents the product as a **premium, trustworthy** marine experience, not a bare form  

### 6.2 How to Approach the Idea (Strategic Sequence)

Think of the build as layers that each close a specific part of the problem:

```text
1. Clarify the two roles and shared booking contract
2. Model the domain (users, vessels, docks, bookings)
3. Expose a REST API that enforces ownership and status rules
4. Ship a public marketplace for discovery and trust
5. Ship boater tools (vessels, search, request, track, delay)
6. Ship owner tools (listings, approve/reject, arrivals)
7. Seed demo data so the two-sided loop can be demonstrated end-to-end
8. Verify auth, CRUD, compatibility, booking, and delay flows with tests
```

### 6.3 Solution Pillars

#### Pillar A — Centralized Discovery

**Problem addressed:** Boaters must hunt across many contacts.  
**Approach:** A public **Explore Docks** experience with live search and multi-parameter filtering (location/waterway, dock type, max vessel length, minimum depth, daily price).  
**Outcome:** Boaters compare options in one place; owners get visibility without building their own site.

#### Pillar B — Vessel Profiles & Compatibility

**Problem addressed:** Unsuitable bookings and ambiguous fit.  
**Approach:** Boaters maintain vessel profiles (name, type, LOA, beam, draft, registration). The platform compares vessel specs to berth max length, max beam, and minimum water depth (e.g. low-tide depth) and surfaces a clear fit / no-fit signal.  
**Outcome:** More informed search and fewer wasted requests. Explicitly framed as a **preliminary check**, not a safety guarantee.

#### Pillar C — Dual Dashboards Connected by Bookings

**Problem addressed:** No organized process between sides.  
**Approach:**

- **Boater dashboard:** vessels, explore & book, trip status, arrival instructions when accepted, delay reporting  
- **Owner dashboard:** berth CRUD, incoming requests with vessel details, one-click accept/reject, arrivals & delay alerts  

**Outcome:** One shared status model (`Pending`, `Accepted`, `Rejected`, `Completed`) visible to both parties.

#### Pillar D — Controlled Arrival Information

**Problem addressed:** Sensitive arrival details shared too early or inconsistently.  
**Approach:** Private gate codes, slip numbers, and VHF channels stay with the listing/booking record and are **unlocked to the boater only after owner acceptance**.  
**Outcome:** Trust and operational clarity without exposing private access data on public listings.

#### Pillar E — Persistent Backend of Record

**Problem addressed:** Conversations and statuses drift across channels.  
**Approach:** Node.js + Express REST API with SQLite (`database/anchordrop.db`), relational tables, foreign keys, bcrypt password hashing, and seeded demo accounts.  
**Outcome:** Consistent data for auth, listings, vessels, bookings, and delays — runnable locally on `http://localhost:8080`.

---

## 7. End-to-End Booking Journey (Solution Workflow)

This is the complete intended workflow the product must support:

1. Boater registers and adds a vessel  
2. Boater searches for available docking spaces  
3. Platform displays relevant listings  
4. Boater checks specifications and compatibility  
5. Boater submits a reservation request (dates, special requests)  
6. Dock owner reviews the request and vessel details  
7. Owner accepts or rejects the request  
8. Booking status updates for both users  
9. On acceptance, the boater receives private arrival information  
10. Optionally, the boater reports a delay with updated ETA  
11. The booking can eventually be marked as completed  

This journey is the **contract** between product vision and implementation: every feature should make one of these steps clearer, faster, or safer.

---

## 8. Illustrative Compatibility Example

A vessel has:

- Length: **42 ft**  
- Beam: **13 ft**  
- Draft: **4 ft**

A berth allows:

- Maximum length: **50 ft**  
- Maximum beam: **15 ft**  
- Minimum water depth: **6 ft**

Compatibility logic (conceptual):

- Length OK if `vessel.length <= dock.max_length` → 42 ≤ 50  
- Beam OK if `vessel.beam <= dock.max_beam` → 13 ≤ 15  
- Draft OK if `vessel.draft <= dock.min_depth` → 4 ≤ 6  

Result: **Compatible** (preliminary dimensional fit). If any check fails, the UI should indicate incompatibility so the boater can choose another berth or vessel before requesting.

---

## 9. Product Vision (What “Done” Feels Like)

AnchorDrop should feel like a **premium, trustworthy marine marketplace**.

When the solution is working, a new user should be able to:

- Understand the product from the homepage (hero, explore, how it works, auth)  
- Sign in as a boater or dock owner (including 1-click demo credentials)  
- As a boater: manage vessels, filter docks, check fit, request a berth, track status, unlock arrival info, report delays  
- As an owner: manage berths, review requests with vessel specs, accept/reject, monitor arrivals and delays  
- Rely on the backend so both sides always see the same booking truth  

Brand cues that reinforce the vision:

- **Values:** Luxury, Trust, Adventure  
- **Palette:** Deep Navy `#0B1F33`, Champagne Gold `#C6A56B`, Warm Hover `#D8BD91`, Cream `#F5F1E8`  
- **Typography:** Georgia for headings; Arial / modern sans-serif for interface  
- **Tagline:** Discover. Dock. Unwind.  
- **Positioning line:** Your Place on the Water!

---

## 10. Scope Boundaries for This Approach

### In scope (solution focus)

- Public marketplace pages and modal authentication with roles  
- Boater vessel CRUD, booking requests, status tracking, arrival unlock, delay reporting  
- Owner berth CRUD, request center, accept/reject, arrivals/delay alerts  
- Compatibility engine for length, beam, and draft/depth  
- Express API + SQLite persistence + seed data + verification tests  

### Explicitly out of scope (for now / later enhancements)

- Real payment processing and escrow  
- Live AIS / chart navigation or legal navigational advice  
- Native mobile apps  
- Multi-currency / global marina networks at scale  
- Full marina PMS replacement for large commercial operators  

These can enhance the product later; they are not required to prove the core two-sided loop.

---

## 11. Success Criteria (Problem Solved When…)

The problem is meaningfully solved when:

1. A boater can find and compare berths without calling multiple venues first  
2. Vessel fit is visible before a request is locked in  
3. An owner can list vacant capacity and decide on requests using vessel specs  
4. Both sides share one booking status timeline  
5. Arrival instructions appear only after acceptance  
6. Delay notices reach the owner in the same system  
7. A local demo with seeded accounts can walk the full journey end-to-end  

---

## 12. Summary

| Element | Statement |
| :--- | :--- |
| **Problem** | Temporary docking is hard to discover, compare, fit-check, and manage; vacant berths are hard to advertise and coordinate |
| **Users** | Boaters needing short-term slips; private hosts and smaller marinas with unused berths |
| **Approach** | One marketplace + dual dashboards + compatibility + shared booking lifecycle + persistent backend |
| **Differentiator** | Vessel–berth dimensional compatibility as a first-class part of search and booking |
| **Vision** | A premium marine marketplace: Discover. Dock. Unwind. |

---

## Related Documents

- [02 — Features & Problem–Solution Mapping](./02-features-and-solutions.md) — feature inventory and how each feature closes the gaps above  
- [03 — Technical Start Document](./03-technical-start.md) — Next.js + MongoDB stack, APIs, env, build order  
- [04 — Solution Approach](./04-solution-approach.md) — how we deliver the solution (phases, slices, definition of done)  
- [07 — Combined Project Structure](./07-combined-project-structure.md) — full repo map  
- [08 — Master Plan](./08-master-plan.md) — 25-phase execution checklist  
- [Diagrams (PlantUML)](./diagrams/) — architecture, use cases, booking sequence, data model  

---

© 2026 AnchorDrop. All rights reserved.
