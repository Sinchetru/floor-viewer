---
phase: 01-project-foundation-portal
plan: 02
subsystem: auth
tags: [payload, server-actions, authentication, users, roles]

requires:
  - phase: 01-01
    provides: "shadcn components and Tailwind 4 base"
provides:
  - "Server actions: login, logout, register in src/lib/actions.ts"
  - "Homepage (/) as SSR auth gate — shows LoginForm or HelloUser"
  - "Register page at /register with password confirmation"
  - "Users collection with 4 roles + KST field"
  - "Admin access control function at src/collections/access/admin.ts"
  - "Proxy route protection skeleton at src/proxy.ts (not yet active)"
affects: [portal, user-management, roles-permissions]

tech-stack:
  added: []
  patterns:
    - "Server actions for auth: 'use server' functions in src/lib/actions.ts"
    - "payload.auth({ headers }) for SSR user check in Server Components"
    - "payload.login() sets token, manually written to cookie store"
    - "Payload singleton: src/lib/db.ts exports await getPayload({ config })"

key-files:
  created:
    - src/lib/actions.ts
    - src/components/LoginForm.tsx
    - src/components/HelloUser.tsx
    - src/app/(frontend)/register/page.tsx
    - src/collections/access/admin.ts
    - src/proxy.ts
  modified:
    - src/app/(frontend)/page.tsx
    - src/collections/Users.ts

key-decisions:
  - "Server actions chosen over fetch to /api/users/login — avoids CORS, token handled server-side"
  - "Login embedded in homepage (/) not a separate /login route"
  - "Homepage uses SSR payload.auth() to decide what to render (LoginForm vs HelloUser)"
  - "Users collection: roles = admin | fm_user | power_user | user; KST field required"
  - "Access (initial): read=public, create=public, update/delete=admin — CORRECTED post-plan (see amendment below)"
  - "proxy.ts created as route protection logic but NOT yet wired as Next.js middleware"

patterns-established:
  - "Auth pattern: payload.auth({ headers: await headers() }) in Server Components"
  - "Cookie pattern: payload.login() returns token; written manually to cookieStore"
  - "Server action error: throw Error with German message, caught by client useState"

requirements-completed: [AUTH-01]

duration: 60min
completed: 2026-04-12
---

# Phase 01, Plan 02 Summary

**Server action auth (login/logout/register) working; Users collection with roles and KST; homepage is the SSR auth gate.**

## Deviations from Plan

- **Server actions instead of fetch**: Plan specified `fetch('/api/users/login', { credentials: 'include' })`. Implemented as `'use server'` actions — cleaner, no CORS, token managed server-side.
- **No separate /login route**: Login form is embedded in the homepage. Register has its own page at `/register`.
- **proxy.ts not middleware**: Route protection logic exists in `src/proxy.ts` but is named `proxy()` not `middleware()` — Next.js does not pick it up automatically. `/flaechen` is currently unprotected.

## Outstanding for Plan 03

- Rename/rewire proxy.ts → src/middleware.ts with correct export
- Create /portal page
- Restrict Payload /admin to admin role only via middleware

## Amendment — 2026-04-13: Access Control Hardening

Initial access model was insecure. Corrected in `src/collections/Users.ts`:

| Operation | Before | After |
|---|---|---|
| `read` | `() => true` (public) | Unauthenticated=denied, admin=all, others=own record (Where clause) |
| `update` | `admin` only | Admin=all, authenticated=own record; unauthenticated=denied |
| `role` field | No guard | `access.create` + `access.update` = adminOnly (FieldAccess, boolean) |
| `KST` field | No guard | `access.create` + `access.update` = adminOnly (FieldAccess, boolean) |

**Key Payload 3.x finding:** `collection.access.admin` requires a boolean-returning function — it is incompatible with the `Access` type (which can return `Where`). The `admin` helper from `access/admin.ts` cannot be reused there; an inline lambda is required. `Access` and `FieldAccess` are genuinely different types and serve different Payload APIs.
