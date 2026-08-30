"use client";

/**
 * Header auth control. Signed out → a primary "Sign in" button; signed in → the
 * user's avatar + name next to a secondary "Sign out". Styled with the brand
 * system. Uses the AuthKit `useAuth` hook to read the session client-side.
 */

import { Avatar } from "@radix-ui/themes";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { handleSignOutAction } from "../actions/signOut";

export function SignInButton({ large }: { large?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <span className="eyebrow" style={{ color: "var(--slate-500)" }}>
        …
      </span>
    );
  }

  if (user) {
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
    const initials =
      [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
      user.email[0]?.toUpperCase() ||
      "?";

    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        <Avatar
          size="2"
          radius="full"
          color="jade"
          src={user.profilePictureUrl ?? undefined}
          fallback={initials}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-200)",
          }}
        >
          {name}
        </span>
        <form action={handleSignOutAction}>
          <button
            type="submit"
            className="btn btn-secondary"
            style={{ padding: "8px 16px" }}
          >
            Sign out
          </button>
        </form>
      </span>
    );
  }

  return (
    <a
      className={large ? "btn btn-primary" : "btn btn-primary"}
      href="/login"
      style={large ? undefined : { padding: "9px 18px" }}
    >
      Sign in
    </a>
  );
}
