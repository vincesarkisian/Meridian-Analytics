/**
 * Requirement 5: a stricter session policy for ONE customer (the "Prospect" org)
 * without changing anything for the others.
 *
 * WorkOS session length is configured environment-wide (Applications -> Sessions),
 * not per organization. So the per-org part ("24h for one customer only") is
 * enforced in our own app: we stamp the sign-in time in a cookie at the callback,
 * and the middleware ends any Prospect session older than the limit. Sessions in
 * every other org are left completely alone.
 *
 * (Admin MFA, the other half of Requirement 5, IS native per-org — configured as
 * the Prospect organization's authentication policy in the WorkOS dashboard.)
 */

/** Cookie recording when the current session signed in (epoch ms, as a string). */
export const SESSION_STARTED_COOKIE = "meridian_session_started_at";

/** The org this stricter policy applies to. Undefined disables enforcement. */
export const PROSPECT_ORG_ID = process.env.DEMO_PROSPECT_ORG_ID;

/**
 * Max session age for the Prospect org. Defaults to 24h. For a live demo, set
 * PROSPECT_SESSION_MAX_SECONDS (e.g. 10) to make the expiry easy to show without
 * waiting a full day; it takes precedence over the default when > 0.
 */
const demoSeconds = Number(process.env.PROSPECT_SESSION_MAX_SECONDS);
export const PROSPECT_MAX_SESSION_MS =
  demoSeconds > 0 ? demoSeconds * 1000 : 24 * 60 * 60 * 1000;

/**
 * True when a session belongs to the Prospect org and is older than the allowed
 * max. A missing/blank `startedAtRaw` is treated as NOT expired, so we never lock
 * out a session whose age we can't determine (every fresh sign-in stamps it).
 */
export function isProspectSessionExpired(
  organizationId: string | undefined,
  startedAtRaw: string | undefined,
): boolean {
  if (!PROSPECT_ORG_ID || organizationId !== PROSPECT_ORG_ID) return false;
  const startedAt = Number(startedAtRaw);
  if (!startedAt) return false;
  return Date.now() - startedAt > PROSPECT_MAX_SESSION_MS;
}
