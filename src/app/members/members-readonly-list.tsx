import { getWorkOS } from "@workos-inc/authkit-nextjs";
import { Avatar, Badge, Flex, Table, Text } from "@radix-ui/themes";

/**
 * Read-only member list for the Compliance role (Requirement 3: "see everything,
 * change nothing"). Compliance has `members:read` but not the widget permission, so
 * we can't use the manage widget — instead we render the roster server-side from the
 * WorkOS API. It's a plain table: no invite/remove/role controls anywhere.
 *
 * This is a Server Component, so the WorkOS calls (and the API key) stay on the
 * server. (getUser per membership is fine at demo scale; batch for large orgs.)
 */
export async function MembersReadonlyList({
  organizationId,
}: {
  organizationId: string;
}) {
  const memberships =
    await getWorkOS().userManagement.listOrganizationMemberships({
      organizationId,
      limit: 100,
    });

  const members = await Promise.all(
    memberships.data.map(async (m) => ({
      user: await getWorkOS().userManagement.getUser(m.userId),
      role: m.role?.slug ?? "—",
      status: m.status,
    })),
  );

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {members.map(({ user, role, status }) => {
          const name =
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.email;
          const initials =
            [user.firstName?.[0], user.lastName?.[0]]
              .filter(Boolean)
              .join("") ||
            user.email[0]?.toUpperCase() ||
            "?";

          return (
            <Table.Row key={user.id}>
              <Table.Cell>
                <Flex align="center" gap="3">
                  <Avatar
                    size="2"
                    radius="full"
                    src={user.profilePictureUrl ?? undefined}
                    fallback={initials}
                  />
                  <Flex direction="column">
                    <Text size="2" weight="medium">
                      {name}
                    </Text>
                    <Text size="1" color="gray">
                      {user.email}
                    </Text>
                  </Flex>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Badge variant="soft">{role}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Text size="2" color="gray">
                  {status}
                </Text>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
