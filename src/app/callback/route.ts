import { handleAuth } from "@workos-inc/authkit-nextjs";
import { cookies } from "next/headers";
import { SESSION_STARTED_COOKIE } from "@/lib/session-policy";

/**
 * Completes the AuthKit sign-in. We add an `onSuccess` hook that stamps the
 * sign-in time in a cookie, so the middleware can enforce the Prospect org's
 * 24h session limit (Requirement 5). This runs for every sign-in; only Prospect
 * sessions are actually enforced against it.
 */
export const GET = handleAuth({
  onSuccess: async () => {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_STARTED_COOKIE, Date.now().toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  },
});
