import NextLink from "next/link";
import { withAuth, getWorkOS } from "@workos-inc/authkit-nextjs";

/** A signature metric card: mono metric name + big value + delta + sparkline. */
function MetricCard({
  name,
  value,
  delta,
  bars,
  down,
}: {
  name: string;
  value: string;
  delta: string;
  bars: number[];
  down?: boolean;
}) {
  return (
    <div className="metric-card">
      <div className="metric-name">{name}</div>
      <div className="metric-row">
        <span className="metric-value">{value}</span>
        <span className={down ? "metric-delta down" : "metric-delta"}>
          {delta}
        </span>
      </div>
      <div className="sparkline">
        {bars.map((h, i) => (
          <span key={i} className="spark-bar" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

/** A signature audit row: timestamp · status dot · description · mono tag. */
function AuditRow({
  time,
  text,
  tag,
  blocked,
}: {
  time: string;
  text: string;
  tag: string;
  blocked?: boolean;
}) {
  return (
    <div className="audit-row">
      <span className="audit-time">{time}</span>
      <span
        className="audit-dot"
        style={{
          background: blocked ? "var(--status-error)" : "var(--status-ok)",
        }}
      />
      <span className="audit-text">{text}</span>
      <span className="audit-tag">{tag}</span>
    </div>
  );
}

export default async function HomePage() {
  const { user, role, organizationId } = await withAuth();

  // Signed out — brand hero.
  if (!user) {
    return (
      <div style={{ padding: "40px 0", maxWidth: 720 }}>
        <div className="eyebrow eyebrow-green" style={{ marginBottom: 22 }}>
          Governed agentic analytics
        </div>
        <h1 className="display" style={{ fontSize: 56 }}>
          Answers you can hand to an examiner.
        </h1>
        <p className="lead" style={{ marginTop: 22, maxWidth: 560 }}>
          Ask in plain language, get a number with its lineage attached. Sign in
          to your workspace to see members, roles, and governed metrics.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <a className="btn btn-primary" href="/login">
            Sign in
          </a>
          <NextLink className="btn btn-secondary" href="/login/sso">
            Enterprise SSO (Acme)
          </NextLink>
        </div>
      </div>
    );
  }

  // Look up org name + seat count so the dashboard is scoped to this workspace.
  let orgName: string | null = null;
  let seats: number | null = null;
  if (organizationId) {
    try {
      const org = await getWorkOS().organizations.getOrganization(organizationId);
      orgName = org.name;
    } catch {
      orgName = null;
    }
    try {
      const ms = await getWorkOS().userManagement.listOrganizationMemberships({
        organizationId,
        limit: 100,
      });
      seats = ms.data.length;
    } catch {
      seats = null;
    }
  }

  const workspace = orgName ?? "your workspace";
  const roleLabel = role ?? "member";

  return (
    <div>
      {/* Workspace header — org name front and centre. */}
      <div style={{ marginBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          Workspace
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1 className="display" style={{ fontSize: 48 }}>
            {workspace}
          </h1>
          <span className="pill pill-ok">{roleLabel}</span>
        </div>
        <p className="lead" style={{ marginTop: 16, maxWidth: 640 }}>
          Welcome back{user.firstName ? `, ${user.firstName}` : ""}. Every metric
          and member below is scoped to{" "}
          <span style={{ color: "var(--text-200)" }}>{workspace}</span> — a
          walled-off workspace on WorkOS. You won&apos;t see any other
          customer&apos;s data.
        </p>
      </div>

      {/* Metric row — the fake governed-analytics dashboard. */}
      <div className="section-header">
        <span className="num">01</span>
        <h2>Governed metrics</h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 16,
          marginBottom: 48,
        }}
      >
        <MetricCard
          name={`net_revenue · ${workspace} · Q3`}
          value="$48.2M"
          delta="+6.1% QoQ"
          bars={[38, 52, 45, 61, 58, 72, 66, 80, 74, 88, 82, 100]}
        />
        <MetricCard
          name={`active_seats · ${workspace}`}
          value={seats !== null ? String(seats) : "—"}
          delta="provisioned"
          bars={[60, 60, 70, 70, 80, 80, 90, 90, 100, 100, 100, 100]}
        />
        <MetricCard
          name="queries_governed · 30d"
          value="12,480"
          delta="+18%"
          bars={[30, 42, 40, 55, 60, 58, 70, 68, 82, 90, 86, 96]}
        />
        <MetricCard
          name="certified_metrics"
          value="214"
          delta="+7 this quarter"
          bars={[50, 55, 54, 62, 66, 70, 72, 78, 84, 88, 92, 98]}
        />
      </div>

      {/* Audit trail — the signature pattern; also shows access is checked. */}
      <div className="section-header">
        <span className="num">02</span>
        <h2>Access &amp; audit trail</h2>
      </div>
      <div className="brand-card" style={{ padding: "28px 32px" }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>
          Recent activity · {workspace}
        </div>
        <AuditRow
          time="09:14:03"
          text={`Role verified · ${roleLabel} · scope ${workspace}, row-level filter applied`}
          tag="ALLOWED"
        />
        <AuditRow
          time="09:14:05"
          text="Queried FINANCE_DW.fct_revenue in place, 0 rows copied"
          tag="PUSH-DOWN"
        />
        <AuditRow
          time="09:16:22"
          text="Member roster requested · read-only grant honoured"
          tag="ALLOWED"
        />
        <AuditRow
          time="09:17:44"
          text="Access denied at query time · Finance not in role grants"
          tag="BLOCKED"
          blocked
        />
      </div>

      {/* Quick links into the demo surfaces. */}
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <NextLink className="btn btn-primary" href="/members">
          Manage members
        </NextLink>
        <NextLink className="btn btn-secondary" href="/account">
          View account &amp; role
        </NextLink>
      </div>
    </div>
  );
}
