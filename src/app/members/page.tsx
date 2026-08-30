import { withAuth, getWorkOS } from "@workos-inc/authkit-nextjs";
import { Flex, Heading, Text, Callout } from "@radix-ui/themes";
import { PERMISSIONS, can } from "@/lib/permissions";
import { MembersWidget } from "./members-widget";

/**
 * Requirement 2: self-serve member management.
 *
 * Admins (and team leads) manage their own workspace's members — invite, remove,
 * change access — with no support ticket. We render the WorkOS User Management
 * widget. The security-critical piece is that the widget's access token is minted
 * HERE, on the server, scoped to this user + organization + a single permission.
 * The WorkOS API key stays server-side; the browser never sees it.
 */
export default async function MembersPage() {
  const { user, organizationId, permissions } = await withAuth({
    ensureSignedIn: true,
  });

  const header = (
    <Flex direction="column" gap="2" mb="6" align="center">
      <Heading size="8">Members</Heading>
      <Text size="4" color="gray">
        Manage who has access to your workspace
      </Text>
    </Flex>
  );

  // A session must be scoped to an organization to manage that org's members.
  if (!organizationId) {
    return (
      <Flex direction="column" width="500px">
        {header}
        <Callout.Root color="amber">
          <Callout.Text>
            Your session isn&apos;t scoped to an organization, so there are no
            members to manage.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    );
  }

  // Read-only roles (e.g. Compliance) can reach this page but cannot manage.
  if (!can(permissions, PERMISSIONS.MEMBERS_WRITE)) {
    return (
      <Flex direction="column" width="500px">
        {header}
        <Callout.Root color="gray">
          <Callout.Text>
            You have read-only access. Only admins and team leads can invite,
            remove, or change members.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    );
  }

  // Mint a short-lived widget token, scoped to this user + org + the users-table
  // permission. Requires the user's WorkOS role to hold `widgets:users-table:manage`.
  let authToken: string;
  try {
    authToken = await getWorkOS().widgets.getToken({
      organizationId,
      userId: user.id,
      scopes: ["widgets:users-table:manage"],
    });
  } catch {
    return (
      <Flex direction="column" width="500px">
        {header}
        <Callout.Root color="red">
          <Callout.Text>
            Couldn&apos;t load member management. Your role needs the
            <code> widgets:users-table:manage </code> permission in WorkOS.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    );
  }

  return (
    <Flex direction="column" width="640px" maxWidth="100%">
      {header}
      <MembersWidget authToken={authToken} />
    </Flex>
  );
}
