# CLAUDE.md — Working agreement for this repo

This is a **WorkOS Solutions Engineer take-home** (the "Meridian Engagement"). The goal
is not just working code — it's that **Vince understands every line** well enough to
present it back to the WorkOS engineering team.

## How we work (read this every turn)

1. **Step by step.** Do one coherent step at a time. Do not race ahead and scaffold
   five features at once. Finish a step, explain it, let Vince absorb it, then move on.
2. **Explain every line.** When code is added or changed, walk through what each part
   does and *why*, in plain language. Assume Vince will be asked to defend it live.
3. **Document every turn in two places** (this is mandatory, not optional):
   - **`NOTES.md`** — the running decision log. Append a dated entry for each turn:
     what we did, why, what WorkOS concept it maps to, and anything we learned or
     rejected. This is our engineering journal.
   - **`SUBMISSION.md`** — the graded deliverable. Keep its sections
     (requirement map, decision log, pushback, cut list) in sync as we go, so it is
     never a last-minute scramble.
4. **Tie work back to the brief.** Every build step should trace to a requirement in
   `SCENARIO.md`. If it doesn't earn its place against the brief, flag it.
5. **Surface SE judgment.** The brief contains deliberate traps and choices (e.g.
   "call the WorkOS API from the frontend with the API key" → don't; secret leak).
   Call these out and record the reasoning in `SUBMISSION.md` §5 Pushback.

## The five things the demo must prove (from SCENARIO.md)

1. **Multi-tenancy** — each customer a walled-off workspace, zero cross-tenant visibility → WorkOS **Organizations**.
2. **Self-serve admin** — Acme admins invite/remove/change access, no support ticket → **User Management** (+ Admin Portal / widgets).
3. **Three roles** — admin, team lead, compliance (read-only) → **Roles & Permissions (RBAC)**.
4. **SSO via Okta** — "no Okta, no deal"; use the **WorkOS Test IdP** as the sanctioned stand-in.
5. **Per-org auth policy** — 24h session expiry + admin MFA for ONE customer only → **per-organization settings**.

Optional bonus: Slack ping to `#customer-success` on seat changes → **WorkOS Pipes**.

## Stack

Next.js 15 (App Router) + `@workos-inc/authkit-nextjs` + Radix Themes. Auth is already
wired: `middleware.ts` (authkitMiddleware), `/login`, `/callback`, `/account`, `signOut`.

## Deliverables (README)

Deployed Vercel URL · repo link · one test login per role · 5–10 min demo video ·
completed `SUBMISSION.md`.
