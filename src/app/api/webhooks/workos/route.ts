import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { postToSlack } from "@/lib/slack";

/**
 * WorkOS webhook: the automatic seat-change trigger for the Slack bonus.
 *
 * WorkOS posts membership events here; we verify the signature, and on a member being
 * added or removed we ping the #customer-success channel via Pipes. The notification is
 * sent as the admin who connected Slack (Pipes tokens are per-user), configured via env.
 *
 * Configure in the WorkOS dashboard: Webhooks → endpoint
 * `https://<deployed-url>/api/webhooks/workos`, events
 * `organization_membership.created` + `organization_membership.deleted`.
 */
export async function POST(request: NextRequest) {
  // WorkOS's SDK verifies the signature over the parsed JSON body.
  const payload = (await request.json()) as Record<string, unknown>;
  const sigHeader = request.headers.get("workos-signature") ?? "";
  const secret = process.env.WORKOS_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  let event;
  try {
    event = await getWorkOS().webhooks.constructEvent({
      payload,
      sigHeader,
      secret,
    });
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (
    event.event === "organization_membership.created" ||
    event.event === "organization_membership.deleted"
  ) {
    const added = event.event === "organization_membership.created";
    const adminUserId = process.env.DEMO_SLACK_ADMIN_USER_ID;
    const channel = process.env.SLACK_CUSTOMER_SUCCESS_CHANNEL;

    if (adminUserId && channel) {
      const membership = event.data;
      // Resolve friendly names for the message; fall back to ids.
      let who: string = membership.userId;
      let where: string = membership.organizationId;
      try {
        const [user, org] = await Promise.all([
          getWorkOS().userManagement.getUser(membership.userId),
          getWorkOS().organizations.getOrganization(membership.organizationId),
        ]);
        who = user.email;
        where = org.name;
      } catch {
        // keep the ids
      }

      const text = `:busts_in_silhouette: *Seat ${added ? "added" : "removed"}* — ${who} was ${added ? "added to" : "removed from"} *${where}*.`;
      await postToSlack(adminUserId, membership.organizationId, channel, text);
    }
  }

  return NextResponse.json({ received: true });
}
