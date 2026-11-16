# AnchorDrop — Frontend Implementation Plan

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Frontend plan — pages, navigation, design system, motion, components, scalability  
**Product surface:** Responsive **web portal only**  
**Stack alignment:** Next.js App Router + React + TypeScript  
**Style:** Planning only — **no application code** in this document  
**Related docs:**  
[Problem](./01-problem-statement-and-solution.md) ·  
[Features](./02-features-and-solutions.md) ·  
[Technical Start](./03-technical-start.md) ·  
[Solution Approach](./04-solution-approach.md) ·  
[Backend Plan](./05-backend-plan.md) ·  
[Diagrams](./diagrams/)

---

## 1. Purpose of This Document

This document is the **complete frontend plan** for AnchorDrop. It defines:

- Every page and screen the portal will have  
- Navigation for guests, boaters, and dock owners  
- Visual design system (colors, type, spacing, icons, elevation)  
- Animation and transition standards  
- Component architecture for a scalable UI  
- Dashboard information architecture  
- Responsive / accessibility / empty-error-loading states  
- Frontend implementation order  

It does **not** include source code. It assumes the backend capabilities described in [05 — Backend Plan](./05-backend-plan.md).

---

## 2. Frontend Vision

The frontend must feel like a **premium marine hospitality marketplace**, not a generic admin CRUD tool.

| Quality | Frontend meaning |
| :--- | :--- |
| **Luxury** | Calm navy surfaces, champagne accents, generous whitespace, refined serif headlines |
| **Trust** | Clear statuses, secure unlock cues, readable forms, no visual noise |
| **Adventure** | Strong marina photography, confident CTAs, subtle motion that feels like water/horizon — not gimmicks |
| **Scalable** | Route groups, shared UI kit, design tokens, feature folders that grow without chaos |

**Brand test for the first viewport:** If the hero could belong to another product after removing the nav, branding is too weak. **AnchorDrop** must be a hero-level signal.

---

## 3. Design System Plan

### 3.1 Color system (locked brand)

| Token name | Hex | Role |
| :--- | :--- | :--- |
| `color-navy` | `#0B1F33` | Primary brand, headers, primary buttons, strong text |
| `color-gold` | `#C6A56B` | Accents, links hover, key borders, CTA highlights |
| `color-gold-hover` | `#D8BD91` | Hover / focus warm state |
| `color-cream` | `#F5F1E8` | Page canvas, soft panels |
| `color-white` | `#FFFFFF` | Cards on cream, modal surfaces, inputs |
| `color-muted` | soft navy-tinted gray | Secondary text, captions |
| `color-success` | deep sea green | Accepted / compatible |
| `color-warning` | muted amber | Pending / delay |
| `color-danger` | restrained crimson | Rejected / errors / destructive |
| `color-info` | slate blue | Neutral informational chips |

**Rules**

- Do **not** introduce purple/indigo gradients or neon glow themes  
- Do **not** replace the brand cream/navy/gold system  
- Gold is an **accent**, not large fill backgrounds  
- Status colors must remain distinguishable on cream and on navy  

### 3.2 Typography

| Role | Family | Usage |
| :--- | :--- | :--- |
| Display / headings | **Georgia** (serif) | Hero title, section titles, dashboard page titles |
| Interface / body | **Arial** or a clean modern sans (Inter only if needed for UI density — prefer a distinctive but readable sans if adding web fonts later) | Nav, forms, tables, buttons, helper text |

**Type scale (plan)**

- Hero brand / H1 — largest, confident, limited line length  
- Section H2 — clear section ownership  
- Card H3 — listing titles, vessel names  
- Body — readable 16px-class baseline  
- Caption / meta — muted, for dimensions, dates, IDs  

**Rules:** One headline job per section. Do not stack competing hero-sized text blocks.

### 3.3 Spacing, layout, radius

| Token idea | Guidance |
| :--- | :--- |
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 |
| Page max width | Wide content ~1120–1280px; dashboards can use fuller width with side nav |
| Section padding | Generous vertical rhythm on marketing pages |
| Radius | Soft but restrained (inputs/modals slightly rounded; avoid pill-everything) |
| Borders | Hairline navy/gold borders sparingly; prefer surface contrast over heavy boxes |
| Shadows | Soft, single-layer elevation for modals and sticky bars only — no multi-glow stacks |

### 3.4 Elevation & surfaces

| Surface | Use |
| :--- | :--- |
| Cream canvas | Default page background |
| White panel | Forms, listing content, dashboard content wells |
| Navy band | Hero overlays, footer, primary nav on marketing (or transparent-over-hero → solid on scroll) |
| Gold rule / underline | Section accents, active nav indicator |

**Card policy (product + brand rules)**

- **No cards in the hero**  
- Cards allowed when they are the container for **interaction** (dock result, vessel item, booking request)  
- If removing border/shadow/radius does not hurt understanding, do not force a card  

### 3.5 Iconography

| Choice | Plan |
| :--- | :--- |
| Library | One consistent set (e.g. Lucide or Heroicons) — **pick one**, do not mix styles |
| Style | Outline, 1.5–2px stroke, professional, maritime-friendly metaphors |
| Core icons | Anchor, ship/boat, map pin, waves/depth, ruler, calendar, clock, check, x, bell, lock/unlock, user, settings, plus, edit, trash |
| Status icons | Pending (clock), Accepted (check), Rejected (x), Completed (flag/check-circle), Delay (alert) |
| Usage | Icon + label for primary actions; icon-only only when tooltip/aria-label exists |

**Do not** use emoji as primary UI iconography in product chrome.

### 3.6 Imagery

| Asset | Plan |
| :--- | :--- |
| Hero | Full-bleed marina / waterfront photograph with navy gradient overlay |
| Listing photos | Aspect-ratio locked; graceful placeholder if missing |
| Empty states | Soft illustrated or photographic empty panels — not cartoon clutter |
| Avatars | Optional initials on navy circle for users |

Hero image is **edge-to-edge** on the landing first viewport — not an inset media card.

---

## 4. Motion & Interaction Plan

Motion should create **presence and hierarchy**, not noise. Target **2–3 intentional motions** per major surface, plus shared micro-interactions.

### 4.1 Global motion principles

| Principle | Meaning |
| :--- | :--- |
| Purposeful | Every animation explains state change or guides attention |
| Fast enough | Micro: 150–220ms; medium: 250–400ms; page: ≤600ms |
| Ease | Standard ease-out for entrances; ease-in-out for toggles |
| Reduced motion | Honor `prefers-reduced-motion` — disable non-essential motion |
| No endless loops | No constant shimmer/glow on idle luxury UI |

### 4.2 Planned animation inventory

| Motion | Where | Behavior |
| :--- | :--- | :--- |
| **Hero entrance** | Homepage | Brand + headline + CTA fade/rise once on load |
| **Nav solidify** | Marketing header | Transparent/over-hero → solid navy/cream on scroll |
| **Section reveal** | How It Works / Explore intro | Light fade-up as section enters viewport (once) |
| **Filter response** | Explore results | Soft list crossfade / stagger of result items |
| **Modal present** | Auth / forms / confirm | Overlay fade + panel scale/slide from center |
| **Tab switch** | Dashboards | Content fade or short slide; active gold underline animate |
| **Status pulse** | New pending / delay badge | One-time subtle attention, then static |
| **Button hover** | Primary CTAs | Gold hover warm-up; press slight darken |
| **Compatibility result** | Fit panel | Result panel height/opacity transition when check returns |
| **Unlock moment** | Arrival instructions | Lock → unlock icon transition when status becomes accepted |
| **Toast/snackbar** | CRUD success/error | Slide in from edge, auto-dismiss |
| **Skeleton load** | Lists | Soft shimmer placeholders (disabled under reduced motion) |

### 4.3 Transition map (route-level)

| From → To | Transition feel |
| :--- | :--- |
| Marketing ↔ Auth modal | Modal overlay (no hard page jump if modal pattern used) |
| Login → Boater/Owner dashboard | Short fade into dashboard shell |
| Dashboard tab changes | In-place content transition |
| Listing → Booking request panel | Drawer or modal with clear focus trap |

---

## 5. Information Architecture & Navigation

### 5.1 Primary audiences in the UI

| Audience | Landing after auth | Primary nav mode |
| :--- | :--- | :--- |
| Guest | Public marketing site | Top marketing nav |
| Boater | Boater dashboard | Dashboard shell + top/side nav |
| Dock owner | Owner dashboard | Dashboard shell + top/side nav |

### 5.2 Public marketing navigation

| Item | Target | Notes |
| :--- | :--- | :--- |
| Brand / Logo **AnchorDrop** | `/` | Always visible; brand-first |
| Explore Docks | `/#explore` or `/explore` | Anchor or dedicated page |
| How It Works | `/#how-it-works` or `/how-it-works` |
| Sign In | Auth modal or `/login` |
| Register | Auth modal/register tab or `/register` |
| (Post-login) Dashboard | `/boater` or `/owner` by role |

Footer links: About, Contact, Terms, Privacy, Copyright © 2026 AnchorDrop.

### 5.3 Boater dashboard navigation

| Nav item | Purpose |
| :--- | :--- |
| Explore & Book | Search, filters, compatibility, request |
| My Vessels | Vessel CRUD |
| My Trips | Booking status, arrival instructions, delay |
| Account / Sign out | Session controls |

### 5.4 Owner dashboard navigation

| Nav item | Purpose |
| :--- | :--- |
| My Berths | Listing CRUD + pricing |
| Requests | Incoming bookings + accept/reject |
| Arrivals | Today’s arrivals + delay alerts |
| Account / Sign out | Session controls |

### 5.5 Navigation UX rules

- Active route indicated with **gold underline or left rail marker**  
- Mobile: collapse to hamburger / bottom sheet pattern; keep brand visible  
- Authenticated users see role dashboard CTA instead of generic Register when appropriate  
- Deep links must restore the correct tab/section after refresh  

---

## 6. Complete Page & Screen Inventory

### 6.1 Public / marketing pages

| Page ID | Route plan | Purpose | Key UI blocks |
| :--- | :--- | :--- | :--- |
| P-HOME | `/` | Brand + conversion + discovery entry | Nav, full-bleed hero, CTA group, Explore preview or full section, How It Works, footer |
| P-EXPLORE | `/explore` *(or home section)* | Full search & compare | Filters bar, results grid/list, empty state, sort |
| P-DOCK-DETAIL | `/docks/[id]` | Public berth detail | Gallery, dims, depth, amenities, price, CTA “Request booking” (auth-aware) |
| P-HOW | `/how-it-works` *(or section)* | Dual-audience guide | Boater path + Owner path, switch/toggle |
| P-ABOUT | `/about` | Trust / story | Short brand story (keep light in v1) |
| P-CONTACT | `/contact` | Contact | Simple contact content/form placeholder |
| P-TERMS | `/terms` | Legal stub | Static content |
| P-PRIVACY | `/privacy` | Privacy stub | Static content |

**Hero first-viewport budget (P-HOME)**

Include only:

1. Brand (AnchorDrop)  
2. One headline — **Your Place on the Water!**  
3. One supporting line — **Discover. Dock. Unwind.** (+ short intro sentence if needed)  
4. One CTA group (Explore / Host your dock / Sign in)  
5. One dominant full-bleed image  

Do **not** put stats strips, schedules, address blocks, or promo chips in the first viewport.

### 6.2 Auth screens

| Page ID | Route / pattern | Purpose | Key UI blocks |
| :--- | :--- | :--- | :--- |
| A-AUTH-MODAL | Modal on public pages | Fast login/register | Tabs: Sign In / Register; role selector; demo buttons |
| A-LOGIN | `/login` | Dedicated login (optional alternative) | Form + demo autofill + link to register |
| A-REGISTER | `/register` | Dedicated register | Role, name, email, password, confirm |

**Demo credential UI**

- Buttons: “Demo as Boater”, “Demo as Marina Owner”, “Demo as Private Host”  
- Autofill only — still submit through normal auth flow  
- Visually secondary to real login (outline gold), never louder than primary Sign In  

### 6.3 Boater dashboard pages

| Page ID | Route plan | Purpose | Key UI blocks |
| :--- | :--- | :--- | :--- |
| B-SHELL | `/boater` layout | Shared chrome | Side/top nav, user chip, logout |
| B-EXPLORE | `/boater` or `/boater/explore` | Explore & book | Filters, results, compatibility panel, request CTA |
| B-VESSELS | `/boater/vessels` | Vessel management | Vessel list, add button, edit/delete dialogs |
| B-VESSEL-FORM | modal/drawer on vessels | Create/edit vessel | Fields: name, type, LOA, beam, draft, registration |
| B-TRIPS | `/boater/trips` | Booking lifecycle | Trip cards/table, status badges, filters by status |
| B-TRIP-DETAIL | `/boater/trips/[id]` | One booking | Dates, dock summary, status timeline, arrival block, delay form |

### 6.4 Owner dashboard pages

| Page ID | Route plan | Purpose | Key UI blocks |
| :--- | :--- | :--- | :--- |
| O-SHELL | `/owner` layout | Shared chrome | Side/top nav, user chip, logout |
| O-BERTHS | `/owner/berths` | Inventory | Berth cards/table, add berth |
| O-BERTH-FORM | `/owner/berths/new` + edit | Create/edit listing | Location, photos, dims, depth, price, amenities, availability, private arrival notes |
| O-REQUESTS | `/owner/requests` | Approvals | Request list, vessel specs, accept/reject actions |
| O-REQUEST-DETAIL | `/owner/requests/[id]` | Deep review | Full vessel + boater + dates + notes |
| O-ARRIVALS | `/owner/arrivals` | Day-of ops | Today’s accepted arrivals, delay alerts panel |

### 6.5 System / shared screens

| Page ID | Purpose |
| :--- | :--- |
| S-404 | Not found — branded soft page |
| S-403 | Forbidden — wrong role messaging + CTA home |
| S-ERROR | Generic error boundary fallback |
| S-LOADING | Route loading UI / skeletons |

---

## 7. Page-by-Page UX Specs (What Must Be On Each Screen)

### 7.1 Homepage (`/`)

**Sections (in order)**

1. **Nav** — brand left; links; auth actions right  
2. **Hero** — full-bleed marina image, navy overlay, brand, headline, tagline, CTA group  
3. **Explore Docks** — compact filters + featured/result cards + “View all” if paginated  
4. **How It Works** — dual audience (toggle Boater / Dock Host)  
5. **Trust strip (optional, below fold only)** — short reassurance line, not stats spam  
6. **Footer** — About, Contact, Terms, Privacy, copyright  

**CTAs**

- Primary: Explore Docks  
- Secondary: List your dock / Become a host  
- Tertiary: Sign in  

### 7.2 Explore

**Must include**

- Search / location or waterway field  
- Filters: dock type, max vessel length, minimum depth, max daily price  
- Clear filters action  
- Results count  
- Result items showing: photo, title, location, max L/B, depth, price, amenity highlights  
- Empty state with guidance  
- Click-through to dock detail  

### 7.3 Dock detail (public)

**Must include**

- Photo gallery  
- Title, location, waterway  
- Dimensions & depth  
- Price per day  
- Amenities  
- Availability notes  
- CTA: Request to book (prompts auth if guest)  
- Explicit note: public page does **not** show gate codes / private arrival info  

### 7.4 How It Works

**Must include**

- Boater journey steps  
- Owner journey steps  
- Interactive toggle or dual columns with clear hierarchy  
- CTA into register for each role  

### 7.5 Auth

**Must include**

- Sign in fields  
- Register fields + role choice  
- Validation messages  
- Demo autofill buttons  
- Password visibility toggle (optional but recommended)  
- Link between sign in / register  

### 7.6 Boater — Explore & Book

**Must include**

- Vessel selector (which vessel to check/fit)  
- Same search/filter tools as public explore (or embedded)  
- Compatibility panel with pass/fail per constraint  
- Request booking form: dates, special requests, submit  
- Inline success → link to My Trips  

### 7.7 Boater — My Vessels

**Must include**

- List of vessels with key dims  
- Add / Edit / Delete  
- Confirm delete dialog  
- Empty state: “Add your first vessel to check berth fit”  

### 7.8 Boater — My Trips

**Must include**

- Status filter chips: All / Pending / Accepted / Rejected / Completed  
- Trip cards with dock name, dates, status badge  
- Detail: timeline, arrival instructions (locked or unlocked UI), delay form  
- Locked arrival state copy when pending  
- Unlocked arrival panel when accepted  

### 7.9 Owner — My Berths

**Must include**

- Berth inventory list  
- Add berth CTA  
- Edit / delete or deactivate  
- Form sections: Basics, Dimensions & depth, Pricing, Amenities, Availability, **Private arrival notes** (clearly marked private)  

### 7.10 Owner — Requests

**Must include**

- Pending emphasis  
- Vessel specs prominently shown  
- Boater name + dates + special requests  
- Accept / Reject with confirm for reject  
- After action, toast + list refresh  

### 7.11 Owner — Arrivals

**Must include**

- Today’s accepted arrivals  
- Delay alert list (ETA + note)  
- Visual priority for delayed vessels  
- Link back to request/booking detail  

---

## 8. Planned Frontend Folder Structure

Scalable structure inside the Next.js app (frontend-focused):

```text
src/
├── app/
│   ├── layout                          ← Root shell, fonts, global providers
│   ├── page                            ← Homepage
│   ├── explore/page                    ← Explore (if separate)
│   ├── docks/[id]/page                 ← Dock detail
│   ├── how-it-works/page               ← Optional dedicated page
│   ├── about/page
│   ├── contact/page
│   ├── terms/page
│   ├── privacy/page
│   ├── login/page                      ← Optional if not modal-only
│   ├── register/page
│   ├── boater/
│   │   ├── layout                      ← Boater shell (nav)
│   │   ├── page                        ← Default tab (explore & book)
│   │   ├── vessels/page
│   │   └── trips/
│   │       ├── page
│   │       └── [id]/page
│   ├── owner/
│   │   ├── layout                      ← Owner shell (nav)
│   │   ├── page                        ← Default (berths or requests)
│   │   ├── berths/
│   │   │   ├── page
│   │   │   ├── new/page
│   │   │   └── [id]/edit/page
│   │   ├── requests/
│   │   │   ├── page
│   │   │   └── [id]/page
│   │   └── arrivals/page
│   └── (optional) loading/error/not-found
│
├── components/
│   ├── brand/                          ← Logo, BrandMark
│   ├── layout/                         ← PublicHeader, Footer, DashboardShell, Sidebar
│   ├── marketing/                      ← Hero, HowItWorks, TrustLine
│   ├── explore/                        ← FilterBar, DockCard, DockGrid, SortControl
│   ├── docks/                          ← DockGallery, SpecsList, AmenitiesList
│   ├── auth/                           ← AuthModal, LoginForm, RegisterForm, DemoButtons
│   ├── vessels/                        ← VesselCard, VesselForm, VesselSelect
│   ├── bookings/                       ← BookingRequestForm, TripCard, StatusBadge, Timeline
│   ├── compatibility/                  ← CompatibilityPanel, ConstraintRow
│   ├── arrivals/                       ← ArrivalUnlockPanel, DelayForm, DelayAlertList
│   ├── owner/                          ← BerthForm, RequestReviewCard, ArrivalBoard
│   ├── feedback/                       ← Toast, EmptyState, ErrorState, ConfirmDialog, Skeleton
│   └── ui/                             ← Button, Input, Select, Textarea, Badge, Modal, Tabs
│
├── styles/
│   ├── tokens                          ← colors, type, space, radii, shadows, motion
│   ├── globals                         ← base element styles
│   └── (optional) themes               ← future extension point
│
├── hooks/                              ← useAuth, useDocks, useVessels, useBookings, useMediaQuery
├── lib/
│   ├── api-client                      ← frontend fetch wrappers to backend routes
│   ├── format                          ← dates, currency, dimensions display
│   └── paths                           ← route constants
└── types/                              ← shared frontend DTO types (mirroring API shapes)
```

### Scalability rules for this structure

| Rule | Why |
| :--- | :--- |
| Feature folders under `components/` | Prevents a dumping-ground `components` mess |
| `ui/` primitives stay dumb | Reusable across marketing + dashboards |
| Tokens centralize look | Brand changes do not require hunting magic values |
| Route groups by role | Boater/Owner shells can evolve independently |
| Hooks own data wiring | Pages stay mostly composition |
| No business rule duplication | Compatibility/unlock display consumes API results only |

---

## 9. Shared Component Plan (What Must Exist)

### 9.1 Layout & brand

- Logo / wordmark  
- Public header  
- Dashboard shell (sidebar + topbar)  
- Footer  
- Mobile nav drawer  

### 9.2 Marketing

- Hero  
- How It Works switcher  
- Section heading pattern (serif title + one supporting sentence)  

### 9.3 Marketplace

- Filter bar  
- Dock card  
- Dock detail sections  
- Results empty state  

### 9.4 Auth

- Auth modal  
- Login form  
- Register form (with role)  
- Demo credential buttons  

### 9.5 Domain widgets

- Vessel form / card / select  
- Compatibility panel  
- Booking request form  
- Trip card + status badge + timeline  
- Arrival unlock panel  
- Delay form  
- Owner request review card  
- Arrivals board / delay alert list  

### 9.6 Feedback system

- Toast notifications  
- Confirm dialog  
- Inline field errors  
- Skeleton loaders  
- Forbidden / not found pages  

---

## 10. State, Data Fetching & Frontend Rules

| Concern | Plan |
| :--- | :--- |
| Auth state | Shared provider/session; gate dashboard layouts |
| Lists | Fetch on page enter; refresh after mutations |
| Forms | Local form state; disable submit while saving |
| Compatibility | Call backend check; render returned constraint flags (do not re-implement math) |
| Arrival UI | Show locked/unlocked based on booking status from API |
| Optimistic UI | Optional for accept/reject; always reconcile with server response |
| Caching | Keep simple in v1; add client cache library later if needed |

**Frontend must never**

- Invent compatibility pass/fail locally as source of truth  
- Display arrival instructions from public dock payloads  
- Allow owner screens for boater tokens (rely on route guards + API 403 handling)  

---

## 11. Responsive Plan

| Breakpoint idea | Layout behavior |
| :--- | :--- |
| Mobile | Single column; hamburger nav; stacked filters; bottom-friendly CTAs |
| Tablet | 2-column dock grids; collapsible filter drawer |
| Desktop | Full nav; filter sidebar or top bar; dashboard side rail |

**Touch rules:** Accept/Reject and destructive actions need adequate tap targets and confirmations.

---

## 12. Accessibility & Content UX

| Area | Requirement |
| :--- | :--- |
| Contrast | Navy/gold/cream combinations checked for text readability |
| Focus | Visible focus rings (gold/navy), especially in modals |
| Keyboard | Modal focus trap; Esc closes; tabs reachable |
| Labels | Every input has a visible label |
| Status | Not color-only — badge text + icon |
| Alt text | Meaningful image descriptions for marina photos |
| Copy tone | Calm, premium, clear — avoid hype spam |

**Important product copy (must appear in UI somewhere relevant)**

- Compatibility is a **preliminary dimensional check**, not a navigational safety guarantee  

---

## 13. Content & Microcopy Map (Planned)

| Moment | Message intent |
| :--- | :--- |
| Hero | Brand + place-on-the-water promise |
| Empty vessels | Prompt to add vessel before booking |
| Incompatible fit | Explain which constraint failed |
| Pending trip | Arrival details unlock after owner confirms |
| Accepted trip | Arrival panel title like “Arrival instructions” |
| Rejected trip | Neutral, respectful decline state |
| Delay submitted | Confirmation that host will see updated ETA |
| Owner private notes field | “Only shared with the boater after you accept” |

---

## 14. Professional Theme Combinations (Approved Sets)

Use these **within** the brand system — not new brand directions.

| Theme combo name | Application |
| :--- | :--- |
| **Harbor Night** | Navy background + cream text + gold accents (hero, footer, dark panels) |
| **Day Deck** | Cream background + navy text + gold CTAs (most pages) |
| **Slip Card** | White surface + navy headings + muted meta + gold active states |
| **Status Calm** | Soft tinted backgrounds for badges (success/warn/danger) on white/cream |

Avoid mixing Harbor Night body text pages with random bright accents outside the token set.

---

## 15. Frontend Implementation Order

| Step | Frontend deliverable | Depends on backend |
| :---: | :--- | :--- |
| F0 | Tokens, globals, layout shells, logo, footer | — |
| F1 | Homepage hero + nav + How It Works structure | — |
| F2 | Auth modal/pages + demo buttons + session-aware header | Auth APIs |
| F3 | Explore filters + dock cards + dock detail | Docks APIs |
| F4 | Boater shell + vessels CRUD UI | Vessels APIs |
| F5 | Compatibility panel wired to check API | Compatibility API |
| F6 | Booking request UI + My Trips list/detail | Bookings APIs |
| F7 | Arrival unlock + delay form UI | Arrival/delay behaviors |
| F8 | Owner shell + berths CRUD UI | Docks owner APIs |
| F9 | Requests accept/reject UI | Booking status API |
| F10 | Arrivals & delay alerts UI | Owner bookings feed |
| F11 | Empty/error/loading/404/403 polish + motion pass | Stable APIs |
| F12 | Responsive QA + a11y pass + demo walkthrough UI polish | Seed data |

---

## 16. Frontend Definition of Done

Frontend v1 is complete when:

1. All pages in the inventory exist (or intentional section equivalents)  
2. Guest can explore docks and open details without seeing private arrival info  
3. Auth + demo login works and routes users by role  
4. Boater can manage vessels, check fit, request, track, unlock arrival, report delay  
5. Owner can manage berths, review requests, accept/reject, see arrivals/delays  
6. Design tokens are used consistently (no random off-brand colors)  
7. Core motions listed in §4 are present and respect reduced motion  
8. Mobile and desktop layouts are usable  
9. Loading, empty, and error states exist for primary lists/forms  
10. UI matches the premium marine marketplace vision (brand-first hero, calm dashboards)

---

## 17. Out of Scope for Frontend v1

- Native mobile apps  
- Heavy 3D/WebGL water effects  
- Dark-mode theme switcher (Harbor Night is for specific bands, not a full second product theme unless later requested)  
- Map-first discovery UI (can be enhancement)  
- Real-time websocket toast infrastructure (polling/refresh is enough initially)  
- Design-system documentation site separate from the app  

---

## 18. Handoff Contract With Backend

Frontend consumes; backend owns rules.

| UI need | Backend source |
| :--- | :--- |
| Dock cards/detail | `GET /api/docks`, `GET /api/docks/:id` |
| Vessel list/form | `/api/vessels` |
| Fit panel | `/api/bookings/check-compatibility` |
| Create request | `POST /api/bookings` |
| Trips | `GET /api/bookings/boater` |
| Owner requests/arrivals | `GET /api/bookings/owner` |
| Accept/reject/complete | `PATCH /api/bookings/:id/status` |
| Delay | `PATCH /api/bookings/:id/delay` |

---

## 19. Summary

| Topic | Plan |
| :--- | :--- |
| Look | Premium navy / gold / cream marine marketplace |
| Pages | Public marketing + auth + boater hub + owner hub + system states |
| Nav | Marketing top nav; role dashboard shells |
| Components | Brand, marketing, explore, auth, vessels, bookings, compatibility, arrivals, ui primitives |
| Motion | Purposeful entrances, modal, tab, unlock, toast — not decorative spam |
| Scale | Feature folders, tokens, role route groups, shared shells |
| This doc | Full frontend plan — structures & specs only, no code |

---

## Related Documents

- [01 — Problem Statement](./01-problem-statement-and-solution.md)  
- [02 — Features](./02-features-and-solutions.md)  
- [03 — Technical Start](./03-technical-start.md)  
- [04 — Solution Approach](./04-solution-approach.md)  
- [05 — Backend Plan](./05-backend-plan.md)  
- [07 — Combined Project Structure](./07-combined-project-structure.md)  
- [08 — Master Plan](./08-master-plan.md)  
- [Diagrams](./diagrams/)  

**Next:** Combined structure ✅ [07](./07-combined-project-structure.md) · Master plan ✅ [08](./08-master-plan.md).

---

© 2026 AnchorDrop. All rights reserved.
