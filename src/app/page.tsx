import NextLink from "next/link";
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function HomePage() {
  const { user } = await withAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "60vh",
        maxWidth: 860,
      }}
    >
      <h1 className="display" style={{ fontSize: 52 }}>
        Governed analytics on a WorkOS-powered, multi-tenant foundation.
      </h1>

      {!user && (
        <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
          <a className="btn btn-primary" href="/login">
            Sign in
          </a>
          <NextLink className="btn btn-secondary" href="/login/sso">
            Enterprise SSO
          </NextLink>
        </div>
      )}
    </div>
  );
}
