import { getWorkOS } from "@workos-inc/authkit-nextjs";

/**
 * Post a message to a Slack channel using a WorkOS Pipes-connected Slack account.
 *
 * WorkOS Pipes owns the OAuth lifecycle: `pipes.getAccessToken` returns a fresh Slack
 * token (auto-refreshed) for a user who has connected Slack, or a failure verdict if
 * they haven't. We then call Slack's `chat.postMessage` with that token. All of this is
 * server-side — neither the WorkOS API key nor the Slack token reaches the browser.
 */
export async function postToSlack(
  userId: string,
  organizationId: string | undefined,
  channel: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  // Connections made through the widget (with an org-scoped session token) are
  // org-scoped, so try (user + org) first, then fall back to a user-only connection.
  let token = await getWorkOS().pipes.getAccessToken({
    provider: "slack",
    userId,
    organizationId,
  });
  if (!token.active && organizationId) {
    token = await getWorkOS().pipes.getAccessToken({ provider: "slack", userId });
  }

  if (!token.active) {
    return {
      ok: false,
      error:
        token.error === "not_installed"
          ? "Slack isn't connected yet — connect it above first."
          : "Slack needs to be re-authorized.",
    };
  }

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.accessToken.accessToken}`,
    },
    body: JSON.stringify({
      channel,
      text,
      blocks: [{ type: "section", text: { type: "mrkdwn", text } }],
    }),
  });

  const data = (await response.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    return { ok: false, error: `Slack rejected the message: ${data.error}` };
  }
  return { ok: true };
}
