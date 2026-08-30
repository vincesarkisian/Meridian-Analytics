import { authkit, handleAuthkitHeaders } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_STARTED_COOKIE,
  isProspectSessionExpired,
} from "@/lib/session-policy";

/**
 * We compose AuthKit's middleware (via the `authkit` helper) with one extra rule:
 * Requirement 5's per-org 24h session limit for the Prospect org. Everything else
 * behaves exactly like the default `authkitMiddleware()`.
 */
export default async function middleware(request: NextRequest) {
  const { session, headers } = await authkit(request);

  // End a Prospect-org session once it exceeds the org's max age.
  if (
    session.user &&
    isProspectSessionExpired(
      session.organizationId,
      request.cookies.get(SESSION_STARTED_COOKIE)?.value,
    )
  ) {
    // Clear the AuthKit session cookies so the user must sign in again. We KEEP
    // the sign-in-time marker: a fresh sign-in overwrites it, and keeping it means
    // a session that survives (e.g. a lingering refresh token) is still treated as
    // expired rather than silently un-enforced.
    const response = NextResponse.redirect(new URL("/", request.url));
    const expire = { path: "/" as const, maxAge: 0, sameSite: "lax" as const };
    response.cookies.set("wos-session", "", expire);
    response.cookies.set("workos-access-token", "", expire);
    return response;
  }

  return handleAuthkitHeaders(request, headers);
}

// Match against the pages
export const config = {
  matcher: ["/", "/account/:path*", "/members/:path*", "/api/:path*"],
};
