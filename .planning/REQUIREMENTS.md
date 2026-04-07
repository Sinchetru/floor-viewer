# Requirements: Campus Platform (Floor Viewer — v1 Module)

**Defined:** 2026-04-07
**Core Value:** Any user can open the app, find their rooms on the map, and understand what they're looking at

## v1 Requirements

### Portal / Landing Page

- [ ] **PORT-01**: After login, user lands on a portal page showing module tiles (Kacheln)
- [ ] **PORT-02**: v1 includes one tile: "Flächenmanagement" — clicking it opens the floor viewer
- [ ] **PORT-03**: All logged-in roles see the Flächenmanagement tile
- [ ] **PORT-04**: Tile visibility is role-driven — future modules can be restricted per role
- [ ] **PORT-05**: Portal is designed to accommodate additional module tiles without layout changes

### Data Model

- [ ] **DATA-01**: RoomGeometry collection stores room_id, path_data (SVG d attribute), building, floor
- [ ] **DATA-02**: RoomData collection stores room_id and all room attributes (type, area, cost_center, din277, etc.)
- [ ] **DATA-03**: Collections are joined at query time on room_id
- [ ] **DATA-04**: Admin can import RoomGeometry from CSV/Excel via Payload admin
- [ ] **DATA-05**: Admin can import RoomData from CSV/Excel via Payload admin

### Authentication & Roles

- [ ] **AUTH-01**: Users can log in with email and password
- [ ] **AUTH-02**: User record includes role (admin, fm, power_user, user) and cost_center
- [ ] **AUTH-03**: Admin role has access to Payload admin panel
- [ ] **AUTH-04**: FM role sees all rooms, no Payload admin access
- [ ] **AUTH-05**: Power User sees rooms where cost_center starts with first 2 digits of their own cost_center
- [ ] **AUTH-06**: User sees only rooms matching their exact cost_center
- [ ] **AUTH-07**: Out-of-scope rooms are returned from API but flagged — rendered gray with no tooltip or interaction

### Map Rendering

- [ ] **MAP-01**: Floor plan polygons are rendered as SVG paths from DB data (no static SVG asset files)
- [ ] **MAP-02**: Campus view renders all buildings simultaneously
- [ ] **MAP-03**: User can select building and floor to navigate the map
- [ ] **MAP-04**: Zoom in/out via mouse wheel and +/- buttons
- [ ] **MAP-05**: Pan map via drag (pan mode) or mouse drag
- [ ] **MAP-06**: Zoom/pan reset button restores default view
- [ ] **MAP-07**: Zoom level percentage display

### Room Interaction

- [ ] **INT-01**: Hover tooltip shows room details (room_id, type, area, cost_center, etc.)
- [ ] **INT-02**: Click to select/highlight a room
- [ ] **INT-03**: No tooltip or interaction on out-of-scope rooms (gray rendering)

### Search & Filter

- [ ] **SRCH-01**: Search room by ID — highlights matching room on map and navigates to its floor
- [ ] **SRCH-02**: Result counter shows number of matches
- [ ] **FILT-01**: Filter rooms by floor
- [ ] **FILT-02**: Filter rooms by room_type
- [ ] **FILT-03**: Filtered-out rooms are muted/dimmed on map
- [ ] **FILT-04**: Each filter group has a reset button

### Category Coloring

- [ ] **COLOR-01**: Toggle switch activates/deactivates category color mode
- [ ] **COLOR-02**: When active, user picks which field to color by (room_type, floor, cost_center, etc.)
- [ ] **COLOR-03**: Each unique value of the selected field is auto-assigned a color from a fixed palette
- [ ] **COLOR-04**: Color assignments persist when switching floors within a session
- [ ] **COLOR-05**: Legend panel shows each unique value with its color swatch (visible only when category mode is active)
- [ ] **COLOR-06**: Right-click a legend item opens a color picker popup
- [ ] **COLOR-07**: Color picker shows 50 standard swatches + recently used colors
- [ ] **COLOR-08**: Picked color overrides the auto-assigned palette color for that value
- [ ] **COLOR-09**: When category mode is off, default coloring is applied (in-scope = light blue, out-of-scope = light gray)

### Legend

- [ ] **LEG-01**: A persistent legend panel is always visible on the map, showing the current color scheme
- [ ] **LEG-02**: When category mode is off, legend shows the default colors (in-scope light blue, out-of-scope light gray)
- [ ] **LEG-03**: When category mode is on, legend shows each unique value of the selected field with its assigned color

### Print / Export

- [ ] **PRINT-01**: User can export the current map view to PDF
- [ ] **PRINT-02**: PDF export includes the visible floor plan, legend, and active filter state
- [ ] **PRINT-03**: In split view, both panels are included in the PDF export

### Split View

- [ ] **SPLIT-01**: User can activate a split view showing two panels side by side
- [ ] **SPLIT-02**: Each panel has independent building, floor, and filter selection
- [ ] **SPLIT-03**: Both panels share the same global category color scheme

### Admin

- [ ] **ADMIN-01**: Payload admin panel accessible only to admin role
- [ ] **ADMIN-02**: Admin can create, edit, and delete user accounts with role and cost_center
- [ ] **ADMIN-03**: Admin can trigger CSV/Excel import for RoomGeometry and RoomData

## v2 Requirements

### Enhanced Features

- **V2-01**: Keyboard navigation on the map
- **V2-02**: Exportable floor plan view (PNG/PDF) — moved to v1 as PRINT-01–03
- **V2-03**: Room booking or reservation overlay
- **V2-04**: Notifications when room data is updated

### View State Export / Import

- **V2-05**: User can export the current view state (active filters, category field, color assignments) to a file
- **V2-06**: User can import a previously exported view state file to restore filters and colors exactly

### Custom Categories & Project Views

- **V2-07**: User can create a named custom category (e.g. "Blocked Rooms") with a list of labeled values (e.g. "blocked", "free"), each assigned a color
- **V2-08**: User can add, rename, or remove values within a custom category
- **V2-09**: User can assign any room to a value within a custom category (e.g. mark room 16.11.00.018 as "blocked")
- **V2-10**: Custom category can be activated in category mode just like a built-in field — rooms colored by their assigned value
- **V2-11**: User can save a named project view combining a custom category + active floor/filter state
- **V2-12**: Project views persist across sessions and can be updated
- **V2-13**: User can share a project view via a shareable link — recipient sees the plan read-only with the saved state

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Web-first; mobile layout deferred |
| OAuth / SSO | Email+password sufficient for v1 |
| CAD/BIM direct import | Geometry comes from Excel/CSV, not CAD files |
| Real-time collaboration | Not needed |
| Multi-language UI | UI is German only for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PORT-01–05 | Phase 1 | Pending |
| DATA-01–05 | Phase 2 | Pending |
| AUTH-01–07 | Phase 3 | Pending |
| ADMIN-01–03 | Phase 3 | Pending |
| MAP-01–07 | Phase 4 | Pending |
| INT-01–03 | Phase 5 | Pending |
| SRCH-01–02, FILT-01–04 | Phase 5 | Pending |
| COLOR-01–09 | Phase 6 | Pending |
| LEG-01–03 | Phase 6 | Pending |
| SPLIT-01–03 | Phase 7 | Pending |
| PRINT-01–03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-07*
*Last updated: 2026-04-07 after adding Portal, Legend, and Print/Export*
