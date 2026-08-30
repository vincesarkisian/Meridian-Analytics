/**
 * RBAC permission helpers for the Meridian demo (Requirement 3).
 *
 * We gate behaviour on PERMISSIONS, never on role slugs. Role slugs vary per
 * organization (especially once custom / org-level roles exist), while permission
 * slugs are stable contracts. This is the WorkOS-recommended pattern — see
 * `.agents/skills/workos/references/workos-rbac.md` ("Always check permissions,
 * NOT role slugs").
 *
 * These slugs MUST match the permissions configured in the WorkOS dashboard.
 * A typo here fails silently (access is denied, no error), so keep them in sync.
 */
export const PERMISSIONS = {
  /** View the member list. */
  MEMBERS_READ: "members:read",
  /** Invite and remove members. */
  MEMBERS_WRITE: "members:write",
  /** Change a member's access (their role). */
  MEMBERS_MANAGE_ROLES: "members:manage_roles",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * True if the current session carries `permission`.
 *
 * `permissions` is the array from `withAuth()` (the access-token claims). It is
 * `undefined` when the session is not scoped to an organization, so we treat a
 * missing array as "no permission".
 */
export function can(
  permissions: string[] | undefined,
  permission: Permission,
): boolean {
  return permissions?.includes(permission) ?? false;
}
