# Engineering Notes — Meridian Engagement

A running, step-by-step journal of how we built this demo. Newest entries at the bottom.
Each entry: what we did, why, which WorkOS concept it maps to, and what we learned.

---

## Turn 1 — 2026-08-30 — Assignment intake & working agreement

**What we did**
- Read the three assignment docs: `README.md` (logistics/deliverables), `SCENARIO.md`
  (the customer brief — the real spec), and `SUBMISSION.md` (the graded template).
- Read the starter app to establish the baseline we're extending.
- Created `CLAUDE.md` as our working agreement (step-by-step, explain every line,
  document every turn) and this `NOTES.md` journal.
- Set the session title to "WorkOS SE Take-Home — Meridian Analytics".

**Baseline app (what exists today)**
- `src/middleware.ts` — `authkitMiddleware()` protecting `/`, `/account/*`, `/api/*`.
- `src/app/login/route.ts` — redirects to the AuthKit hosted sign-in URL.
- `src/app/callback/route.ts` — `handleAuth()` completes the OAuth callback.
- `src/app/account/page.tsx` — shows `user`, `role`, `permissions` from `withAuth()`.
- `src/app/actions/signOut.ts` — server action calling `signOut()`.
- `src/app/api/get-name/route.ts` — sample edge-safe route using `authkit(request)`.
- `src/app/layout.tsx` — Radix Theme shell, `AuthKitProvider`, header nav, `Impersonation`.
- No org switching, no member management, no RBAC UI, no SSO/policy config yet.

**How the brief maps to WorkOS (our enumeration)**
1. Walled-off workspaces, zero cross-tenant visibility → **Organizations** (multi-tenancy).
2. Self-serve invite/remove/change-access, no ticket → **User Management** (+ Admin Portal / widgets).
3. Admin / team lead / compliance(read-only) → **Roles & Permissions (RBAC)**.
4. Sign in via Acme's Okta, "no Okta no deal" → **SSO**, demoed with the **Test IdP**.
5. 24h session + admin MFA for one customer only → **per-organization auth policy**.
- Bonus (optional): Slack `#customer-success` ping on seat changes → **WorkOS Pipes**.

**SE judgment moments spotted (to record in SUBMISSION §5)**
- Engineers' "just call the WorkOS API from the frontend with the API key" → **push back**:
  the secret key would ship to the browser (full-account compromise). Correct pattern is
  a server-side backend (which AuthKit already gives us). Frontend-safe widget flows use
  short-lived scoped tokens minted server-side, not the API key.

**Decisions**
- Not writing feature code yet. This turn is intake + scaffolding so every later step is
  understood and documented. Next step is the environment/dashboard setup (WorkOS
  account, redirect URI, `.env.local`, run the app) before we build.

**Open questions / to confirm with Vince**
- Do you already have a WorkOS account + dashboard access to configure?
- Confirm we're deploying to Vercel (per README's expected host).

---

## Turn 2 — 2026-08-30 — Step 1: environment setup (code side)

Vince has a WorkOS account but hasn't configured this project yet. Chosen workflow:
Claude gives click-by-click dashboard steps, Vince clicks, Claude verifies via the app.

**What we did (code side)**
- Confirmed toolchain: Node v20.19.2, npm 11.13.0. `.env*` is gitignored, so
  `.env.local` cannot be committed.
- `npm install` — installed dependencies (node_modules was missing).
- `npx skills add workos/skills` — installed the required WorkOS agent skills
  (`workos`, `workos-widgets`) into `.agents/skills/`. These give our AI tooling current
  WorkOS integration guides (esp. the widgets we'll use for self-serve member mgmt).
- Created `.env.local` from the example: generated a 44-char cookie password with
  `openssl rand -base64 32` (stays local), pre-filled `NEXT_PUBLIC_WORKOS_REDIRECT_URI`,
  left `WORKOS_CLIENT_ID` and `WORKOS_API_KEY` blank for Vince to paste from the dashboard.

**What each env var is for**
- `WORKOS_CLIENT_ID` — public identifier for our WorkOS "app"/environment.
- `WORKOS_API_KEY` — the **secret** key; server-side only. (This is exactly why the
  brief's "call the API from the frontend" idea is unsafe — see SUBMISSION §5.)
- `WORKOS_COOKIE_PASSWORD` — private key AuthKit uses to encrypt the session cookie.
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` — where AuthKit sends the user back after sign-in;
  the `NEXT_PUBLIC_` prefix means it's exposed to the browser (safe — it's just a URL).

**Pending (Vince, in the dashboard)**
- Redirects tab: add sign-in callback `http://localhost:3000/callback`; set homepage
  `http://localhost:3000`.
- API Keys tab: copy Client ID + Secret Key into `.env.local`.
- Then: `npm run dev`, confirm sign-in round-trips.

---

## Turn 3 — 2026-08-30 — Debugging: env var shadowing (and Step 1 done)

**Symptom:** After filling `.env.local` and starting the dev server, clicking Sign In
landed on WorkOS's **"Invalid Redirect URI"** page belonging to **"Dust's Application"**
(client `client_01JGCT55…`) — *not* the client ID in our `.env.local`
(`client_01M19A3PM4W…`).

**Root cause (great teaching moment):** Next.js gives **real shell-exported environment
variables precedence over `.env*` files**. The Claude Code desktop app had been launched
from a shell that (at the time) exported `WORKOS_CLIENT_ID` etc. globally, pointing at
Dust's WorkOS environment. Any dev server spawned by that app inherited those exports, so
`getSignInUrl()` read `process.env.WORKOS_CLIENT_ID` = Dust's value and **silently
shadowed** our `.env.local`. The file was correct all along.

**Investigation:**
- `env | grep WORKOS` in the Bash tool → empty (that shell is clean).
- `grep WORKOS ~/.zshrc` → the exports were **already commented out** (lines 90–97), and
  `~/.zshenv` / `~/.zprofile` had none. So a *fresh* shell is clean; only the
  *already-running server process* still held the stale values baked in at launch.

**Fix (no `.zshrc` edit, no app restart — restarting the app would have killed this
session):**
1. Stopped the shadowed preview server; `pkill` any leftover `next`/`next-server`.
2. Relaunched `npm run dev` from the clean Bash env, explicitly `unset`-ing all `WORKOS_*`
   as belt-and-suspenders. Log confirmed `Environments: .env.local`.

**Verification:**
- `curl -D- http://localhost:3000/login` → `Location: …/authorize?client_id=client_01M19A3PM4W…`
  (the **new** account, not Dust's).
- Browser: `/login` → `right-cottage-48-staging.authkit.app` real "Sign in" form
  (previously it was `energetic-venue-23-staging` = Dust's, with the redirect error).

**Lesson to carry:** globally exporting service credentials in a shell profile leaks into
every project that reads the same var names. Prefer per-project `.env.local`. If a value
*must* be global, expect it to shadow `.env*` and be deliberate about it.

**Step 1 (environment) — DONE.** App runs on :3000, authenticates against the correct
new WorkOS account end-to-end. Next: Step 2 — Organizations (create Acme Corp tenant).

---

## Turn 4 — 2026-08-30 — Step 2: Organizations (Requirement 1, walled-off tenants)

**Concept.** A WorkOS **Organization** = one tenant. A user authenticates and, as a
**member** of an org, their session is **scoped** to that org via `organizationId` (also
in the access-token JWT). Server code reads `withAuth().organizationId` and filters every
query by it → a user at Acme cannot request another org's data. Tenant isolation is
enforced by the session server-side, not by hiding UI. That is Requirement 1.

**Grounding.** Consulted the installed `workos` skill: `references/workos-authkit-nextjs.md`
(starter app already passes its integration checklist) and the SDK types. Confirmed
`withAuth()` returns `UserInfo` with `organizationId?`, `role?`, `roles?`, `permissions?`,
`entitlements?`, `featureFlags?` (`node_modules/@workos-inc/authkit-nextjs/.../interfaces.d.ts`).

**Code change.** `src/app/account/page.tsx`:
- Destructured `organizationId` from `withAuth({ ensureSignedIn: true })`.
- Added a conditional field `organizationId ? ["Organization", organizationId] : []`,
  placed before Role (org = outer/tenant context, role = inner). The existing
  `.filter(arr => arr.length > 0)` drops it when a session isn't org-scoped.
- Purpose: make the tenant binding *visible* in the demo — proof the session is scoped
  to Acme. Verification deferred until a user signs into Acme (change only shows then).

**Dashboard (Vince):** create Organization "Acme Corp"; create first user with a password
(recommend real plus-addressed email `vince+acme.admin@dust.tt` to pass email verification);
add that user as a member of Acme. Then sign in → expect `organizationId = org_…` on /account.

**Design note for later:** Acme's scenario needs SSO via Okta (Req 4) while SUBMISSION asks
for password logins per role. Resolve the credential story in Steps 3–4; for now one
password user in Acme is enough to prove tenant scoping.

---

## Turn 5 — 2026-08-30 — Commit & push Requirement 1

Branched off `main` (never commit straight to default) → `req-1-organizations`. Two clean
commits for reviewability:
1. `chore: project scaffolding` — WorkOS skills (`.agents/`, `skills-lock.json`),
   `.claude/launch.json`, `CLAUDE.md`, `NOTES.md`, updated `package-lock.json`.
2. `feat(account): surface organizationId to demonstrate tenant scoping` — the R1 code.

Reverted an unintended `package.json` change (npm had auto-added a `packageManager` pin to
the local npm build hash, which could break CI). `.env.local` stayed ignored — no secrets
committed. Pushed to `origin` (github.com/vincesarkisian/Meridian-Analytics).

**Still open:** live sign-in verification of R1 was paused at the AuthKit password step
(Claude does not type passwords). Once signed in, confirm `/account` shows
`Organization = org_01M17EGW73PSFAYF93CMAE7M3C`. Acme Corp id recorded.

**R1 verified by Vince (Turn 6):** org ID shows on the account page. ✅

---

## Turn 6 — 2026-08-30 — Step 3: Roles & Permissions (Requirement 3)

**Grounding.** Read `references/workos-rbac.md`. Two rules adopted:
1. Gate on **permissions**, never role slugs (slug checks break with custom/multi-org roles).
2. Use **environment-level** roles (IdP→role mapping needs them; org-level roles isolate
   the org irreversibly).

**Role design (interpretation — brief invites it).** Three permission slugs cleanly
separate the three roles, and since code checks permissions (not names), role names stay
cosmetic/renamable:
- `members:read` — view members
- `members:write` — invite/remove members
- `members:manage_roles` — change a member's access

| Role | slug | permissions | brief mapping |
|------|------|-------------|---------------|
| Administrator | `admin` | read, write, manage_roles | "run the workspace" incl. change access |
| Team Lead | `team-lead` | read, write | "look after their own people" |
| Compliance | `compliance` | read | "see everything, change nothing" |

*Interpretation recorded:* true "own people" scoping is resource-level (app logic), not
RBAC. RBAC grants workspace-wide capability tiers; per-team filtering is an app-layer
add-on. Stated in SUBMISSION.

**Code.**
- New `src/lib/permissions.ts`: `PERMISSIONS` constants + `can(permissions, perm)` helper
  (single source of truth for slugs; "missing array = denied"). Uses `@/*` alias.
- `src/app/account/page.tsx`: added a "What you can do here" panel — maps each permission
  to a label and renders ✓/✕ via `can()`. Makes role differences visible in the demo.
- Verified: `npx tsc --noEmit` clean; no dev-server compile errors. Live authenticated
  render deferred until roles assigned + re-auth (in-app browser has no session).

**Dashboard (Vince):** create the 3 permissions + 3 roles at the environment level; assign
`admin` to vince.sarkisian@gmail.com; re-authenticate (role changes need re-login). Then
`/account` should show Role=admin and all capabilities green.

**Verified by Vince:** re-signed in, capabilities show green for admin. ✅

---

## Turn 7 — 2026-08-30 — Step 4: self-serve member management (Requirement 2)

**Grounding.** Read `workos-widgets` skill: SKILL.md, framework-nextjs, token-strategies,
widget-user-management, styling. Inspected the installed packages to use exact APIs rather
than guessing:
- `@workos-inc/widgets` 1.17.1 → exports `WorkOsWidgets` (provider, self-contained
  react-query) and `UsersManagement` (`authToken: string | () => Promise<string>`).
- Peers: `@radix-ui/themes ^3.3.0` (npm auto-bumped 3.2.1→3.3.0), `@tanstack/react-query`
  (installed). `swr` is a peer but only used by the widget's *experimental* API — the
  standard components use react-query, so we skip swr (its install hit an unrelated E404
  for a private `@internal/typescript-config` devDep leak; avoided by not installing it).
- Token: `getWorkOS().widgets.getToken({ organizationId, userId, scopes })` → `Promise<string>`.
  Scope for this widget: `widgets:users-table:manage`. `getWorkOS` is a public export of
  authkit-nextjs, so we reuse the already-configured SDK client (no new WorkOS instance).
- Widget CSS: `@workos-inc/widgets/styles.css` (resolves to dist/css/styles.css).

**The security story (answers the brief's "call the API from the frontend" question).**
Token is minted server-side, scoped to user + org + a single permission, short-lived
(1h). The secret API key never leaves the server; the browser only receives the scoped
token. This is the concrete reason not to ship the API key to the frontend → SUBMISSION §5.

**Code.**
- `src/app/members/members-widget.tsx` (client): `<WorkOsWidgets><UsersManagement
  authToken=.../></WorkOsWidgets>`. Receives only the serializable token.
- `src/app/members/page.tsx` (server): `withAuth` → gate on `MEMBERS_WRITE`; states for
  no-org (amber), read-only/compliance (gray), token failure (red, names the missing
  widget permission), success (render widget). Mints token with the users-table scope.
- `src/middleware.ts`: added `/members/:path*` to the matcher (else withAuth errs).
- `src/app/layout.tsx`: import widget CSS; add "Members" nav link.

**Verification.** `npx tsc --noEmit` clean. `npm run build` succeeds — `/members` compiles
(37.9 kB widget bundle), all 10 routes generate, CSS + client/server boundary OK. Dev
server restarted to pick up new deps; `/members` protects + redirects correctly.

**Pending (Vince):** add the built-in **`widgets:users-table:manage`** permission to the
`admin` role (and `team-lead` if they should manage), then re-authenticate. Then `/members`
renders the live members table with invite/remove/change-role. Without that permission,
`getToken` throws and the page shows the red "role needs widgets:users-table:manage" state.

**Debug — CORS (resolved).** After re-auth, the widget mounted but rows stuck loading.
Console showed the real cause: the widget calls `api.workos.com/_widgets/...` *directly
from the browser*, and WorkOS returned no `Access-Control-Allow-Origin` for
`http://localhost:3000` → CORS block. Our code was correct (token minted, widget mounted);
the origin just wasn't allowlisted. Diagnosed via the in-app browser console/network (no
server error; the failing calls were client→api.workos.com). **Fix:** add
`http://localhost:3000` as a CORS origin in the WorkOS dashboard (CLI equivalent:
`workos config cors add http://localhost:3000`). Applies immediately, no re-auth.
**Deploy note:** must also add the Vercel URL as a CORS origin (and a redirect URI) at
deploy time, or the widget breaks in production.

**Verified live (Turn 7):** `/members` shows the real members table — Vince Sarkisian,
role Admin, "You" badge, working Search / role filter / Invite user. Requirement 2 done. ✅
