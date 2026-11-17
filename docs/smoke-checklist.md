# AnchorDrop — Manual Smoke & Release Verification Checklist

This checklist is used prior to any production deployment or stakeholder demonstration.

---

## 1. Environment & Database Bootstrap
- [ ] In-memory MongoDB starts automatically when no external URI is provided.
- [ ] `npm run seed` executes without errors and seeds demo accounts:
  - Captain Alex Vance (`boater@anchordrop.com` / `password123`)
  - Marina Del Sol Harbor (`owner@anchordrop.com` / `password123`)
  - Sarah Jenkins (`sarah@anchordrop.com` / `password123`)
- [ ] `npm test` runs master regression suite with zero errors.

---

## 2. Marketing & Exploration Loop (Guest)
- [ ] Visit `/` (Homepage):
  - Brand-first hero section visible on initial viewport (no card clutter).
  - How It Works dual-journey toggle switches between Boater and Host flows.
  - Explore catalog under `#explore` displays live berths with photo, dimensions, rate, and amenities.
- [ ] Filter Bar operations:
  - Filter by LOA, beam, depth, or location updates result count in real time.
  - Reset filters restores default listing state.
- [ ] Open Dock Detail page (`/docks/:id`):
  - Gallery and key specifications (LOA, Beam, Depth, Waterway) render.
  - Host privacy callout explicitly notes arrival instructions are protected.
  - "Request to Book" CTA prompts sign-in for guests.

---

## 3. Boater Flow & Compatibility
- [ ] Sign in as Captain Alex via 1-click demo button or `/login`.
- [ ] Navigate to `/boater/vessels`:
  - List displays "Sea Breeze II" (42ft) and "Island Runner" (28ft).
  - Add Vessel modal validates positive dimensions.
  - Edit modal updates vessel specifications.
- [ ] Navigate to `/boater/book?dockId=...`:
  - Select vessel from dropdown.
  - Dimensional compatibility indicator evaluates fit (Green = Compatible, Red = Exceedance).
  - Select check-in and check-out dates.
  - Submit reservation request.
- [ ] Navigate to `/boater/trips`:
  - New booking appears under "Pending" status chip.
  - Open trip detail (`/boater/trips/:id`):
    - Locked state displays lock icon with security notice.
    - Arrival gate codes and slip info are hidden.

---

## 4. Host Operations & Status Machine
- [ ] Sign in as Marina Del Sol or Sarah Jenkins.
- [ ] Navigate to `/owner/requests`:
  - Pending reservation request visible with boater name, vessel dimensions, and dates.
  - Click "Accept Request" -> Status updates to `accepted`.
- [ ] Switch back to boater account (`/boater/trips/:id`):
  - Arrival instructions panel unlocks with celebration pulse.
  - Gate code, assigned slip, and VHF radio frequency are revealed.
  - One-click copy utility copies instructions to clipboard.
- [ ] Submit arrival delay via DelayForm:
  - Enter delayed ETA and navigation note ("Delayed by low tide").
  - Submit -> Confirmation toast appears.
- [ ] Switch to host dashboard (`/owner/arrivals`):
  - Arrival appears on host dashboard with ⚠️ Delay Alert banner and updated ETA.
- [ ] On `/owner/requests`:
  - Click "Mark as Completed" -> Status transitions to `completed`.

---

## 5. Host Inventory Management
- [ ] Navigate to `/owner/berths`:
  - Lists all docks owned by current host.
  - Click "+ Add New Berth" -> Complete basics, dimensions, price, amenities, and arrival notes.
  - Save berth -> New listing appears in owner inventory and public Explore catalog.
  - Attempting to delete a berth with active bookings displays 409 conflict protection.

---

## 6. Accessibility & Motion
- [ ] Tab through modals, forms, and navigation buttons — focus rings are visibly highlighted (`:focus-visible`).
- [ ] Enable reduced motion in OS settings — animations are disabled.
- [ ] Screen reader announces asynchronous status updates via ARIA live regions.
- [ ] Color contrast exceeds WCAG 2.1 AA across navy, gold, and cream tokens.
