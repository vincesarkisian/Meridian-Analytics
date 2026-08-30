/**
 * Meridian Analytics logo — a sphere crossed by its prime meridian. The horizontal
 * rule is always the brightest element. Geometry + colorways from the brand kit.
 * On dark: circle + ellipse signal-400, rule mint-300.
 */
export function MeridianMark({ size = 30 }: { size?: number }) {
  // Below ~26px the kit thickens the strokes and nudges the rule.
  const small = size <= 26;
  const sw = small ? 4 : 3;
  const rectY = small ? 28 : 28.5;
  const rectH = small ? 4 : 3;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="26" stroke="var(--signal-400)" strokeWidth={sw} />
      <ellipse
        cx="30"
        cy="30"
        rx="11"
        ry="26"
        stroke="var(--signal-400)"
        strokeWidth={sw}
      />
      <rect x="4" y={rectY} width="52" height={rectH} fill="var(--mint-300)" />
    </svg>
  );
}

/** Mark + lowercase "meridian" wordmark, vertically centered. */
export function MeridianLockup({
  markSize = 28,
  wordSize = 20,
}: {
  markSize?: number;
  wordSize?: number;
}) {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: markSize / 3 }}
    >
      <MeridianMark size={markSize} />
      <span
        style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 600,
          fontSize: wordSize,
          letterSpacing: "-0.035em",
          color: "var(--text-100)",
        }}
      >
        meridian
      </span>
    </span>
  );
}
