export function Wordmark({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: size * 0.35,
        lineHeight: 1,
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: size * 1.45,
          letterSpacing: `${-0.02 * size}px`,
          color: "var(--paper-1)",
        }}
      >
        Pick&rsquo;em
      </span>
      <span
        className="font-mono"
        style={{
          fontWeight: 500,
          fontSize: size * 0.62,
          letterSpacing: `${0.12 * size}px`,
          color: "var(--paper-3)",
          transform: "translateY(-1px)",
        }}
      >
        WC26
      </span>
    </span>
  );
}
