# Campus Platform

## What This Is

A modular web platform for campus facility management. Users log in to a portal and access modules via tiles. The first module — Flächenmanagement — is an interactive floor plan viewer where room polygons are rendered dynamically from a database, users can search and filter rooms, color them by any attribute category, and compare two buildings side by side. Access to room data and interactions is scoped by user role and cost center. New modules can be added to the portal over time.

## Core Value

Any user can open the app, find their rooms on the map, and understand what they're looking at — without needing a GIS tool or a static PDF.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Render floor plan polygons from SVG path data stored in the database (no static SVG assets)
- [ ] Two Payload collections: RoomGeometry (annual) and RoomData (monthly), joined on room_id
- [ ] Import room geometry and room data from Excel/CSV files via Payload admin
- [ ] Campus-wide view: all buildings rendered from a single map
- [ ] Split view: two independent panels side by side, each with their own floor/filter selection, sharing a global color scheme
- [ ] Category coloring: toggle switch → pick field → auto-assign palette colors per unique value → right-click legend item to override color via color picker popup
- [ ] Room search by ID with highlight on map
- [ ] Filter rooms by floor, room type, and other attributes
- [ ] Hover tooltip showing room details
- [ ] Zoom and pan controls (mouse wheel + buttons)
- [ ] Role-based access: Admin, FM, Power User, User
- [ ] Rooms outside a user's cost center scope rendered gray with no tooltip or interaction
- [ ] Public viewer + Payload admin interface

### Out of Scope

- Mobile app — web-first
- Real-time collaboration — not needed
- CAD/BIM import — geometry comes from Excel/CSV exports
- OAuth/SSO — email+password sufficient for v1

## Data Schema

### RoomGeometry collection (updated ~annually via CSV/Excel import)
| Field | Type | Notes |
|-------|------|-------|
| room_id | text, unique | Join key — e.g. `16.11.00.018` |
| path_data | text | SVG `d` attribute string |
| building | text | e.g. `1611` |
| floor | text | e.g. `00`, `01`, `02`, `U1` |

### RoomData collection (updated ~monthly via CSV/Excel import)
| Field | Type | Notes |
|-------|------|-------|
| room_id | text, unique | Join key |
| room_number | text | |
| room_type | text | |
| room_type_code | text | |
| area_sqm | number | |
| din277_code | text | |
| din277_name | text | |
| cost_center | text | Used for visibility scoping |
| cost_center_name | text | |
| special_use | text | |
| owner | text | |
| location | text | |
| room_note | text | |
| usage_note | text | |
| usage_from | date | |
| usage_to | date | |

### Users collection
| Field | Type | Notes |
|-------|------|-------|
| email | text | |
| password | hashed | |
| role | enum | admin \| fm \| power_user \| user |
| cost_center | text | Determines visibility scope |

### Visibility rules
- **Admin**: Full Payload access + sees all rooms fully colored and interactive
- **FM**: Sees all rooms fully colored and interactive, no Payload admin access
- **Power User**: Sees rooms where `cost_center` starts with first 2 digits of their own cost center; other rooms rendered gray, no tooltip or interaction
- **User**: Sees only rooms matching their exact `cost_center`; others gray

Visibility enforced at API level. Gray rendering is the UI signal for out-of-scope rooms.

## Context

- Existing HTML/CSS/JS prototype at `D:/Projects/do_yourself` demonstrates the full interaction model: SVG floor plan viewer, room search, filter dropdowns, category color mode with palette and color picker popup, zoom/pan
- Existing app loads geometry from static SVG files and data from `rooms.json` — the new app replaces both with DB-backed collections
- Color system to replicate: toggle activates category mode → field select → auto-assign from `CATEGORY_PALETTE` → right-click legend item → color picker popup with 50 standard swatches + recent colors
- Room data is in German (Ebene, Raumtyp, Kostenstelle, etc.) — UI language is German
- Data is institutional/campus (university or similar)

## Constraints

- **Tech stack**: Next.js (App Router) + Payload CMS 3.x + Node.js + Tailwind CSS + pnpm
- **Database**: SQLite for development (already configured), migrate to Postgres for production
- **Package manager**: pnpm
- **Learning context**: Developer is learning Next.js and Payload — each phase should be explained as it's built

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Polygon rendering from DB instead of static SVG files | Enables dynamic campus view, per-room toggle, split view with independent state | — Pending |
| Two separate collections (Geometry + Data) with different update frequencies | Matches real-world data lifecycle — geometry rarely changes, room attributes change monthly | — Pending |
| Payload CMS for admin/import | Provides ready-made admin UI, auth, and collection management without building from scratch | — Pending |
| Role-based gray rendering at API + UI level | Allows all polygons to be sent to client but interaction disabled for out-of-scope rooms | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after initialization*
