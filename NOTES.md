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
