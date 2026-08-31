import type { ReactNode } from "react";
import { withAuth, getWorkOS } from "@workos-inc/authkit-nextjs";
import { PERMISSIONS, can } from "@/lib/permissions";
import { AccountProfile } from "./account-profile";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 16,
        alignItems: "baseline",
      }}
    >
      <dt className="metric-name">{label}</dt>
      <dd style={{ margin: 0, fontSize: 14, color: "var(--text-200)" }}>
        {value}
      </dd>
    </div>
  );
}

export default async function AccountPage() {
  const { user, role, permissions, organizationId } = await withAuth({
    ensureSignedIn: true,
  });

  // Mint a token for the User Profile widget (no permission scope required), and
  // look up the organization's display name — the session only carries its id.
  let profileToken: string | null = null;
  let organizationName: string | null = null;
  if (organizationId) {
    try {
      profileToken = await getWorkOS().widgets.getToken({
        organizationId,
        userId: user.id,
      });
    } catch {
      profileToken = null;
    }
    try {
      const org = await getWorkOS().organizations.getOrganization(organizationId);
      organizationName = org.name;
    } catch {
      organizationName = null;
    }
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const workspace = organizationName ?? organizationId ?? null;

  // Requirement 3: what this session can do, derived from its permissions.
  // "Change a member's access" is governed by the User Management widget's
  // `widgets:users-table:manage` permission (which admin + team-lead have), not our
  // custom manage_roles — so the panel matches what the /members widget actually allows.
  const capabilities = [
    [PERMISSIONS.MEMBERS_READ, "View the member list"],
    [PERMISSIONS.MEMBERS_WRITE, "Invite and remove members"],
    [PERMISSIONS.WIDGETS_USERS_TABLE_MANAGE, "Change a member's access"],
  ] as const;

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Account</div>
        <h1>{displayName}</h1>
        <p>
          Your identity, role, and access{workspace ? ` in ${workspace}` : ""}.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          alignItems: "start",
          maxWidth: 920,
        }}
      >
        {/* Identity */}
        <div className="brand-card" style={{ padding: "26px 28px" }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            Identity
          </div>
          <dl style={{ margin: 0, display: "grid", gap: 16 }}>
            <Field label="Name" value={displayName} />
            <Field label="Email" value={user.email} />
            {workspace && <Field label="Organization" value={workspace} />}
            <Field
              label="Role"
              value={<span className="pill pill-ok">{role ?? "member"}</span>}
            />
            <Field
              label="User ID"
              value={
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: "var(--slate-400)",
                  }}
                >
                  {user.id}
                </span>
              }
            />
          </dl>
        </div>

        {/* Access */}
        <div className="brand-card" style={{ padding: "26px 28px" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Access
          </div>
          <p
            className="lead"
            style={{ fontSize: 13.5, marginBottom: 12, maxWidth: 380 }}
          >
            What this role can do{workspace ? ` in ${workspace}` : ""} — derived
            from your permissions, never a hardcoded role name.
          </p>
          <div style={{ display: "grid", gap: 0 }}>
            {capabilities.map(([permission, label]) => {
              const allowed = can(permissions, permission);
              return (
                <div
                  key={permission}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderTop: "1px solid var(--line-800)",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      className="audit-dot"
                      style={{
                        background: allowed
                          ? "var(--status-ok)"
                          : "var(--line-750)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        color: allowed ? "var(--text-200)" : "var(--slate-500)",
                      }}
                    >
                      {label}
                    </span>
                  </span>
                  <span className={allowed ? "pill pill-ok" : "pill pill-neutral"}>
                    {allowed ? "allowed" : "denied"}
                  </span>
                </div>
              );
            })}
          </div>
          {permissions && permissions.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Permissions
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {permissions.map((p) => (
                  <span key={p} className="pill pill-neutral">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {profileToken && (
        <div style={{ marginTop: 44, maxWidth: 920 }}>
          <div className="section-header">
            <span className="num">03</span>
            <h2>Manage your profile</h2>
          </div>
          <div className="brand-card" style={{ padding: 10 }}>
            <AccountProfile authToken={profileToken} />
          </div>
        </div>
      )}
    </div>
  );
}
