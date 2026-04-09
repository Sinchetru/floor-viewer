# Roadmap: Campus Platform

**Created:** 2026-04-07
**Granularity:** Fine (8-12 phases)
**Model:** Next.js (App Router) + Payload CMS 3.x + SQLite + Tailwind CSS + pnpm

---

## Phase 1: Project Foundation & Portal

**Goal:** App runs, user can log in, and lands on a portal page with the Flächenmanagement tile.

**Why first:** Every other phase builds on top of this shell. Auth and routing must exist before anything else.

**Requirements:** PORT-01–05, AUTH-01 (login only)

**Plans:**
1. Configure Next.js App Router structure — root layout, `/login`, `/portal` routes
2. Build login page UI with email/password form (Tailwind, German labels)
3. Wire Payload auth — session handling, protected routes, redirect logic
4. Build portal landing page with tile grid layout
5. Build Flächenmanagement tile — navigates to `/flaechen` on click
6. Ensure tile grid is extensible (adding new tiles requires no layout changes)

**Done when:** Unauthenticated users are redirected to login. After login, portal shows the Flächenmanagement tile. Clicking it navigates to the floor viewer route.

---

## Phase 2: Payload Collections & CSV Import

**Goal:** RoomGeometry and RoomData collections exist in Payload with working CSV/Excel import.

**Why here:** All map rendering and room data depends on these collections. Must exist before any map work.

**Requirements:** DATA-01–05

**Plans:**
1. Define RoomGeometry collection in Payload (room_id, path_data, building, floor)
2. Define RoomData collection in Payload (all room attribute fields)
3. Build CSV import endpoint for RoomGeometry — parse, validate, upsert on room_id
4. Build CSV import endpoint for RoomData — parse, validate, upsert on room_id
5. Wire import endpoints to Payload admin UI (upload button per collection)
6. Write seed script to load existing `rooms.json` data into RoomData for development

**Done when:** Admin can upload a CSV in Payload and rows appear in the collection. Seed script populates dev database from the existing JSON file.

---

## Phase 3: Roles, Permissions & User Management

**Goal:** Four roles enforced. Users see only what their cost center allows. Admin manages users in Payload.

**Why here:** Visibility scoping must be built into the API layer before any UI queries data.

**Requirements:** AUTH-02–07, ADMIN-01–03

**Plans:**
1. Add role and cost_center fields to Payload Users collection
2. Implement API visibility logic — RoomData query returns all rooms, flagged `visible: true/false` based on caller's role and cost_center
3. Enforce Admin-only access to Payload admin panel
4. FM role: full visibility, no Payload access
5. Power User role: visibility where cost_center starts with first 2 digits of user's cost_center
6. User role: visibility for exact cost_center match only
7. Admin UI: create/edit/delete users with role and cost_center fields

**Done when:** Each role sees the correct subset of rooms as `visible: true`. Out-of-scope rooms are returned but flagged. Payload admin is blocked for non-admin roles.

---

## Phase 4: Map Rendering Engine

**Goal:** Floor plan polygons render on screen from database path data. No static SVG files.

**Why here:** Core visual feature. Everything interactive builds on top of this renderer.

**Requirements:** MAP-01–03

**Plans:**
1. Create `/api/rooms/geometry` endpoint — returns RoomGeometry rows for a given building+floor
2. Build SVG renderer component — renders `<path>` elements from path_data with room_id as element ID
3. Fetch and render all buildings for campus-wide view
4. Building + floor selector UI (dropdowns, populates from available data in DB)
5. Apply default room fill colors: in-scope = light blue, out-of-scope = light gray
6. Verify polygon accuracy against original SVG assets

**Done when:** Selecting a building and floor renders correct room polygons on screen, colored by scope. Campus view shows all buildings simultaneously.

---

## Phase 5: Zoom, Pan & Map Controls

**Goal:** User can navigate the map fluidly — zoom, pan, reset.

**Why separate phase:** Navigation UX is complex enough to deserve focused attention without mixing in interaction logic.

**Requirements:** MAP-04–07

**Plans:**
1. Implement mouse wheel zoom centered on cursor position
2. Implement zoom in/out buttons with configurable step
3. Implement pan via mouse drag (pan mode)
4. Implement select mode vs pan mode toggle (cursor changes per mode)
5. Reset button restores default scale and translate
6. Zoom percentage display updates in real time

**Done when:** User can zoom from 50% to 500%, pan freely, and reset to 100%. Mode toggle switches between select and pan cursor.

---

## Phase 6: Room Interaction & Tooltip

**Goal:** Hovering a room shows a tooltip with its data. Clicking highlights it. Out-of-scope rooms are inert.

**Requirements:** INT-01–03

**Plans:**
1. Fetch and join RoomData to rendered polygons by room_id (client-side map)
2. Hover tooltip — position relative to cursor, show room_id, type, area, cost_center
3. Click to select — highlight selected room, deselect on second click or outside click
4. Disable hover and click on out-of-scope rooms (visible: false)
5. Tooltip hides on pan start

**Done when:** Hovering an in-scope room shows correct data. Clicking highlights it. Out-of-scope rooms show no tooltip and cannot be selected.

---

## Phase 7: Search & Filter

**Goal:** User can find a room by ID and filter the map by floor and room type.

**Requirements:** SRCH-01–02, FILT-01–04

**Plans:**
1. Room search input — matches room_id substring, highlights matching room on map, navigates to its floor
2. Search result counter
3. Filter UI — floor filter with multi-select dropdown and reset button
4. Filter UI — room_type filter with multi-select dropdown and reset button
5. Filtered-out rooms dimmed/muted on map (not hidden, just visually de-emphasized)
6. Filter state persists when switching floors within a session

**Done when:** Searching for a room ID highlights it on the correct floor. Activating filters mutes non-matching rooms. Reset clears filters.

---

## Phase 8: Category Coloring & Legend

**Goal:** User can color rooms by any attribute field using the full palette+picker system from the prototype.

**Requirements:** COLOR-01–09, LEG-01–03

**Plans:**
1. Category mode toggle switch — activates/deactivates color mode, toggles default fill
2. Category field selector — dropdown of all colorable room fields (excludes numeric/date fields)
3. Auto-assign colors from CATEGORY_PALETTE per unique value of selected field
4. Color assignments persist across floor switches within a session
5. Legend panel — shows each unique value with its color swatch (visible when category mode is on)
6. Persistent legend panel — shows default color scheme (in-scope/out-of-scope) when category mode is off
7. Right-click legend item opens color picker popup
8. Color picker popup — 50 standard swatches + recently used colors (max 10)
9. Picked color overrides palette color for that value, re-renders map

**Done when:** Toggle activates coloring. Switching fields re-colors map. Right-clicking a legend entry and picking a color updates that value across all visible rooms. Legend reflects current state at all times.

---

## Phase 9: Split View

**Goal:** Two floor plan panels side by side, each independently navigable, sharing one color scheme.

**Requirements:** SPLIT-01–03

**Plans:**
1. Split view toggle — splits the map area into two equal panels
2. Each panel has its own building/floor selectors and filter state
3. Each panel renders its own polygon set independently
4. Both panels use the same global category color scheme (same field, same color assignments)
5. Legend is shared and reflects the common color scheme

**Done when:** Activating split view shows two panels. Changing floor in panel A does not affect panel B. Both panels use identical colors for matching room values.

---

## Phase 10: Print to PDF

**Goal:** User can export the current map view (or both split panels) to a PDF including legend and filter state.

**Requirements:** PRINT-01–03

**Plans:**
1. Print button triggers browser print with print-optimized CSS layout
2. Print view includes current floor plan, active legend, and visible filter chips
3. In split view, both panels are laid out side by side in the print output
4. Suppress UI chrome (controls, sidebar) from print output
5. Test PDF output in Chrome and Firefox

**Done when:** Clicking Print generates a PDF that shows the floor plan(s) as rendered, with legend and filter state visible. UI controls are not in the output.

---

## Milestone Summary

| Phase | Name | Requirements | Key Output |
|-------|------|--------------|------------|
| 1 | Foundation & Portal | PORT-01–05 | Login + portal with tile |
| 2 | Collections & Import | DATA-01–05 | Payload collections + CSV import |
| 3 | Roles & Permissions | AUTH-02–07, ADMIN-01–03 | Role-based visibility enforced |
| 4 | Map Rendering | MAP-01–03 | Polygons on screen from DB |
| 5 | Zoom & Pan | MAP-04–07 | Full map navigation |
| 6 | Room Interaction | INT-01–03 | Tooltip + click highlight |
| 7 | Search & Filter | SRCH-01–02, FILT-01–04 | Find and filter rooms |
| 8 | Category Coloring | COLOR-01–09, LEG-01–03 | Full color mode + legend |
| 9 | Split View | SPLIT-01–03 | Dual panel view |
| 10 | Print to PDF | PRINT-01–03 | PDF export |

**Total v1 requirements covered:** 49 / 49 ✓

---

## Learning Notes

Each phase will be explained as it is built. Key concepts introduced per phase:

- **Phase 1**: Next.js App Router, layouts, route protection, Payload auth
- **Phase 2**: Payload collections, field types, custom endpoints, CSV parsing
- **Phase 3**: Payload access control, role-based middleware, JWT claims
- **Phase 4**: SVG rendering in React, data fetching patterns, API routes
- **Phase 5**: React event handling, transform state, mouse/wheel events
- **Phase 6**: React component composition, join patterns, conditional rendering
- **Phase 7**: Controlled inputs, filter state management, derived UI state
- **Phase 8**: Complex state with Maps, color algorithms, portal/popup patterns
- **Phase 9**: Layout splitting, shared state between sibling components
- **Phase 10**: CSS print media queries, layout for print

---
*Created: 2026-04-07*
