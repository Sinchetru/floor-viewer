---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 02 Complete — Ready for Phase 03
last_updated: "2026-04-16T00:00:00.000Z"
progress:
  total_phases: 10
  completed_phases: 2
  total_plans: 7
  completed_plans: 7
  percent: 20
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-07)

**Core value:** Any user can open the app, find their rooms on the map, and understand what they're looking at
**Current focus:** Phase 03 — Roles, Permissions & User Management

## Current Status

- Initialization: ✓ Complete
- Research: Skipped
- Requirements: ✓ Complete (49 v1 requirements)
- Roadmap: ✓ Complete (10 phases, updated 2026-04-12)
- Phase 01: ✓ Complete (all 3 plans + post-plan access control hardening)
- Phase 02: ✓ Complete (4 plans — collections, CSV import API, admin UI button, seed CSVs)

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
- **Phase 02 decisions:**
  - RoomGeometry (slug: room-geometry) and RoomData (slug: room-data) — admin-only access, upsert on room_id
  - CSV import via custom Next.js API routes (not Payload's built-in REST) — German header mapping via papaparse
  - Upload button injected via `beforeListTable` in Payload admin — inline styles required (Payload admin CSS overrides Tailwind)
  - Seed script dropped — manual CSV upload via admin UI is sufficient; seed CSVs in `data/`
  - Windows browsers send CSV as `application/vnd.ms-excel` — MIME check broadened with `.csv` extension fallback
  - shadcn Luma preset applied (Neutral/Inter theme)

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation & Portal | ✓ Complete |
| 2 | Collections & Import | ✓ Complete |
| 3 | Roles & Permissions | ○ Pending |
| 4 | Map Rendering | ○ Pending |
| 5 | Zoom & Pan | ○ Pending |
| 6 | Room Interaction | ○ Pending |
| 7 | Search & Filter | ○ Pending |
| 8 | Category Coloring & Legend | ○ Pending |
| 9 | Split View | ○ Pending |
| 10 | Print to PDF | ○ Pending |

## What's Been Built

**Phase 01:**
- Plan 01: Tailwind 4, shadcn/ui, frontend layout, /flaechen placeholder
- Plan 02: Login/logout/register server actions, Users collection (4 roles + KST), access/admin.ts
- Plan 03: src/middleware.ts (route protection), PortalView component, homepage as auth-gate, admin panel restricted via Users collection access.admin
- Post-plan hardening: Users collection access control corrected

**Phase 02:**
- Plan 01: RoomGeometry + RoomData collections, migration, types regenerated
- Plan 02: CSV import API routes (/api/import/room-geometry, /api/import/room-data) with papaparse, German header mapping, upsert logic
- Plan 03: CsvImportButton component, beforeListTable injection in Payload admin
- Plan 04: seed-geometry.csv and seed-roomdata.csv (5 rooms each) in data/

## What's Next

**Phase 03:** Four roles enforced. Users see only what their KST allows. Admin manages users from the frontend.

## Session Continuity

Last session: 2026-04-16
Stopped at: Phase 02 complete. All 4 plans done, committed, pushed. Ready to plan Phase 03.

---
*Last updated: 2026-04-16 — Phase 02 fully complete*
