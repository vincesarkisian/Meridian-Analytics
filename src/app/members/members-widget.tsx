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

export function MembersWidget({ authToken }: { authToken: string }) {
  return (
    <WorkOsWidgets>
      <UsersManagement authToken={authToken} />
    </WorkOsWidgets>
  );
}
