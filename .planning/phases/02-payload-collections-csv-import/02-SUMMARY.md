---
phase: 02-payload-collections-csv-import
subsystem: data
tags: [payload, collections, sqlite, migrations, csv-import, admin-ui, papaparse]

requires:
  - phase: 01-03
    provides: "Users collection, admin access helper, Payload config baseline"
provides:
  - "RoomGeometry collection (slug: room-geometry) — room_id, path_data, building, floor"
  - "RoomData collection (slug: room-data) — 16 fields, all room attributes"
  - "Both collections admin-only, registered in payload.config.ts, SQLite tables migrated"
  - "POST /api/import/room-geometry — CSV upload, German header mapping, upsert on room_id"
  - "POST /api/import/room-data — CSV upload, stricter validation, partial field upsert"
  - "Upload button in Payload admin list view for each collection (beforeListTable injection)"
  - "data/seed-geometry.csv and data/seed-roomdata.csv — 5 rooms each, placeholder data"
affects: [data-layer, payload-config, admin-ui, api]

tech-stack:
  added:
    - "papaparse@5.5.3 — CSV parsing (handles BOM, quoted fields, UTF-8)"
    - "@types/papaparse — TypeScript types for papaparse"
  patterns:
    - "Data collections: admin-only access on all four ops via src/collections/access/admin.ts"
    - "room_id field: unique: true — enforced at DB level"
    - "path_data uses textarea type — SVG path strings can be very long"
    - "Non-room_id fields in RoomData not required — CSV import may have partial data"
    - "German CSV headers mapped internally via GEOMETRY_HEADER_MAP / ROOMDATA_HEADER_MAP"
    - "Upsert pattern: payload.find by room_id → payload.update or payload.create"
    - "Admin UI injection: beforeListTable renders component above collection table"
    - "Inline styles used in admin components — Payload admin CSS overrides Tailwind classes"
    - "File input triggered via useRef + onClick — avoids label/input nesting issues in Payload admin"

key-files:
  created:
    - src/collections/RoomGeometry.ts
    - src/collections/RoomData.ts
    - src/migrations/20260415_192300.ts
    - src/lib/csv-import.ts
    - src/app/api/import/room-geometry/route.ts
    - src/app/api/import/room-data/route.ts
    - src/components/CsvImportButton.tsx
    - src/components/RoomGeometryImport.tsx
    - src/components/RoomDataImport.tsx
    - data/seed-geometry.csv
    - data/seed-roomdata.csv
  modified:
    - src/payload.config.ts
    - src/payload-types.ts
    - src/lib/actions.ts
    - tests/helpers/seedUser.ts
    - src/app/(payload)/admin/importMap.js

key-decisions:
  - "Seed script dropped — manual CSV upload via admin UI is sufficient for dev seeding"
  - "beforeListTable chosen over beforeList — renders below search bar, above table (cleaner position)"
  - "MIME type check broadened to include application/vnd.ms-excel and application/octet-stream — Windows browsers send CSV with these types"
  - "as any cast on dynamic upsert data object — TypeScript cannot statically verify dynamically built record matches Payload's RequiredDataFromCollectionSlug"
  - "shadcn Luma preset applied (Neutral/Inter theme) during this phase"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05]

completed: 2026-04-15
---

# Phase 02 Summary

**RoomGeometry and RoomData collections built end-to-end: schema defined, migrated to SQLite, CSV import API routes working, upload button visible in Payload admin.**

## Plan 01 — Collections + Migration

RoomGeometry and RoomData collection files created following the Users.ts pattern. Both registered in `payload.config.ts`. Types regenerated, migration run — `room_geometry` and `room_data` tables created in SQLite.

**Deviation:** After `pnpm payload generate:types`, `payload.create` for the `users` collection started failing TypeScript — `RequiredDataFromCollectionSlug<"users">` enforces `role` as required (it has `required: true`). Fixed by adding `role: 'user'` to the data object in `src/lib/actions.ts` and `tests/helpers/seedUser.ts`. Field-level access control still blocks non-admins from setting the role at runtime.

**Key Payload 3.x finding:** Always include all `required: true` fields when calling `payload.create` via the local API, even if the field has a `defaultValue`. The generated type enforces it at the call site.

## Plan 02 — CSV Import API Routes

Two Next.js App Router POST handlers built at `/api/import/room-geometry` and `/api/import/room-data`. Shared utility `src/lib/csv-import.ts` handles German header mapping via papaparse and CSV injection sanitization.

**Deviation:** Windows browsers send CSV files with `application/vnd.ms-excel` or `application/octet-stream` MIME type instead of `text/csv` — MIME check broadened to accept all common CSV types plus `.csv` extension fallback.

**Deviation:** Dynamic upsert data object (built with spread operators) required `as any` cast — TypeScript cannot match `Record<string, unknown>` to `RequiredDataFromCollectionSlug<"room-data">` at the call site.

## Plan 03 — Admin UI Upload Button

`CsvImportButton` shared component added with wrapper components per collection (`RoomGeometryImport`, `RoomDataImport`). Injected via `beforeListTable` (renders between search/filter bar and the data table).

**Deviation:** `beforeList` injection placed the button above the page title — switched to `beforeListTable` for better visual placement. Payload's injection points do not support placing content next to the "Create New" button without overriding the entire list view.

**Deviation:** Tailwind's `hidden` class is overridden by Payload admin CSS — switched to `style={{ display: 'none' }}` inline style on the hidden file input. All container styling uses inline styles for the same reason. File input triggered via `useRef` + button `onClick` instead of `label` wrapping.

## Plan 04 — Seed Data

Two seed CSV files created in `data/` (5 rooms each, matching room_id format `16.11.00.001`). Seed script dropped — manual upload via the admin UI button is sufficient for development seeding and keeps the workflow simple.