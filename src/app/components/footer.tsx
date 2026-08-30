import { MeridianMark } from "./logo";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line-700)" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "32px 40px 48px",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <MeridianMark size={24} />
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 600,
              fontSize: 17,
              letterSpacing: "-0.03em",
              color: "var(--text-200)",
            }}
          >
            meridian
          </span>
          <span
            className="lead"
            style={{ fontSize: 14, marginLeft: 12, maxWidth: 360 }}
          >
            Governed analytics on a WorkOS-powered, multi-tenant foundation.
          </span>
        </div>

        <div style={{ display: "flex", gap: 24, fontSize: 14, fontWeight: 600 }}>
          <a href="https://workos.com/docs" rel="noreferrer" target="_blank">
            Documentation
          </a>
          <a
            href="https://workos.com/docs/reference"
            rel="noreferrer"
            target="_blank"
          >
            API Reference
          </a>
          <a href="https://workos.com" rel="noreferrer" target="_blank">
            WorkOS
          </a>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 40px 40px",
        }}
      >
        <span className="eyebrow" style={{ textTransform: "none" }}>
          © 2026 Meridian Analytics · demo workspace on WorkOS AuthKit
        </span>
      </div>
    </footer>
  );
}
