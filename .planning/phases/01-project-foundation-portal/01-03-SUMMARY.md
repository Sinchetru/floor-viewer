---
phase: 01-project-foundation-portal
plan: 03
subsystem: auth-routing
tags: [middleware, portal, access-control, payload]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [route-protection, portal-ui, admin-access-control]
  affects: [src/middleware.ts, src/app/(frontend)/page.tsx, src/components/PortalView.tsx, src/collections/Users.ts]
tech_stack:
  added: []
  patterns: [Next.js middleware, SSR auth-gate, Payload collection access.admin]
key_files:
  created:
    - src/middleware.ts
    - src/components/PortalView.tsx
  modified:
    - src/app/(frontend)/page.tsx
    - src/collections/Users.ts
  deleted:
    - src/proxy.ts
    - src/components/HelloUser.tsx
decisions:
  - "access.admin on Users collection (not payload.config.ts admin.access) is the correct Payload 3.x API for admin panel access control"
  - "Middleware matcher covers only /flaechen/:path* — homepage self-manages auth state via SSR payload.auth()"
metrics:
  duration: ~15 minutes
  completed: 2026-04-12
---

# Phase 01 Plan 03: Middleware, Portal UI, and Admin Access Control Summary

One-liner: Next.js middleware protecting /flaechen, PortalView portal UI with top-nav logout, and Payload admin panel restricted to admin role via Users collection access.admin.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create src/middleware.ts — replace proxy.ts | ef3b381 | src/middleware.ts (created), src/proxy.ts (deleted) |
| 2 | Rebuild homepage — login form OR portal | ba67ec9 | src/app/(frontend)/page.tsx, src/components/PortalView.tsx (created), src/components/HelloUser.tsx (deleted) |
| 3 | Restrict Payload admin panel to admin role | cca206c | src/collections/Users.ts |

## What Was Built

**Task 1 — middleware.ts**
`src/proxy.ts` had a wrong export name (`proxy` instead of `middleware`) so Next.js never activated it. Created `src/middleware.ts` with the required `export function middleware` name and the same cookie-check logic. Matcher: `/flaechen/:path*` only.

**Task 2 — PortalView + homepage rebuild**
Homepage (`/`) now uses SSR `payload.auth()` to branch: unauthenticated → centered LoginForm; authenticated → full-page PortalView. PortalView is a `'use client'` component with a top nav bar (Campus Platform left, email + Abmelden button right) and a tile grid. The Flächenmanagement tile links to `/flaechen`. HelloUser.tsx removed.

**Task 3 — Admin panel access control**
Payload 3.x exposes `access.admin` on collection configs (not `admin.access` on `buildConfig`). Added `admin: ({ req: { user } }) => user?.role === 'admin'` to the Users collection access block. Non-admin authenticated users hitting `/admin` will see Payload's built-in unauthorized screen.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] payload.config.ts admin.access does not exist in Payload 3.x**
- **Found during:** Task 3
- **Issue:** Plan specified `admin.access: admin` in `buildConfig()`, but the Payload 3.x `Config.admin` type does not include an `access` property. TypeScript error 2353: "does not exist in type".
- **Fix:** Removed the invalid property from payload.config.ts. Used the correct Payload 3.x API: `access.admin` on the Users collection config, which controls who can log into the admin panel.
- **Files modified:** src/collections/Users.ts, src/payload.config.ts (reverted)
- **Commits:** cca206c

## Known Stubs

None — all components render real data (user.email from SSR auth, real logout action).

## Threat Flags

No new threat surface introduced beyond what was in the plan's threat model. All three mitigations (T-03-01, T-03-02, T-03-03) are implemented.

## Self-Check: PASSED
