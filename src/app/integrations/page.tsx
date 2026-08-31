import { withAuth } from "@workos-inc/authkit-nextjs";
import { Callout } from "@radix-ui/themes";
import { PERMISSIONS, can } from "@/lib/permissions";
import { PipesWidget } from "./pipes-widget";
import { TestNotifyForm } from "./test-notify-form";

/**
 * Bonus: Slack notifications on seat changes via WorkOS Pipes.
 *
 * Admins connect Slack here (the Pipes widget owns the OAuth), and a WorkOS webhook
 * (`/api/webhooks/workos`) pings #customer-success whenever a membership is created or
 * removed. The "Send test" button exercises the same path without waiting for a webhook.
 */
export default async function IntegrationsPage() {
  const { accessToken, permissions } = await withAuth({ ensureSignedIn: true });

  const isAdmin = can(permissions, PERMISSIONS.MEMBERS_MANAGE_ROLES);
  const channelLabel =
    process.env.SLACK_CUSTOMER_SUCCESS_CHANNEL ?? "(not configured)";

  const header = (
    <div className="page-head">
      <div className="eyebrow">Integrations</div>
      <h1>Slack notifications</h1>
      <p>
        Ping your #customer-success channel whenever a customer adds or removes
        someone — powered by WorkOS Pipes, so there&apos;s no OAuth to build or
        maintain.
      </p>
    </div>
  );

  if (!isAdmin) {
    return (
      <div>
        {header}
        <Callout.Root color="gray">
          <Callout.Text>
            Only admins can manage workspace integrations.
          </Callout.Text>
        </Callout.Root>
      </div>
    );
  }

  return (
    <div>
      {header}

      <div className="brand-card" style={{ marginBottom: 16 }}>
        <div className="section-header">Connect Slack</div>
        <PipesWidget authToken={accessToken} />
      </div>

      <div className="brand-card">
        <div className="section-header">Test: new user added</div>
        <p className="lead" style={{ margin: "8px 0 12px" }}>
          Simulate a new user being added to the platform and post that
          notification to your customer-success channel.
        </p>
        <TestNotifyForm channelLabel={channelLabel} />
      </div>
    </div>
  );
}
