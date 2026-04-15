---
phase: 02-payload-collections-csv-import
plan: 01
subsystem: data
tags: [payload, collections, sqlite, migrations, types]

requires:
  - phase: 01-03
    provides: "Users collection, admin access helper, Payload config baseline"
provides:
  - "RoomGeometry collection at src/collections/RoomGeometry.ts (slug: room-geometry)"
  - "RoomData collection at src/collections/RoomData.ts (slug: room-data)"
  - "Both collections registered in src/payload.config.ts"
  - "TypeScript types regenerated — RoomGeometry and RoomData exported from payload-types.ts"
  - "SQLite tables room_geometry and room_data created via migration"
affects: [data-layer, payload-config]

tech-stack:
  added: []
  patterns:
    - "Data collections use admin-only access on all four operations (read/create/update/delete)"
    - "room_id field: unique: true — enforced at DB level via Payload"
    - "path_data uses textarea type (not text) — SVG path strings can be very long"
    - "Non-room_id fields in RoomData are not required — CSV import may have partial data"

key-files:
  created:
    - src/collections/RoomGeometry.ts
    - src/collections/RoomData.ts
    - src/migrations/20260415_192300.ts
  modified:
    - src/payload.config.ts
    - src/payload-types.ts
    - src/lib/actions.ts
    - tests/helpers/seedUser.ts

key-decisions:
  - "All collection ops admin-only — reuses admin helper from src/collections/access/admin.ts"
  - "useAsTitle: room_id on both collections for readable Payload admin list view"
  - "Migration run with $env:CI='true'; npx payload migrate (PowerShell syntax)"

requirements-completed: [DATA-01, DATA-02]

duration: 45min
completed: 2026-04-15
---

# Phase 02, Plan 01 Summary

**RoomGeometry and RoomData collections defined, registered, migrated. SQLite tables exist. Types generated.**

## Deviations from Plan

- **`payload.create` type error after generate:types** — Regenerating types made `RequiredDataFromCollectionSlug<"users">` enforce `role` as a required field (it has `required: true` in the Users collection). Fixed by adding `role: 'user'` to the data object in `src/lib/actions.ts` and `tests/helpers/seedUser.ts`. Field-level access control still blocks non-admins from actually setting the role value.

## Key Payload 3.x Finding

After running `pnpm payload generate:types`, the `payload.create` call for the `users` collection started failing TypeScript because `role` is `required: true` — the generated type `RequiredDataFromCollectionSlug<"users">` enforces it at the call site. Always include all `required: true` fields when calling `payload.create` via the local API, even if the field has a `defaultValue` and field-level access control will override it at runtime.