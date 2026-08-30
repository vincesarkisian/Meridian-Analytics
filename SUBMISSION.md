# Submission

Fill in every section and commit this file to your repo. Reviewers work from this document first, so treat it as part of the deliverable.

## 1. Links

Deployed URL, repo, and demo video.

- **Deployed app**:
- **Repo**:
- **Video**:

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
| 2. Self-serve member management (invite / remove / change access) — no support ticket | _Planned: Step 4 — WorkOS User Management widgets._ | — |
| 4. Acme employees sign in via their own Okta ("no Okta, no deal") | _Planned: Step 5 — WorkOS SSO via the sanctioned Test Identity Provider._ | — |
| 5. 24h session expiry + admin MFA for one customer only | _Planned: Step 6 — per-organization authentication policy._ | — |
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
