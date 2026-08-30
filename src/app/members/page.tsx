import { withAuth, getWorkOS } from "@workos-inc/authkit-nextjs";
import { Flex, Heading, Text, Callout } from "@radix-ui/themes";
import { PERMISSIONS, can } from "@/lib/permissions";
import { MembersWidget } from "./members-widget";
import { MembersReadonlyList } from "./members-readonly-list";

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

  // Look up the org's display name so the header names the workspace.
  let organizationName: string | null = null;
  if (organizationId) {
    try {
      const org = await getWorkOS().organizations.getOrganization(organizationId);
      organizationName = org.name;
    } catch {
      organizationName = null;
    }
  }

  const header = (
    <Flex direction="column" gap="2" mb="6" align="center">
      <Heading size="8">Members</Heading>
      <Text size="4" color="gray">
        Manage who has access to {organizationName ?? "your workspace"}
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

  const canManage = can(permissions, PERMISSIONS.MEMBERS_WRITE);
  const canRead = can(permissions, PERMISSIONS.MEMBERS_READ);

  // No membership permissions at all (e.g. the default member role).
  if (!canManage && !canRead) {
    return (
      <Flex direction="column" width="500px">
        {header}
        <Callout.Root color="gray">
          <Callout.Text>
            You don&apos;t have access to this workspace&apos;s members.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    );
  }

  // Read-only roles (Compliance): see the full roster, no management controls.
  if (!canManage && canRead) {
    return (
      <Flex direction="column" width="640px" maxWidth="100%">
        {header}
        <Callout.Root color="gray" mb="4">
          <Callout.Text>
            Read-only view — you can see everyone in the workspace but can&apos;t
            invite, remove, or change members.
          </Callout.Text>
        </Callout.Root>
        <MembersReadonlyList organizationId={organizationId} />
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
