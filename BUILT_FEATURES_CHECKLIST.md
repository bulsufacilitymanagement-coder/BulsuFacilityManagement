# BulSU Facility Reservation — As-Built Requirements Checklist
> Generated 2026-10-07 from actual repo code. Use this to double-check against the original spec.

## A. Roles & Access (as built)

| Requirement | Status | Evidence |
|---|---|---|
| Public (non-authenticated) can view landing + facility list + facility schedule | DONE (UI + live reads for list) | `app/page.tsx`, `components/pages/bulsu-facilities/BulSUFacilities.tsx:41` (`facilities.select`), `app/(public)/bulsu-facilities/[id]/page.tsx` calendar UI |
| Student Org Admin / College Admin register + login | DONE (Supabase Auth live) | `components/pages/register/Register.tsx:179` (`auth.signUp`), `:204` (`profiles.insert`), `components/pages/login/Login.tsx:36` (`signInWithPassword`) |
| Auth guard + session | DONE | `proxy.ts:32`, `app/(auth-protected)/layout.tsx:11`, `lib/auth/get-current-user-profile.ts:18` (`profiles` + `colleges` join) |
| College Admin sees only own college facilities | DONE (facilities list scoping) | `components/pages/facilities/Facilities.tsx:38-39` (`eq("college_id", user.college.id)`), header shows `user.college.code` |
| Super Admin sees Colleges + User Management nav | PARTIAL (nav gating only) | `components/ui/AppSidebar/AppSidebar.tsx:149-154` hides nav by role; Colleges page works, User Management is stub |
| Logout | DONE | `AppSidebar.tsx:192` (`auth.signOut`) |

**Gap:** `Register.tsx:203` has `kulang pa ng school_id` — no `college_id` picker on register, so new users have `college_id = NULL` (`profiles` schema allows nullable). Role labels in UI (`Student/Faculty`) don't match stored values (`Student Org Admin` / `College Admin`).

## B. Module 1 — Multi-College Catalog & Portal

| Requirement | Status | Evidence |
|---|---|---|
| Search + filter by Facility Type | DONE (both public + auth) | `BulSUFacilities.tsx:67`, `Facilities.tsx:55`; types: Auditorium, Laboratory, Conference Room, Sports & Grounds |
| Filter by College/Unit (e.g. CICT, COE) | MISSING | No college filter dropdown exists; auth view auto-scopes instead, public view has no college filter |
| Facility profile: location, capacity, status, description | DONE (read-only) | `FacilityCard.tsx:36-80` renders `type/status/name/location/capacity/description` from `facilities` table |
| Equipment details, usage guidelines | MISSING | `facilities` table has no `equipment`/`guidelines` columns; `description` text only |
| Status values Available / Under Maintenance / Deactivated | PARTIAL | Code checks `Available` / `Reserved Today` (`Facilities.tsx:167`); DB `status:text` free-form, no maintenance/deactivated workflow |
| Mobile-responsive views | DONE (layout-level) | Tailwind responsive classes throughout (`grid sm:`, `lg:`), mobile sidebar drawer in `LayoutShell.tsx:25-46` |
| Colleges management (Super Admin) | DONE (create + list) | `Colleges.tsx:26` (`colleges.select`), `AddCollegeSheet.tsx:37` (`colleges.insert`) |

## C. Module 2 — QR Code Quick-Scan

| Requirement | Status | Evidence |
|---|---|---|
| System-generated QR per facility, printable | MISSING | No QR lib in `package.json`, no `qr` string in code |
| Scan → facility live schedule + booking form | MISSING | Deep link pattern (`/bulsu-facilities/[id]`) exists and could host it, but no QR generation/linkage |

## D. Module 3 — Interactive Availability Calendar (NOW LIVE)

- Day/Week/Month calendar per facility with real `reservations` rows:
  auth view `ReservationsSchedule.tsx` (scoped to the facility in the URL,
  with status filter + search, loading skeleton, not-found state),
  public view `bulsu-facilities/[id]/page.tsx` (read-only, cancelled hidden).
- Color legend: confirmed bulsu, pending gold, cancelled grey.
- Click/drag an open slot (eligible roles, available facilities only) opens
  `AddReservationSheet` prefilled with the selected range.

## E. Module 4 — Reservation Engine & Conflict Prevention (NOW LIVE)

- Submit reservation request: `AddReservationSheet` inserts into
  `reservations` with `status: "pending"` (College Admin + Student Org Admin
  only, via `canReserveFacility`; Super Admins are read-only).
- Validation: purpose ≥ 5 chars, future slot, end > start, ≥ 30 min, within
  06:00–22:00, instant overlap check + live re-check at submit.
- Confirmation dialog precedes every insert; receipt modal follows with
  reservation ID, facility, date/time, purpose, and status.
- Conflict blocking: overlapping non-cancelled bookings are rejected both in
  the form and with a fresh query at submit time.
- Reservations tab (`/reservations`, linked in the sidebar): role-scoped
  one-liner list with status pills, search, and click-to-view details modal.
- Dashboard reads live `reservations` (counts, donut, trend, recent list).
- Still missing: cancel-own-booking button, approve/reject, check-in/no-show.

## F. Module 5 — Admin Management & Check-In Workflow

| Requirement | Status | Evidence |
|---|---|---|
| College-scoped admin panel | PARTIAL | College Admin facility list scoped (`Facilities.tsx:38`), reservations calendar has college filter stub (`ReservationsSchedule.tsx:359`) — but backed by dummy data |
| Approve / reject reservations | MISSING | Event modal (`ReservationsSchedule.tsx:793`) is view-only with `Close` button |
| Check-in verification + grace period | MISSING | No check-in field/flow; `reservations` table has no `checked_in_at` column |
| No-show revocation (free the slot) | MISSING | No status transition logic; no `update` calls |
| Global usage logs (Super Admin) | MISSING | No logs table/page; sidebar has no such link |

## G. DB Table Coverage

| Table | Used? | How |
|---|---|---|
| `profiles` | READ + INSERT live | register insert, `getCurrentUserProfile` select with college join |
| `colleges` | READ + INSERT live | list + AddCollegeSheet |
| `facilities` | READ + INSERT live | public + auth lists, AddFacilitySheet |
| `reservations` | READ + INSERT live | submit flow, both calendars, Reservations tab, dashboard |

## H. Broken / Dead Links to Fix Before UAT

1. Sidebar `/reservations`, `/settings`, `/help` — no routes (`AppSidebar.tsx:41-80`).
2. Login `Forgot password?` → `/forgot-password` — no route (`Login.tsx:187`).
3. `AddFacilitySheet.tsx:184` option typo `Laboratoriy` will pollute `facilities.type` filter.
4. Public calendar ignores actual `facility_id` — header uses `?name=&location=` query params only.

## I. Suggested Next Build Order (to match original spec)

1. Wire both calendars to `reservations` (filter by `facility_id + status`), keep color legend.
2. Build reservation submit form on date-select + overlap check before insert.
3. Replace Dashboard dummies with `reservations` queries (upcoming/history/counts) + cancel.
4. Add approve/reject + check-in/no-show transitions (may need `checked_in_at` column or status values `checked_in`, `no_show`).
5. Add college filter to public catalog; add QR code (e.g. `qrcode` lib → `/bulsu-facilities/{id}` URL).
6. Implement User Management (list `profiles`, assign role/college) + global logs if still required.
