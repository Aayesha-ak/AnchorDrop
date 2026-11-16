# AnchorDrop — Combined Project Structure

> **Your Place on the Water!**  
> *Discover. Dock. Unwind.*

**Document type:** Combined frontend + backend repository structure (single Next.js web portal)  
**Purpose:** One map of how all planned pieces fit together before / during execution  
**Related:** [Backend Plan](./05-backend-plan.md) · [Frontend Plan](./06-frontend-plan.md) · [Master Plan](./08-master-plan.md)

---

## 1. What This Document Is

This is the **combined structure** for the whole AnchorDrop v1 application:

- One Next.js codebase  
- Frontend pages/components and backend API/services in the **same repo**  
- MongoDB as the single database  
- Docs + diagrams living alongside the product  

Use this as the **folder truth**. Use [08 — Master Plan](./08-master-plan.md) as the **execution checklist**.

---

## 2. Stack Snapshot (Locked)

| Layer | Choice |
| :--- | :--- |
| App | Next.js App Router + React + TypeScript |
| Data | MongoDB + Mongoose |
| Auth | Session/JWT + bcryptjs + roles |
| Validation | Zod |
| UI | Design tokens (navy/gold/cream) + shared component kit |
| Channel | Web portal only |
| External business APIs | None required for v1 |

---

## 3. Full Repository Tree (Planned)

```text
AnchorDrop/
├── docs/
│   ├── 01-problem-statement-and-solution.md
│   ├── 02-features-and-solutions.md
│   ├── 03-technical-start.md
│   ├── 04-solution-approach.md
│   ├── 05-backend-plan.md
│   ├── 06-frontend-plan.md
│   ├── 07-combined-project-structure.md    ← this file
│   ├── 08-master-plan.md                  ← execution phases + checklist
│   └── diagrams/
│       ├── README.md
│       ├── 01-system-architecture.puml
│       ├── 02-use-case-diagram.puml
│       ├── 03-booking-sequence.puml
│       └── 04-data-model.puml
│
├── public/
│   ├── images/                            ← hero, placeholders, listing samples
│   └── favicon.ico
│
├── scripts/
│   ├── seed.ts                            ← demo users/vessels/docks/bookings
│   └── reset-db.ts                        ← optional local reset
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                     ← root layout, fonts, providers
│   │   ├── page.tsx                       ← homepage
│   │   ├── loading.tsx / error.tsx / not-found.tsx
│   │   ├── explore/page.tsx
│   │   ├── docks/[id]/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── boater/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   ← explore & book
│   │   │   ├── vessels/page.tsx
│   │   │   └── trips/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── owner/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── berths/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── arrivals/page.tsx
│   │   └── api/                           ← BACKEND transport
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── vessels/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── docks/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── bookings/
│   │           ├── route.ts
│   │           ├── check-compatibility/route.ts
│   │           ├── boater/route.ts
│   │           ├── owner/route.ts
│   │           └── [id]/
│   │               ├── status/route.ts
│   │               └── delay/route.ts
│   │
│   ├── components/                        ← FRONTEND UI
│   │   ├── brand/
│   │   ├── layout/
│   │   ├── marketing/
│   │   ├── explore/
│   │   ├── docks/
│   │   ├── auth/
│   │   ├── vessels/
│   │   ├── bookings/
│   │   ├── compatibility/
│   │   ├── arrivals/
│   │   ├── owner/
│   │   ├── feedback/
│   │   └── ui/
│   │
│   ├── services/                          ← BACKEND domain logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── vessel.service.ts
│   │   ├── dock.service.ts
│   │   ├── booking.service.ts
│   │   ├── compatibility.service.ts
│   │   └── arrival.service.ts
│   │
│   ├── models/                            ← BACKEND persistence
│   │   ├── User.ts
│   │   ├── Vessel.ts
│   │   ├── Dock.ts
│   │   └── Booking.ts
│   │
│   ├── validations/                       ← shared request contracts
│   │   ├── auth.schema.ts
│   │   ├── vessel.schema.ts
│   │   ├── dock.schema.ts
│   │   └── booking.schema.ts
│   │
│   ├── lib/
│   │   ├── db.ts                          ← Mongo connection
│   │   ├── auth.ts                        ← session/JWT helpers
│   │   ├── password.ts
│   │   ├── errors.ts
│   │   ├── serializers.ts
│   │   ├── constants.ts
│   │   ├── api-client.ts                  ← frontend HTTP helpers
│   │   ├── format.ts
│   │   └── paths.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDocks.ts
│   │   ├── useVessels.ts
│   │   ├── useBookings.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── vessel.ts
│   │   ├── dock.ts
│   │   ├── booking.ts
│   │   └── api.ts
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   └── globals.css
│   │
│   └── middleware.ts                      ← route protection patterns
│
├── .env.local.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md                              ← setup + demo credentials (product-facing)
```

---

## 4. How Frontend and Backend Connect

```text
Browser UI (pages + components + hooks)
        │
        │  api-client / fetch
        ▼
app/api/**/route.ts          (transport)
        │
        ▼
validations + auth guards
        │
        ▼
services/*                   (domain rules)
        │
        ▼
models/*  →  MongoDB
```

| Concern | Lives in |
| :--- | :--- |
| Pages & layouts | `src/app/**` (non-api) |
| Visual components | `src/components/**` |
| HTTP endpoints | `src/app/api/**` |
| Business rules | `src/services/**` |
| DB schemas | `src/models/**` |
| Input contracts | `src/validations/**` |
| Shared helpers | `src/lib/**` |

---

## 5. Domain Module Map (Combined)

| Module | Backend pieces | Frontend pieces |
| :--- | :--- | :--- |
| Auth | api/auth, auth.service, User model | auth components, login/register, header session |
| Docks | api/docks, dock.service, serializers | explore, dock detail, owner berths forms |
| Vessels | api/vessels, vessel.service | boater vessels pages/components |
| Compatibility | compatibility.service + check route | CompatibilityPanel |
| Bookings | booking.service + booking routes | request form, trips, owner requests |
| Arrival | arrival.service | ArrivalUnlockPanel |
| Delay | booking delay route | DelayForm, DelayAlertList |
| Seed | scripts/seed | DemoButtons (consume seeded users) |

---

## 6. Environment & Scripts

| Item | Purpose |
| :--- | :--- |
| `MONGODB_URI` | DB connection |
| `AUTH_SECRET` | Session/JWT signing |
| `NEXTAUTH_URL` / app URL | Local callback base if used |
| `npm run dev` | Local portal |
| `npm run seed` | Demo dataset |
| `npm test` | Critical-path verification |

---

## 7. Document Roles (How to Use the Docs Set)

| Doc | Role during execution |
| :--- | :--- |
| 01 | Why the product exists |
| 02 | What features close which problems |
| 03 | Stack and technical boundaries |
| 04 | Delivery approach / principles |
| 05 | Backend module detail |
| 06 | Frontend page/UI detail |
| **07** | **Where everything lives in the repo** |
| **08** | **What to build next (phased checklist)** |
| diagrams/ | Visual architecture aids |

---

## Related Documents

- [05 — Backend Plan](./05-backend-plan.md)  
- [06 — Frontend Plan](./06-frontend-plan.md)  
- [08 — Master Plan](./08-master-plan.md)  

---

© 2026 AnchorDrop. All rights reserved.
