---
phase: 1
slug: project-foundation-portal
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-08
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest / vitest (to be installed in Wave 0) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `pnpm test --passWithNoTests` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --passWithNoTests`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | PORT-01 | — | N/A | e2e/manual | `pnpm dev` → navigate to `/portal` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | AUTH-01 | — | Login form submits only via HTTPS | e2e/manual | POST `/api/users/login` returns 200 + cookie | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | AUTH-01 | — | Unauthenticated requests redirected to /login | unit | `pnpm test` (middleware unit test) | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 2 | PORT-01–03 | — | N/A | e2e/manual | Portal renders tile after login | ❌ W0 | ⬜ pending |
| 1-05-01 | 05 | 2 | PORT-02 | — | N/A | e2e/manual | Tile click navigates to `/flaechen` | ❌ W0 | ⬜ pending |
| 1-06-01 | 06 | 3 | PORT-04–05 | — | N/A | unit | `pnpm test` (tile config test) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/middleware.test.ts` — stub for redirect logic (AUTH-01)
- [ ] `__tests__/tiles.test.ts` — stub for tile array config (PORT-04–05)
- [ ] Install vitest or jest if not present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login form renders with German labels | PORT-01 | UI text, no automated check | Open `/login`, verify "E-Mail" and "Passwort" labels |
| Cookie set after login | AUTH-01 | Browser DevTools required | Login → DevTools → Application → Cookies → check `payload-token` |
| Unauthenticated redirect | AUTH-01 | Integration (middleware + browser) | Open `/portal` logged out → should land on `/login` |
| Tile navigates to floor viewer | PORT-02 | Navigation e2e | Click tile → URL becomes `/flaechen` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
