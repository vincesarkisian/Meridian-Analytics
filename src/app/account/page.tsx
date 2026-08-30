import { withAuth } from "@workos-inc/authkit-nextjs";
import { Text, Heading, TextField, Flex, Box } from "@radix-ui/themes";
import { PERMISSIONS, can } from "@/lib/permissions";

export default async function AccountPage() {
  const { user, role, permissions, organizationId } = await withAuth({
    ensureSignedIn: true,
  });

  const userFields = [
    ["First name", user?.firstName],
    ["Last name", user?.lastName],
    ["Email", user?.email],
    organizationId ? ["Organization", organizationId] : [],
    role ? ["Role", role] : [],
    permissions ? ["Permissions", permissions] : [],
    ["Id", user?.id],
  ].filter((arr) => arr.length > 0);

  // Requirement 3: what this session can do, derived from its permissions.
  // Each row reflects a real permission, so admin / team-lead / compliance
  // sessions visibly differ here.
  const capabilities = [
    [PERMISSIONS.MEMBERS_READ, "View the member list"],
    [PERMISSIONS.MEMBERS_WRITE, "Invite and remove members"],
    [PERMISSIONS.MEMBERS_MANAGE_ROLES, "Change a member's access"],
  ] as const;

  return (
    <>
      <Flex direction="column" gap="2" mb="7">
        <Heading size="8" align="center">
          Account details
        </Heading>
        <Text size="5" align="center" color="gray">
          Below are your account details
        </Text>
      </Flex>

      {userFields && (
        <Flex direction="column" justify="center" gap="3" width="400px">
          {userFields.map(([label, value]) => (
            <Flex asChild align="center" gap="6" key={String(value)}>
              <label>
                <Text weight="bold" size="3" style={{ width: 100 }}>
                  {label}
                </Text>

                <Box flexGrow="1">
                  <TextField.Root value={String(value) || ""} readOnly />
                </Box>
              </label>
            </Flex>
          ))}
        </Flex>
      )}

      <Flex direction="column" gap="2" mt="7" width="400px">
        <Heading size="4">What you can do here</Heading>
        {capabilities.map(([permission, label]) => {
          const allowed = can(permissions, permission);
          return (
            <Text key={permission} size="3" color={allowed ? "green" : "gray"}>
              {allowed ? "✓" : "✕"} {label}
            </Text>
          );
        })}
      </Flex>
    </>
  );
}
