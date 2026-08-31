"use server";

import { withAuth, getWorkOS } from "@workos-inc/authkit-nextjs";
import { postToSlack } from "@/lib/slack";

/**
 * Send a sample "seat change" notification to a Slack channel, using the current
 * admin's Pipes-connected Slack account. Lets you verify the pipe end-to-end without
 * waiting for a real membership webhook.
 */
export async function sendTestSeatChange(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });

  // Post to the configured channel (a channel ID) server-side — chat.postMessage
  // rejects channel names, so we never take a name from the client.
  const channel = process.env.SLACK_CUSTOMER_SUCCESS_CHANNEL;
  if (!channel) {
    return { ok: false, error: "SLACK_CUSTOMER_SUCCESS_CHANNEL isn't set." };
  }

  // Name the org so the notification reads like a real "user added" event.
  let orgName = "the workspace";
  if (organizationId) {
    try {
      orgName = (await getWorkOS().organizations.getOrganization(organizationId))
        .name;
    } catch {
      // fall back to the generic label
    }
  }

  const text = `:wave: *New user added* — a new user was just added to the *${orgName}* organization. _Test from the integrations page by ${user.email}._`;

  return postToSlack(user.id, organizationId, channel, text);
}
