# AnchorDrop — Your Place on the Water!
> *Discover. Dock. Unwind.*

AnchorDrop is a two-sided web marketplace purpose-built for temporary and overnight boat docking. It connects boaters seeking compatible berths with private dock owners and commercial marinas monetizing vacant slips.

---

## 1. Locked Technology Stack (Phase 2 Alignment)

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | `15.x` | Unified frontend pages and API Route Handlers |
| **Language** | **TypeScript** | `5.x` | Strict type safety for vessels, docks, and bookings |
| **UI Library** | **React** | `19.x` | Component-based dashboards and marketplace UI |
| **Database** | **MongoDB** | `7.x / Atlas` | Persistent document store (Mongoose ODM) |
| **Auth** | **Session / JWT + bcryptjs** | — | Role-based authorization (`boater`, `dock_owner`) |
| **Validation** | **Zod** | — | Server-side schema validation |
| **Channel** | **Web Portal Only** | — | Responsive browser app (mobile/desktop) |
| **Dev Port** | `http://localhost:3000` | — | Aligned with `.vscode/launch.json` |

> [!NOTE]
> Older exploratory sketches mentioning Express + SQLite + static HTML are officially **superseded** by Next.js + MongoDB.
> No third-party business APIs (Stripe, live maps, SMS, live tides) are required for v1.

---

## 2. Brand Tokens & Design System

- **Deep Navy** (`#0B1F33`): Primary brand color, headers, primary buttons, trust.
- **Champagne Gold** (`#C6A56B`): Accents, borders, highlights, CTA accents.
- **Warm Hover** (`#D8BD91`): Interactive hover and focus warm state.
- **Cream** (`#F5F1E8`): Canvas background, soft panels.
- **Pure White** (`#FFFFFF`): Card surfaces on cream, modal surfaces, inputs.
- **Headings**: Georgia (serif).
- **Body / Interface**: Clean modern sans-serif (Arial / system).
- **Headline**: *Your Place on the Water!*
- **Tagline**: *Discover. Dock. Unwind.*

---

## 3. Seeded Demo Accounts

The application includes 1-click demo login accounts for walkthroughs:

| Role | Account Name | Email | Password | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Boater** | Captain Alex Morgan | `captain.alex@gmail.com` | `password123` | 2 vessels (*Sea Breeze* 42ft, *Coastal Star* 32ft), active trips |
| **Dock Owner** | Marina Del Sol | `marina.delsol@gmail.com` | `password123` | Commercial marina, 3 slips, incoming requests |
| **Private Host** | Sarah Jenkins | `sarah.harbor@gmail.com` | `password123` | Residential Fort Lauderdale dock, 1 deep-water slip |

---

## 4. Documentation Index

Detailed planning and architecture specifications live in [`docs/`](./docs):

- [`01 — Problem Statement & Solution Approach`](./docs/01-problem-statement-and-solution.md)
- [`02 — Features & Problem-Solution Mapping`](./docs/02-features-and-solutions.md)
- [`03 — Technical Start Document`](./docs/03-technical-start.md)
- [`04 — Solution Approach`](./docs/04-solution-approach.md)
- [`05 — Backend Plan`](./docs/05-backend-plan.md)
- [`06 — Frontend Plan`](./docs/06-frontend-plan.md)
- [`07 — Combined Project Structure`](./docs/07-combined-project-structure.md)
- [`08 — Master Execution Plan`](./docs/08-master-plan.md) *(Mastermind execution checklist)*
- [`Diagrams (PlantUML)`](./docs/diagrams/) *(Architecture, Use Cases, Booking Sequence, Data Model)*

---

## 5. Development Workflow

```powershell
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Code quality check
npm run lint
```
