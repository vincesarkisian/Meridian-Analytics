"use client";

/**
 * Header auth control. When signed out it's a "Sign In" button; when signed in it
 * shows the user's avatar + name next to Sign Out. Uses the AuthKit `useAuth` hook
 * (the idiomatic way to read the session client-side) — WorkOS widgets cover full
 * self-service panels (UserProfile, UserSecurity, ...), not a compact header chip.
 */

import { Avatar, Button, Flex, Text } from "@radix-ui/themes";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { handleSignOutAction } from "../actions/signOut";

export function SignInButton({ large }: { large?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
    const initials =
      [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
      user.email[0]?.toUpperCase() ||
      "?";

    return (
      <Flex align="center" gap="3">
        <Avatar
          size="2"
          radius="full"
          src={user.profilePictureUrl ?? undefined}
          fallback={initials}
        />
        <Text size="2" weight="medium">
          {name}
        </Text>
        <form action={handleSignOutAction}>
          <Button type="submit" variant="soft" size={large ? "3" : "2"}>
            Sign Out
          </Button>
        </form>
      </Flex>
    );
  }

  return (
    <Button asChild size={large ? "3" : "2"}>
      <a href="/login">Sign In {large && "with AuthKit"}</a>
    </Button>
  );
}
