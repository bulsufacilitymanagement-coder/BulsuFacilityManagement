# AGENTS.md — BulSU Centralized Facility Reservation

> Every agent contributing to this repo must follow this file. It keeps
> structure, style, and data-access patterns consistent no matter who writes
> the code. When in doubt, match the existing files listed as references.

## 1. Stack & Commands

- Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4.
- Data: Supabase (`@supabase/ssr`, `@supabase/supabase-js`). No other backend.
- UI extras: `framer-motion` (page/sheet animations), FullCalendar
  (`daygrid`/`timegrid`/`interaction`), `lucide-react` icons, `sileo` toasts.
- Path alias: `@/*` maps to repo root (`tsconfig.json`).
- Commands: `npm run dev` / `npm run build` / `npm run start` / `npm run lint`.
- Env (see `.env.local`, never commit it):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## 2. Project Structure (do not reorganize without discussion)

```text
app/
  page.tsx                    # Public landing
  layout.tsx                  # Root layout + <AppToaster />
  globals.css                 # Theme + .bulSU-calendar styles
  providers/                  # userProvider.tsx, types.ts (UserProfile)
  (public)/                   # No auth required
    login/page.tsx  register/page.tsx
    bulsu-facilities/page.tsx  bulsu-facilities/[id]/page.tsx
  (auth-protected)/           # Requires profile (layout.tsx redirects to /login)
    LayoutShell.tsx           # Sidebar + header + content frame
    layout.tsx                # getCurrentUserProfile() -> <UserProvider>
    dashboard/page.tsx
    facilities/page.tsx  facilities/[id]/page.tsx
    (super-admin)/colleges/page.tsx  (super-admin)/user-management/page.tsx
components/
  pages/<domain>/             # One folder per domain (dashboard, facilities,
                              # colleges, bulsu-facilities, login, register,
                              # user-management). Each owns its Sheets/, *Card/,
                              # and types/ subfolders.
  ui/                         # Shared only: AppSidebar, AppHeader, PublicNavbar,
                              # AppToaster, ConfirmDialog, Buttons/, Fields/
lib/
  supabase/client.ts          # Browser client ("use client" components ONLY)
  supabase/server.ts          # Server client (server components, layouts, lib/auth)
  auth/get-current-user-profile.ts  # "server-only": auth user + profiles+college join
proxy.ts                      # Supabase session refresh middleware (do not remove)
```

Rules:

- Domain logic lives in `components/pages/<domain>/`. Shared/reused UI goes in
  `components/ui/`. Never import from one `pages/<domain>` folder into another
  (except `facilities/FacilityCard`, which both facility lists share).
- Route `app/**` files stay thin: guard/fetch, then render the domain component.
- Supabase table names: `profiles`, `colleges`, `facilities`, `reservations`.

## 3. Data-Access Principles

1. **Right client, right place.** `"use client"` → `lib/supabase/client.ts`.
   Server components/layouts/`lib/auth` → `lib/supabase/server.ts`. Never import
   the server client into a client component.
2. **Auth guard pattern.** Protected routes rely on
   `app/(auth-protected)/layout.tsx` (`getCurrentUserProfile()` → redirect
   `/login`). Client components read the user via `useUser()` from
   `app/providers/userProvider.tsx` — do not re-fetch the profile per component.
3. **College scoping.** `College Admin` queries must add
   `.eq("college_id", user.college.id)` (see `Facilities.tsx:38-39`). Super Admin
   sees everything. Never trust role checks on the client alone for writes —
   enforce with Supabase RLS/policies too.
4. **No dummy data in production paths.** The old `DUMMY_RESERVATIONS` pattern is
   banned for new code. Loading → skeleton, empty → designed empty state with
   reset action (see `BulSUFacilities.tsx:288-330`), error → `console.error` +
   toast, never a silent blank screen.
5. **Writes give feedback.** Every insert/update/delete ends in either
   `sileo.success` or `sileo.error` (see `AddCollegeSheet.tsx:50-71`) and resets
   `isSubmitting` on ALL paths (including the error path — use `finally` or set
   before each `return`). Refresh/invalidate the list after a successful write.
6. **Types match the DB.** `capacity` is `int8` — coerce form strings to numbers
   before insert. `facilities.type` must be exactly one of `Auditorium |
Laboratory | Conference Room | Sports & Grounds` (note: the old
   `AddFacilitySheet` typo `Laboratoriy` is a known bug — do not copy it).

## 4. TypeScript & Commenting Principles

1. **One interface per major component.** Every page-level component, card,
   sheet/modal, and calendar view exports (or colocates in `types/`) an explicit
   interface for its props and its row shape — e.g. `ViewFacility`
   (`facilities/types/view-facility.ts`), `ViewCollege`
   (`colleges/types/view-college.ts`), `UserProfile`
   (`app/providers/types.ts`). No inline anonymous prop types on major
   components; no `any` for Supabase rows.
2. **Short comments on complex logic only.** Do not narrate obvious JSX. DO add
   a 1–3 line comment above: non-trivial filters/transforms (calendar event
   mapping, college scoping), date/timezone handling (`en-PH`, `+08:00`),
   auth/role branches, and conflict/overlap checks. Keep each comment to what +
   why, never a paragraph.
3. **Forms.** Controlled inputs via shared `components/ui/Fields/*` +
   `PrimaryButton` (with `loading`/`loadingText`). Validate on submit, show
   inline field errors, clear a field's error on change (see `Register.tsx`).
4. **Verify before finishing.** Run `npm run lint` and `npm run build` for any
   change touching routes, layouts, or data access. Fix new warnings you
   introduce.

## 5. UI/UX Principles (iOS-first, WCAG AA)

Follow Apple Human Interface Guidelines tone: content-first, generous
whitespace, large touch targets, predictable navigation, motion with purpose.

- **Color scheme (fixed tokens, no ad-hoc hex):**
  `bulsu` `#a50011` (primary actions, active states), `bulsu-dark` `#8c000e`
  (hovers), `bulsu-active` `#7a000c` (pressed), `gold` `#f1a926`
  (accents, pending states), `gold-dark` `#d49521` (pending borders),
  canvas `white` `#ffffff`, text `slate-950/900/500/400`.
  Status colors: confirmed = bulsu, pending = gold/amber, success = emerald,
  cancelled/neutral = slate. Reuse these — do not invent new status colors.
- **Typography:** Geist Sans via `next/font` (`app/layout.tsx`). Scale used
  across the app: hero `42–64px/−1.8px tracking`, page titles
  `32–40px/−1.2px`, section `20–24px`, body `13–15px`, eyebrow labels
  `10–11px uppercase tracking-[0.12–0.18em]`. Body text stays `slate-500/600`,
  never pure gray on white below 12px without 4.5:1 contrast.
- **Shape & depth:** Cards `rounded-[22–28px]`, inputs `rounded-[15px]`,
  pills `rounded-full`; borders `slate-200/70`, soft shadows
  (`0_10px_30px_rgba(15,23,42,0.04)`). New surfaces copy an existing card/sheet
  instead of inventing a style.
- **Touch & responsive:** Minimum target `40–48px` (`h-10`–`h-12` buttons,
  `h-9` filter chips are the smallest allowed). Layouts must work at `360px`
  wide: grid → single column, calendar toolbar stacks (see
  `globals.css` `@media (max-width: 640px)`). Test the mobile drawer in
  `LayoutShell.tsx` when touching navigation.
- **Motion:** `framer-motion` entrance (`opacity/y`, ≤0.6s, `easeOut`), sheets
  slide via spring (`stiffness:300, damping:30`). Decorative only — never block
  interaction, never animate essential state changes.
- **Confirm dialogs (required):** Any destructive or state-changing admin
  action (delete facility/college, approve/reject, revoke/no-show, cancel someone
  else's booking) MUST show a confirm dialog stating what happens + an explicit
  confirm button (`Revoke booking`, `Delete`) — never a single-click delete. Use
  `AnimatePresence` modal pattern from `ReservationsSchedule.tsx:793-962`
  (backdrop blur, `Esc`/backdrop close, focus the dialog on open, return focus on
  close). Success/cancel of the dialog is toast-confirmed. Implement with the
  shared `ConfirmDialog` (`components/ui/ConfirmDialog/ConfirmDialog.tsx`,
  props in `ConfirmDialogProps`) — do not build one-off confirms.
- **WCAG checklist for every screen:** visible `:focus` rings on all
  interactives (global `:focus-visible` fallback in `globals.css`, plus
  `focus:ring-2 ring-bulsu/20` on inputs), real `<label>`s on
  inputs, `aria-label` on icon-only buttons, `role="dialog" aria-modal` on
  modals/sheets, `role="alert"/"status"` on error/success messages, keyboard
  reachable calendar actions, and no color-only status (pair dot + text label).

## 6. Naming & File Conventions

- Components: `PascalCase.tsx` exporting a named or default component matching
  the file. Sheets: `Add<Thing>Sheet.tsx` with `{ isOpen, onClose }` props.
  Cards: `<Thing>Card.tsx` with data + callbacks only (no fetching inside).
- Types: `types/view-<thing>.ts`, `types/create-<thing>.ts`.
- Handlers: `handleNounVerb` (`handleShowReservationSchedule`,
  `handleDateSelect`, `handleEventClick`). State: `selectedCategory`,
  `searchQuery`, `isSubmitting`/`loading`, `errorMsg`/`successMsg`.
- Supabase client instances in client components: `const supabase =
createClient()` at module scope is the current convention — keep it, but do
  NOT share one instance across server/client boundary.

## 7. Known Issues (fix, don't replicate)

- `AddFacilitySheet.tsx`: `Laboratoriy` typo; `isSubmitting` never resets on
  error; image upload box is UI-only.
- `Register.tsx`: missing `college_id`/`school_id` capture; UI role labels
  (`Student`/`Faculty`) mismatch stored roles (`Student Org Admin`/
  `College Admin`).
- `Dashboard.tsx` + `dashboard/page.tsx`: hardcoded stats/reservations; buttons
  without handlers.
- Both schedule calendars: `DUMMY_RESERVATIONS`, `handleDateSelect` only logs.
  `reservations` table has zero reads/writes repo-wide.
- Dead routes referenced but missing: `/reservations`, `/settings`, `/help`,
  `/forgot-password`. `UserManagement` is a stub.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
