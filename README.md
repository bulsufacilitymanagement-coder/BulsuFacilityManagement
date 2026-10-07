# BulSU Centralized Facility Reservation

A university-wide web platform for Bulacan State University that centralizes
how facilities are discovered, booked, and managed — replacing fragmented,
per-college scheduling with one portal, one live calendar, and one approval
workflow.

## Purpose

- Let anyone (even without an account) browse facilities and view live
  schedules.
- Let authenticated users submit reservation requests without double bookings.
- Let College Admins manage only their own college's facilities and bookings
  (availability, check-ins, no-show revocations).
- Let Super Admins oversee colleges, accounts, and global usage.

Out of scope: RFID/smartcard hardware, SMS notifications, payments/rental fees,
native iOS/Android apps.

## Target Users & Roles

| Role | Access |
|---|---|
| **Public (no login)** | Landing page, facility catalog, per-facility schedule calendar (read-only). |
| **Student Org Admin** | Everything public, plus submit reservations, track upcoming/past bookings, cancel own bookings. |
| **College Admin** (e.g. CICT, COE, E-Library staff) | Scoped to own `college_id`: manage facility inventory, view/approve bookings, confirm check-ins, revoke no-shows. |
| **Super Admin** | All of the above, plus Colleges and User Management, global views/logs. |

Role gating today: sidebar hides `Colleges`/`User Management` for non–Super
Admins (`AppSidebar.tsx`); facility queries add `.eq("college_id", …)` for
College Admins (`Facilities.tsx`). Writes should additionally be enforced by
Supabase RLS.

## Features & Status

| # | Feature | Status |
|---|---|---|
| 1 | Auth (register, login, logout, session refresh, protected routes) | ✅ Live on Supabase Auth |
| 2 | Public + auth facility catalog (search, type filter, facility cards) | ✅ Live (`facilities` table) |
| 3 | Colleges list + add college (Super Admin) | ✅ Live (`colleges` table) |
| 4 | Add facility (College Admin) | ✅ Live, minor bugs (type typo, capacity coercion, image upload UI-only) |
| 5 | Interactive calendar Day/Week/Month + color legend + event details modal | ⚠️ UI done, dummy data — not yet wired to `reservations` |
| 6 | Reservation submit + overlap/conflict blocking | ❌ Not started |
| 7 | Personal dashboard (upcoming/history/counts/cancel) | ❌ Hardcoded placeholders |
| 8 | Approve/reject, check-in, no-show revoke | ❌ Not started |
| 9 | QR code per facility → live schedule + booking form | ❌ Not started |
| 10 | User Management, global usage logs | ❌ Stub |
| 11 | Mobile-responsive layouts, mobile nav drawer | ✅ Done (layout-level) |

See `BUILT_FEATURES_CHECKLIST.md` for the file-by-file as-built audit and
`AGENTS.md` §7 for known issues.

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Supabase (`@supabase/ssr` + `@supabase/supabase-js`) · FullCalendar
(daygrid/timegrid/interaction) · framer-motion · lucide-react · sileo toasts.

## Getting Started

Prerequisites: Node 20+, npm, a Supabase project.

```bash
npm install
cp .env.local.example .env.local   # then fill in the two keys below
npm run dev                        # http://localhost:3000
```

Required env (`./.env.local`, never commit):

```text
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=…
SUPABASE_SERVICE_ROLE_KEY=…   # server-only: Super Admin user creation (never expose to the browser)
```

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`.

## Routes

```text
/                              Public landing
/login  /register               Auth (redirects to /dashboard when signed in)
/bulsu-facilities               Public catalog (live data)
/bulsu-facilities/[id]         Public schedule calendar (dummy data for now)
/dashboard                     Overview (auth; stats still placeholders)
/facilities                    Browse/manage facilities (college-scoped for admins)
/facilities/[id]                Reservations calendar (dummy data for now)
/colleges                       Super Admin: colleges (live)
/user-management                Super Admin: stub
```

Sidebar also links `/reservations`, `/settings`, `/help` and login links
`/forgot-password` — these routes do not exist yet.

## Database (Supabase)

| Table | Columns | Used for |
|---|---|---|
| `profiles` | `id(uuid PK), first_name, last_name, email, role, college_id(nullable), created_at` | User record created at signup; joined with `colleges` for session/role display. |
| `colleges` | `id(uuid PK), name(unique), code(unique), description?, created_at, location` | College directory; owns facilities via `facilities.college_id`. |
| `facilities` | `id(uuid PK), name, college_id, type, capacity(int8), status, created_at, description, location?` | Catalog + cards + add-facility form. `type ∈ {Auditorium, Laboratory, Conference Room, Sports & Grounds}`. |
| `reservations` | `id(int8 PK identity), purpose, status, start_time, end_time, user_id, facility_id, created_at` | Schema exists; **no code reads/writes it yet** — this is the next build target. |

## Design System

- **Colors:** BulSU red `#a50011` (`bulsu` token; hover `#8c000e`,
  pressed `#7a000c`), gold `#f1a926` (accent/pending; border `#d49521`),
  canvas `#ffffff`, text `slate-950/900/500/400`. Status: confirmed red,
  pending gold, success emerald, cancelled slate.
- **Typography:** Geist Sans (`next/font`); hero 42–64px, page titles 32–40px,
  section 20–24px, body 13–15px, eyebrow labels 10–11px uppercase.
- **Shape:** cards `rounded-[22–28px]`, inputs `rounded-[15px]`, pills
  `rounded-full`; soft slate borders and shadows.
- **UX rules:** iOS-style 40–48px touch targets; destructive/state-changing
  admin actions require a confirm dialog; every screen meets WCAG AA basics
  (focus rings, labels, `aria` on icon buttons/dialogs, `role="alert"/"status"`
  on messages, status never color-only). Full rules in `AGENTS.md` §5.

## Code Principles (for contributors)

- One explicit `interface` per major component/card/sheet/view (see
  `components/**/types/`, `app/providers/types.ts`).
- Short 1–3 line comments on complex logic only (filters, calendar mapping,
  timezone handling, role branches, overlap checks) — never narrate obvious JSX.
- Right Supabase client per environment; college-scope admin queries; every
  write ends in a toast and resets submitting state; no dummy data in
  production paths. Full rules in `AGENTS.md`.

## Project Structure

```text
app/(public)/          login, register, bulsu-facilities, bulsu-facilities/[id]
app/(auth-protected)/  layout (guard) + LayoutShell, dashboard,
                       facilities, facilities/[id], (super-admin)/colleges,
                       (super-admin)/user-management
components/pages/<domain>/   domain UI (Sheets/, *Card/, types/)
components/ui/                shared: AppSidebar, AppHeader, PublicNavbar,
                              AppToaster, Buttons/, Fields/
lib/supabase/          client.ts (browser) / server.ts (server)
lib/auth/              get-current-user-profile.ts (server-only)
proxy.ts               Supabase session refresh
```

Contributing: read `AGENTS.md` first — it defines structure, data access,
commenting, UI/UX, and naming conventions all agents must follow.
