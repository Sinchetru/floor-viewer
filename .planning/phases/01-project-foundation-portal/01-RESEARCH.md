# Phase 1: Project Foundation & Portal - Research

**Researched:** 2026-04-08
**Domain:** Next.js 15 App Router, Payload CMS 3.x auth, Tailwind CSS v3, SQLite
**Confidence:** HIGH

---

## Summary

The project is a Payload CMS 3.x + Next.js 15 App Router application, already scaffolded from the official blank template. The codebase has the standard route group split: `(frontend)` for public/user-facing pages and `(payload)` for the Payload admin panel. Phase 1 needs to replace the blank template page with a proper `/login` route and a `/portal` route, wire Payload's built-in auth (cookie name: `payload-token`) to protect those routes, and render a tile grid with one tile.

Payload ships its own HTTP-only cookie (`payload-token`) and exposes `payload.auth({ headers })` for server-side session resolution — no third-party auth library is needed. Route protection is a two-layer pattern: a `middleware.ts` file provides the cheap redirect-on-no-cookie check, and each protected Server Component calls `payload.auth()` for authoritative verification.

Tailwind CSS is installed at **v3.4.19** (not v4 as the roadmap states). The `tailwind.config.js` and `postcss.config.js` are present and wired. No configuration changes are needed to start using Tailwind utility classes — just import styles in the layout.

**Primary recommendation:** Keep the existing `(frontend)` / `(payload)` route group structure. Add `/login` and `/portal` inside `(frontend)`. Use Next.js `middleware.ts` at the project root for redirect logic. Call `payload.auth()` inside portal Server Component for authoritative guard.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PORT-01 | After login, user lands on portal page showing module tiles | `/portal` route in `(frontend)` group; redirect from login via `router.replace('/portal')` |
| PORT-02 | v1 includes one tile: "Flächenmanagement" — clicking it opens the floor viewer | Single `TileCard` component linking to `/flaechen` |
| PORT-03 | All logged-in roles see the Flächenmanagement tile | Tile rendered unconditionally when `user` is present; role-gating deferred to Phase 3 |
| PORT-04 | Tile visibility is role-driven (future modules) | Tile data array carries optional `roles` field; render logic checks `roles.includes(user.role)` or renders if `roles` undefined |
| PORT-05 | Portal accommodates additional module tiles without layout changes | CSS Grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`) — adding tiles to the array is the only change needed |
| AUTH-01 | Users can log in with email and password | Payload REST endpoint `POST /api/users/login`; sets `payload-token` HTTP-only cookie automatically |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | Framework, App Router, middleware | Already installed [VERIFIED: package.json] |
| payload | 3.81.0 | CMS, auth, collections, admin UI | Already installed [VERIFIED: package.json] |
| @payloadcms/db-sqlite | 3.81.0 | SQLite adapter | Already installed, dev database already created [VERIFIED: package.json] |
| @payloadcms/next | 3.81.0 | Payload Next.js integration, withPayload wrapper | Already installed [VERIFIED: package.json] |
| tailwindcss | 3.4.19 | Utility-first CSS | Already installed and configured [VERIFIED: node_modules] |
| react | 19.2.4 | UI rendering | Already installed [VERIFIED: package.json] |
| typescript | 5.7.3 | Type safety | Already installed [VERIFIED: package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation | (built-in) | `redirect()`, `useRouter()` | Server-side redirect after auth check |
| next/headers | (built-in) | `headers()` for passing to `payload.auth()` | Any Server Component needing auth |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Payload built-in auth | NextAuth / Auth.js | Payload auth is already present; NextAuth adds complexity and another session store |
| CSS Grid tile layout | Flexbox | Grid provides automatic wrapping without media query hacks for multi-column tile grids |

**Installation:** No new packages needed for this phase. All dependencies are present.

**Version note:** `tailwindcss` resolves to **3.4.19** at runtime [VERIFIED: node_modules/tailwindcss/package.json]. The roadmap says "Tailwind CSS 4" — that is incorrect. The installed version is v3. Do not use v4 CSS-first config syntax (`@import "tailwindcss"` or `@theme`) in this phase.

---

## Architecture Patterns

### Existing Project Structure

```
src/
├── app/
│   ├── (frontend)/          # User-facing pages
│   │   ├── layout.tsx       # Root HTML shell — ADD Tailwind import here
│   │   ├── page.tsx         # Blank template home — REPLACE or redirect to /portal
│   │   └── styles.css       # Non-Tailwind styles — can coexist
│   └── (payload)/           # Payload admin panel — DO NOT MODIFY
│       ├── admin/           # Admin UI routes
│       ├── api/             # Payload REST + GraphQL routes
│       └── layout.tsx
├── collections/
│   └── Users.ts             # auth: true already set
└── payload.config.ts        # SQLite, Users, Media collections registered
```

### Target Structure After Phase 1

```
src/
├── app/
│   ├── (frontend)/
│   │   ├── layout.tsx           # Root layout with Tailwind globals import
│   │   ├── page.tsx             # Redirect to /portal (or /login if unauthed)
│   │   ├── login/
│   │   │   └── page.tsx         # Login form (Client Component)
│   │   ├── portal/
│   │   │   └── page.tsx         # Portal with tile grid (Server Component)
│   │   └── flaechen/
│   │       └── page.tsx         # Placeholder — navigated to from tile
│   └── (payload)/               # Unchanged
├── components/
│   ├── TileCard.tsx             # Single tile component
│   └── TileGrid.tsx             # Grid wrapper
├── middleware.ts                # Route protection
└── ...
```

### Pattern 1: Two-Layer Route Protection

**What:** Middleware checks for `payload-token` cookie (cheap, no DB hit). Protected Server Components call `payload.auth()` for authoritative verification.

**When to use:** All routes under `/portal` and future protected paths.

```typescript
// Source: https://dev.to/aaronksaunders/authentication-with-payload-cms-and-nextjs-client-vs-server-approaches-c5a
// middleware.ts (project root, not inside src/)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const payloadToken = request.cookies.get('payload-token')

  if (!payloadToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*', '/flaechen/:path*'],
}
```

```typescript
// src/app/(frontend)/portal/page.tsx
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import config from '@payload-config'

export default async function PortalPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/login')

  return <TileGrid user={user} />
}
```

### Pattern 2: Client-Side Login Form with Payload REST

**What:** Login page is a Client Component. Submits `credentials: 'include'` so the browser automatically stores the `payload-token` cookie. On success, calls `router.replace('/portal')`.

**When to use:** Login page only. Do not call `payload.auth()` in a Client Component.

```typescript
// src/app/(frontend)/login/page.tsx  (Client Component)
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/users/login', {
      method: 'POST',
      credentials: 'include',   // Critical: lets browser store the cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    })

    if (res.ok) {
      router.replace('/portal')
    } else {
      const data = await res.json()
      setError(data.errors?.[0]?.message ?? 'Anmeldung fehlgeschlagen')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>E-Mail</label>
      <input name="email" type="email" required />
      <label>Passwort</label>
      <input name="password" type="password" required />
      {error && <p>{error}</p>}
      <button type="submit">Anmelden</button>
    </form>
  )
}
```

### Pattern 3: Extensible Tile Grid

**What:** Tile data is a typed array. The grid renders each entry. Adding a tile = appending to the array.

**When to use:** Portal page and all future module tile additions.

```typescript
// src/components/TileGrid.tsx
type Tile = {
  label: string
  href: string
  icon?: React.ReactNode
  roles?: string[]  // undefined = all roles; PORT-04 readiness
}

const TILES: Tile[] = [
  { label: 'Flächenmanagement', href: '/flaechen' },
]

export function TileGrid({ user }: { user: { role?: string } }) {
  const visibleTiles = TILES.filter(
    (t) => !t.roles || (user.role && t.roles.includes(user.role))
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {visibleTiles.map((tile) => (
        <TileCard key={tile.href} tile={tile} />
      ))}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Payload `auth: true` collection — do not add `auth: false`:** The Users collection already has `auth: true`. Changing this breaks Payload's entire session system.
- **Calling `getPayload` in a Client Component:** `getPayload` is a server-only function. Login form must POST to the REST API, not call Payload directly.
- **Relying solely on middleware for security:** Middleware checks the cookie presence only. The portal Server Component must also call `payload.auth()` to verify the token is valid.
- **Placing `middleware.ts` inside `src/`:** Next.js resolves `middleware.ts` from the project root or `src/` but it must be a single file, not inside a route group. Place it at `src/middleware.ts` or the project root.
- **Using Tailwind v4 config syntax:** The installed version is v3.4.19. Do not use `@import "tailwindcss"` or `@theme` directives — those are v4 patterns and will break builds.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom bcrypt logic | `auth: true` on Users collection | Payload handles hashing, salting, JWT signing |
| Session tokens | Custom JWT generation | Payload's built-in cookie/token system | Already generates `payload-token` HTTP-only cookie on login |
| Login endpoint | Custom `/api/login` route | `POST /api/users/login` (auto-generated) | Payload auto-generates REST auth endpoints for every auth-enabled collection |
| User management UI | Custom CRUD screens | Payload Admin Panel | Admin panel is at `/admin` already; no Phase 1 work needed |

**Key insight:** Payload's `auth: true` on a collection auto-generates login, logout, me, refresh, forgot-password, and reset-password REST endpoints. Zero custom auth code needed.

---

## Common Pitfalls

### Pitfall 1: Tailwind Not Applied (Missing Global Import)

**What goes wrong:** Utility classes render but produce no styles. The page looks completely unstyled.

**Why it happens:** Tailwind v3 requires a CSS file with `@tailwind base; @tailwind components; @tailwind utilities;` to be imported in the root layout. The existing `styles.css` in `(frontend)` uses raw CSS, not Tailwind directives.

**How to avoid:** Create a `globals.css` (or modify the layout import) with the three `@tailwind` directives. Import it in `src/app/(frontend)/layout.tsx`. The `tailwind.config.js` content array already includes `./src/**/*.{js,ts,jsx,tsx,mdx}`, so class scanning is configured.

**Warning signs:** Buttons have no background, text has no sizing, grid does not wrap — even with correct class names.

### Pitfall 2: Infinite Redirect Loop

**What goes wrong:** `/login` itself gets caught by the middleware matcher, causing an infinite redirect cycle.

**Why it happens:** If the matcher includes `/login`, unauthenticated users hitting `/login` get redirected to `/login` forever.

**How to avoid:** Exclude `/login` and `/api` from the middleware matcher. Use positive matchers:
```typescript
matcher: ['/portal/:path*', '/flaechen/:path*']
```
Never use a catch-all matcher that includes public routes.

### Pitfall 3: `payload-token` Cookie Not Sent Cross-Origin

**What goes wrong:** Login appears to succeed (200 response) but the cookie is never stored, so the next request to `/portal` triggers a redirect back to login.

**Why it happens:** `fetch('/api/users/login')` without `credentials: 'include'` does not attach or receive cookies in the browser.

**How to avoid:** Always include `credentials: 'include'` on the login fetch. This is same-origin in development (both Payload API and the frontend are served from the same Next.js process), so `credentials: 'include'` is sufficient.

### Pitfall 4: `middleware.ts` in Wrong Location

**What goes wrong:** Middleware is never executed — routes are not protected.

**Why it happens:** `middleware.ts` must be at the root of the project (same level as `next.config.ts`) or at `src/middleware.ts`. Placing it inside a route group like `app/(frontend)/middleware.ts` is not valid.

**How to avoid:** Create `src/middleware.ts` (the `src/` convention works with this project's structure).

### Pitfall 5: Payload `getPayload` Called at Module Level

**What goes wrong:** Build fails or hot reload breaks with "Payload is not initialized" errors.

**Why it happens:** `getPayload({ config })` must be called inside an async function (request handler or Server Component render), not at the top of a module.

**How to avoid:** Always call `getPayload` inside the exported async function, not at the top of the file.

---

## Code Examples

### Enabling Tailwind in Root Layout

```typescript
// src/app/(frontend)/layout.tsx
import './globals.css'  // contains @tailwind directives
import React from 'react'

export const metadata = {
  title: 'Campus Platform',
  description: 'Flächenmanagement Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
```

```css
/* src/app/(frontend)/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Root Page Redirect

```typescript
// src/app/(frontend)/page.tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/portal')
}
```

The middleware will catch unauthenticated requests to `/portal` and redirect to `/login` — no auth check needed here.

### Checking Payload Cookie Name

Payload sets the cookie as `payload-token` [CITED: https://dev.to/aaronksaunders/authentication-with-payload-cms-and-nextjs-client-vs-server-approaches-c5a]. Verify in browser DevTools → Application → Cookies after first login.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | Implicit (project runs) | >=18.20.2 required by engines field | — |
| pnpm | Package manager | Assumed present (lockfile exists) | ^9 or ^10 | — |
| SQLite database | Payload data layer | `floor-viewer.db` exists in root | — | — |
| Next.js dev server | All development | `pnpm dev` script present | 16.2.1 | — |

No missing dependencies for this phase.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 (unit) + Playwright 1.58.2 (e2e) |
| Config file | `vitest.config.mts` (unit), `playwright.config.ts` (e2e) |
| Quick run command | `pnpm test:int` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login with valid credentials sets cookie and redirects to /portal | e2e | `pnpm test:e2e` | ❌ Wave 0 |
| AUTH-01 | Login with invalid credentials shows German error message | e2e | `pnpm test:e2e` | ❌ Wave 0 |
| PORT-01 | Authenticated user landing on / redirects to /portal | e2e | `pnpm test:e2e` | ❌ Wave 0 |
| PORT-01 | Unauthenticated user accessing /portal redirects to /login | e2e | `pnpm test:e2e` | ❌ Wave 0 |
| PORT-02 | Portal renders Flächenmanagement tile | e2e | `pnpm test:e2e` | ❌ Wave 0 |
| PORT-02 | Clicking tile navigates to /flaechen | e2e | `pnpm test:e2e` | ❌ Wave 0 |
| PORT-05 | TileGrid renders additional tile when appended to TILES array | unit | `pnpm test:int` | ❌ Wave 0 |
| PORT-04 | Tile with roles restriction is hidden if user role not in list | unit | `pnpm test:int` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test:int` (unit tests only, fast)
- **Per wave merge:** `pnpm test` (full suite)
- **Phase gate:** Full suite green before marking phase complete

### Wave 0 Gaps

- [ ] `tests/unit/TileGrid.test.tsx` — covers PORT-04, PORT-05
- [ ] `tests/e2e/auth.spec.ts` — covers AUTH-01, PORT-01 redirect behavior
- [ ] `tests/e2e/portal.spec.ts` — covers PORT-02 tile rendering and navigation

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Payload built-in auth (bcrypt hashing, JWT, HTTP-only cookie) |
| V3 Session Management | yes | Payload HTTP-only `payload-token` cookie; no custom session code |
| V4 Access Control | yes | Middleware cookie check + Server Component `payload.auth()` double-verification |
| V5 Input Validation | yes | HTML `type="email"` + `required` on login form; Payload validates on server |
| V6 Cryptography | no | No custom crypto in this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Middleware bypass (CVE-2025-29927) | Elevation of privilege | Double-verify with `payload.auth()` in Server Components — never trust middleware alone [CITED: https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass] |
| Redirect to unprotected login while logged in | Spoofing | After successful login, check if already authed and skip login form render |
| XSS cookie theft | Information disclosure | Payload sets HTTP-only cookie — JavaScript cannot read it; no additional config needed |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `_app.tsx` + `getServerSideProps` | App Router Server Components + `async/await` | Next.js 13+ | All data fetching in server components; no `getServerSideProps` |
| Manual JWT verification in middleware | Cookie presence check in middleware + `payload.auth()` in Server Component | Payload 3.x | Simpler middleware, authoritative check deferred to server |
| Tailwind v4 CSS-first config (`@theme`) | Tailwind v3 `tailwind.config.js` + PostCSS | — | v3 is installed; v4 patterns will not work |

**Deprecated/outdated:**
- `getServerSideProps`: Not available in App Router. Use async Server Components.
- `next/router` (`useRouter` from `next/router`): Use `next/navigation` in App Router.
- Payload `v2` local API patterns: Payload 3.x uses `getPayload({ config })` — old `req.payload` patterns from v2 do not apply.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `middleware.ts` at `src/middleware.ts` will be picked up by Next.js | Architecture Patterns | If not, routes are unprotected; validate by running dev and hitting /portal unauthenticated |
| A2 | Payload cookie name is `payload-token` | Patterns, Pitfalls | Middleware checks wrong cookie; login succeeds but protection fails; verify in DevTools after first login |

---

## Open Questions

1. **Tailwind version mismatch with roadmap**
   - What we know: `tailwindcss` v3.4.19 is installed; roadmap states "Tailwind CSS 4"
   - What's unclear: Whether the intent was to upgrade to v4 before Phase 1, or the roadmap was written assuming v4 but v3 was used in scaffolding
   - Recommendation: Plan with v3 as-is. Upgrading to v4 mid-phase adds migration risk with no Phase 1 benefit. Revisit at a natural boundary if needed.

2. **Root `page.tsx` behavior**
   - What we know: Current `src/app/(frontend)/page.tsx` renders a Payload template page, not a redirect
   - What's unclear: Whether to delete it or replace it with a redirect
   - Recommendation: Replace with a `redirect('/portal')` stub. The middleware handles unauthenticated users; `/portal` handles the auth guard.

---

## Sources

### Primary (HIGH confidence)
- `D:/Projects/floor-viewer/package.json` — installed dependency versions [VERIFIED]
- `D:/Projects/floor-viewer/node_modules/tailwindcss/package.json` — actual tailwindcss version 3.4.19 [VERIFIED]
- `D:/Projects/floor-viewer/node_modules/payload/package.json` — actual payload version 3.81.0 [VERIFIED]
- `D:/Projects/floor-viewer/src/payload.config.ts` — existing Payload config with SQLite and Users collection [VERIFIED]
- `D:/Projects/floor-viewer/src/collections/Users.ts` — `auth: true` already set [VERIFIED]
- `D:/Projects/floor-viewer/src/app/(frontend)/layout.tsx` — existing root layout [VERIFIED]
- `D:/Projects/floor-viewer/tailwind.config.js` — content paths configured [VERIFIED]

### Secondary (MEDIUM confidence)
- [Authentication with Payload CMS and Next.js — DEV Community](https://dev.to/aaronksaunders/authentication-with-payload-cms-and-nextjs-client-vs-server-approaches-c5a) — `payload-token` cookie name, middleware pattern, `credentials: 'include'` requirement
- [Handling authentication in Next.js with Payload — payloadcms.com](https://payloadcms.com/posts/blog/nextjs-payload-cms-auth) — official Payload blog on auth integration

### Tertiary (LOW confidence)
- [CVE-2025-29927 — ProjectDiscovery](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) — middleware bypass vulnerability; defense-in-depth recommendation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from node_modules and package.json
- Architecture: HIGH — existing codebase structure directly observed
- Auth patterns: MEDIUM — verified via community source + official blog; cookie name needs runtime confirmation
- Pitfalls: MEDIUM — derived from known patterns; A2 (cookie name) needs first-login verification

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable stack; Payload minor versions move fast — recheck if upgrading)
