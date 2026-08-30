"use client";

/**
 * The WorkOS User Profile widget: lets the signed-in user view and edit their own
 * profile (name, email, profile picture). Like the members widget, it receives only
 * a server-minted `authToken` string — the API key stays on the server. The
 * user-profile widget needs no permission scope on its token.
 */
import { WorkOsWidgets, UserProfile } from "@workos-inc/widgets";

export function AccountProfile({ authToken }: { authToken: string }) {
  return (
    <WorkOsWidgets>
      <UserProfile authToken={authToken} />
    </WorkOsWidgets>
  );
}
