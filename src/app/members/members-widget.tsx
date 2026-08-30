"use client";

/**
 * Client wrapper for the WorkOS User Management widget (Requirement 2).
 *
 * The widget is interactive, so it must be a Client Component. It receives only a
 * serializable `authToken` string from the server page — the WorkOS secret API key
 * never reaches the browser. `WorkOsWidgets` is the provider (it sets up its own
 * react-query client internally); `UsersManagement` is the members table + invite/
 * remove/change-role UI.
 */
import { WorkOsWidgets, UsersManagement } from "@workos-inc/widgets";

// Match the widget chrome to the Meridian brand (dark, jade accent).
const widgetTheme = {
  appearance: "dark",
  accentColor: "jade",
  grayColor: "sage",
  radius: "medium",
  panelBackground: "solid",
  fontFamily: "'Instrument Sans', system-ui, sans-serif",
} as const;

export function MembersWidget({ authToken }: { authToken: string }) {
  return (
    <WorkOsWidgets theme={widgetTheme}>
      <UsersManagement authToken={authToken} />
    </WorkOsWidgets>
  );
}
