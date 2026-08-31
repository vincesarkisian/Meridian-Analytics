# Submission

Fill in every section and commit this file to your repo. Reviewers work from this document first, so treat it as part of the deliverable.

## 1. Links

Deployed URL, repo, and demo video.

- **Deployed app**: https://meridian-analytics-chi.vercel.app
- **Repo**: https://github.com/vincesarkisian/Meridian-Analytics
- **Video**: _(pending)_

## 2. Test credentials

One row per role. "What to try" should tell a reviewer what to click to see this role's experience.

| Role | Email | Password | What to try while logged in as this user |
| --- | --- | --- | --- |
| **Admin** — Vince Sarkisian (Acme Corp) | vince.sarkisian@gmail.com | `AEG8jmz*tna3mtf3fez` | `/members`: full management — invite, remove, change a member's role. `/account`: all three capabilities green. |
| **Team lead** — Tyrion Lannister (Acme Corp) | vince.sarkisian1+1@gmail.com | `ryw_zvw_GBE_xen9thq` | `/members`: can invite and remove members (the widget). `/account`: all three capabilities green. |
| **Compliance** — Rob Stark (Acme Corp) | vince.sarkisian1@gmail.com | `8Tyqk#B2LO^{;-D%` | `/members`: **read-only roster of the whole workspace** (sees every member, role, and status; no controls anywhere). |
| **Prospect admin** — John Snow (MFA + session demo) | vince.sarkisian1+2@gmail.com | `c0ttage48` | Sign-in requires **MFA** — enroll an authenticator on first login (see note). `/account` shows org "Prospect". Session **expires ~10s** after sign-in → next click bounces you to signin. |

> **MFA note:** Prospect Organization requires MFA for non-SSO members. John's authenticator factor is reset, so a reviewer enrolls their **own** authenticator on first sign-in. The 10s session limit means you'll be signed out quickly on purpose

## 3. Requirement map

One row per requirement as you understood them from the brief. Your enumeration is part of the answer.

| Scenario requirement | Where it's addressed (route / file / dashboard surface) | Notes on your interpretation |
| --- | --- | --- |
| 1. Each customer is a walled-off workspace; zero cross-tenant visibility | WorkOS **Organizations** `withAuth().organizationId` surfaced in `src/app/account/page.tsx`. Isolation is enforced by the org-scoped session server-side. | Clearest requirement and easiest to implement since its a core primitive in WorkOS. |
| 2. Self-serve member management (invite / remove / change access) — no support ticket | `/members` route: `src/app/members/page.tsx` (server, mints scoped widget token) + `src/app/members/members-widget.tsx` (WorkOS `UsersManagement` widget). Gated on `members:write`. | Token minted server-side, scoped to user+org+`widgets:users-table:manage`; the API key never reaches the browser. This is our answer to the customers ask to call the API from the frontend" question. |
| 3. Three user kinds: admins, team leads, compliance (read-only) | WorkOS **environment-level Roles & Permissions** + `src/lib/permissions.ts` (`can()` helper) + capabilities panel in `src/app/account/page.tsx`. `/members` renders three tiers: manage widget (write), **read-only roster** `src/app/members/members-readonly-list.tsx` (read), or no-access. Gated on permissions, never role slugs. | Roles: `admin` (read/write/manage_roles), `team-lead` (read/write), `compliance` (read only sees everyone) |
| 4. Acme employees sign in via their own Okta ("no Okta, no deal") | Active SSO connection on Acme via the **Test Identity Provider** (dashboard). App entry point `src/app/login/sso/route.ts` → `getSignInUrl({ organizationId })` routes straight to Acme's IdP; "Enterprise SSO (Acme)" button on `src/app/page.tsx`. | Used the sanctioned Test IdP as Acme's Okta stand-in. Password login kept alongside SSO. This is the weakest part of he demo, plan to reinforce this in the video that this is so out of the box it is not critical to demo in code. |
| 5. 24h session expiry + admin MFA for one customer only | **MFA**: Prospect org authentication policy ("Require non-SSO members … MFA", dashboard). **24h session**: app-enforced in `src/lib/session-policy.ts` + `src/middleware.ts` + `src/app/callback/route.ts`, Prospect only. | WorkOS per-org policy covers MFA natively but **not** session length that is environment-wide. The 24h for one org part is enforced in-app and a custome timeout can be set for any org. MFA policy is org-wide for non-SSO members. Showing how you can extend the timeout shows how you could customize the MFA authentication with custom logic. Or enforce MFA through your SSO log in. |
| Bonus: Slack `#customer-success` ping on seat changes | **Built** with WorkOS **Pipes**: `/integrations` (admin-only) connects Slack via the Pipes widget — `src/app/integrations/*` + `src/lib/slack.ts` (`pipes.getAccessToken('slack')` → `chat.postMessage`). Webhook `src/app/api/webhooks/workos/route.ts` is how you would construct the automatic seat trigger. | Important to show the extensibility of Pipes to show how you can set up slack notifications or how you can enable your customers to set slack notifications for their own events. |

## 4. Decision log

How you worked with AI on this engagement. Be specific: name files, prompts, and moments.

- **Tools used**: Claude Code (Opus 4.8) in the desktop app.

- **Two or three things the AI produced that you kept, and why**:
  1. The **permission-gating helper** `src/lib/permissions.ts` (`can()` checks permissions,
     never role slugs). Kept because the `workos-rbac` skill explicitly warns slug checks
     break with custom/multi-org roles — this is the correct, portable pattern.
  2. The **server-minted widget token** flow (`getWorkOS().widgets.getToken(...)` in
     `src/app/members/page.tsx`). Kept because it's the secure pattern and it _is_ the
     answer to the customer's "call the API from the frontend" question.
  3. The **app-level per-org 24h session** enforcement (`src/lib/session-policy.ts` +
     `middleware.ts`). Kept because WorkOS session length is environment-wide, so this was
     the only way to satisfy "24h for one customer only."

- **Two or three things you rejected or reworked, and why**:
  1. The **first middleware** cleared the sign-in-time marker cookie on expiry. Live testing
     showed a lingering refresh token could re-establish the session with no marker. Reworked to clear the session cookies and a true sign out.
  2. Considered **email-domain routing** for SSO, but reworked to a simple entry point because it is more reliable for the demo and our ability to work with Okta is table stakes with proof in the dashboard.
  3. Reordered the build so **RBAC (permissions) landed before the widgets**, so the
     `/members` page could be permission-gated from the start rather than retrofitted.
  4. Built a full **app-level admin-only MFA** flow (WorkOS MFA API + a custom `/mfa`
     enroll/challenge screen, scoped to Prospect admins), then **cut it**. It duplicates
     WorkOS's hosted MFA, double-prompts when the org policy is also on, and means owning an
     MFA UI. Shipped the native org-wide policy instead and kept the tradeoff as pushback.

- **The prompt or technique that paid off most**: installing the WorkOS skills and then
  **grounding every dashboard step against the real dashboard in the browser** instead of
  letting the AI invent click-paths. It surfaced the exact scopes (`widgets:users-table:manage`),
  the "check permissions not slugs" rule, and the fact that per-org session length isn't a
  native toggle — all before writing code.

- **The worst thing the AI gave you**: the per-org session limit _looked_ done but was not. It correctly detected expiry and cleared the local cookie but the WorkOS
  session was still alive, so AuthKit **silently re-authenticated** the user and reset the
  window, making the timeout look ignored. I only caught it by adding debug logging to the
  middleware and watching a fresh sign-in marker reappear right after each expiry. The fix
  was to end the WorkOS session.

## 5. Pushback

- **"Just call the WorkOS API from our frontend with the API key."** Hard no. The secret
  key in browser code is exposed to every visitor and grants full account access read and
  modify _every_ org, user, and connection. It also can't be scoped or revoked per user. The
  right pattern (already in this demo) keeps the key server-side and hands the browser a
  **short-lived, user+org+permission-scoped widget token**. And it doesn't even save a
  backend: AuthKit already runs server-side, so it is more secure and less code to maintain.

- **"24h sessions for one customer without changing the rest."** WorkOS session length is
  configured **environment-wide** (Applications → Sessions), not per-organization. The
  per-org policy only covers SSO and MFA. I enforced the 24h limit for Prospect in the app
  instead, and I'd tell the customer plainly: MFA-per-org is native today; per-org session
  length is not, so it's app-enforced (or a feature request to WorkOS).

- **"Admins have to sign in with MFA."** We chose the **org-wide** MFA policy on Prospect
  (native, WorkOS's hosted MFA UI). It requires MFA for **all non-SSO members** — a superset
  of "admins", so admins are covered. This is where its worth creating some tension in the deal that
  WorkOS can't do that with its built-in MFA and show our support to develop feature or push for a feature. I would evaluate if other customers have asked for this.

## 6. Cut list

Roughly in priority order:

1. **Activate the automatic Slack seat-change trigger.** The Pipes connect flow and a
   manual test button om the UI to send to `#customer-success` and the webhook handler
   (`src/app/api/webhooks/workos/route.ts`) is built to demonstrate automation capabilities. Remaining: register the deployed
   `/api/webhooks/workos` URL in WorkOS dashboard and set the Slack env vars
   on Vercel, so real member adds/removes fire the notification without the manual button.

2. **Real team scoping** for team leads to only be able to manage their team. This is app level logic to define teams so figured the app logic for roles and session timeout demontstrated how you can extend WorkOS foundations.

3. **Tests** for the pure helpers (`isProspectSessionExpired`, `can`). Tests for all the code. Prioritized functionin code for the prospect over a robust code base.
