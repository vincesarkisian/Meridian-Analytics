# Submission

Fill in every section and commit this file to your repo. Reviewers work from this document first, so treat it as part of the deliverable.

## 1. Links

Deployed URL, repo, and demo video.

- **Deployed app**: https://meridian-analytics-chi.vercel.app
- **Repo**: https://github.com/vincesarkisian/Meridian-Analytics
- **Video**: _(pending)_

> Note: the deployed **Prospect** org enforces a **10-second** session limit
> (`PROSPECT_SESSION_MAX_SECONDS=10`) so a reviewer signing in as the Prospect admin
> sees Requirement 5's per-org session policy fire live. Every other org uses the
> normal session. The default in code is 24h.

## 2. Test credentials

One row per role. "What to try" should tell a reviewer what to click to see this role's experience.

| Role | Email | Password | What to try while logged in as this user |
| ---- | ----- | -------- | ---------------------------------------- |
|      |       |          |                                          |
|      |       |          |                                          |
|      |       |          |                                          |

## 3. Requirement map

One row per requirement as you understood them from the brief. Your enumeration is part of the answer.

| Scenario requirement | Where it's addressed (route / file / dashboard surface) | Notes on your interpretation |
| -------------------- | ------------------------------------------------------- | ---------------------------- |
| 1. Each customer is a walled-off workspace; zero cross-tenant visibility | WorkOS **Organizations** (dashboard) + `withAuth().organizationId` surfaced in `src/app/account/page.tsx`. Isolation is enforced by the org-scoped session server-side. | Tenant = WorkOS Organization. Acme Corp = `org_01M17EGW73PSFAYF93CMAE7M3C`. |
| 3. Three user kinds: admins, team leads, compliance (read-only) | WorkOS **environment-level Roles & Permissions** (dashboard) + `src/lib/permissions.ts` (`can()` helper) + capabilities panel in `src/app/account/page.tsx`. Gated on permissions, never role slugs. | Roles: `admin` (read/write/manage_roles), `team-lead` (read/write), `compliance` (read). "Team lead looks after their own people" = a capability tier; true per-team scoping is app-layer, not RBAC. |
| 2. Self-serve member management (invite / remove / change access) — no support ticket | `/members` route: `src/app/members/page.tsx` (server, mints scoped widget token) + `src/app/members/members-widget.tsx` (WorkOS `UsersManagement` widget). Gated on `members:write`. | Token minted server-side, scoped to user+org+`widgets:users-table:manage`; the API key never reaches the browser — this is our answer to the "call the API from the frontend" question (§5). |
| 4. Acme employees sign in via their own Okta ("no Okta, no deal") | Active SSO connection on Acme via the **Test Identity Provider** (dashboard). App entry point `src/app/login/sso/route.ts` → `getSignInUrl({ organizationId })` routes straight to Acme's IdP; "Enterprise SSO (Acme)" button on `src/app/page.tsx`. | Used the sanctioned Test IdP as Acme's Okta stand-in. Password login kept alongside SSO. For a real rollout, verify Acme's domain so employees provision without the guest email-verification step. |
| 5. 24h session expiry + admin MFA for one customer only | **MFA**: Prospect org authentication policy ("Require non-SSO members … MFA", dashboard). **24h session**: app-enforced in `src/lib/session-policy.ts` + `src/middleware.ts` + `src/app/callback/route.ts`, Prospect only. | WorkOS per-org policy covers MFA natively but **not** session length (that's environment-wide), so the 24h-for-one-org part is enforced in-app — other orgs untouched. MFA policy is org-wide for non-SSO members, a superset of "admins". |
| Bonus: Slack `#customer-success` ping on seat changes | _Optional: WorkOS Pipes._ | Explicitly "down the road" in the brief. |

## 4. Decision log

How you worked with AI on this engagement. Be specific: name files, prompts, and moments.

- **Tools used**:
- **Two or three things the AI produced that you kept, and why**:
- **Two or three things you rejected or reworked, and why**:
- **The prompt or technique that paid off most**:
- **The worst thing the AI gave you**:

## 5. Pushback

Anything in the brief you'd push back on as the SE, and what you'd propose instead.

## 6. Cut list

What you'd do next with more time, roughly in order.
