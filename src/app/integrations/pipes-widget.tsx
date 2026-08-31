"use client";

/**
 * The WorkOS Pipes widget, filtered to Slack. It renders a "Connect Slack" button and
 * manages the entire OAuth flow (WorkOS Pipes owns authorization + token refresh — no
 * custom OAuth on our side). It authenticates with the AuthKit session access token.
 */
import { WorkOsWidgets, Pipes } from "@workos-inc/widgets";

export function PipesWidget({ authToken }: { authToken: string }) {
  return (
    <WorkOsWidgets>
      <Pipes authToken={authToken} filter={{ slugs: ["slack"] }} />
    </WorkOsWidgets>
  );
}
