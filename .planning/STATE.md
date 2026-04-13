---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 01 Complete — Ready for Phase 02
last_updated: "2026-04-13T00:00:00.000Z"
progress:
  total_phases: 10
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
  percent: 10
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-07)

**Core value:** Any user can open the app, find their rooms on the map, and understand what they're looking at
**Current focus:** Phase 02 — Payload Collections & CSV Import

## Current Status

- Initialization: ✓ Complete
- Research: Skipped
- Requirements: ✓ Complete (49 v1 requirements)
- Roadmap: ✓ Complete (10 phases, updated 2026-04-12)
- Phase 01: ✓ Complete (all 3 plans + post-plan access control hardening)

## Key Decisions Made

- **Tailwind 4** chosen (not v3) — `@import "tailwindcss"` syntax throughout
- **Server actions** for auth (not REST fetch to `/api/users/login`)
- **Homepage `/`** is the login page — no separate `/login` route
- **`/register`** is a separate page with password confirmation
- **KST** (Kostenstelle) is the cost center field on Users — controls room visibility; only for `user` and `power_user` roles; `admin` and `fm_user` have no KST; set manually by admin in Payload, not during registration
- **Roles**: admin | fm_user | power_user | user
  - `admin`: full Payload + frontend access; no KST
  - `fm_user`: frontend only; sees all rooms; no KST
  - `power_user`: frontend only; sees rooms where KST prefix (first 2 digits) matches
  - `user`: frontend only; sees rooms where KST exactly matches
- **`src/middleware.ts`** active — protects `/flaechen/:path*`; homepage self-manages auth via SSR
- **Admin panel** access: wired via `access.admin` on Users collection (NOT `payload.config.ts admin.access` — that API does not exist in Payload 3.x)
- **Users collection access model** (final, hardened):
  - `access.admin`: inline boolean lambda (Payload panel access must be boolean, incompatible with `Access` type)
  - `read`: unauthenticated=denied, admin=all, others=own record only (Where clause)
  - `create`: public (self-registration); field-level guards strip role/KST from request
  - `update`: admin=all, authenticated=own record only; role/KST locked at field level
  - `delete`: admin only
  - `role` field: `access.create` + `access.update` = adminOnly (FieldAccess)
  - `KST` field: `access.create` + `access.update` = adminOnly (FieldAccess)
- **Two access helpers** in `src/collections/access/`:
  - `admin.ts` — `Access` type (can return Where); used for collection CRUD ops
  - `adminOnly` — `FieldAccess` type (boolean only); local to Users.ts for field-level ops
  - These are NOT redundant — Payload enforces different types for collection vs field access
- **User management UI**: will be built on the frontend (admin-only), not relying on Payload admin

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation & Portal | ✓ Complete |
| 2 | Collections & Import | ○ Pending |
| 3 | Roles & Permissions | ○ Pending |
| 4 | Map Rendering | ○ Pending |
| 5 | Zoom & Pan | ○ Pending |
| 6 | Room Interaction | ○ Pending |
| 7 | Search & Filter | ○ Pending |
| 8 | Category Coloring & Legend | ○ Pending |
| 9 | Split View | ○ Pending |
| 10 | Print to PDF | ○ Pending |

## What's Been Built (Phase 1)

**Plan 01 (done):** Tailwind 4, shadcn/ui, frontend layout, /flaechen placeholder
**Plan 02 (done):** Login/logout/register server actions, Users collection (4 roles + KST), access/admin.ts
**Plan 03 (done):** src/middleware.ts (route protection), PortalView component, homepage as auth-gate, admin panel restricted via Users collection access.admin
**Post-plan hardening:** Users collection access control corrected — read restricted to own record, update allows self-edit, role/KST locked to admin via FieldAccess

## What's Next

**Phase 02:** RoomGeometry + RoomData collections in Payload, CSV import endpoints, seed script for rooms.json

## Session Continuity

Last session: 2026-04-13
Stopped at: Phase 01 complete. Users collection access hardened. Ready to plan Phase 02.

---
*Last updated: 2026-04-13 — Phase 01 fully complete including access control hardening*
