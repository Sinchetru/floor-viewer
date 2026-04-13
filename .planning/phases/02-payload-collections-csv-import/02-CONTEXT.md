# Phase 2: Payload Collections & CSV Import - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Define the RoomGeometry and RoomData Payload collections. Build CSV import endpoints for both. Wire import UI into the Payload admin panel. Write a dev seed script that reads two small sample CSV files.

Does NOT include: KST-based visibility filtering (Phase 3), map rendering (Phase 4), any frontend UI beyond the Payload admin import button.

</domain>

<decisions>
## Implementation Decisions

### Seed data strategy
- **D-01:** Create two small sample seed files: `data/seed-geometry.csv` and `data/seed-roomdata.csv`
- **D-02:** `seed-geometry.csv` — hand-crafted rows with dummy `path_data` (simple rectangle-like SVG paths), realistic `room_id` format (`16.11.00.001`), correct `building` and `floor` values. A few rooms only — enough to test map rendering later.
- **D-03:** `seed-roomdata.csv` — a small slice of real rooms sampled from `rooms.json`, converted to CSV with German column headers
- **D-04:** Both files are designed to be replaced with real data — the seed script just reads these CSVs and upserts them. No hardcoded room data in the script itself.
- **D-05:** The prototype at `D:/Projects/do_yourself` is a design reference only — do NOT process its full SVG or JSON files

### CSV column naming
- **D-06:** Import CSV files use **German column headers** matching the facility management system export format
- **D-07:** RoomGeometry CSV columns: `Raum-ID`, `Pfaddaten`, `Gebäude`, `Ebene`
- **D-08:** RoomData CSV columns (German equivalents): `Raum-ID`, `Raumnummer`, `Raumtyp`, `Raumtyp-Code`, `Fläche`, `DIN277-Code`, `DIN277-Name`, `Kostenstelle`, `Kostenstellen-Name`, `Sondernutzung`, `Eigentümer`, `Standort`, `Raumnotiz`, `Nutzungsnotiz`, `Nutzung-von`, `Nutzung-bis`
- **D-09:** The import parser maps German headers → DB field names internally

### Upsert strategy
- **D-10:** Always upsert on `room_id` — existing records are overwritten with the incoming CSV row
- **D-11:** Each import is treated as the authoritative source for the rows it contains

### Import validation and error handling
- **D-12:** Skip invalid rows, continue import, report skipped rows at end
- **D-13:** A row is invalid if any of these required fields are missing: `Raum-ID`, `Kostenstelle`, `Fläche`
- **D-14:** Duplicate `room_id` within a single CSV — last row wins
- **D-15:** End-of-import summary shows: total rows processed, rows imported/updated, rows skipped with reason per row

### Import UI in Payload admin
- **D-16:** Each collection gets an upload button in the Payload admin panel — implemented as a Payload Custom Component (admin field or global, not an external API route)
- **D-17:** Claude's discretion: exact Payload Custom Component pattern (field upload component vs. admin custom view)

</decisions>

<specifics>
## Specific Ideas

- "Create your own two files that I will be able to replace in the future with the real ones" — seed files are placeholders, not generated from real data
- The rooms.json at `D:/Projects/do_yourself/data/rooms.json` shows the real field structure and naming — use it as a reference for field names only
- room_id format from real data: `16.11.00.018` (building.subbuilding.floor.number)
- German is the UI and data language throughout

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Data schema
- `.planning/PROJECT.md` — Authoritative data schema for both collections (RoomGeometry and RoomData tables, field names, types, notes)
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-05 (collection definitions, import requirements)

### Existing codebase
- `src/payload.config.ts` — Current Payload config; new collections must be registered here
- `src/collections/Users.ts` — Pattern to follow for collection definitions (access control structure, field types)
- `src/collections/access/admin.ts` — `Access` type helper for admin-only collection ops

### No external specs
No external design docs or ADRs. All requirements are captured in PROJECT.md, REQUIREMENTS.md, and decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Established patterns
- Collection definition pattern: `src/collections/Users.ts` — fields array, access object, admin config
- Admin-only access: `src/collections/access/admin.ts` exports `admin: Access` — reuse for both new collections
- Payload config registration: `src/payload.config.ts` `collections: [Users, Media]` — add RoomGeometry and RoomData here
- No CSV parsing library installed yet — will need to add (e.g., `papaparse` or `csv-parse`)

### Integration points
- `src/payload.config.ts` — register new collections
- `src/payload-types.ts` — regenerated automatically after collections added (`pnpm payload generate:types`)
- Payload admin UI — import button component added to each collection's admin view

</code_context>

<deferred>
## Deferred Ideas

- KST-based visibility filtering on RoomData queries — Phase 3
- Public API endpoint for room geometry/data — Phase 4 (map rendering needs it)
- Excel (.xlsx) import support — if needed, add in a later phase; Phase 2 targets CSV only

</deferred>

---

*Phase: 02-payload-collections-csv-import*
*Context gathered: 2026-04-13*
