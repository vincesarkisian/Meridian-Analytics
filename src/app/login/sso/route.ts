import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

/**
 * Requirement 4: organization-scoped sign-in ("Enterprise SSO").
 *
 * Passing `organizationId` to AuthKit routes the user straight to that
 * organization's authentication. If the org has an active SSO connection (Acme's
 * Test IdP standing in for their Okta), AuthKit sends them to that IdP instead of
 * the email/password screen. Before a connection exists this simply falls back to
 * the org's normal auth, so the route is safe to ship ahead of the dashboard setup.
 *
 * `getSignInUrl` sets the PKCE cookie, so it must run in a Route Handler (here) or a
 * Server Action — never during a Server Component render.
 */
export const GET = async () => {
  const organizationId = process.env.DEMO_ACME_ORG_ID;

  const signInUrl = await getSignInUrl(
    organizationId ? { organizationId } : undefined,
  );

  return redirect(signInUrl);
};
