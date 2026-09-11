import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

/**
 * Requirement 4: organization-scoped sign-in ("Enterprise SSO").
 *
 * Passing `organizationId` to AuthKit routes the user straight to that
 * organization's authentication. The Prospect org has an active Okta SSO
 * connection, so AuthKit sends them to Okta instead of the email/password screen.
 * If the connection were removed this simply falls back to the org's normal auth.
 *
 * `getSignInUrl` sets the PKCE cookie, so it must run in a Route Handler (here) or a
 * Server Action, never during a Server Component render.
 */
export const GET = async () => {
  const organizationId = process.env.DEMO_PROSPECT_ORG_ID;

  const signInUrl = await getSignInUrl(
    organizationId ? { organizationId } : undefined,
  );

  return redirect(signInUrl);
};
