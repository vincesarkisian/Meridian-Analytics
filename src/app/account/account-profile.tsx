"use client";

/**
 * The WorkOS User Profile widget: lets the signed-in user view and edit their own
 * profile (name, email, profile picture). Like the members widget, it receives only
 * a server-minted `authToken` string — the API key stays on the server. The
 * user-profile widget needs no permission scope on its token.
 */
import { WorkOsWidgets, UserProfile } from "@workos-inc/widgets";

const widgetTheme = {
  appearance: "dark",
  accentColor: "jade",
  grayColor: "sage",
  radius: "medium",
  panelBackground: "solid",
  fontFamily: "'Instrument Sans', system-ui, sans-serif",
} as const;

export function AccountProfile({ authToken }: { authToken: string }) {
  return (
    <WorkOsWidgets theme={widgetTheme}>
      <UserProfile authToken={authToken} />
    </WorkOsWidgets>
  );
}
