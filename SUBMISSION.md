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
| **Admin** (Vince Sarkisian, Acme Corp) | vince.sarkisian@gmail.com | `AEG8jmz*tna3mtf3fez` | `/members`: full management. Invite, remove, and change a member's role. `/account`: all three capabilities green. |
| **Team lead** (Tyrion Lannister, Acme Corp) | vince.sarkisian1+1@gmail.com | `ryw_zvw_GBE_xen9thq` | `/members`: invite and remove members through the widget. `/account`: all three capabilities green. |
| **Compliance** (Rob Stark, Acme Corp) | vince.sarkisian1@gmail.com | `8Tyqk#B2LO^{;-D%` | `/members`: a **read-only roster of the whole workspace** (every member, role, and status, with no controls anywhere). |
| **Prospect admin** (John Snow, MFA + session demo) | vince.sarkisian1+2@gmail.com | `c0ttage48` | Sign-in requires **MFA**, so enroll an authenticator on first login (see note). `/account` shows org "Prospect". The session expires about 10 seconds after sign-in, so your next click sends you back to sign-in. That is Requirement 5 firing. |

> **MFA note:** The Prospect organization requires MFA for non-SSO members. John's authenticator factor is reset, so a reviewer enrolls their **own** authenticator on first sign-in. The 10-second session limit means you get signed out quickly, which is on purpose.

## 3. Requirement map

One row per requirement as you understood them from the brief. Your enumeration is part of the answer.

| Scenario requirement | Where it's addressed (route / file / dashboard surface) | Notes on your interpretation |
| --- | --- | --- |
| 1. Each customer is a walled-off workspace; zero cross-tenant visibility | WorkOS **Organizations**. `withAuth().organizationId` is surfaced in `src/app/account/page.tsx`. Isolation is enforced by the org-scoped session on the server. | The clearest requirement and the easiest to build, since multi-tenancy is a core WorkOS primitive. |
| 2. Self-serve member management (invite / remove / change access), no support ticket | `/members`: `src/app/members/page.tsx` (server, mints a scoped widget token) plus `src/app/members/members-widget.tsx` (WorkOS `UsersManagement` widget). Gated on `members:write`. | The token is minted server-side and scoped to a user, org, and `widgets:users-table:manage`, so the API key never reaches the browser. That answers the customer's idea of calling the API from the frontend. |
| 3. Three user kinds: admins, team leads, compliance (read-only) | WorkOS **environment-level Roles & Permissions**, `src/lib/permissions.ts` (`can()` helper), and the capabilities panel in `src/app/account/page.tsx`. `/members` renders three tiers: the manage widget (write), a **read-only roster** in `src/app/members/members-readonly-list.tsx` (read), or no access. Gated on permissions, never role slugs. | Roles: `admin` (read/write/manage_roles), `team-lead` (read/write), `compliance` (read, so they see everyone and change nothing). |
| 4. Acme employees sign in through their own Okta ("no Okta, no deal") | An active SSO connection on Acme using the **Test Identity Provider** (dashboard). The app entry point `src/app/login/sso/route.ts` calls `getSignInUrl({ organizationId })` to route straight to Acme's IdP, with an "Enterprise SSO" button on `src/app/page.tsx`. | I used the sanctioned Test IdP as Acme's Okta stand-in and kept password login alongside SSO. This is the weakest part of the demo. The plan is to reinforce it in the video, since SSO is so out of the box that it is not critical to show in code. |
| 5. 24h session expiry + admin MFA for one customer only | **MFA**: the Prospect org authentication policy ("Require non-SSO members to enroll in MFA", dashboard). **24h session**: enforced in the app in `src/lib/session-policy.ts`, `src/middleware.ts`, and `src/app/callback/route.ts`, for Prospect only. | The WorkOS per-org policy covers MFA natively, but session length is environment-wide. So the 24h-for-one-org part is enforced in the app, and you can set a custom timeout for any org. MFA is org-wide for non-SSO members. The timeout work shows how you would extend that further, for example custom MFA logic or MFA enforced through the SSO login. |
| Bonus: Slack `#customer-success` ping on seat changes | **Built** with WorkOS **Pipes**. `/integrations` (admin only) connects Slack through the Pipes widget (`src/app/integrations/*` plus `src/lib/slack.ts`, which calls `pipes.getAccessToken('slack')` then `chat.postMessage`). The webhook in `src/app/api/webhooks/workos/route.ts` is how you would wire the automatic seat-change trigger. | Worth showing to make the point about how extensible Pipes is. You can set up Slack notifications yourself, or let customers set up their own for their own events. |

## 4. Decision log

How you worked with AI on this engagement. Be specific: name files, prompts, and moments.

- **Tools used**: Claude Code (Opus 4.8) in the desktop app.

- **Two or three things the AI produced that you kept, and why**:
  1. The permission helper `src/lib/permissions.ts` (`can()` checks permissions, never role slugs). I kept it because the `workos-rbac` skill warns that slug checks break with custom or multi-org roles, so this is the portable pattern.
  2. The server-minted widget token flow (`getWorkOS().widgets.getToken(...)` in `src/app/members/page.tsx`). I kept it because it is the secure pattern, and it is the answer to the customer's "call the API from the frontend" idea.
  3. The app-level per-org 24h session enforcement (`src/lib/session-policy.ts` plus `middleware.ts`). I kept it because WorkOS session length is environment-wide, so this was the only way to do "24h for one customer only."

- **Two or three things you rejected or reworked, and why**:
  1. The first middleware cleared the sign-in-time marker cookie on expiry. Live testing showed a lingering refresh token could bring the session back with no marker, so I reworked it to clear the session cookies and do a real sign-out.
  2. I considered email-domain routing for SSO, but reworked it to a simple entry point. It is more reliable for the demo, and proving WorkOS works with Okta is table stakes that the dashboard already shows.
  3. I reordered the build so RBAC landed before the widgets, so the `/members` page could be permission-gated from the start instead of retrofitted.
  4. I built a full app-level admin-only MFA flow (WorkOS MFA API plus a custom `/mfa` enroll and challenge screen, scoped to Prospect admins), then cut it. It duplicates WorkOS's hosted MFA, double-prompts when the org policy is also on, and means owning an MFA UI. I shipped the native org-wide policy instead and kept the tradeoff as pushback.

- **The prompt or technique that paid off most**: installing the WorkOS skills, then checking every dashboard step against the real dashboard in the browser instead of letting the AI guess click-paths. That surfaced the exact scopes (`widgets:users-table:manage`), the "check permissions not slugs" rule, and the fact that per-org session length is not a native toggle, all before writing code.

- **The worst thing the AI gave you**: the per-org session limit looked done but was not. It detected expiry and cleared the local cookie, but the WorkOS session was still alive, so AuthKit silently re-authenticated the user and reset the window. The timeout looked ignored. I only caught it by adding debug logging to the middleware and watching a fresh sign-in marker reappear right after each expiry. The fix was to end the WorkOS session, not just the cookie.

## 5. Pushback

- **"Just call the WorkOS API from our frontend with the API key."** Hard no. The secret key in browser code is exposed to every visitor and grants full account access, so anyone can read and modify every org, user, and connection, and it cannot be scoped or revoked per user. The pattern in this demo keeps the key server-side and hands the browser a short-lived token scoped to a user, org, and permission. It also does not save a backend: AuthKit already runs server-side, so this is more secure and less code to maintain.

- **"24h sessions for one customer without changing the rest."** WorkOS session length is set environment-wide (Applications, Sessions), not per organization. The per-org policy only covers SSO and MFA. I enforced the 24h limit for Prospect in the app, and I would tell the customer plainly: MFA per org is native today, per-org session length is not, so it is app-enforced (or a feature request to WorkOS).

- **"Admins have to sign in with MFA."** I used the org-wide MFA policy on Prospect (native, WorkOS's hosted UI). It requires MFA for all non-SSO members, which is a superset of admins, so admins are covered. This is a good place to create some tension in the deal: WorkOS cannot do admin-only MFA with its built-in tools, so I would show support for building the feature or pushing for it, and check whether other customers have asked for the same thing.

## 6. Cut list

Roughly in priority order:

1. **Activate the automatic Slack seat-change trigger.** The Pipes connect flow works, there is a manual button in the UI to send to `#customer-success`, and the webhook handler (`src/app/api/webhooks/workos/route.ts`) is built to show the automation. What is left: register the deployed `/api/webhooks/workos` URL in the WorkOS dashboard and set the Slack env vars on Vercel, so real member adds and removes fire the notification without the manual button.

2. **Real team scoping** so team leads can only manage their own team. This is app-level logic to define teams. I figured the app logic for roles and the session timeout already show how you extend the WorkOS foundations.

3. **Tests** for the pure helpers (`isProspectSessionExpired`, `can`), and then tests across the rest of the code. I prioritized working code for the Prospect flow over a fully covered codebase.
